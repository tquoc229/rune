---
name: zalo-oa-mcp
pack: "@rune/zalo"
description: MCP server blueprint — AI agent reads and sends Zalo OA messages. Webhook-to-MCP bridge, tool definitions, conversation loop.
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-oa-mcp

MCP server blueprint that bridges AI agents (Claude) with Zalo OA — enabling the use case "AI agent chats via Zalo".

#### Architecture

```
User sends message via Zalo
  → Zalo webhook POST to your server
  → Webhook handler verifies signature, stores in message queue
  → MCP server exposes tools:
      zalo_read_messages  — poll queue for new messages
      zalo_send_message   — send reply via OA API
      zalo_get_profile    — fetch user info (cached)
      zalo_list_followers — list OA followers
      zalo_send_broadcast — broadcast with targeting (confirm-gated)
  → AI agent (Claude) calls these tools in a conversation loop
  → Agent processes message, decides response
  → Calls zalo_send_message to reply
  → User receives reply in Zalo
```

Webhook server and MCP server run in the **same Node.js process** — no IPC overhead, shared in-memory queue.

#### MCP Tool Definitions

**1. zalo_read_messages** — query, auto-approve

```json
{
  "name": "zalo_read_messages",
  "description": "Poll the webhook queue for new Zalo OA messages. Returns messages received since last read.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "limit": { "type": "number", "default": 10, "description": "Max messages to return" },
      "since_timestamp": { "type": "number", "description": "Unix ms — only return messages after this time" }
    }
  }
}
```

Returns: `{ messages: [{ user_id, user_name, text, attachments, timestamp, msg_id }] }`

**2. zalo_send_message** — mutation, confirm before send

```json
{
  "name": "zalo_send_message",
  "description": "Send a message to a Zalo OA follower. Requires confirmation before execution.",
  "inputSchema": {
    "type": "object",
    "required": ["user_id", "text"],
    "properties": {
      "user_id": { "type": "string", "description": "OA-scoped user ID" },
      "text": { "type": "string", "description": "Message text (max 2000 chars)" },
      "message_type": { "type": "string", "enum": ["text", "image", "template"], "default": "text" },
      "attachment_id": { "type": "string", "description": "Required when message_type is image" }
    }
  }
}
```

Returns: `{ success: true, msg_id: "..." }` or `{ success: false, error: "..." }`

**3. zalo_get_profile** — query, auto-approve, 1-hour TTL cache

```json
{
  "name": "zalo_get_profile",
  "description": "Get Zalo user profile. Cached for 1 hour to avoid repeated API calls.",
  "inputSchema": {
    "type": "object",
    "required": ["user_id"],
    "properties": {
      "user_id": { "type": "string" }
    }
  }
}
```

Returns: `{ display_name, avatar, user_id, is_follower }`

**4. zalo_list_followers** — query, auto-approve

```json
{
  "name": "zalo_list_followers",
  "description": "List OA followers with pagination.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "offset": { "type": "number", "default": 0 },
      "count": { "type": "number", "default": 50, "maximum": 50 }
    }
  }
}
```

Returns: `{ followers: [{ user_id, display_name }], total }`

**5. zalo_send_broadcast** — mutation, ALWAYS confirm with preview

```json
{
  "name": "zalo_send_broadcast",
  "description": "Broadcast message to all followers or filtered segment. Always shows preview before sending.",
  "inputSchema": {
    "type": "object",
    "required": ["text"],
    "properties": {
      "text": { "type": "string" },
      "target": {
        "type": "object",
        "properties": {
          "gender": { "type": "string", "enum": ["male", "female"] },
          "age_range": { "type": "object", "properties": { "min": { "type": "number" }, "max": { "type": "number" } } },
          "city": { "type": "string" }
        }
      }
    }
  }
}
```

Returns: `{ success: true, sent_count: 1240 }` — always preview target before sending.

#### MCP Server Implementation

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

// ── Message Queue (webhook → MCP bridge) ──────────────────────────────────
const MAX_QUEUE = 1000
const messageQueue: ZaloMessage[] = []

function enqueue(msg: ZaloMessage): void {
  messageQueue.push(msg)
  if (messageQueue.length > MAX_QUEUE) messageQueue.shift() // drop oldest
}

// ── Profile Cache (1-hour TTL) ─────────────────────────────────────────────
const profileCache = new Map<string, { data: ZaloProfile; expiry: number }>()

async function getCachedProfile(userId: string): Promise<ZaloProfile> {
  const cached = profileCache.get(userId)
  if (cached && Date.now() < cached.expiry) return cached.data
  const data = await fetchOAProfile(userId)
  profileCache.set(userId, { data, expiry: Date.now() + 3_600_000 })
  return data
}

// ── MCP Server ─────────────────────────────────────────────────────────────
const server = new Server(
  { name: 'zalo-oa-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'zalo_read_messages', description: '...', inputSchema: { /* as above */ } },
    { name: 'zalo_send_message',  description: '...', inputSchema: { /* as above */ } },
    { name: 'zalo_get_profile',   description: '...', inputSchema: { /* as above */ } },
    { name: 'zalo_list_followers',description: '...', inputSchema: { /* as above */ } },
    { name: 'zalo_send_broadcast',description: '...', inputSchema: { /* as above */ } },
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'zalo_read_messages': {
      const { limit = 10, since_timestamp } = args as { limit?: number; since_timestamp?: number }
      const msgs = since_timestamp
        ? messageQueue.filter(m => m.timestamp > since_timestamp).slice(-limit)
        : messageQueue.slice(-limit)
      return { content: [{ type: 'text', text: JSON.stringify({ messages: msgs }) }] }
    }

    case 'zalo_send_message': {
      const { user_id, text, message_type = 'text', attachment_id } = args as SendMessageArgs
      const result = await sendOAMessage({ user_id, text, message_type, attachment_id })
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    case 'zalo_get_profile': {
      const profile = await getCachedProfile((args as { user_id: string }).user_id)
      return { content: [{ type: 'text', text: JSON.stringify(profile) }] }
    }

    case 'zalo_list_followers': {
      const { offset = 0, count = 50 } = args as { offset?: number; count?: number }
      const result = await listOAFollowers(offset, Math.min(count, 50))
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    }

    case 'zalo_send_broadcast': {
      // Confirmation preview MUST be shown before sending
      const { text, target } = args as BroadcastArgs
      const preview = `BROADCAST PREVIEW:\nText: "${text}"\nTarget: ${JSON.stringify(target ?? 'all followers')}\nConfirm?`
      return { content: [{ type: 'text', text: preview }] }
      // On confirmed re-call with confirmed: true, execute sendOABroadcast()
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

// ── Webhook Server (same process) ──────────────────────────────────────────
const app = new Hono()

app.post('/webhook/zalo', async (c) => {
  const signature = c.req.header('X-ZEvent-Signature') ?? ''
  const body = await c.req.text()

  if (!verifySignature(body, signature)) return c.json({ error: 'Invalid signature' }, 403)

  const event = JSON.parse(body)
  c.executionCtx?.waitUntil(handleWebhookEvent(event))
  return c.json({ received: true })
})

async function handleWebhookEvent(event: ZaloEvent): Promise<void> {
  if (event.event_name !== 'user_send_text') return // extend as needed
  const profile = await getCachedProfile(event.sender.id).catch(() => null)
  enqueue({
    user_id: event.sender.id,
    user_name: profile?.display_name ?? event.sender.id,
    text: event.message.text,
    attachments: event.message.attachments ?? [],
    timestamp: event.timestamp,
    msg_id: event.message.msg_id,
  })
}

// ── Boot both in same process ───────────────────────────────────────────────
serve({ fetch: app.fetch, port: 3000 })
const transport = new StdioServerTransport()
await server.connect(transport)
```

#### Credential Management

Store credentials in `~/.zalo-mcp/credentials.json` — never commit this file.

```json
{
  "oa_token": "OA_ACCESS_TOKEN",
  "oa_secret_key": "OA_SECRET_KEY_FOR_WEBHOOK",
  "refresh_token": "REFRESH_TOKEN",
  "expires_at": 1712345678000
}
```

MCP server reads on startup and auto-refreshes before expiry. Never expose tokens via MCP tool responses.

```typescript
import { readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

const CREDS_PATH = join(homedir(), '.zalo-mcp', 'credentials.json')

function loadCredentials(): ZaloCredentials {
  const raw = readFileSync(CREDS_PATH, 'utf-8')
  return JSON.parse(raw) as ZaloCredentials
}
```

#### Conversation Loop (Agent Side)

```typescript
// Claude agent system prompt excerpt
const systemPrompt = `
You are a Zalo OA customer support agent.
- Call zalo_read_messages to get new messages from users
- Call zalo_get_profile to personalize responses
- Reply via zalo_send_message — ALWAYS confirm before sending
- You cannot reply to users who haven't messaged in the last 7 days (OA API constraint)
- Keep replies concise — Zalo UI shows ~160 chars before truncation on mobile
`
```

#### Tool Safety Classification

| Tool | Class | Approval |
|------|-------|----------|
| `zalo_read_messages` | query | auto-approve |
| `zalo_get_profile` | query | auto-approve |
| `zalo_list_followers` | query | auto-approve |
| `zalo_send_message` | mutation | confirm before send |
| `zalo_send_broadcast` | mutation | ALWAYS confirm — shows preview |

Rate limiting: call `zalo-rate-guard` before `zalo_send_message` and `zalo_send_broadcast`. See [@rune/zalo rate guard skill](zalo-rate-guard.md).

#### Sharp Edges

- **Queue overflow**: Queue caps at 1000 messages, drops oldest. If agent polls infrequently in high-traffic OA, messages are lost. Use Redis `LPUSH/LTRIM` in production.
- **7-day CS window**: OA API rejects sends to users who haven't initiated contact in 7 days. Agent must check `timestamp` before attempting reply — surface this as a graceful error, not a crash.
- **Rate limiting is mandatory**: `zalo_send_message` must go through `zalo-rate-guard` — OA bans are silent and permanent.
- **user_id is OA-scoped**: The same Zalo user has different IDs per OA. Cache `display_name` via `zalo_get_profile` to humanize logs and agent context.
- **Single process, not microservices**: Webhook and MCP server share the same queue in-memory. Splitting into separate processes requires a Redis or HTTP bridge — adds latency and operational overhead with no benefit at typical OA traffic volumes.
- **Broadcast confirmation is non-negotiable**: `zalo_send_broadcast` without preview risks mass-spamming followers. Always return preview on first call; only execute on explicit re-call with `confirmed: true`.
