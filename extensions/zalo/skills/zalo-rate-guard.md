---
name: zalo-rate-guard
pack: "@rune/zalo"
description: Rate limiting patterns for Zalo OA and personal APIs — token bucket per endpoint, exponential backoff, queue management, quota monitoring, anti-ban strategies.
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-rate-guard

Shared rate limiting layer for both Track A (OA API) and Track B (Personal via zca-js).
Zalo has **undocumented rate limits** — no official RPM/QPM numbers published.
Exceeding limits: throttled (429) → warned → OA suspended / account banned.
Neither `zalo-php-sdk`, `zalo-java-sdk`, nor `zca-js` implement any rate limiting.
This skill fills that gap.

---

## Estimated Safe Limits

**Track A — OA API:**

| Endpoint | Safe RPM | Burst | Notes |
|----------|----------|-------|-------|
| Send CS message | 200 | 10 | Per OA, includes all message types |
| Send broadcast | 50 | 5 | Monthly quota based on follower count |
| Get user profile | 300 | 20 | Cacheable — use name cache |
| Get follower list | 100 | 10 | Paginated, cache results |
| Upload media | 60 | 5 | Large payloads, slower |
| Global | 500 | 30 | Total across all endpoints |

**Track B — Personal (zca-js):**

| Action | Safe RPM | Burst | Notes |
|--------|----------|-------|-------|
| Send message (DM) | 30 | 5 | Much lower than OA — personal account |
| Send message (group) | 20 | 3 | Groups are more scrutinized |
| Friend operations | 10 | 2 | Add/remove friend is very sensitive |
| Profile lookups | 60 | 10 | Less sensitive, still cache |
| Global | 100 | 15 | Err on side of caution |

---

## Token Bucket Implementation

```typescript
import PQueue from 'p-queue'

interface RateLimitConfig {
  rpm: number        // requests per minute
  burst: number      // max concurrent
  retryAfter: number // ms to wait on 429
}

const LIMITS: Record<string, RateLimitConfig> = {
  'oa:send_message':   { rpm: 200, burst: 10, retryAfter: 5000 },
  'oa:broadcast':      { rpm: 50,  burst: 5,  retryAfter: 10000 },
  'oa:get_profile':    { rpm: 300, burst: 20, retryAfter: 3000 },
  'oa:upload':         { rpm: 60,  burst: 5,  retryAfter: 5000 },
  'personal:send_dm':  { rpm: 30,  burst: 5,  retryAfter: 10000 },
  'personal:send_grp': { rpm: 20,  burst: 3,  retryAfter: 15000 },
  'personal:friend':   { rpm: 10,  burst: 2,  retryAfter: 30000 },
}

export class ZaloRateLimiter {
  private queues = new Map<string, PQueue>()

  constructor() {
    for (const [key, config] of Object.entries(LIMITS)) {
      this.queues.set(key, new PQueue({
        concurrency: config.burst,
        intervalCap: config.rpm,
        interval: 60_000, // per minute window
      }))
    }
  }

  async execute<T>(endpoint: string, fn: () => Promise<T>): Promise<T> {
    const queue = this.queues.get(endpoint)
    if (!queue) throw new Error(`Unknown endpoint: ${endpoint}`)
    return queue.add(fn) as Promise<T>
  }

  queueSize(endpoint: string): number {
    return this.queues.get(endpoint)?.size ?? 0
  }

  pending(endpoint: string): number {
    return this.queues.get(endpoint)?.pending ?? 0
  }
}
```

---

## Exponential Backoff on 429

```typescript
export async function withBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimit = error?.status === 429 || error?.error_code === 429
      if (!isRateLimit || attempt === maxRetries) throw error
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      console.warn(`[zalo-rate-guard] Rate limited. Retry ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
  throw new Error('Unreachable')
}
```

---

## Quota Monitoring (OA Broadcast)

Broadcast quota is a **hard monthly limit** — exceeding it silently drops messages, no error returned.

```typescript
interface QuotaTracker {
  monthly_limit: number  // based on follower count + OA level
  used: number
  resets_at: Date        // 1st of each month
}

export function canBroadcast(tracker: QuotaTracker, recipientCount: number): boolean {
  const remaining = tracker.monthly_limit - tracker.used
  if (recipientCount > remaining) {
    console.error(
      `[zalo-rate-guard] Broadcast quota insufficient: need ${recipientCount}, have ${remaining}/${tracker.monthly_limit}`
    )
    return false
  }
  return true
}

export function trackBroadcastUsed(tracker: QuotaTracker, sent: number): QuotaTracker {
  return { ...tracker, used: tracker.used + sent }
}
```

---

## Integration Pattern

```typescript
// Singleton — shared across the app
export const limiter = new ZaloRateLimiter()

// Track A: OA message send with rate limiting
export async function sendOaMessage(userId: string, text: string) {
  return limiter.execute('oa:send_message', () =>
    withBackoff(() =>
      oaApiCall('/message/cs', {
        recipient: { user_id: userId },
        message: { text },
      })
    )
  )
}

// Track B: Personal DM with rate limiting + human jitter
export async function sendPersonalMessage(threadId: string, text: string) {
  const jitter = 500 + Math.random() * 1500 // 500–2000ms
  await new Promise(r => setTimeout(r, jitter))
  return limiter.execute('personal:send_dm', () =>
    withBackoff(() => api.sendMessage(text, threadId, 'User'))
  )
}

// Track B: Friend operation — highest-risk, extra jitter
export async function addFriend(userId: string) {
  const jitter = 2000 + Math.random() * 3000 // 2–5s
  await new Promise(r => setTimeout(r, jitter))
  return limiter.execute('personal:friend', () =>
    withBackoff(() => api.sendFriendRequest(userId), 2, 5000)
  )
}
```

---

## Anti-Ban Strategies

**Track A (OA):**
1. Stay under safe RPM limits (table above)
2. Exponential backoff on ALL 429 responses — never retry immediately
3. Cache user profiles — avoid repeated lookups for the same user
4. Spread broadcasts over time — don't burst the entire follower list at once
5. Monitor quota before each broadcast batch — stop before hitting monthly limit
6. Use `appsecret_proof` on all requests — proves you're the legitimate app owner

**Track B (Personal):**
1. Much lower limits than OA — personal accounts are watched more closely
2. Add human-like jitter: 500–2000ms random delay between messages (not optional)
3. Avoid 3–6 AM (VN timezone) — traffic at those hours flags automated activity
4. Never change profile info programmatically — triggers manual review
5. Friend operations are highest-risk — max 10 RPM, prefer lower in practice
6. Keep sessions long-lived — repeated login/logout is a strong ban signal
7. Use a consistent device fingerprint (`userAgent` + `IMEI`) per account
8. On `DuplicateConnection` (error 3000): wait 30s before reconnecting, never spam reconnects

---

## Sharp Edges

- Rate limits are **estimated** — Zalo does not publish official numbers; treat all figures as conservative targets
- `p-queue` `intervalCap` applies per window, not per request — test behavior under burst
- 429 without backoff = accelerating toward ban, not slowing down
- Broadcast quota overflow **silently drops messages** — no 429, no error, just lost sends
- Stale cached profile data is acceptable; hitting rate limits for fresh data is not
- Personal account friend operations are the single highest-risk action — handle with care
- Human jitter for personal track is a survival strategy, not a nice-to-have
