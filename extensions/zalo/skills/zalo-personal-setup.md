---
name: zalo-personal-setup
pack: "@rune/zalo"
description: Personal Zalo account automation setup via zca-js — QR login, credential persistence, WebSocket listener, session management. UNOFFICIAL — risk-gated.
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-personal-setup

## Purpose

Bootstrap a personal Zalo account automation using zca-js — the community-maintained reverse-engineered client. Handles first-time QR login, credential persistence, WebSocket listener setup, and session restore on subsequent runs.

<HARD-GATE>
This skill uses UNOFFICIAL reverse-engineered APIs via zca-js.
BEFORE proceeding, acknowledge ALL risks:
1. ToS VIOLATION — Zalo can ban your account without warning
2. SINGLE SESSION — cannot use Zalo mobile/web simultaneously
3. API INSTABILITY — Zalo can break internal APIs anytime
4. NO SUPPORT — Zalo will not help with issues from unofficial usage
5. NOT FOR PRODUCTION — personal projects and prototypes ONLY

If building for business/production → use Track A (zalo-oa-setup) instead.
</HARD-GATE>

## Step 1 — Install Dependency

```bash
npm install zca-js
# zca-js: https://github.com/RFS-ADRENO/zca-js (359★, 202 forks)
```

Minimum Node.js: 18+. TypeScript users add `@types/node` if not already present.

## Step 2 — QR Login (First Run)

```typescript
import { Zalo } from 'zca-js'

const zalo = new Zalo()

// First-time login: QR code
const api = await zalo.loginQR()
// Terminal displays QR → scan with Zalo mobile app
// Returns API instance with full access

// Save credentials for next time
const credentials = {
  imei: api.getImei(),         // generated device ID
  cookie: api.getCookie(),      // session cookies
  userAgent: api.getUserAgent() // browser fingerprint
}
await saveCredentials(credentials)
```

QR code expires in ~60 seconds — scan quickly. After scan, zca-js completes handshake and returns a live API instance.

## Step 3 — Credential Persistence

```typescript
import { readFile, writeFile, chmod } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'

const CRED_PATH = join(homedir(), '.zalo-personal', 'credentials.json')

async function saveCredentials(creds: ZaloCredentials): Promise<void> {
  await writeFile(CRED_PATH, JSON.stringify(creds, null, 2))
  await chmod(CRED_PATH, 0o600) // owner-only read/write
}

async function loadCredentials(): Promise<ZaloCredentials | null> {
  try {
    return JSON.parse(await readFile(CRED_PATH, 'utf-8'))
  } catch { return null }
}
```

Store at `~/.zalo-personal/credentials.json` — outside the project repo. Never commit credentials to git. Add `.zalo-personal/` to `.gitignore`.

## Step 4 — Session Restore (Subsequent Runs)

```typescript
const creds = await loadCredentials()

const api = creds
  ? await zalo.login({
      imei: creds.imei,
      cookie: creds.cookie,
      userAgent: creds.userAgent
    })
  : await zalo.loginQR() // fall back to QR if no saved creds

// Always re-persist after login — cookies may have refreshed
await saveCredentials({
  imei: api.getImei(),
  cookie: api.getCookie(),
  userAgent: api.getUserAgent()
})
```

## Step 5 — WebSocket Listener

```typescript
const listener = api.listener
await listener.start({ retryOnClose: true })

listener.on('message', (msg) => {
  // Handle incoming DMs
  console.log(`[DM] ${msg.data.content}`)
})

listener.on('group_message', (msg) => {
  // Group messages arrive on separate event
  console.log(`[Group] ${msg.data.content}`)
})

// keepAlive is automatic via zca-js — no manual ping needed
```

`retryOnClose: true` enables automatic reconnect using the retry schedule provided by Zalo's server.

## Session Management Notes

| Concept | Detail |
|---------|--------|
| IMEI | Deterministic UUID from userAgent — acts as device fingerprint. Must stay consistent across restarts. |
| Cookies | Auto-refreshed on keepAlive. Always re-persist after each session start. |
| DuplicateConnection (3000) | Another session opened — this one closes. Cannot run bot + Zalo mobile simultaneously. |
| Reconnect | Handled by zca-js via server retry schedule. No manual logic needed. |

## Anti-Detection Baseline

- Use consistent `userAgent` across sessions — don't randomize on each run
- Don't send messages too fast (see `zalo-rate-guard` for throttle patterns)
- Avoid running during unusual hours (3–6 AM local time)
- Keep sessions long-lived — frequent login/logout is suspicious
- Never change profile info programmatically

## Sharp Edges

- Cookie refresh happens on keepAlive — **MUST** persist updated cookies after every session start, not just first login
- IMEI must stay consistent — changing it looks like a new device to Zalo's backend
- If Zalo mobile is active on same account, bot receives `DuplicateConnection` kick immediately
- zca-js depends on Zalo's internal undocumented API — breaks without warning on Zalo updates
- No official rate limits documented — err heavily on the side of caution

## Mesh Links

- `zalo-oa-setup` — Track A (official OA API) if this use case grows to production
- `zalo-rate-guard` — rate limiting and message throttle for personal bots
- `zalo-personal-messaging` — send/reply DMs and group messages once session is live
