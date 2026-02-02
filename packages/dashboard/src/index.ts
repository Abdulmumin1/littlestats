// LittleStats Analytics v2.0 - Worker Entry Point
// Cloudflare Workers + Durable Objects + D1

import { Hono } from "hono";
import { DomainAnalyticsDO } from "./durable-objects/DomainAnalyticsDO";
import { createAuth } from "./auth";
import type { Env } from "./types";
import { generateTrackerScript } from "./lib/tracker-script";

// Routers
import { trackingRouter } from "./routes/tracking";
import { sitesRouter } from "./routes/sites";
import { analyticsRouter } from "./routes/analytics";
import { publicFeedbackRouter, sitesFeedbackRouter } from "./routes/feedback";
import { billingRouter } from "./routes/billing";
import { webhooksRouter } from "./routes/webhooks";

// Middleware
import { authCors, trackingCors, apiCors, feedbackCors } from "./middleware/cors";

// Export Durable Object class
export { DomainAnalyticsDO };

// Create Hono app with proper types
type Variables = {
  user: any;
  session: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============================================
// Middleware & CORS
// ============================================

// Auth CORS
app.use("/api/auth/*", authCors);

// General API CORS
// Skip for track and feedback endpoints which have their own CORS logic
app.use("/api/v2/*", async (c, next) => {
  if (c.req.path.startsWith("/api/v2/track") || c.req.path.startsWith("/api/v2/feedback")) {
    return next();
  }
  return apiCors(c, next);
});

// ============================================
// Routes Mounting
// ============================================

// Tracking & Realtime (DO proxies)
// Mounts: /track, /realtime, /stats, /health
app.route("/api/v2", trackingRouter);

// Sites Management
// Mounts: /, /:siteId/verify, /:siteId (DELETE)
app.route("/api/v2/sites", sitesRouter);

// Site Analytics
// Mounts: /:siteId/stats, /:siteId/timeseries, etc.
app.route("/api/v2/sites", analyticsRouter);

// Site Feedback Management (Protected)
// Mounts: /:siteId/feedback
app.route("/api/v2/sites", sitesFeedbackRouter);

// Public Feedback Submission
// Mounts: /:siteKey
app.route("/api/v2/feedback", publicFeedbackRouter);

// Billing & Payments
// Mounts: /checkout, /subscription, etc.
app.route("/api/v2/billing", billingRouter);

// Webhooks
// Mounts: /dodo
app.route("/webhooks", webhooksRouter);

// ============================================
// Auth Handler
// ============================================

// Mount better-auth handler at /api/auth/*
app.all("/api/auth/*", async (c) => {
  const auth = createAuth(c.env);
  const response = await auth.handler(c.req.raw);
  
  // Ensure CORS headers are preserved in the response
  const newHeaders = new Headers(response.headers);
  const origin = c.req.header("Origin");
  
  // Use the same trusted origins logic as the middleware
  const trustedOrigins = [
    "http://localhost:5173", 
    "http://localhost:8787", 
    "https://littlestats.click", 
    "https://www.littlestats.click",
    ...(c.env.TRUSTED_ORIGINS ? c.env.TRUSTED_ORIGINS.split(',').map((o: string) => o.trim()) : [])
  ];

  if (origin && trustedOrigins.includes(origin)) {
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
// Legacy Routes (v1)
// ============================================

// Keep old collect endpoint working but redirect to v2
app.post("/collect/:domainKey", async (c) => {
  return c.json({ 
    status: "deprecated", 
    message: "Please update to the new tracking script" 
  });
});

export default app;
