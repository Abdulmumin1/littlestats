# Littlestats

Data to make business decisions - analytics that helps you understand your users

![alt text](https://mac-file.yaqeen.me/F5AC3A54-Screenshot%202026-02-02%20at%2023.14.55.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: Cloudflare Workers](https://img.shields.io/badge/Stack-Cloudflare_Workers-F38020?logo=cloudflare-workers&logoColor=white)](https://workers.cloudflare.com/)

---

## Features

- **Performance:** < 1kb tracking script. Zero impact on your Core Web Vitals.
- **Real-Time:** Powered by Cloudflare Durable Objects for instant data streaming via WebSockets.
- **Privacy-First:** No cookies, no PII, no tracking across domains. GDPR/CCPA compliant out of the box.
- **Edge-Native:** Runs entirely on the Cloudflare edge (Workers + D1 + Durable Objects).
- **Advanced Tracking:** Automated UTM campaigns, custom events, funnels, and retention analysis.

---

## Project Structure

This is a monorepo managed with `pnpm`:

- [`/packages/dashboard`](./packages/dashboard): **The Backend.** Hono-based API running on Cloudflare Workers.
- [`/packages/web`](./packages/web): **The Frontend.** SvelteKit dashboard for visualizing your data.
- [**Self-Hosting Guide**](./docs/self-hosting.md): Detailed instructions for deploying your own instance to Cloudflare.

---

## Quick Start

### For Users
Simply add the tracking script to your `<head>`:

```html
<script 
  defer 
  data-site="YOUR_SITE_ID" 
  src="https://stats.littlestats.click/tracker.js"
></script>
```

### For Developers (Self-Hosting)
Littlestats is fully open-source and easy to host on your own Cloudflare account.

1. **Clone & Install:**
   ```bash
   git clone https://github.com/abdulmumin1/littlestats.git
   cd littlestats
   pnpm install
   ```

2. **Deploy Backend:**
   Follow the [Self-Hosting Guide](./docs/self-hosting.md) to set up your Cloudflare D1 and deploy the worker.

---

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Real-time:** Cloudflare Durable Objects
- **Frontend:** SvelteKit 5 + Tailwind CSS
- **Auth:** Better Auth
- **API:** Hono

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---
