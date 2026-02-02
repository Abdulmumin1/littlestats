import { createAuth } from "../auth";
import type { Context, Next } from "hono";

// Auth middleware for protected API routes
export const authMiddleware = async (c: Context, next: Next) => {
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
