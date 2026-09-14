# Feedback API

LittleStats keeps feedback collection as an API-backed feature. The analytics
tracker does not inject a feedback button, modal, or other interface into a
customer site.

Build feedback UI inside your application and submit it to:

```text
POST /api/v2/feedback/:siteKey
```

Example:

```javascript
await fetch("https://stats.littlestats.click/api/v2/feedback/YOUR_DOMAIN_KEY", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "The user's message",
    rating: 5,
    category: "bug",
    email: "user@example.com",
    metadata: { plan: "pro" }
  })
});
```

Supported submission fields:

- `content`: required message text.
- `rating`: optional number from 1 to 5.
- `category`: optional `general`, `bug`, `feature`, or `other`.
- `email`: optional reply address.
- `metadata`: optional JSON context.
- `visitorId` and `sessionId`: optional analytics identifiers.

Authenticated dashboard endpoints:

- `GET /api/v2/sites/:siteId/feedback`
- `PATCH /api/v2/sites/:siteId/feedback/:feedbackId`
- `DELETE /api/v2/sites/:siteId/feedback/:feedbackId`

Submitted feedback remains available on the site's Feedback dashboard page.
