import { cors } from "hono/cors";
import type { Context, Next } from "hono";

// CORS for tracking endpoint (dynamic origin)
export const trackingCors = async (c: Context, next: Next) => {
  const origin = c.req.header("Origin") || "*";
  
  // Set CORS headers manually
  c.res.headers.set("Access-Control-Allow-Origin", origin);
  c.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  c.res.headers.set("Access-Control-Max-Age", "86400");
  
  // If credentials are sent/requested, we must set specific origin, not *
  if (origin !== "*") {
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // Handle OPTIONS request directly
  if (c.req.method === "OPTIONS") {
    c.status(204);
    return c.body(null);
  }

  await next();
};

// CORS for API (specific origins)
export const apiCors = async (c: Context, next: Next) => {
  const trustedOrigins = [
    "http://localhost:5173", 
    "https://littlestats.click", 
    "https://www.littlestats.click",
    ...(c.env.TRUSTED_ORIGINS ? c.env.TRUSTED_ORIGINS.split(',').map((o: string) => o.trim()) : [])
  ];
  
  return cors({
    origin: trustedOrigins,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  })(c, next);
};

// CORS for auth endpoints (must be before auth handler)
export const authCors = async (c: Context, next: Next) => {
  const trustedOrigins = [
    "http://localhost:5173", 
    "http://localhost:8787", 
    "https://littlestats.click", 
    "https://www.littlestats.click",
    ...(c.env.TRUSTED_ORIGINS ? c.env.TRUSTED_ORIGINS.split(',').map((o: string) => o.trim()) : [])
  ];

  return cors({
    origin: trustedOrigins,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  })(c, next);
};

// CORS for feedback endpoint (dynamic origin)
export const feedbackCors = async (c: Context, next: Next) => {
  const origin = c.req.header("Origin") || "*";
  
  c.res.headers.set("Access-Control-Allow-Origin", origin);
  c.res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  
  if (origin !== "*") {
    c.res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  
  await next();
};
