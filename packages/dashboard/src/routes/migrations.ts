import { Hono } from "hono";
import type { AnalyticsEventRecord, Env } from "../types";
import { ANALYTICS_SCHEMA_VERSION, validateAnalyticsEventRecord } from "../lib/analytics/event-contract";

const migrationsRouter = new Hono<{ Bindings: Env }>();

type LegacyEventRow = {
  id: number;
  event_uid: string;
  site_id: string;
  session_id: string;
  visit_id: string;
  event_type: number;
  url_path: string | null;
  url_query: string | null;
  referrer_domain: string | null;
  page_title: string | null;
  event_name: string | null;
  event_data: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  screen: string | null;
  country: string | null;
  language: string | null;
  timezone: string | null;
  engagement_time: number | null;
  created_at: string;
  campaign_bucket: string | null;
  visitor_id: string | null;
  identified_user_id: string | null;
};

function authorized(request: Request, env: Env): boolean {
  if (!env.MIGRATION_ADMIN_TOKEN) return false;
  return request.headers.get("Authorization") === `Bearer ${env.MIGRATION_ADMIN_TOKEN}`;
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(response.body, { status: response.status, headers });
}

function optional<T>(value: T | null): T | undefined {
  return value == null || value === "" ? undefined : value;
}

function properties(value: string | null): Record<string, unknown> | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined;
  } catch {
    return undefined;
  }
}

function campaignParts(bucket: string | null): [string?, string?, string?] {
  if (!bucket || !bucket.includes("|")) return [];
  const [source, medium, campaign] = bucket.split("|", 3);
  return [source, medium, campaign];
}

function toRecord(row: LegacyEventRow): AnalyticsEventRecord {
  const [utmSource, utmMedium, utmCampaign] = campaignParts(row.campaign_bucket);
  const eventTypes = ["pageview", "custom", "page_exit", "identify"] as const;
  const record: AnalyticsEventRecord = {
    schema_version: ANALYTICS_SCHEMA_VERSION,
    event_id: row.event_uid || `d1-${row.id}`,
    site_id: row.site_id,
    event_time: new Date(row.created_at).toISOString(),
    event_type: eventTypes[row.event_type - 1] || "pageview",
    visitor_id: row.visitor_id || row.session_id,
    visit_id: row.visit_id,
    is_billable: row.event_type === 1 || row.event_type === 2,
    identified_user_id: optional(row.identified_user_id),
    url_path: optional(row.url_path),
    url_query: optional(row.url_query),
    page_title: optional(row.page_title),
    referrer_domain: optional(row.referrer_domain),
    event_name: optional(row.event_name),
    event_properties: properties(row.event_data),
    browser: optional(row.browser),
    os: optional(row.os),
    device: optional(row.device),
    screen: optional(row.screen),
    country: optional(row.country),
    language: optional(row.language),
    timezone: optional(row.timezone),
    engagement_seconds: optional(row.engagement_time),
    utm_source: optional(utmSource),
    utm_medium: optional(utmMedium),
    utm_campaign: optional(utmCampaign),
    campaign_bucket: optional(row.campaign_bucket),
  };
  validateAnalyticsEventRecord(record);
  return record;
}

migrationsRouter.options("/analytics/backfill", (c) => withCors(new Response(null, { status: 204 })));

migrationsRouter.post("/analytics/backfill", async (c) => {
  if (!authorized(c.req.raw, c.env)) return withCors(c.json({ error: "Not found" }, 404));
  if (!c.env.ANALYTICS_STREAM) return withCors(c.json({ error: "ANALYTICS_STREAM is not configured" }, 503));

  const body: { cursor?: number; batchSize?: number } = await c.req
    .json<{ cursor?: number; batchSize?: number }>()
    .catch(() => ({}));
  const cursor = Number.isInteger(body.cursor) && (body.cursor || 0) >= 0 ? body.cursor || 0 : 0;
  const batchSize = Math.min(500, Math.max(1, Number(body.batchSize) || 200));

  const { results } = await c.env.DB.prepare(`
    SELECT e.*, s.visitor_id, s.identified_user_id
    FROM events e
    LEFT JOIN sessions s ON s.id = e.session_id
    WHERE e.id > ?
    ORDER BY e.id ASC
    LIMIT ?
  `).bind(cursor, batchSize).all<LegacyEventRow>();

  const rows = results || [];
  const records = rows.map(toRecord);
  if (records.length > 0) await c.env.ANALYTICS_STREAM.send(records);
  const nextCursor = rows.at(-1)?.id || cursor;

  return withCors(c.json({ sent: records.length, nextCursor, hasMore: rows.length === batchSize }));
});

export { migrationsRouter };
