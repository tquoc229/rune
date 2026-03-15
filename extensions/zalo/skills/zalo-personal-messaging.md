---
name: zalo-personal-messaging
pack: "@rune/zalo"
description: Personal and group messaging via zca-js — text, media, reactions, group management, mention gating, message buffer for context. UNOFFICIAL — risk-gated.
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-personal-messaging

> ⚠️ Track B (unofficial). See zalo-personal-setup for full risk disclaimer.
> This skill assumes you have completed zalo-personal-setup and have an active API instance.

## Overview

Send messages, media, and reactions to Zalo personal accounts and groups via zca-js. Covers 1:1 DMs, group messaging, mention-gated bot patterns, and context buffering.

---

## Direct Messages (1:1)

```typescript
// Send text
await api.sendMessage('Hello!', threadId, 'User')

// Send image (local file path — download first if URL)
await api.sendMessage({
  body: 'Check this image',
  attachments: [imagePath]
}, threadId, 'User')

// Chunk long messages (2000-char limit applies to DMs too)
async function sendLong(text: string, threadId: string, type: 'User' | 'Group') {
  const chunks = text.match(/.{1,1900}/gs) ?? [text]
  for (const chunk of chunks) {
    await api.sendMessage(chunk, threadId, type)
  }
}
```

---

## Group Messaging

```typescript
// Send to group
await api.sendMessage('Hello group!', groupId, 'Group')

// Send with mention
await api.sendMessage({
  body: '@John check this',
  mentions: [{ pos: 0, len: 5, uid: johnUserId }]
}, groupId, 'Group')

// Group management
await api.createGroup('Bot Test Group', [userId1, userId2]) // min 3 members incl. self
await api.addGroupMembers(groupId, [newMemberId])
await api.removeGroupMembers(groupId, [memberId])
await api.changeGroupName(groupId, 'New Name')
```

---

## Media Types

| Type | Notes |
|------|-------|
| Text | 2000-char limit — chunk if needed |
| Image | Local file path only — download URL first |
| Video | Local file path |
| Voice | Local file path |
| Sticker | By sticker ID — IDs undocumented, capture from received msgs |
| File | Local file path |
| Contact card | User ID reference |
| Link | Auto-generates preview |

---

## Reactions

```typescript
// React to a message (11 types)
await api.sendReaction(messageId, threadId, '❤️', 'User')

// Available: ❤️ 😆 😮 😢 😠 👍 👎 ✊ 🎉 😏 🥰
```

---

## Mention Gating Pattern

For group bots — only process when @mentioned, buffer other messages for context:

```typescript
function isMentioned(msg: GroupMessage, botId: string): boolean {
  return msg.data.mentions?.some(m => m.uid === botId) ?? false
}

listener.on('group_message', async (msg) => {
  if (!isMentioned(msg, BOT_USER_ID)) {
    messageBuffer.push(msg) // buffer for context
    return
  }
  // Bot was mentioned — process with buffered context
  const context = messageBuffer.getRecent(msg.threadId, 20)
  const response = await processWithContext(msg, context)
  await api.sendMessage(response, msg.threadId, 'Group')
})
```

> Use `msg.data.mentions` array — never parse `@` from message text (unreliable).

---

## Message Buffer

Buffer recent group messages per thread for context injection:

```typescript
class MessageBuffer {
  private buffer: Map<string, Message[]> = new Map()
  private maxPerThread = 50

  push(msg: Message) {
    const threadId = msg.threadId
    const msgs = this.buffer.get(threadId) ?? []
    msgs.push(msg)
    if (msgs.length > this.maxPerThread) msgs.shift() // cap to avoid unbounded growth
    this.buffer.set(threadId, msgs)
  }

  getRecent(threadId: string, count: number): Message[] {
    return (this.buffer.get(threadId) ?? []).slice(-count)
  }
}
```

---

## Name Cache

Resolve user IDs to display names with TTL to avoid API hammering:

```typescript
class NameCache {
  private cache = new Map<string, { name: string; expiresAt: number }>()
  private ttl = 60 * 60 * 1000 // 1 hour

  async resolve(userId: string, api: ZaloApi): Promise<string> {
    const cached = this.cache.get(userId)
    if (cached && cached.expiresAt > Date.now()) return cached.name
    try {
      const profile = await api.getUserInfo(userId)
      const name = profile.displayName || 'Unknown'
      this.cache.set(userId, { name, expiresAt: Date.now() + this.ttl })
      return name
    } catch {
      return 'Unknown'
    }
  }
}
```

---

## Event Listeners

```typescript
// DM and group events are SEPARATE — wire both
listener.on('message', async (msg) => {
  // 1:1 personal messages
  const senderId = msg.data.uidFrom
  await handleDM(msg, senderId)
})

listener.on('group_message', async (msg) => {
  // Group messages — includes mention data
  const senderId = msg.data.uidFrom
  await handleGroup(msg, senderId)
})
```

---

## Sharp Edges

- **Separate events**: `message` (DM) vs `group_message` (group) — missing one = silent drop
- **Mention detection**: check `msg.data.mentions` array, not text `@` parsing
- **2000-char limit**: applies to both DM and group — always chunk
- **Image upload**: local file path only — download remote URLs before sending
- **Sticker IDs**: undocumented — sniff from received sticker messages to build your own map
- **Group create**: minimum 3 members including self — 2-member call throws
- **Buffer cap**: always set `maxPerThread` — unbounded growth crashes long-running bots
- **Name cache TTL**: don't skip — `getUserInfo` rate-limited aggressively on personal accounts
