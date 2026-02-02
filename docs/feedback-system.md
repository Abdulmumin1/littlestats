# Feedback System Documentation

The LittleStats Feedback System allows you to collect, manage, and analyze user feedback directly from your website.

## 1. Tracker Integration

The feedback widget is included by default in the standard tracker script.

### Basic Usage
```html
<script 
  src="https://stats.littlestats.click/tracker.js" 
  data-site-id="YOUR_DOMAIN_KEY"
></script>
```

### Configuration Attributes
- `data-feedback="false"`: Completely disables the feedback system (no API, no UI).
- `data-feedback-ui="false"`: Enables the feedback API but hides the default floating widget. Use this if you want to build your own custom feedback form.

## 2. Public JavaScript API

When the tracker is loaded, it exposes a public API via `window.littlestats`.

### Programmatic Control
- `window.littlestats.showFeedback()`: Opens the default feedback modal.
- `window.littlestats.hideFeedback()`: Closes the default feedback modal.

### Manual Submission (Custom UI)
If you've disabled the default UI with `data-feedback-ui="false"`, you can still submit feedback using:
```javascript
window.littlestats.submit("The user's message", {
  rating: 5,        // Optional: 1-5
  category: "bug",  // Optional: "general", "bug", "feature", "other"
  email: "user@example.com", // Optional
  metadata: {       // Optional: Any additional JSON data
    plan: "pro",
    source: "header-link"
  }
});
```

## 3. Backend API (Internal)

### Public Endpoints
- `POST /api/v2/feedback/:siteKey`: Submit feedback (handles CORS, used by tracker).

### Protected Endpoints (Requires Auth)
- `GET /api/v2/sites/:siteId/feedback`: List feedback with pagination and filters.
- `PATCH /api/v2/sites/:siteId/feedback/:feedbackId`: Update feedback status (`new`, `reviewed`, `resolved`, `archived`).
- `DELETE /api/v2/sites/:siteId/feedback/:feedbackId`: Permanently delete a feedback entry.

## 4. Database Schema

Feedback is stored in the `feedbacks` table with the following information:
- **Content**: The message text.
- **Rating**: 1-5 star rating.
- **Category**: Feedback classification.
- **Context**: Automatically captured URL, Browser, OS, Device, Screen size, and Country.
- **Identity**: Linked to `visitor_id` and `session_id` from analytics.
- **Status**: Management state for internal workflow.
