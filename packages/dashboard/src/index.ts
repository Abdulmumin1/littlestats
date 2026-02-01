// LittleStats Analytics v2.0 - Worker Entry Point
// Cloudflare Workers + Durable Objects + D1

import { Hono } from "hono";
import { cors } from "hono/cors";
import { DomainAnalyticsDO } from "./durable-objects/DomainAnalyticsDO";
import { createAuth } from "./auth";
import type { Env } from "./types";
import { DashboardAPI } from "./lib/dashboard-api";
import DodoPayments from "dodopayments";

// Export Durable Object class
export { DomainAnalyticsDO };

// Create Hono app with proper types
type Variables = {
  user: any;
  session: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Helper to check site ownership
async function checkSiteOwnership(c: any, siteId: string) {
  const user = c.get("user");
  if (!user) return false;

  const site = await c.env.DB.prepare(
    "SELECT id FROM sites WHERE id = ? AND user_id = ?"
  ).bind(siteId, user.id).first();
  
  return !!site;
}

// ============================================
// Middleware
// ============================================

// CORS for tracking endpoint (dynamic origin)
app.use("/api/v2/track/*", async (c: any, next: () => Promise<void>) => {
  const origin = c.req.header("Origin") || "*";
  
  // Set CORS headers manually
  c.res.headers.set("Access-Control-Allow-Origin", origin);
  c.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  c.res.headers.set("Access-Control-Max-Age", "86400");
  
  // If credentials are sent/requested, we must set specific origin, not *
  // However, tracking requests usually don't need credentials.
  // If the client sends credentials, we can allow it by reflecting origin.
  if (origin !== "*") {
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle OPTIONS request directly
  if (c.req.method === "OPTIONS") {
		c.status(204);
		return c.body(null);
  }

  await next();
});

// CORS for API (specific origins)
app.use("/api/v2/*", cors({
  origin: ["http://localhost:5173", "https://littlestats.click", "https://www.littlestats.click"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
}));

// ============================================
// Better-Auth Authentication
// ============================================

// CORS for auth endpoints (must be before auth handler)
app.use("/api/auth/*", cors({
  origin: ["http://localhost:5173", "http://localhost:8787", "https://littlestats.click", "https://www.littlestats.click"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
}));

// Auth middleware for protected API routes
const authMiddleware = async (c: any, next: any) => {
  if (c.req.method === "OPTIONS") return await next();
  
  try {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session || !session.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    await next();
  } catch (error) {
    console.error("[Auth] Middleware error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
};

// Apply auth middleware to protected routes
app.use("/api/v2/sites/*", authMiddleware);
app.use("/api/v2/sites", authMiddleware);
app.use("/api/v2/sites/:siteId/verify", authMiddleware);
app.use("/api/v2/realtime/:siteId", authMiddleware);
app.use("/api/v2/stats/:siteId", authMiddleware);
app.use("/api/v2/health/:siteId", authMiddleware);
app.use("/api/v2/billing/checkout", authMiddleware);
app.use("/api/v2/billing/subscription", authMiddleware);
app.use("/api/v2/billing/usage", authMiddleware);

// Mount better-auth handler at /api/auth/*
app.all("/api/auth/*", async (c) => {
  const auth = createAuth(c.env);
  const response = await auth.handler(c.req.raw);
  
  // Ensure CORS headers are preserved in the response
  const newHeaders = new Headers(response.headers);
  const origin = c.req.header("Origin");
  
  if (origin && ["http://localhost:5173", "http://localhost:8787", "https://littlestats.click", "https://www.littlestats.click"].includes(origin)) {
    newHeaders.set("Access-Control-Allow-Origin", origin);
    newHeaders.set("Access-Control-Allow-Credentials", "true");
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
});

// ============================================
// Tracking Script Endpoint
// ============================================

// Serve the tracking script
app.get("/tracker.js", async (c) => {
  const script = await generateTrackerScript(c.env);
  
  const origin = c.req.header("Origin");
  
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": origin || "*",
    },
  });
});

// ============================================
// v2 API Routes
// ============================================

// Track endpoint - Routes to DomainAnalyticsDO
app.post("/api/v2/track/:siteId", async (c) => {
  const siteId = c.req.param("siteId");
  
  try {
    // Get the DO instance for this site
    const id = c.env.ANALYTICS_DO.idFromName(siteId);
    const doStub = c.env.ANALYTICS_DO.get(id);
    
    // Clone the request and add site_id to URL
    const url = new URL(c.req.url);
    url.pathname = "/track";
    url.searchParams.set("site_id", siteId);
    
    const newRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.header(),
      body: await c.req.blob(),
    });
    
    // Forward to DO
    const response = await doStub.fetch(newRequest);
    
    // Copy response headers for CORS
    const origin = c.req.header("Origin") || "*";
    const corsHeaders: Record<string, string> = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    if (origin !== "*") {
      corsHeaders["Access-Control-Allow-Credentials"] = "true";
    }
    
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
    
  } catch (error) {
    console.error("[Worker] Track error:", error);
    return c.json({ error: "Failed to track event" }, { status: 500 });
  }
});

// Real-time WebSocket endpoint
app.get("/api/v2/realtime/:siteId", async (c) => {
  const siteId = c.req.param("siteId");
  const upgrade = c.req.header("Upgrade");
  
  if (upgrade !== "websocket") {
    return c.json({ error: "Expected websocket upgrade" }, { status: 400 });
  }
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  try {
    // Get the DO instance
    const id = c.env.ANALYTICS_DO.idFromName(siteId);
    const doStub = c.env.ANALYTICS_DO.get(id);
    
    // Clone request with correct pathname
    const url = new URL(c.req.url);
    url.pathname = "/realtime";
    url.searchParams.set("site_id", siteId);
    
    const newRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.header(),
    });
    
    // Forward WebSocket upgrade to DO
    return await doStub.fetch(newRequest);
    
  } catch (error) {
    console.error("[Worker] WebSocket error:", error);
    return c.json({ error: "WebSocket connection failed" }, { status: 500 });
  }
});

// Stats endpoint
app.get("/api/v2/stats/:siteId", async (c) => {
  const siteId = c.req.param("siteId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  try {
    const id = c.env.ANALYTICS_DO.idFromName(siteId);
    const doStub = c.env.ANALYTICS_DO.get(id);
    
    const url = new URL(c.req.url);
    url.pathname = "/stats";
    url.searchParams.set("site_id", siteId);
    
    const newRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: c.req.header(),
    });
    
    return await doStub.fetch(newRequest);
    
  } catch (error) {
    console.error("[Worker] Stats error:", error);
    return c.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
});

// Health check
app.get("/api/v2/health/:siteId", async (c) => {
  const siteId = c.req.param("siteId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  try {
    const id = c.env.ANALYTICS_DO.idFromName(siteId);
    const doStub = c.env.ANALYTICS_DO.get(id);
    
    const response = await doStub.fetch(new Request("http://internal/health"));
    return response;
    
  } catch (error) {
    return c.json({ 
      status: "error", 
      siteId,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
});

// ============================================
// Site Management
// ============================================

// Create new site
app.post("/api/v2/sites", async (c) => {
  try {
    const body = await c.req.json();
    const { domain, name } = body;
    
    // Get user from auth context
    const user = c.get("user");
    
    // Validate domain
    if (!domain || !isValidDomain(domain)) {
      return c.json({ error: "Invalid domain" }, { status: 400 });
    }
    
    // Check if domain is already claimed AND verified by someone else
    const existingVerified = await c.env.DB.prepare(
      "SELECT id FROM sites WHERE domain = ? AND verified_at IS NOT NULL"
    ).bind(domain).first();
    
    if (existingVerified) {
      return c.json({ error: "This domain has already been verified by another user." }, { status: 409 });
    }

    // Check plan limits (Domain Limit)
    // 1. Check if user has active subscription
    const subscription = await c.env.DB.prepare(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'"
    ).bind(user.id).first();
    const isPaid = !!subscription;

    // 2. Count existing sites
    const { count } = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM sites WHERE user_id = ?"
    ).bind(user.id).first() as { count: number };

    // 3. Define limits: Free = 2, Paid = 10
    const limit = isPaid ? 10 : 2;

    if (count >= limit) {
      return c.json({ 
        error: `Plan limit reached. You can only create up to ${limit} sites on your current plan.` 
      }, { status: 403 });
    }
    
    // Create site
    const siteId = crypto.randomUUID();
    const domainKey = generateDomainKey();
    const verificationToken = "ls-verify-" + crypto.randomUUID().split("-")[0];
    
    const userId = user.id;
    
    await c.env.DB.prepare(`
      INSERT INTO sites (id, domain, user_id, name, domain_key, plan, verification_token)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(siteId, domain, userId, name || domain, domainKey, "free", verificationToken).run();
    
    return c.json({
      id: siteId,
      domain,
      domainKey,
      verificationToken,
      embedCode: `<script src="https://${c.env.ANALYTICS_DOMAIN}/tracker.js" data-site-id="${domainKey}"></script>`,
    }, { status: 201 });
    
  } catch (error) {
    console.error("[Worker] Create site error:", error);
    return c.json({ error: "Failed to create site" }, { status: 500 });
  }
});

    // Get user's sites
    app.get("/api/v2/sites", async (c) => {
      try {
        const user = c.get("user");
        const userId = user.id;
        
        const { results } = await c.env.DB.prepare(`
          SELECT s.*, 
            (SELECT COUNT(*) FROM sessions WHERE site_id = s.id) as session_count,
            (SELECT COUNT(*) FROM events WHERE site_id = s.id AND created_at >= datetime('now', '-24 hours')) as events_24h
          FROM sites s
          WHERE s.user_id = ?
          ORDER BY s.created_at DESC
        `).bind(userId).all();
        
        // Map snake_case to camelCase
        const sites = results.map((s: any) => ({
          id: s.id,
          domain: s.domain,
          name: s.name,
          plan: s.plan,
          planStatus: s.plan_status,
          domainKey: s.domain_key,
          verificationToken: s.verification_token,
          verifiedAt: s.verified_at,
          createdAt: s.created_at,
          sessionCount: s.session_count,
          events24h: s.events_24h
        }));
        
        return c.json({ sites });
        
      } catch (error) {
        console.error("[Worker] List sites error:", error);
        return c.json({ error: "Failed to list sites" }, { status: 500 });
      }
    });

// Delete site
app.delete("/api/v2/sites/:siteId", async (c) => {
  const siteId = c.req.param("siteId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  try {
    await c.env.DB.prepare("DELETE FROM sites WHERE id = ?").bind(siteId).run();
    return c.json({ success: true });
  } catch (error) {
    console.error("[Worker] Delete site error:", error);
    return c.json({ error: "Failed to delete site" }, 500);
  }
});

// Verify site domain ownership
app.post("/api/v2/sites/:siteId/verify", async (c) => {
  const siteId = c.req.param("siteId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  try {
    const site = await c.env.DB.prepare(
      "SELECT domain, verification_token, verified_at FROM sites WHERE id = ?"
    ).bind(siteId).first<{ domain: string, verification_token: string, verified_at: number }>();

    if (!site) {
      return c.json({ error: "Site not found" }, 404);
    }

    if (site.verified_at) {
      return c.json({ success: true, verified: true, message: "Domain already verified" });
    }

    if (!site.verification_token) {
      // Should not happen for new sites, but handle legacy
      const token = "ls-verify-" + crypto.randomUUID().split("-")[0];
      await c.env.DB.prepare(
        "UPDATE sites SET verification_token = ? WHERE id = ?"
      ).bind(token, siteId).run();
      return c.json({ 
        success: false, 
        verified: false, 
        error: "Verification token was missing. A new one has been generated. Please add it to your DNS records and try again.",
        token 
      });
    }

    // Verify DNS
    const isVerified = await verifyDnsToken(site.domain, site.verification_token);

    if (isVerified) {
      // Final check: ensure no one else verified it just now
      const existingVerified = await c.env.DB.prepare(
        "SELECT id FROM sites WHERE domain = ? AND verified_at IS NOT NULL AND id != ?"
      ).bind(site.domain, siteId).first();

      if (existingVerified) {
        return c.json({ 
          success: false, 
          verified: false, 
          error: "This domain was just verified by another user." 
        });
      }

      // Mark as verified
      await c.env.DB.prepare(
        "UPDATE sites SET verified_at = datetime('now') WHERE id = ?"
      ).bind(siteId).run();

      // Cleanup: Delete other unverified claims for this domain
      await c.env.DB.prepare(
        "DELETE FROM sites WHERE domain = ? AND id != ? AND verified_at IS NULL"
      ).bind(site.domain, siteId).run();
      
      return c.json({ success: true, verified: true });
    } else {
      return c.json({ 
        success: false, 
        verified: false, 
        error: "Verification token not found in DNS TXT records. Please check your DNS settings and try again. Note that DNS changes can take some time to propagate." 
      });
    }

  } catch (error) {
    console.error("[Worker] Verify site error:", error);
    return c.json({ error: "Failed to verify site" }, 500);
  }
});

// Dashboard Stats API
app.get("/api/v2/sites/:siteId/stats", async (c) => {
  const siteId = c.req.param("siteId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
    urlPattern: c.req.query("page"),
    referrerDomain: c.req.query("referrer"),
    country: c.req.query("country"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const stats = await api.getStatsSummary(filter);
  return c.json(stats);
});

app.get("/api/v2/sites/:siteId/timeseries", async (c) => {
  const siteId = c.req.param("siteId");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
    urlPattern: c.req.query("page"),
    referrerDomain: c.req.query("referrer"),
    country: c.req.query("country"),
  };
  const granularity = c.req.query("granularity") as 'hour' | 'day' || 'day';

  const api = new DashboardAPI(c.env.DB, siteId);
  const data = await api.getTimeSeries(filter, granularity);
  return c.json({ data });
});

app.get("/api/v2/sites/:siteId/referrers", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");
  const q = c.req.query("q");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
    urlPattern: c.req.query("page"),
    referrerDomain: c.req.query("referrer"),
    country: c.req.query("country"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const referrers = await api.getTopReferrers(filter, limit, { q });
  return c.json({ referrers });
});

app.get("/api/v2/sites/:siteId/pages", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");
  const q = c.req.query("q");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
    urlPattern: c.req.query("page"),
    referrerDomain: c.req.query("referrer"),
    country: c.req.query("country"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const pages = await api.getTopPages(filter, limit, { q });
  return c.json({ pages });
});

app.get("/api/v2/sites/:siteId/countries", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");
  const q = c.req.query("q");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
    urlPattern: c.req.query("page"),
    referrerDomain: c.req.query("referrer"),
    country: c.req.query("country"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const countries = await api.getTopCountries(filter, limit, { q });
  return c.json({ countries });
});

app.get("/api/v2/sites/:siteId/devices", async (c) => {
  const siteId = c.req.param("siteId");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const api = new DashboardAPI(c.env.DB, siteId);
  const devices = await api.getDeviceBreakdown({});
  return c.json({ devices });
});

app.get("/api/v2/sites/:siteId/browsers", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const api = new DashboardAPI(c.env.DB, siteId);
  const browsers = await api.getBrowserBreakdown({}, limit);
  return c.json({ browsers });
});

app.get("/api/v2/sites/:siteId/events", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "100");
  const cursor = c.req.query("cursor");
  const eventName = c.req.query("eventName");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
    excludePageview: c.req.query("excludePageview") === 'true',
  };

  const api = new DashboardAPI(c.env.DB, siteId);

  let parsedCursor: { timestamp: string; id: number } | undefined;
  if (cursor) {
    const [ts, idStr] = cursor.split(",");
    const id = Number(idStr);
    if (ts && Number.isFinite(id)) {
      parsedCursor = { timestamp: ts, id };
    }
  }

  const result = await api.getEventsList(filter, { limit, cursor: parsedCursor, eventName });
  const nextCursor = result.nextCursor ? `${result.nextCursor.timestamp},${result.nextCursor.id}` : null;
  return c.json({ events: result.events, total: result.total, nextCursor });
});

app.get("/api/v2/sites/:siteId/custom-events", async (c) => {
  const siteId = c.req.param("siteId");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const events = await api.getCustomEvents(filter);
  return c.json({ events });
});

// ============================================
// Campaigns & Goals (MVP)
// ============================================

app.get("/api/v2/sites/:siteId/event-names", async (c) => {
  const siteId = c.req.param("siteId");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const api = new DashboardAPI(c.env.DB, siteId);
  const eventNames = await api.getEventNames();
  return c.json({ eventNames });
});

app.get("/api/v2/sites/:siteId/campaigns", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "20");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
  };

  const goalEventName = c.req.query("goal") || undefined;

  const api = new DashboardAPI(c.env.DB, siteId);
  const campaigns = await api.getCampaigns(filter, limit, goalEventName);
  return c.json({ campaigns });
});

app.get("/api/v2/sites/:siteId/campaigns/segmented-timeseries", async (c) => {
  const siteId = c.req.param("siteId");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
  };

  const groupBy = (c.req.query("groupBy") || "source") as "source" | "medium";
  const metric = (c.req.query("metric") || "conversions") as "conversions" | "visits";
  const granularity = (c.req.query("granularity") || "day") as "day" | "hour";
  const segmentsLimit = parseInt(c.req.query("segmentsLimit") || "6");

  const goalEventName = c.req.query("goal") || undefined;

  const api = new DashboardAPI(c.env.DB, siteId);
  const series = await api.getCampaignsSegmentedTimeSeries(filter, {
    groupBy,
    metric,
    granularity,
    segmentsLimit,
    goalEventName,
  });
  return c.json(series);
});

app.post("/api/v2/sites/:siteId/funnels/analyze", async (c) => {
  const siteId = c.req.param("siteId");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  const body = await c.req.json<{
    steps: Array<{ type: 'url' | 'event'; value: string; name?: string }>;
    funnelType?: 'session' | 'user';
    startDate?: string;
    endDate?: string;
  }>();

  if (!body.steps || body.steps.length === 0) {
    return c.json({ error: "steps array is required" }, 400);
  }

  const filter = {
    startDate: body.startDate,
    endDate: body.endDate,
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const result = await api.analyzeFunnel(filter, body.steps, body.funnelType || 'session');
  return c.json(result);
});

app.get("/api/v2/sites/:siteId/funnels", async (c) => {
  const siteId = c.req.param("siteId");
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  const api = new DashboardAPI(c.env.DB, siteId);
  const funnels = await api.listFunnels();
  return c.json({ funnels });
});

app.post("/api/v2/sites/:siteId/funnels", async (c) => {
  const siteId = c.req.param("siteId");
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  const body = await c.req.json<{
    id?: string;
    name: string;
    type: 'session' | 'user';
    steps: any[];
  }>();
  const api = new DashboardAPI(c.env.DB, siteId);
  const result = await api.saveFunnel(body);
  return c.json(result);
});

app.delete("/api/v2/sites/:siteId/funnels/:funnelId", async (c) => {
  const siteId = c.req.param("siteId");
  const funnelId = c.req.param("funnelId");
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  const api = new DashboardAPI(c.env.DB, siteId);
  await api.deleteFunnel(funnelId);
  return c.json({ success: true });
});

app.get("/api/v2/sites/:siteId/goals/summary", async (c) => {
  const siteId = c.req.param("siteId");
  const goalEventName = c.req.query("goalEventName");

  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }

  if (!goalEventName) {
    return c.json({ error: "goalEventName query parameter is required" }, 400);
  }

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const summary = await api.getGoalSummary(filter, goalEventName);
  return c.json(summary);
});

// ============================================
// Billing & Payments (Dodo Payments)
// ============================================

// Product IDs - Using provided test and live product IDs
const DODO_PRODUCTS = {
  test: {
    monthly: 'pdt_0NXY8Oz1kUf3jfQMcJH84',
  },
  live: {
    monthly: 'pdt_0NXY5RTCJcXsqRiV3U2Tm',
  }
};

// Helper to get Dodo client
function getDodoClient(env: Env) {
  const isTestMode = env.DODO_PAYMENTS_ENV === 'test';
  return new DodoPayments({
    bearerToken: env.DODO_PAYMENTS_API_KEY,
    environment: isTestMode ? 'test_mode' : 'live_mode',
  });
}

// Get available checkout options
app.get("/api/v2/billing/checkout-options", async (c) => {
  try {
    const isTestMode = c.env.DODO_PAYMENTS_ENV === 'test';
    const products = isTestMode ? DODO_PRODUCTS.test : DODO_PRODUCTS.live;
    
    // Return checkout options matching the frontend format
    // Format: [priceInCents, currency, billingInterval, checkoutUrlOrId]
    const checkoutOptions = [
      [400, 'USD', 'monthly', products.monthly],  // $4/month
    ];
    
    return c.json({ checkout: checkoutOptions });
  } catch (error) {
    console.error("[Billing] Error fetching checkout options:", error);
    return c.json({ error: "Failed to fetch checkout options" }, 500);
  }
});

// Create checkout session
app.post("/api/v2/billing/checkout", async (c) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    const { productId, quantity = 1, email, name, metadata = {} } = body;

    if (!productId || !email) {
      return c.json({ error: "Missing required fields: productId and email" }, 400);
    }

    const client = getDodoClient(c.env);
    const isTestMode = c.env.DODO_PAYMENTS_ENV === 'test';
    const appUrl = isTestMode ? 'http://localhost:5173' : 'https://littlestats.click';

    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity }],
      customer: { 
        email, 
        name: name || user.name || undefined 
      },
      metadata: {
        ...metadata,
        userId: user.id,
        source: 'littlestats'
      },
      return_url: `${appUrl}/billing/success${metadata?.siteId ? `?siteId=${metadata.siteId}` : ''}`,
    });

    return c.json({ 
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    });
  } catch (error: any) {
    console.error("[Billing] Checkout error:", error);
    return c.json({ 
      error: error.message || "Failed to create checkout session" 
    }, 500);
  }
});

// Get user subscription status with full details
app.get("/api/v2/billing/subscription", async (c) => {
  try {
    const user = c.get("user");
    
    // Query user's subscription from database
    const subscription = await c.env.DB.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? 
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(user.id).first();

    if (!subscription) {
      return c.json({ 
        hasSubscription: false,
        subscription: null 
      });
    }

    return c.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planName: subscription.plan_name,
        provider: subscription.provider,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        providerSubscriptionId: subscription.provider_subscription_id,
        providerCustomerId: subscription.provider_customer_id,
        metadata: subscription.metadata ? JSON.parse(subscription.metadata) : null,
        createdAt: subscription.created_at,
        updatedAt: subscription.updated_at
      }
    });
  } catch (error) {
    console.error("[Billing] Error fetching subscription:", error);
    return c.json({ error: "Failed to fetch subscription" }, 500);
  }
});

// Get usage statistics
app.get("/api/v2/billing/usage", async (c) => {
  try {
    const user = c.get("user");
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

    // 1. Get Plan Limits
    const subscription = await c.env.DB.prepare(
      "SELECT status, plan_name FROM subscriptions WHERE user_id = ? AND status = 'active'"
    ).bind(user.id).first();

    const isPaid = !!subscription;
    const limits = {
      sites: isPaid ? 10 : 2,
      events: isPaid ? 5_000_000 : 500_000
    };

    // 2. Get Site Usage
    const sitesResult = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM sites WHERE user_id = ?"
    ).bind(user.id).first<{ count: number }>();

    // 3. Get Event Usage (Current Month)
    // We need to sum up views + custom_events from hourly_stats for all sites owned by the user
    const eventsResult = await c.env.DB.prepare(`
      SELECT SUM(h.views + h.custom_events) as total
      FROM hourly_stats h
      JOIN sites s ON h.site_id = s.id
      WHERE s.user_id = ? AND h.hour >= ?
    `).bind(user.id, startOfMonth).first<{ total: number }>();

    return c.json({
      plan: {
        name: subscription?.plan_name || "Free",
        isPaid
      },
      usage: {
        sites: sitesResult?.count || 0,
        events: eventsResult?.total || 0
      },
      limits
    }, {
      headers: {
        // Cache for 5 minutes to reduce DB load
        "Cache-Control": "private, max-age=300"
      }
    });
  } catch (error) {
    console.error("[Billing] Usage stats error:", error);
    return c.json({ error: "Failed to fetch usage stats" }, 500);
  }
});

// Dodo Payments Webhook Handler
app.post("/webhooks/dodo", async (c) => {
  try {
    const payload = await c.req.text();
    const signature = c.req.header('x-dodo-signature');
    
    // Verify webhook signature if secret is configured
    if (c.env.DODO_WEBHOOK_SECRET && signature) {
      // TODO: Implement signature verification
      // const isValid = verifyDodoWebhook(payload, signature, c.env.DODO_WEBHOOK_SECRET);
      // if (!isValid) return c.json({ error: "Invalid signature" }, 401);
    }

    const event = JSON.parse(payload);
    console.log("[Webhook] Dodo event received:", event.type);

    switch (event.type) {
      case 'payment.succeeded':
      case 'subscription.active': {
        const { customer: {customer_id}, subscription_id, metadata } = event.data;
        const userId = metadata?.userId;
        
        
        if (userId && subscription_id) {
          // Store subscription in database
          await c.env.DB.prepare(`
            INSERT INTO subscriptions (
              id, user_id, provider, provider_subscription_id, provider_customer_id,
              plan_id, plan_name, status, metadata, created_at, updated_at
            ) VALUES (?, ?, 'dodo', ?, ?, ?, ?, 'active', ?, datetime('now'), datetime('now'))
          `).bind(
            crypto.randomUUID(),
            userId,
            subscription_id,
            customer_id || null,
            metadata?.planId || 'pro',
            metadata?.planName || 'Pro Plan',
            JSON.stringify(metadata || {})
          ).run();
          
          console.log("[Webhook] Subscription created for user:", userId, "Customer ID:", customer_id);
        }
        break;
      }
      
      case 'subscription.cancelled':
      case 'subscription.expired': {
        const { subscription_id } = event.data;
        
        // Update subscription status
        await c.env.DB.prepare(`
          UPDATE subscriptions 
          SET status = ?, updated_at = datetime('now')
          WHERE provider_subscription_id = ?
        `).bind(
          event.type === 'subscription.cancelled' ? 'cancelled' : 'expired',
          subscription_id
        ).run();
        
        console.log("[Webhook] Subscription updated:", subscription_id);
        break;
      }
      
      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// Customer portal - create Dodo customer portal session
app.use("/api/v2/billing/portal", authMiddleware);
app.get("/api/v2/billing/portal", async (c) => {
  try {
    const user = c.get("user");
    console.log(user)
    // Get customer's subscription with customer ID
    const subscription = await c.env.DB.prepare(`
      SELECT provider_subscription_id, provider_customer_id, provider 
      FROM subscriptions 
      WHERE user_id = ? 
      AND status = 'active'
      LIMIT 1
    `).bind(user.id).first();

    console.log(subscription)
    if (!subscription || subscription.provider !== 'dodo') {
      return c.json({ error: "No active Dodo subscription found" }, 404);
    }

    const client = getDodoClient(c.env);

    let customer_id = subscription.provider_customer_id

    if (!subscription.provider_customer_id) {
        const customer = await client.subscriptions.retrieve(subscription.provider_subscription_id as string)
        customer_id = customer.customer.customer_id
        if (!customer_id) {
            return c.json({ error: "Customer ID not found" }, 404);
        }
    }

    // Create Dodo customer portal session
    console.log(subscription.provider_customer_id)
    
    const portal = await client.customers.customerPortal.create(
      customer_id as string,
      { send_email: false }
    );

    return c.json({ 
      portalUrl: portal.link 
    });
  } catch (error) {
    console.error("[Billing] Portal error:", error);
    return c.json({ error: "Failed to generate portal URL" }, 500);
  }
});

// ============================================
// Legacy Routes (v1 - for backward compatibility)
// ============================================

// Keep old collect endpoint working but redirect to v2
app.post("/collect/:domainKey", async (c) => {
  // TODO: Look up site by domain key and forward to v2
  return c.json({ 
    status: "deprecated", 
    message: "Please update to the new tracking script" 
  });
});

// ============================================
// Helpers
// ============================================

function isValidDomain(domain: string): boolean {
  // Support subdomains, domains, and common TLDs
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

function generateDomainKey(): string {
  return "ls_" + Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

async function verifyDnsToken(domain: string, token: string): Promise<boolean> {
  try {
    // Use Google DNS-over-HTTPS API
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
    if (!response.ok) return false;
    
    const data = await response.json() as any;
    
    if (data.Status !== 0 || !data.Answer) {
      return false;
    }

    // Check all TXT records
    // Answer format: [{ name: 'example.com.', type: 16, TTL: 300, data: '"ls-verify-..."' }]
    return data.Answer.some((record: any) => {
      // Data often comes with quotes, e.g. "value"
      const txtData = record.data.replace(/^"|"$/g, '');
      return txtData === token;
    });
  } catch (error) {
    console.error("DNS verification error:", error);
    return false;
  }
}

async function generateTrackerScript(env: Env): Promise<string> {
  // In production, this should read from a file or be pre-generated
  return `(function() {
  'use strict';
  
  const CONFIG = {
    SESSION_TIMEOUT: 30 * 60 * 1000,
    CACHE_KEY: '_ls_cache',
    VISITOR_KEY: '_ls_vid'
  };

  class LittleStatsTracker {
    constructor(siteId, options = {}) {
      this.siteId = siteId;
      
      // Determine base URL
      let baseUrl = options.host;
      if (!baseUrl) {
        baseUrl = 'https://${env.ANALYTICS_DOMAIN}';
      } else if (!baseUrl.startsWith('http')) {
        baseUrl = 'https://' + baseUrl;
      }
      
      // Remove trailing slash if present
      baseUrl = baseUrl.replace(/\\/$/, '');
      
      this.endpoint = baseUrl + '/api/v2/track/' + siteId;
      this.currentUrl = location.href;
      this.currentRef = document.referrer;
      this.cache = this.loadCache();
      this.visitorId = this.getVisitorId();
      this.init();
    }
    
    loadCache() {
      try {
        const cache = JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY));
        const now = Math.floor(Date.now() / 1000);
        if (cache && (now - cache.iat) < 1800) {
          return cache;
        }
      } catch (e) {}
      return { visitId: this.generateUUID(), iat: Math.floor(Date.now() / 1000) };
    }
    
    saveCache() {
      this.cache.iat = Math.floor(Date.now() / 1000);
      localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(this.cache));
    }
    
    getVisitorId() {
      let vid = localStorage.getItem(CONFIG.VISITOR_KEY);
      if (!vid) {
        vid = this.generateUUID();
        localStorage.setItem(CONFIG.VISITOR_KEY, vid);
      }
      return vid;
    }
    
    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }
    
    getPayload() {
      return {
        website: this.siteId,
        url: location.pathname + location.search,
        referrer: document.referrer,
        screen: screen.width + 'x' + screen.height,
        language: navigator.language,
        title: document.title,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cache: this.cache,
        visitorId: this.visitorId,
        userAgent: navigator.userAgent
      };
    }
    
    init() {
      this.track();
      
      // SPA detection
      const originalPushState = history.pushState;
      history.pushState = (...args) => {
        originalPushState.apply(history, args);
        this.handleNavigation();
      };
      
      window.addEventListener('popstate', () => this.handleNavigation());
      
      // Activity tracking
      ['click', 'scroll', 'mousemove'].forEach(e => {
        document.addEventListener(e, () => this.saveCache(), { passive: true });
      });
    }
    
    handleNavigation() {
      if (this.currentUrl !== location.href) {
        this.currentUrl = location.href;
        this.track();
      }
    }
    
    track(eventName, eventData) {
      const payload = this.getPayload();
      if (eventName) {
        payload.type = 'event';
        payload.name = eventName;
        payload.data = eventData;
      }
      
      this.send(payload);
    }
    
    identify(userId, userData) {
      const payload = this.getPayload();
      payload.type = 'identify';
      payload.id = userId;
      payload.data = userData;
      localStorage.setItem(CONFIG.VISITOR_KEY, userId);
      this.visitorId = userId;
      this.send(payload);
    }
    
    send(payload) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.endpoint, blob);
      } else {
        fetch(this.endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
          keepalive: true
        }).catch(() => {});
      }
    }
  }
  
  // Auto-initialize
  const script = document.currentScript;
  const siteId = script?.getAttribute('data-site-id');
  const host = script?.getAttribute('data-host');
  
  if (siteId) {
    window.littlestats = new LittleStatsTracker(siteId, { host });
    window.track = (name, data) => window.littlestats?.track(name, data);
    window.identify = (id, data) => window.littlestats?.identify(id, data);
  }
})();`;
}

export default app;