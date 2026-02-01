# LittleStats Analytics v2.0

A complete rewrite of the LittleStats analytics engine with proper session tracking, real-time capabilities, and scalable architecture.

## Architecture

### Core Components

1. **DomainAnalyticsDO** - Durable Object (one per site)
   - Session management with 30-min timeout
   - Real-time stats aggregation
   - WebSocket connections for live dashboards
   - Batch D1 persistence

2. **Tracking Script** - Client-side JavaScript
   - No cookies (localStorage-based)
   - Automatic SPA navigation detection
   - Debounced pageviews (prevents duplicates)
   - Beacon API for reliable delivery

3. **Dashboard API** - Stats and aggregation queries
   - Time series data
   - Breakdown by referrer, page, country, device, browser
   - Custom events tracking
   - Pre-aggregated stats for performance

4. **Database Schema** - D1 (SQLite)
   - 16 tables: auth, sites, sessions, events, stats
   - Proper indexes for query performance
   - Data retention policies

## API Endpoints

## Tracking Script Usage

### Basic Setup

Add the tracker script to your website:

```html
<script src="https://analytics.yourdomain.com/tracker.js" data-site-id="your-site-id"></script>
```

The tracker automatically tracks:
- Pageviews on initial load and navigation
- Time spent on each page
- Referrer information
- Screen size and language
- User timezone

### Custom Events

Track custom events using the global `track` function:

```javascript
// Simple event
track('button_click');

// Event with data
track('purchase_complete', {
  orderId: '12345',
  value: 99.99,
  currency: 'USD'
});

// Event with additional properties
track('form_submitted', {
  formName: 'contact',
  fieldsCompleted: 5
});
```

### Identifying Users

Associate events with a user ID:

```javascript
// After user logs in
identify('user_123', {
  email: 'user@example.com',
  plan: 'premium'
});
```

### Available Global Functions

```javascript
// Track custom events
track(eventName, eventData);

// Identify users
identify(userId, userData);

// Manually track a pageview
littlestats.trackPageView();

// Destroy tracker (cleanup)
littlestats.destroy();
```

### API Endpoints

### Tracking
- `POST /api/v2/track/:siteId` - Track events
- `GET /tracker.js` - Tracking script

### Real-Time
- `GET /api/v2/realtime/:siteId` - WebSocket endpoint
- `GET /api/v2/stats/:siteId` - Current stats

### Dashboard
- `GET /api/v2/sites` - List sites
- `POST /api/v2/sites` - Create site
- `GET /api/v2/sites/:id/stats` - Stats summary
- `GET /api/v2/sites/:id/timeseries` - Time series data
- `GET /api/v2/sites/:id/referrers` - Top referrers
- `GET /api/v2/sites/:id/pages` - Top pages
- `GET /api/v2/sites/:id/countries` - Top countries
- `GET /api/v2/sites/:id/devices` - Device breakdown
- `GET /api/v2/sites/:id/browsers` - Browser breakdown
- `GET /api/v2/sites/:id/events` - Custom events

## Quick Start

### Local Development

```bash
cd packages/dashboard

# Install dependencies
pnpm install

# Apply database schema locally
pnpm db:migrate:local

# Start dev server
pnpm dev

# Test endpoints
curl -X POST http://localhost:8787/api/v2/sites \
  -H "Content-Type: application/json" \
  -d '{"domain": "test.com", "name": "Test Site"}'
```

### Production Deployment

```bash
# Deploy worker
pnpm deploy

# Apply schema to production database
pnpm db:migrate:prod

# Set secrets
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## Migration from v1

### 1. Migrate Users (PocketBase → Better-Auth)

```bash
export PB_URL="https://your-pocketbase.com"
export PB_ADMIN_EMAIL="admin@example.com"
export PB_ADMIN_PASSWORD="password"
export D1_DATABASE_ID="your-d1-id"
export CF_ACCOUNT_ID="your-account-id"
export CF_API_TOKEN="your-api-token"

npx tsx scripts/migrate-pocketbase.ts --execute
```

### 2. Migrate Events (v1 → v2)

```bash
export D1_DATABASE_ID="your-d1-id"
export CF_ACCOUNT_ID="your-account-id"
export CF_API_TOKEN="your-api-token"

npx tsx scripts/migrate-v1-to-v2.ts --execute
```

## File Structure

```
packages/dashboard/
├── src/
│   ├── durable-objects/
│   │   └── DomainAnalyticsDO.ts    # Core DO implementation
│   ├── lib/
│   │   ├── dashboard-api.ts         # Stats queries
│   │   └── tracker.ts               # Tracking script source
│   ├── auth/
│   │   ├── index.ts                 # Auth config
│   │   └── adapters/
│   │       └── d1.ts                # D1 adapter for better-auth
│   ├── db/
│   │   └── schema.sql               # Database schema
│   ├── types/
│   │   ├── index.ts                 # Type exports
│   │   ├── env.ts                   # Environment types
│   │   ├── analytics.ts             # Event types
│   │   ├── durable-objects.ts       # DO state types
│   │   ├── database.ts              # DB entity types
│   │   ├── dashboard.ts             # Dashboard types
│   │   ├── auth.ts                  # Auth types
│   │   ├── site.ts                  # Site types
│   │   ├── billing.ts               # Subscription types
│   │   └── common.ts                # Shared types
│   └── index.ts                     # Worker entry point
├── scripts/
│   ├── migrate-pocketbase.ts        # User migration
│   ├── migrate-v1-to-v2.ts          # Events migration
│   └── test-v2.ts                   # Test suite
├── wrangler.jsonc                   # Wrangler config
└── package.json                     # Dependencies
```

## Key Improvements over v1

1. **Session Tracking** - Proper 30-min timeout, visit concept
2. **No Duplicate Pageviews** - Debouncing prevents tab switch issues
3. **Real-Time** - WebSocket connections for live dashboards
4. **State Persistence** - DO storage on every update (no data loss)
5. **Better Architecture** - One DO per domain, proper separation of concerns
6. **Typed Properties** - Custom events with typed properties
7. **Pre-Aggregation** - Hourly stats for fast dashboard queries
8. **Modern Auth** - Better-auth instead of PocketBase

## Testing

```bash
# Run test suite
export TEST_URL=http://localhost:8787
npx tsx scripts/test-v2.ts
```

## Documentation

- `ARCHITECTURE.md` - Detailed architecture specification
- `IMPLEMENTATION.md` - Implementation details and status

## License

MIT
