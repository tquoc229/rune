---
name: zalo-oa-webhook
pack: "@rune/zalo"
description: "Set up and handle Zalo OA webhook server — signature verification, event routing, idempotency, and tunnel for local development."
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-oa-webhook

Set up and handle Zalo OA webhook server — signature verification, event routing, idempotency, and tunnel for local development.

#### Workflow

**Step 1 — Register webhook at Zalo Developer Portal**
Go to [developers.zalo.me](https://developers.zalo.me) → select App → **App Settings → Webhook**. Enter your HTTPS endpoint URL (e.g., `https://your-domain.com/webhook/zalo`). Zalo sends `POST` requests to this URL for every OA event. The URL must be HTTPS — no plain HTTP. For local dev, use ngrok: `ngrok http 3000` and paste the `https://` tunnel URL. Remember to update the URL when the tunnel restarts.

**Step 2 — Verify signature on every request (CRITICAL)**
Every request from Zalo includes `X-ZEvent-Signature` header — HMAC-SHA256 of the raw request body, signed with your **OA Secret Key** (not the App Secret — different keys). Verify before processing. Use `crypto.timingSafeEqual` to prevent timing attacks. Reject with 403 if invalid.

```typescript
import crypto from 'crypto'

function verifyWebhookSignature(
  body: string,
  signature: string,
  oaSecretKey: string
): boolean {
  const computed = crypto
    .createHmac('sha256', oaSecretKey)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(computed, 'hex'),
    Buffer.from(signature, 'hex')
  )
}
```

NEVER skip verification — even in development. NEVER use `===` string compare (timing leak).

**Step 3 — Respond within 5 seconds**
Zalo expects `200 OK` within 5 seconds or it marks the delivery failed and retries up to 3 times. Acknowledge immediately, then process asynchronously:

```typescript
// Return 200 first, then process
return c.json({ received: true })  // respond immediately
await queue.push(event)            // async processing
```

**Step 4 — Implement idempotency**
Retries cause duplicate events. Use `msg_id` (present on message events) to deduplicate. Check before processing, mark as processed after:

```typescript
const processedIds = new Set<string>() // or Redis for production

async function idempotentHandle(event: ZaloEvent): Promise<void> {
  const id = event.message?.msg_id ?? `${event.event_name}:${event.timestamp}`
  if (processedIds.has(id)) return
  processedIds.add(id)
  await routeEvent(event)
}
```

**Step 5 — Route events by event_name**

| event_name | Trigger | Key payload fields |
|---|---|---|
| `user_send_text` | User sends text | `sender.id`, `message.text`, `message.msg_id` |
| `user_send_image` | User sends image | `sender.id`, `message.attachments[].payload.url` |
| `user_send_file` | User sends file | `sender.id`, `message.attachments[]` |
| `user_send_sticker` | User sends sticker | `sender.id`, `message.attachments[]` |
| `user_send_location` | User sends location | `sender.id`, `message.attachments[].payload.coordinates` |
| `follow` | User follows OA | `follower.id` |
| `unfollow` | User unfollows OA | `follower.id` |
| `user_click_button` | User clicks button | `sender.id`, `message.text` (button payload) |
| `oa_send_text` | OA message delivered | — |

Note: naming is inconsistent — messages use `user_send_*` prefix, follow/unfollow do not.

#### Server Implementations

**Hono (recommended — edge-ready)**

```typescript
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import crypto from 'crypto'

const OA_SECRET_KEY = process.env.ZALO_OA_SECRET_KEY!
const app = new Hono()

app.post('/webhook/zalo', async (c) => {
  const signature = c.req.header('X-ZEvent-Signature') ?? ''
  const body = await c.req.text() // raw body — MUST use text(), not json()

  if (!verifyWebhookSignature(body, signature, OA_SECRET_KEY)) {
    return c.json({ error: 'Invalid signature' }, 403)
  }

  const event: ZaloEvent = JSON.parse(body)
  c.executionCtx?.waitUntil(idempotentHandle(event)) // non-blocking
  return c.json({ received: true })
})

async function routeEvent(event: ZaloEvent): Promise<void> {
  switch (event.event_name) {
    case 'user_send_text':    return handleTextMessage(event)
    case 'user_send_image':   return handleImageMessage(event)
    case 'user_send_file':    return handleFileMessage(event)
    case 'user_send_location': return handleLocation(event)
    case 'follow':            return handleFollow(event)
    case 'unfollow':          return handleUnfollow(event)
    case 'user_click_button': return handleButtonClick(event)
    default: console.warn('Unhandled Zalo event:', event.event_name)
  }
}

serve({ fetch: app.fetch, port: 3000 })
```

**Express**

```typescript
import express from 'express'

const app = express()

// MUST use raw body parser — not express.json() — to preserve signature input
app.post('/webhook/zalo', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-zevent-signature'] as string ?? ''
  const body = req.body.toString()

  if (!verifyWebhookSignature(body, signature, OA_SECRET_KEY)) {
    return res.status(403).json({ error: 'Invalid signature' })
  }

  const event: ZaloEvent = JSON.parse(body)
  res.json({ received: true }) // respond first
  idempotentHandle(event).catch(console.error) // then process
})
```

**Fastify**

```typescript
import Fastify from 'fastify'

const fastify = Fastify()

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  done(null, body) // keep raw string for signature verification
})

fastify.post('/webhook/zalo', async (request, reply) => {
  const signature = request.headers['x-zevent-signature'] as string ?? ''
  const body = request.body as string

  if (!verifyWebhookSignature(body, signature, OA_SECRET_KEY)) {
    return reply.status(403).send({ error: 'Invalid signature' })
  }

  const event: ZaloEvent = JSON.parse(body)
  reply.send({ received: true })
  idempotentHandle(event).catch(console.error)
})
```

#### Local Development Tunnel

```bash
# ngrok (most common)
ngrok http 3000
# → copy https://xxxx.ngrok.io → paste to Zalo Developer Portal

# cloudflared (free, no account needed for temp tunnels)
cloudflare tunnel --url http://localhost:3000
```

Update webhook URL in Zalo portal every time the tunnel restarts. Use a stable subdomain (`ngrok http --subdomain=myapp 3000`) with a paid ngrok account to avoid this.

#### Sharp Edges

- **5-second timeout**: If your handler takes longer, Zalo marks it failed and retries. Always return 200 immediately, process async.
- **Wrong secret key**: Signature uses **OA Secret Key** from OA Management → Settings, NOT the App Secret Key from Developer Portal. Different keys, same name confusion.
- **Raw body required**: Parse body as raw string before verification. Using `express.json()` or Hono's `.json()` before verification will break the HMAC because the body gets re-serialized.
- **Inconsistent event naming**: `user_send_text` but just `follow` — not `user_follow`. Handle both patterns in your router.
- **HTTPS required**: Zalo rejects plain HTTP webhook URLs. ngrok/cloudflared tunnels provide HTTPS automatically.
- **msg_id deduplication is mandatory in production**: Zalo retries on non-200 (up to 3x), and network issues can cause duplicate deliveries. A Redis-backed `SETNX msg_id EX 86400` is the production-safe pattern.
