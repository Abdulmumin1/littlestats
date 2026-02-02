import { Hono } from "hono";
import { checkSiteOwnership } from "../lib/site-auth";
import { DashboardAPI } from "../lib/dashboard-api";
import type { Env } from "../types";
import { authMiddleware } from "../middleware/auth";

type Variables = {
  user: any;
  session: any;
};

const analyticsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// All analytics routes require authentication
analyticsRouter.use("*", authMiddleware);

// Helper middleware to check ownership for :siteId param
analyticsRouter.use("/:siteId/*", async (c, next) => {
  const siteId = c.req.param("siteId");
  if (!(await checkSiteOwnership(c, siteId))) {
    return c.json({ error: "Access denied" }, 403);
  }
  await next();
});

analyticsRouter.get("/:siteId/stats", async (c) => {
  const siteId = c.req.param("siteId");
  
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

analyticsRouter.get("/:siteId/timeseries", async (c) => {
  const siteId = c.req.param("siteId");

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

analyticsRouter.get("/:siteId/referrers", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");
  const q = c.req.query("q");

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

analyticsRouter.get("/:siteId/pages", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");
  const q = c.req.query("q");

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

analyticsRouter.get("/:siteId/countries", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");
  const q = c.req.query("q");

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

analyticsRouter.get("/:siteId/devices", async (c) => {
  const siteId = c.req.param("siteId");

  const api = new DashboardAPI(c.env.DB, siteId);
  const devices = await api.getDeviceBreakdown({});
  return c.json({ devices });
});

analyticsRouter.get("/:siteId/browsers", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "10");

  const api = new DashboardAPI(c.env.DB, siteId);
  const browsers = await api.getBrowserBreakdown({}, limit);
  return c.json({ browsers });
});

analyticsRouter.get("/:siteId/events", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "100");
  const cursor = c.req.query("cursor");
  const eventName = c.req.query("eventName");

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

analyticsRouter.get("/:siteId/custom-events", async (c) => {
  const siteId = c.req.param("siteId");

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
  };

  const api = new DashboardAPI(c.env.DB, siteId);
  const events = await api.getCustomEvents(filter);
  return c.json({ events });
});

analyticsRouter.get("/:siteId/event-names", async (c) => {
  const siteId = c.req.param("siteId");
  const api = new DashboardAPI(c.env.DB, siteId);
  const eventNames = await api.getEventNames();
  return c.json({ eventNames });
});

analyticsRouter.get("/:siteId/campaigns", async (c) => {
  const siteId = c.req.param("siteId");
  const limit = parseInt(c.req.query("limit") || "20");

  const filter = {
    startDate: c.req.query("start"),
    endDate: c.req.query("end"),
  };

  const goalEventName = c.req.query("goal") || undefined;

  const api = new DashboardAPI(c.env.DB, siteId);
  const campaigns = await api.getCampaigns(filter, limit, goalEventName);
  return c.json({ campaigns });
});

analyticsRouter.get("/:siteId/campaigns/segmented-timeseries", async (c) => {
  const siteId = c.req.param("siteId");

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

analyticsRouter.post("/:siteId/funnels/analyze", async (c) => {
  const siteId = c.req.param("siteId");
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

analyticsRouter.get("/:siteId/funnels", async (c) => {
  const siteId = c.req.param("siteId");
  const api = new DashboardAPI(c.env.DB, siteId);
  const funnels = await api.listFunnels();
  return c.json({ funnels });
});

analyticsRouter.post("/:siteId/funnels", async (c) => {
  const siteId = c.req.param("siteId");
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

analyticsRouter.delete("/:siteId/funnels/:funnelId", async (c) => {
  const siteId = c.req.param("siteId");
  const funnelId = c.req.param("funnelId");
  const api = new DashboardAPI(c.env.DB, siteId);
  await api.deleteFunnel(funnelId);
  return c.json({ success: true });
});

analyticsRouter.get("/:siteId/goals/summary", async (c) => {
  const siteId = c.req.param("siteId");
  const goalEventName = c.req.query("goalEventName");

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

export { analyticsRouter };
