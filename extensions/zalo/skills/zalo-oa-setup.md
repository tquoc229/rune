---
name: zalo-oa-setup
pack: "@rune/zalo"
description: "Zalo OA OAuth2 PKCE setup — app registration, dual-token management (User vs OA), appsecret_proof signing, and auto-refresh middleware."
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-oa-setup

#### Purpose

Zalo's OAuth2 system has two completely separate token hierarchies — User tokens and OA tokens — that are not interchangeable. Most developers fail because they conflate the two or skip PKCE entirely. This skill walks through app registration, implements PKCE code challenge generation, builds a token auto-refresh middleware, and secures every API call with appsecret_proof signing.

#### Workflow

**Step 1 — App registration at developers.zalo.me**

Navigate to https://developers.zalo.me → Create App → note `app_id` and `secret_key`. Under "Official Account", bind your OA to the app. Configure redirect URI (must be HTTPS in production; `http://localhost:PORT/callback` for dev). Set webhook URL if receiving events. Add `app_id` and `secret_key` to `.env` — never commit them.

```
ZALO_APP_ID=your_app_id
ZALO_APP_SECRET=your_secret_key
ZALO_REDIRECT_URI=https://yourapp.com/auth/zalo/callback
ZALO_OA_ID=your_oa_id
```

**Step 2 — Decide which token track you need**

| Track | Endpoint prefix | Use case |
|-------|----------------|----------|
| User OAuth2 | `oauth.zaloapp.com/v4/permission` | Log in users, read user profile |
| OA OAuth2 | `oauth.zaloapp.com/v4/oa/permission` | Send messages, manage followers, all bot operations |

Most bots only need the OA track. If you only build a chatbot, skip User OAuth2 entirely.

**Step 3 — Generate PKCE pair**

PKCE prevents auth-code interception. Store `code_verifier` in session/memory between the redirect and the callback — it must survive that round-trip.

```typescript
import crypto from 'crypto'

export function generateCodeVerifier(): string {
  // 32 random bytes → base64url = 43-char verifier (RFC 7636 compliant)
  return crypto.randomBytes(32).toString('base64url')
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}
```

**Step 4 — Build the authorization URL**

```typescript
import { generateCodeVerifier, generateCodeChallenge } from './pkce'

interface AuthUrlResult {
  url: string
  codeVerifier: string // store in session — needed for token exchange
  state: string
}

export function buildOaAuthUrl(appId: string, redirectUri: string): AuthUrlResult {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = crypto.randomBytes(16).toString('hex') // CSRF protection

  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  })

  return {
    url: `https://oauth.zaloapp.com/v4/oa/permission?${params}`,
    codeVerifier,
    state,
  }
}
```

**Step 5 — Exchange auth code for tokens (callback handler)**

```typescript
import { z } from 'zod'

const TokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(), // seconds
})

export async function exchangeOaCode(
  code: string,
  codeVerifier: string,
  appId: string,
  appSecret: string,
): Promise<z.infer<typeof TokenResponseSchema>> {
  const res = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'secret_key': appSecret },
    body: new URLSearchParams({
      app_id: appId,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`)
  return TokenResponseSchema.parse(await res.json())
}
```

**Step 6 — Token store with auto-refresh middleware**

OA access_token expires in ~24h. Never make an API call without first verifying the token is still valid. When refreshing, Zalo returns a NEW refresh_token — the old one is invalidated immediately.

```typescript
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const CREDENTIALS_PATH = path.join(os.homedir(), '.zalo-mcp', 'credentials.json')
const REFRESH_BUFFER_MS = 5 * 60 * 1000 // refresh if <5 min remaining

export interface ZaloTokenStore {
  oa_access_token: string
  oa_refresh_token: string
  oa_expires_at: number  // Unix timestamp ms
  user_access_token?: string
  user_refresh_token?: string
  user_expires_at?: number
}

export async function loadTokens(): Promise<ZaloTokenStore> {
  const raw = await fs.readFile(CREDENTIALS_PATH, 'utf-8')
  return JSON.parse(raw) as ZaloTokenStore
}

export async function saveTokens(tokens: ZaloTokenStore): Promise<void> {
  await fs.mkdir(path.dirname(CREDENTIALS_PATH), { recursive: true })
  await fs.writeFile(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2), { mode: 0o600 })
}

async function refreshOaToken(
  refreshToken: string,
  appId: string,
  appSecret: string,
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const res = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'secret_key': appSecret },
    body: new URLSearchParams({
      app_id: appId,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function getValidOaToken(appId: string, appSecret: string): Promise<string> {
  const store = await loadTokens()
  const now = Date.now()

  if (store.oa_expires_at - now > REFRESH_BUFFER_MS) {
    return store.oa_access_token // still fresh
  }

  // Token expired or expiring soon — refresh
  const refreshed = await refreshOaToken(store.oa_refresh_token, appId, appSecret)
  const updated: ZaloTokenStore = {
    ...store,
    oa_access_token: refreshed.access_token,
    oa_refresh_token: refreshed.refresh_token, // rotate — old token is now dead
    oa_expires_at: now + refreshed.expires_in * 1000,
  }
  await saveTokens(updated)
  return updated.oa_access_token
}
```

**Step 7 — appsecret_proof signing for server-side calls**

appsecret_proof is an HMAC-SHA256 of the access_token keyed with app_secret. It binds a token to your server — even if a token leaks, it cannot be replayed without the secret.

```typescript
import crypto from 'crypto'

export function generateAppSecretProof(accessToken: string, appSecret: string): string {
  return crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex')
}

// Usage: attach to every OA API call
export async function oaApiCall(
  endpoint: string,
  body: Record<string, unknown>,
  appId: string,
  appSecret: string,
): Promise<unknown> {
  const accessToken = await getValidOaToken(appId, appSecret)
  const proof = generateAppSecretProof(accessToken, appSecret)

  const res = await fetch(`https://openapi.zalo.me/v3.0/oa/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': accessToken,
      'X-Appsecret-Proof': proof,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`OA API ${endpoint} failed: ${res.status} ${await res.text()}`)
  return res.json()
}
```

#### Sharp Edges

| Failure | Symptom | Fix |
|---------|---------|-----|
| Using User token for OA API | `error_code: 216` or permission denied | Check token source — OA APIs require OA track token, not user track |
| Lost `code_verifier` between redirect and callback | `invalid_grant` on token exchange | Store verifier in server-side session (not cookie) before redirecting |
| Redirect URI mismatch | `redirect_uri does not match` | URI must EXACTLY match registered value — trailing slash, protocol, and port all matter |
| Not rotating refresh token | Refresh silently fails after first use | Always write the NEW `refresh_token` from refresh response back to store |
| `appsecret_proof` missing on server calls | Token accepted but flagged; future calls blocked | Add `X-Appsecret-Proof` header on ALL server-side API calls, not just some |
| `secret_key` sent from browser | Secret exposure in network tab | `secret_key` header and appsecret_proof are server-side only — never from browser JS |
| Credentials file world-readable | Token leak on shared host | `chmod 600 ~/.zalo-mcp/credentials.json` — enforced by `saveTokens` above |
