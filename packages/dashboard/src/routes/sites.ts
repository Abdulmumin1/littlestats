import { Hono } from "hono";
import { checkSiteOwnership } from "../lib/site-auth";
import { isValidDomain, generateDomainKey, verifyDnsToken } from "../lib/utils/index";
import type { Env } from "../types";
import { authMiddleware } from "../middleware/auth";

type Variables = {
  user: any;
  session: any;
};

const sitesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// All site routes require authentication
sitesRouter.use("*", authMiddleware);

// Create new site
sitesRouter.post("/", async (c) => {
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
    ).bind(domain).first<{ id: string }>();
    
    if (existingVerified) {
      return c.json({ error: "This domain has already been verified by another user." }, { status: 409 });
    }

    // Check plan limits (Domain Limit)
    // 1. Check if user has active subscription
    const subscription = await c.env.DB.prepare(
      "SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'"
    ).bind(user.id).first<{ id: string }>();
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
sitesRouter.get("/", async (c) => {
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
sitesRouter.delete("/:siteId", async (c) => {
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
sitesRouter.post("/:siteId/verify", async (c) => {
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
      ).bind(site.domain, siteId).first<{ id: string }>();

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

export { sitesRouter };
