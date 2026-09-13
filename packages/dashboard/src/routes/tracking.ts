import { Hono } from "hono";
import { checkSiteOwnership } from "../lib/site-auth";
import type { Env } from "../types";
import { authMiddleware } from "../middleware/auth";
import { trackingCors } from "../middleware/cors";

type Variables = {
  user: any;
  session: any;
};

const trackingRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const SITE_CACHE_TTL_MS = 5 * 60 * 1000;
const canonicalSiteCache = new Map<string, { siteId: string; expiresAt: number }>();

async function resolveCanonicalSiteId(db: D1Database, siteKey: string): Promise<string | null> {
  const cached = canonicalSiteCache.get(siteKey);
  if (cached && cached.expiresAt > Date.now()) return cached.siteId;

  const site = await db.prepare(
    "SELECT id FROM sites WHERE id = ? OR domain_key = ? LIMIT 1"
  ).bind(siteKey, siteKey).first<{ id: string }>();

  if (!site) return null;
  canonicalSiteCache.set(siteKey, { siteId: site.id, expiresAt: Date.now() + SITE_CACHE_TTL_MS });
  canonicalSiteCache.set(site.id, { siteId: site.id, expiresAt: Date.now() + SITE_CACHE_TTL_MS });
  return site.id;
}

// Apply tracking CORS only to track endpoint
trackingRouter.use("/track/*", trackingCors);

// Track endpoint - Routes to DomainAnalyticsDO
trackingRouter.post("/track/:siteId", async (c) => {
  const siteKey = c.req.param("siteId");
  
  try {
    const siteId = await resolveCanonicalSiteId(c.env.DB, siteKey);
    if (!siteId) return c.json({ error: "Unknown website ID" }, { status: 404 });

    const requestBody = await c.req.text();
    if (new TextEncoder().encode(requestBody).byteLength > 64 * 1024) {
      return c.json({ error: "Tracking payload is too large" }, { status: 413 });
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(requestBody) as Record<string, unknown>;
    } catch {
      return c.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Get the DO instance for this site
    const id = c.env.ANALYTICS_DO.idFromName(siteId);
    const doStub = c.env.ANALYTICS_DO.get(id);
    
    // Clone the request and add site_id to URL
    const url = new URL(c.req.url);
    url.pathname = "/track";
    url.searchParams.set("site_id", siteId);
    
    const forwardedHeaders = new Headers(c.req.raw.headers);
    forwardedHeaders.delete("content-length");
    const newRequest = new Request(url.toString(), {
      method: c.req.method,
      headers: forwardedHeaders,
      body: JSON.stringify({ ...payload, website: siteId }),
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
trackingRouter.get("/realtime/:siteId", authMiddleware, async (c) => {
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

// Stats endpoint (DO proxy)
trackingRouter.get("/stats/:siteId", authMiddleware, async (c) => {
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
trackingRouter.get("/health/:siteId", authMiddleware, async (c) => {
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

export { trackingRouter };
