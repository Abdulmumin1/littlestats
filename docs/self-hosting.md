# Self-Hosting Guide

Littlestats is designed to run on **Cloudflare Workers**, utilizing **D1** for the database and **Durable Objects** for real-time analytics. This guide will walk you through deploying your own instance of Littlestats to your Cloudflare account.

## Prerequisites

- A [Cloudflare](https://dash.cloudflare.com/) account.
- [Cloudflare Workers Paid Plan](https://developers.cloudflare.com/workers/platform/pricing/#workers) (Required for Durable Objects).
- [pnpm](https://pnpm.io/) installed locally.

## Project Structure

Littlestats is a monorepo:
- `packages/dashboard`: The backend API (Hono, D1, Durable Objects).
- `packages/web`: The frontend dashboard (SvelteKit).

---

## 1. Deploying the Dashboard (Backend)

The dashboard handles data collection, authentication, and stats processing.

### Setup Environment

1. Navigate to the dashboard package:
   ```bash
   cd packages/dashboard
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

   - `BETTER_AUTH_SECRET`: A random string for auth security.
   - `BETTER_AUTH_URL`: The URL where your dashboard will be hosted (e.g., `https://stats.yourdomain.com`).
   - `ANALYTICS_DOMAIN`: The domain name only (e.g., `stats.yourdomain.com`).
   - `APP_URL`: The URL of your frontend (e.g., `https://yourdomain.com`).
   - `TRUSTED_ORIGINS`: Comma-separated list of origins allowed to access the API (e.g., `https://yourdomain.com,https://www.yourdomain.com`).
   - `COOKIE_DOMAIN`: The domain to set cookies on (e.g., `.yourdomain.com`). Note the leading dot for subdomains.

### Database Setup

1. Create a D1 database in your Cloudflare account:
   ```bash
   npx wrangler d1 create littlestats-2
   ```

2. Update `wrangler.jsonc` with your new `database_id`.

3. Apply migrations to your remote database:
   ```bash
   pnpm run db:migrate:prod
   ```

### Custom Domains

1. **Custom Domains**: Update the `routes` section in `wrangler.jsonc` to match your desired domain.
   ```jsonc
   "routes": [
     {
       "pattern": "stats.yourdomain.com",
       "custom_domain": true
     }
   ]
   ```

### Deployment


Deploy to Cloudflare:
```bash
pnpm run deploy
```

---

## 2. Deploying the Web App (Frontend)

The web app provides the user interface for viewing your stats.

### Setup Environment

1. Navigate to the web package:
   ```bash
   cd packages/web
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Update the values:
   - `DASHBOARD_URL`: The URL of your deployed dashboard API (e.g., `https://stats.yourdomain.com`).
   - `VITE_DASHBOARD_URL`: Same as above (used for client-side fetches).

### Custom Domains

Update `wrangler.jsonc` in `packages/web` with your frontend domain:
```jsonc
"routes": [
  {
    "pattern": "yourdomain.com",
    "custom_domain": true
  }
],
```

### Deployment

Build and deploy to Cloudflare:
```bash
pnpm run build
pnpm exec wrangler deploy
```

---

## Database Migrations

When you make changes to the schema in `packages/dashboard/src/db/schema.ts`, you need to generate and apply migrations:

1. Generate a new migration:
   ```bash
   pnpm run db:generate
   ```

2. Apply to local for testing:
   ```bash
   pnpm run db:migrate:local
   ```

3. Apply to production:
   ```bash
   pnpm run db:migrate:prod
   ```

## Custom Domains & SSL

Cloudflare handles SSL automatically for custom domains. Ensure your domains are added to your Cloudflare zone and the DNS is pointing to the Workers.

## Troubleshooting

- **CORS Issues**: Ensure all frontend domains (including subdomains) are added to the CORS origins in `packages/dashboard/src/index.ts`.
- **Durable Object Errors**: Ensure you are on the Workers Paid plan, as Durable Objects are not available on the free tier.
- **D1 Migrations**: If migrations fail, check if the `database_id` in `wrangler.jsonc` matches the one created in your Cloudflare dashboard.
