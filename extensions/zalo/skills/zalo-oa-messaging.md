---
name: zalo-oa-messaging
pack: "@rune/zalo"
description: All 8 OA message types (text, image, file, sticker, list, template, transaction, promotion), follower management, and broadcast with demographic targeting.
model: sonnet
tools: "Read, Glob, Grep, Bash, Write, Edit"
---

# zalo-oa-messaging

Send any of the 8 Zalo OA message types, manage followers, and run broadcast campaigns via the v3 Official Account API.

## Base Config

```
Base URL : https://openapi.zalo.me/v3.0/oa
Upload   : https://openapi.zalo.me/v2.0/oa  (intentional version mismatch)
Auth     : Authorization: Bearer {oa_access_token}
Content  : Content-Type: application/json
Endpoint : POST /message/cs  (all 8 CS message types)
```

## Step 1 — Identify the Message Type

| # | Type | Use Case | Constraint |
|---|------|----------|------------|
| 1 | Text | Simple reply, notification | 2000 char limit |
| 2 | Image | Product photo, banner | attachment_id from upload |
| 3 | File | PDF, invoice, document | attachment_id from upload |
| 4 | Sticker | Friendly interaction | sticker_id from catalog |
| 5 | List | Menu, product listing | max 10 items |
| 6 | Template | CTA with buttons | max 5 buttons |
| 7 | Transaction | Order/shipping update | pre-approved template required |
| 8 | Promotion | Marketing campaign | approved template + quota |

**All CS messages**: only sendable within 7 days of user's last interaction with the OA.

---

## Step 2 — Send the Right Payload

### Type 1 — Text Message

```http
POST https://openapi.zalo.me/v3.0/oa/message/cs
Authorization: Bearer {oa_access_token}

{
  "recipient": { "user_id": "4337842264521611405" },
  "message": { "text": "Xin chào! Chúng tôi có thể giúp gì cho bạn?" }
}
```

Response (success):
```json
{ "error": 0, "message": "Success", "data": { "message_id": "oaMsgId.567890" } }
```

---

### Type 2 — Image Message

Upload first (v2.0 endpoint), then send:

```http
POST https://openapi.zalo.me/v2.0/oa/upload/image
Authorization: Bearer {oa_access_token}
Content-Type: multipart/form-data

file=@banner.jpg   (max 1MB)
```

```json
{ "error": 0, "data": { "attachment_id": "f8d5a7e1-2b3c-4d5e-8f9a-1b2c3d4e5f6a" } }
```

Then send:

```json
{
  "recipient": { "user_id": "4337842264521611405" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "media",
        "elements": [{
          "media_type": "image",
          "attachment_id": "f8d5a7e1-2b3c-4d5e-8f9a-1b2c3d4e5f6a"
        }]
      }
    }
  }
}
```

---

### Type 3 — File Message

```http
POST https://openapi.zalo.me/v2.0/oa/upload/file
Authorization: Bearer {oa_access_token}
Content-Type: multipart/form-data

file=@invoice.pdf   (max 5MB)
```

```json
{ "error": 0, "data": { "attachment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890" } }
```

Send payload same shape as image but `"media_type": "file"`.

---

### Type 4 — Sticker Message

```json
{
  "recipient": { "user_id": "4337842264521611405" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "media",
        "elements": [{ "media_type": "sticker", "attachment_id": "87521" }]
      }
    }
  }
}
```

Sticker IDs: fetch from Zalo sticker catalog. Common IDs: 87521 (thumbs up), 87522 (heart), 87523 (smile).

---

### Type 5 — List Message

```json
{
  "recipient": { "user_id": "4337842264521611405" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "list",
        "elements": [
          {
            "title": "Sản phẩm A",
            "subtitle": "Giá: 299.000đ",
            "image_url": "https://cdn.example.com/product-a.jpg",
            "default_action": { "type": "oa.open.url", "url": "https://example.com/product-a" }
          },
          {
            "title": "Sản phẩm B",
            "subtitle": "Giá: 199.000đ",
            "image_url": "https://cdn.example.com/product-b.jpg",
            "default_action": { "type": "oa.open.url", "url": "https://example.com/product-b" }
          }
        ],
        "buttons": [{
          "title": "Xem tất cả sản phẩm",
          "type": "oa.open.url",
          "payload": { "url": "https://example.com/products" }
        }]
      }
    }
  }
}
```

Limits: max 10 elements, max 5 buttons at bottom.

---

### Type 6 — Template Message (Button Template)

```json
{
  "recipient": { "user_id": "4337842264521611405" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Chọn hành động bạn muốn thực hiện:",
        "buttons": [
          {
            "title": "Xem đơn hàng",
            "type": "oa.open.url",
            "payload": { "url": "https://example.com/orders" }
          },
          {
            "title": "Gọi hỗ trợ",
            "type": "oa.open.phone",
            "payload": { "phone_code": "0901234567" }
          },
          {
            "title": "Theo dõi vận chuyển",
            "type": "oa.query.show",
            "payload": { "content": "TRACK_ORDER_12345" }
          }
        ]
      }
    }
  }
}
```

Button types: `oa.open.url`, `oa.open.phone`, `oa.query.show` (postback), `oa.open.sms`.

---

### Type 7 — Transaction Message

Requires a pre-approved template from Zalo OA portal. Cannot send arbitrary content.

```json
{
  "recipient": { "user_id": "4337842264521611405" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "transaction_order",
        "language": "VI",
        "elements": [{
          "attachment_id": "approved-template-id-from-zalo",
          "type": "banner"
        }],
        "parameters": {
          "order_id": "ORD-2026-001234",
          "order_status": "Đã giao hàng",
          "delivery_date": "15/03/2026",
          "tracking_url": "https://example.com/track/ORD-2026-001234"
        }
      }
    }
  }
}
```

Template must match an approved template ID. Parameter keys defined by the template.

---

### Type 8 — Promotion Message

Requires approved template + sufficient broadcast quota.

```json
{
  "recipient": { "user_id": "4337842264521611405" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "promotion",
        "language": "VI",
        "elements": [{
          "attachment_id": "approved-promo-banner-id",
          "type": "banner"
        }],
        "parameters": {
          "coupon_code": "SALE30",
          "discount": "30%",
          "expiry": "31/03/2026"
        }
      }
    }
  }
}
```

---

## Step 3 — Long Text Chunking

Text limit is 2000 chars. Chunk before sending:

```typescript
function chunkMessage(text: string, limit = 2000): string[] {
  if (text.length <= limit) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    if (remaining.length <= limit) { chunks.push(remaining); break }
    let splitAt = remaining.lastIndexOf('\n', limit)
    if (splitAt === -1) splitAt = remaining.lastIndexOf(' ', limit)
    if (splitAt === -1) splitAt = limit
    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt).trimStart()
  }
  return chunks
}

// Send each chunk with delay to respect rate limits
for (const chunk of chunkMessage(longText)) {
  await sendTextMessage(userId, chunk)
  await new Promise(r => setTimeout(r, 300))
}
```

---

## Step 4 — Follower Management

### List Followers

```http
GET https://openapi.zalo.me/v3.0/oa/user/getlist?offset=0&count=50
Authorization: Bearer {oa_access_token}
```

```json
{
  "error": 0,
  "data": {
    "users": [
      { "user_id": "4337842264521611405", "display_name": "Nguyen Van A", "followed_date": 1709827200 }
    ],
    "total": 1250,
    "offset": 0,
    "count": 50
  }
}
```

Paginate: increment `offset` by `count` until `offset >= total`.

### User Profile

```http
GET https://openapi.zalo.me/v3.0/oa/user/detail?user_id=4337842264521611405
Authorization: Bearer {oa_access_token}
```

```json
{
  "error": 0,
  "data": {
    "user_id": "4337842264521611405",
    "display_name": "Nguyen Van A",
    "birth_date": 0,
    "gender": 1,
    "phone": "",
    "city": "Ho Chi Minh City",
    "district": "",
    "tags_and_notes_info": { "tag_names": ["VIP", "Repeat-buyer"] }
  }
}
```

Note: `user_id` is OA-scoped — same person has a different `user_id` for each OA they follow.

### Tag Management

```http
POST https://openapi.zalo.me/v3.0/oa/tag/tagfollower
Authorization: Bearer {oa_access_token}

{ "user_id": "4337842264521611405", "tag_name": "VIP" }
```

```http
POST https://openapi.zalo.me/v3.0/oa/tag/rmfollowerfromtag
Authorization: Bearer {oa_access_token}

{ "user_id": "4337842264521611405", "tag_name": "VIP" }
```

---

## Step 5 — Broadcast

```http
POST https://openapi.zalo.me/v3.0/oa/message/promotion
Authorization: Bearer {oa_access_token}

{
  "recipient": {
    "target": {
      "gender": 1,
      "ages": ["18-25", "26-35"],
      "cities": ["Ho Chi Minh City", "Ha Noi"],
      "platforms": ["iOS", "Android"],
      "telcos": ["Viettel", "Mobifone"]
    }
  },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "promotion",
        "language": "VI",
        "elements": [{ "attachment_id": "approved-promo-banner-id", "type": "banner" }],
        "parameters": { "coupon_code": "SUMMER30", "discount": "30%" }
      }
    }
  }
}
```

Response includes estimated reach count before send is confirmed. Quota resets monthly.

---

## Sharp Edges

- **7-day CS window** — `error: 12` means the user hasn't interacted in 7 days. Cannot bypass. Solution: use Transaction or Promotion templates (pre-approved) which ignore the window.
- **Version mismatch is intentional** — upload endpoints stay on `v2.0`, message send is `v3.0`. Do not "fix" this.
- **OA-scoped user_id** — never assume the same physical person has the same `user_id` across different OAs. Always store per-OA.
- **Template approval lag** — Transaction/Promotion templates take 1-5 business days to approve. Plan ahead; cannot substitute with CS messages after approval delay.
- **Image 1MB / File 5MB hard limits** — compress images server-side before upload. Zalo returns `error: 201` for oversized files.
- **Broadcast quota** — based on follower count × OA verification tier. Track monthly usage; `error: 133` = quota exceeded.
- **Button limit 5** — template messages silently drop buttons beyond index 4. Always validate `buttons.length <= 5` before sending.

## Error Codes Quick Reference

| Code | Meaning | Fix |
|------|---------|-----|
| 0 | Success | — |
| 12 | Outside 7-day CS window | Use approved template type |
| 14 | Invalid access token | Refresh token, retry |
| 107 | Invalid recipient | Verify user_id is OA-scoped and valid |
| 133 | Broadcast quota exceeded | Wait for monthly reset |
| 201 | File size exceeded | Compress/split before upload |
| 216 | Template not approved | Submit template for Zalo review |
