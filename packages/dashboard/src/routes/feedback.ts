import { Hono } from "hono";
import { checkSiteOwnership } from "../lib/site-auth";
import { parseUserAgent } from "../lib/utils/index";
import type { Env } from "../types";
import { authMiddleware } from "../middleware/auth";
import { feedbackCors } from "../middleware/cors";

type Variables = {
  user: any;
  session: any;
};

// ============================================
// Public Feedback Router
// ============================================

export const publicFeedbackRouter = new Hono<{ Bindings: Env }>();

// Apply CORS to feedback endpoint
publicFeedbackRouter.use("/*", feedbackCors);

// Public endpoint - Submit feedback (no auth required, uses site id or domain key)
publicFeedbackRouter.post("/:siteKey", async (c) => {
  const siteKey = c.req.param("siteKey");
  
  try {
    // Look up site by domain key OR by id (for backwards compatibility)
    const site = await c.env.DB.prepare(
      "SELECT id FROM sites WHERE domain_key = ? OR id = ?"
    ).bind(siteKey, siteKey).first<{ id: string }>();
    
    if (!site) {
      return c.json({ error: "Invalid site key" }, 404);
    }
    
    const body = await c.req.json();
    const { content, rating, category, email, visitorId, sessionId, url, metadata } = body;
    
    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return c.json({ error: "Feedback content is required" }, 400);
    }
    
    if (content.length > 10000) {
      return c.json({ error: "Feedback content too long (max 10000 characters)" }, 400);
    }
    
    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }
    
    // Parse user agent for browser/OS info
    const userAgent = c.req.header("User-Agent") || "";
    const browserInfo = parseUserAgent(userAgent);
    
    // Get country from CF headers
    const country = c.req.header("CF-IPCountry") || null;
    
    const feedbackId = crypto.randomUUID();
    
    await c.env.DB.prepare(`
      INSERT INTO feedbacks (
        id, site_id, visitor_id, session_id, content, rating, category, email,
        url, browser, os, device, screen, country, status, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, unixepoch(), unixepoch())
    `).bind(
      feedbackId,
      site.id,
      visitorId || null,
      sessionId || null,
      content.trim(),
      rating || null,
      category || null,
      email || null,
      url || null,
      browserInfo.browser,
      browserInfo.os,
      browserInfo.device,
      body.screen || null,
      country,
      metadata ? JSON.stringify(metadata) : null
    ).run();
    
    return c.json({ success: true, id: feedbackId }, 201);
    
  } catch (error) {
    console.error("[Feedback] Submit error:", error);
    return c.json({ error: "Failed to submit feedback" }, 500);
  }
});

// CORS preflight for feedback endpoint
publicFeedbackRouter.options("/:siteKey", (c) => {
  return new Response(null, { status: 204 });
});

// ============================================
// Protected Site Feedback Router
// ============================================

export const sitesFeedbackRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require auth
sitesFeedbackRouter.use("*", authMiddleware);

// Protected endpoint - List feedback for a site
sitesFeedbackRouter.get("/:siteId/feedback", async (c) => {
  const siteId = c.req.param("siteId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  
  try {
    const status = c.req.query("status"); // Filter by status
    const category = c.req.query("category"); // Filter by category
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");
    
    let whereClause = "WHERE site_id = ?";
    const params: any[] = [siteId];

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    if (category) {
      whereClause += " AND category = ?";
      params.push(category);
    }

    const query = `
      SELECT * FROM feedbacks 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total FROM feedbacks 
      ${whereClause}
    `;
    
    const queryParams = [...params, limit, offset];
    const countParams = [...params];
    
    const [{ results }, countResult] = await Promise.all([
      c.env.DB.prepare(query).bind(...queryParams).all(),
      c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>()
    ]);
    
    // Map to camelCase
    const feedback = results.map((f: any) => ({
      id: f.id,
      siteId: f.site_id,
      visitorId: f.visitor_id,
      sessionId: f.session_id,
      content: f.content,
      rating: f.rating,
      category: f.category,
      email: f.email,
      url: f.url,
      browser: f.browser,
      os: f.os,
      device: f.device,
      screen: f.screen,
      country: f.country,
      status: f.status,
      metadata: f.metadata ? JSON.parse(f.metadata) : null,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    }));
    
    return c.json({ 
      feedback, 
      total: countResult?.total || 0,
      limit,
      offset 
    });
    
  } catch (error) {
    console.error("[Feedback] List error:", error);
    return c.json({ error: "Failed to fetch feedback" }, 500);
  }
});

// Protected endpoint - Update feedback status
sitesFeedbackRouter.patch("/:siteId/feedback/:feedbackId", async (c) => {
  const siteId = c.req.param("siteId");
  const feedbackId = c.req.param("feedbackId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  
  try {
    const body = await c.req.json();
    const { status } = body;
    
    const validStatuses = ['new', 'reviewed', 'resolved', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return c.json({ error: `Status must be one of: ${validStatuses.join(', ')}` }, 400);
    }
    
    await c.env.DB.prepare(`
      UPDATE feedbacks 
      SET status = ?, updated_at = unixepoch()
      WHERE id = ? AND site_id = ?
    `).bind(status, feedbackId, siteId).run();
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error("[Feedback] Update error:", error);
    return c.json({ error: "Failed to update feedback" }, 500);
  }
});

// Protected endpoint - Delete feedback
sitesFeedbackRouter.delete("/:siteId/feedback/:feedbackId", async (c) => {
  const siteId = c.req.param("siteId");
  const feedbackId = c.req.param("feedbackId");
  
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  
  try {
    await c.env.DB.prepare(
      "DELETE FROM feedbacks WHERE id = ? AND site_id = ?"
    ).bind(feedbackId, siteId).run();
    
    return c.json({ success: true });
    
  } catch (error) {
    console.error("[Feedback] Delete error:", error);
    return c.json({ error: "Failed to delete feedback" }, 500);
  }
});
