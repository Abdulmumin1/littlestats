import type { Context } from "hono";

// Helper to check site ownership
export async function checkSiteOwnership(c: Context, siteId: string) {
  const user = c.get("user");
  if (!user) return false;

  const site = await c.env.DB.prepare(
    "SELECT id FROM sites WHERE id = ? AND user_id = ?"
  ).bind(siteId, user.id).first();
  
  return !!site;
}
