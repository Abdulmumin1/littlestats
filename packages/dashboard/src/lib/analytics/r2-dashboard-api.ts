import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter, StatsSummary, TimeSeriesDataPoint } from "../../types";
import { COUNTRY_NAMES } from "../utils/country-names";
import { calculateChange, shiftDateKey } from "../stats/filter-utils";
import { FunnelsStats } from "../stats/funnels-stats";
import { analyticsRange, dedupedEventsCte, eventFilterSql, fillTimeSeries, numeric, roundPercent, searchSql, timeBucketSql } from "./query-helpers";
import { R2SqlClient, sqlString } from "./r2-sql-client";

type Row = Record<string, unknown>;

export class R2DashboardAPI {
  private readonly sql: R2SqlClient;
  private readonly funnels: FunnelsStats;

  constructor(db: D1Database, env: ConstructorParameters<typeof R2SqlClient>[0], private readonly siteId: string) {
    this.sql = new R2SqlClient(env);
    this.funnels = new FunnelsStats(db, siteId);
  }

  private async periodStats(start: string, endExclusive: string, filter: StatsFilter) {
    const rows = await this.sql.query<Row>(`
      WITH ${dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive)},
      relevant AS (
        SELECT event_type, visit_id, visitor_id, engagement_seconds
        FROM deduped WHERE event_type IN ('pageview', 'page_exit') ${eventFilterSql(filter)}
      ),
      visit_counts AS (
        SELECT visit_id, COUNT(*) AS pageviews FROM relevant
        WHERE event_type = 'pageview' GROUP BY visit_id
      )
      SELECT
        SUM(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) AS views,
        (SELECT COUNT(*) FROM visit_counts) AS visits,
        COUNT(DISTINCT CASE WHEN event_type = 'pageview' THEN visitor_id END) AS visitors,
        (SELECT COUNT(*) FROM visit_counts WHERE pageviews = 1) AS bounce_count,
        SUM(CASE WHEN event_type = 'page_exit' THEN COALESCE(engagement_seconds, 0) ELSE 0 END) AS total_duration
      FROM relevant
    `);
    const row = rows[0] || {};
    const visits = numeric(row.visits);
    return {
      views: numeric(row.views),
      visits,
      visitors: numeric(row.visitors),
      bounceRate: roundPercent(numeric(row.bounce_count), visits),
      avgDuration: visits > 0 ? Math.round(numeric(row.total_duration) / visits) : 0,
    };
  }

  async getStatsSummary(filter: StatsFilter): Promise<StatsSummary> {
    const { startDate, endDate, start, endExclusive, timezone } = analyticsRange(filter);
    const days = Math.max(1, Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000) + 1);
    const previousBounds = analyticsRange({
      ...filter,
      startDate: shiftDateKey(startDate, -days),
      endDate: shiftDateKey(endDate, -days),
    });
    const [current, previous] = await Promise.all([
      this.periodStats(start, endExclusive, filter),
      this.periodStats(previousBounds.start, previousBounds.endExclusive, filter),
    ]);
    return {
      siteId: this.siteId,
      period: { start: startDate, end: endDate, timezone },
      ...current,
      change: {
        views: calculateChange(current.views, previous.views),
        visits: calculateChange(current.visits, previous.visits),
        visitors: calculateChange(current.visitors, previous.visitors),
        bounceRate: calculateChange(current.bounceRate, previous.bounceRate),
        avgDuration: calculateChange(current.avgDuration, previous.avgDuration),
      },
    };
  }

  async getTimeSeries(filter: StatsFilter, granularity: "hour" | "day" = "day"): Promise<TimeSeriesDataPoint[]> {
    const { start, endExclusive } = analyticsRange(filter);
    const bucket = timeBucketSql("event_time", filter, granularity);
    const rows = await this.sql.query<Row>(`
      WITH ${dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive)}
      SELECT ${bucket.expression} AS timestamp,
        COUNT(*) AS views,
        COUNT(DISTINCT visit_id) AS visits,
        COUNT(DISTINCT visitor_id) AS visitors
      FROM deduped
      WHERE event_type = 'pageview' ${eventFilterSql(filter)}
      GROUP BY timestamp ORDER BY timestamp ASC
    `);
    const points = rows.map((row) => ({
      timestamp: String(row.timestamp),
      views: numeric(row.views), visits: numeric(row.visits), visitors: numeric(row.visitors),
    }));
    return fillTimeSeries(points, bucket.labels, (timestamp) => ({ timestamp, views: 0, visits: 0, visitors: 0 }));
  }

  private async breakdown(
    filter: StatsFilter,
    field: "referrer_domain" | "url_path" | "country" | "device" | "browser",
    alias: string,
    limit?: number,
    q?: string,
  ): Promise<Row[]> {
    const { start, endExclusive } = analyticsRange(filter);
    const nonNull = field === "referrer_domain" ? " AND referrer_domain IS NOT NULL" : "";
    return this.sql.query<Row>(`
      WITH ${dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive)}
      SELECT COALESCE(${field}, ${field === "country" ? "'XX'" : "'Unknown'"}) AS ${alias},
        COUNT(*) AS views, COUNT(DISTINCT visit_id) AS visits
      FROM deduped
      WHERE event_type = 'pageview' ${nonNull} ${eventFilterSql(filter)} ${searchSql(field === "country" ? "country" : field === "url_path" ? "url_path" : "referrer_domain", q)}
      GROUP BY ${field} ORDER BY views DESC ${limit ? `LIMIT ${Math.min(100, Math.max(1, limit))}` : ""}
    `);
  }

  async getTopReferrers(filter: StatsFilter, limit = 10, options?: { q?: string }) {
    return (await this.breakdown(filter, "referrer_domain", "referrer", limit, options?.q)).map((r) => ({
      referrer: String(r.referrer), views: numeric(r.views), visits: numeric(r.visits),
    }));
  }

  async getTopPages(filter: StatsFilter, limit = 10, options?: { q?: string }) {
    return (await this.breakdown(filter, "url_path", "path", limit, options?.q)).map((r) => ({
      path: String(r.path), views: numeric(r.views), visits: numeric(r.visits),
    }));
  }

  async getTopCountries(filter: StatsFilter, limit = 10, options?: { q?: string }) {
    return (await this.breakdown(filter, "country", "code", limit, options?.q)).map((r) => ({
      country: COUNTRY_NAMES[String(r.code)] || (String(r.code) === "XX" ? "Unknown" : String(r.code)),
      code: String(r.code), views: numeric(r.views), visits: numeric(r.visits),
    }));
  }

  async getDeviceBreakdown(filter: StatsFilter) {
    return (await this.breakdown(filter, "device", "device")).map((r) => ({
      device: String(r.device), views: numeric(r.views), visits: numeric(r.visits),
    }));
  }

  async getBrowserBreakdown(filter: StatsFilter, limit = 10) {
    return (await this.breakdown(filter, "browser", "browser", limit)).map((r) => ({
      browser: String(r.browser), views: numeric(r.views), visits: numeric(r.visits),
    }));
  }

  async getCustomEvents(filter: StatsFilter) {
    const { start, endExclusive } = analyticsRange(filter);
    const rows = await this.sql.query<Row>(`
      WITH ${dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive)}
      SELECT event_name AS name, COUNT(*) AS count FROM deduped
      WHERE event_type = 'custom' AND event_name IS NOT NULL
      GROUP BY event_name ORDER BY count DESC
    `);
    return rows.map((r) => ({ name: String(r.name), count: numeric(r.count) }));
  }

  async getEventsList(filter: StatsFilter, options?: {
    limit?: number;
    cursor?: { timestamp: string; id: string | number };
    eventName?: string;
  }) {
    const { start, endExclusive } = analyticsRange(filter);
    const limit = Math.min(250, Math.max(1, options?.limit || 100));
    const name = options?.eventName;
    let eventClause = "";
    if (name === "Page View") eventClause = " AND event_type = 'pageview'";
    else if (name === "Page Exit") eventClause = " AND event_type = 'page_exit'";
    else if (name === "Identify") eventClause = " AND event_type = 'identify'";
    else if (name) eventClause = ` AND event_type = 'custom' AND event_name = ${sqlString(name)}`;
    if (filter.excludePageview) eventClause += " AND event_type != 'pageview'";
    if (filter.customEventsOnly) eventClause += " AND event_type = 'custom'";
    const cursor = options?.cursor;
    const cursorClause = cursor
      ? ` AND (event_time < ${sqlString(cursor.timestamp)} OR (event_time = ${sqlString(cursor.timestamp)} AND event_id < ${sqlString(String(cursor.id))}))`
      : "";
    const cte = dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive);
    const [totals, rows] = await Promise.all([
      this.sql.query<Row>(`WITH ${cte} SELECT COUNT(*) AS total FROM deduped WHERE TRUE ${eventClause}`),
      this.sql.query<Row>(`
        WITH ${cte}
        SELECT event_id AS id,
          CASE WHEN event_type = 'pageview' THEN 'Page View'
            WHEN event_type = 'custom' THEN COALESCE(event_name, 'Custom Event')
            WHEN event_type = 'page_exit' THEN 'Page Exit'
            WHEN event_type = 'identify' THEN 'Identify' ELSE 'Unknown' END AS event_name,
          COALESCE(url_path, '/') AS url, COALESCE(referrer_domain, 'Direct') AS referrer,
          event_time AS timestamp, COALESCE(timezone, 'UTC') AS timezone,
          visitor_id AS user_id, language, event_properties
        FROM deduped WHERE TRUE ${eventClause} ${cursorClause}
        ORDER BY event_time DESC, event_id DESC LIMIT ${limit}
      `),
    ]);
    const events = rows.map((r) => ({
      ...r,
      id: String(r.id),
      timestamp: String(r.timestamp),
      event_data: r.event_properties == null
        ? null
        : typeof r.event_properties === "string" ? r.event_properties : JSON.stringify(r.event_properties),
    }));
    const last = events.at(-1);
    return {
      events,
      total: numeric(totals[0]?.total),
      nextCursor: events.length === limit && last ? { timestamp: last.timestamp, id: last.id } : null,
    };
  }

  async getEventNames(): Promise<string[]> {
    const end = new Date();
    const start = new Date(end.getTime() - 365 * 86_400_000);
    const rows = await this.sql.query<Row>(`
      WITH ${dedupedEventsCte(this.sql.table, this.siteId, start.toISOString(), end.toISOString())}
      SELECT event_name, MAX(event_time) AS last_seen FROM deduped
      WHERE event_type = 'custom' AND event_name IS NOT NULL
      GROUP BY event_name ORDER BY last_seen DESC LIMIT 100
    `);
    return rows.map((r) => String(r.event_name));
  }

  async getCampaigns(filter: StatsFilter, limit = 20, goalEventName?: string) {
    const { start, endExclusive } = analyticsRange(filter);
    const conversion = goalEventName
      ? `COUNT(DISTINCT CASE WHEN event_type = 'custom' AND event_name = ${sqlString(goalEventName)} THEN visit_id END)`
      : "COUNT(DISTINCT CASE WHEN event_type = 'custom' THEN visit_id END)";
    const rows = await this.sql.query<Row>(`
      WITH ${dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive)}
      SELECT campaign_bucket AS bucket, COUNT(DISTINCT visit_id) AS visits, ${conversion} AS conversions
      FROM deduped WHERE campaign_bucket IS NOT NULL AND campaign_bucket != ''
        AND campaign_bucket NOT LIKE 'localhost%' AND campaign_bucket NOT LIKE '127.0.0.1%'
      GROUP BY campaign_bucket ORDER BY conversions DESC, visits DESC LIMIT ${Math.min(100, Math.max(1, limit))}
    `);
    return rows.map((r) => {
      const visits = numeric(r.visits); const conversions = numeric(r.conversions);
      return { bucket: String(r.bucket || "Direct"), visits, conversions, conversionRate: roundPercent(conversions, visits) };
    });
  }

  async getGoalSummary(filter: StatsFilter, goalEventName: string) {
    const { start, endExclusive } = analyticsRange(filter);
    const cte = dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive);
    const goal = sqlString(goalEventName);
    const bucket = timeBucketSql("event_time", filter, "day");
    const [totalRows, bucketRows, timeRows] = await Promise.all([
      this.sql.query<Row>(`WITH ${cte} SELECT COUNT(DISTINCT CASE WHEN event_type = 'custom' AND event_name = ${goal} THEN visit_id END) AS conversions, COUNT(DISTINCT visit_id) AS total_visits FROM deduped`),
      this.sql.query<Row>(`WITH ${cte} SELECT COALESCE(campaign_bucket, 'Direct') AS bucket, COUNT(DISTINCT visit_id) AS conversions FROM deduped WHERE event_type = 'custom' AND event_name = ${goal} GROUP BY campaign_bucket ORDER BY conversions DESC`),
      this.sql.query<Row>(`WITH ${cte} SELECT ${bucket.expression} AS date, COUNT(*) AS conversions FROM deduped WHERE event_type = 'custom' AND event_name = ${goal} GROUP BY date ORDER BY date ASC`),
    ]);
    const conversions = numeric(totalRows[0]?.conversions);
    const totalVisits = numeric(totalRows[0]?.total_visits);
    const conversionsByDate = new Map(timeRows.map((row) => [String(row.date), numeric(row.conversions)]));
    return {
      conversions,
      conversionRate: roundPercent(conversions, totalVisits),
      byBucket: bucketRows.map((r) => ({ bucket: String(r.bucket), conversions: numeric(r.conversions), conversionRate: roundPercent(numeric(r.conversions), totalVisits) })),
      timeSeries: bucket.labels.map((date) => ({
        date,
        conversions: conversionsByDate.get(date) || 0,
      })),
    };
  }

  async getCampaignsSegmentedTimeSeries(filter: StatsFilter, options?: {
    groupBy?: "source" | "medium";
    metric?: "conversions" | "visits";
    granularity?: "day" | "hour";
    segmentsLimit?: number;
    goalEventName?: string;
  }) {
    const { start, endExclusive } = analyticsRange(filter);
    const groupBy = options?.groupBy || "source";
    const metric = options?.metric || "conversions";
    const granularity = options?.granularity || "day";
    const segmentsLimit = Math.min(12, Math.max(2, options?.segmentsLimit || 6));
    const segment = groupBy === "source"
      ? "COALESCE(utm_source, campaign_bucket, 'Direct')"
      : "COALESCE(utm_medium, CASE WHEN campaign_bucket != 'Direct' THEN 'referral' ELSE 'Direct' END)";
    const metricSql = metric === "visits"
      ? "COUNT(DISTINCT visit_id)"
      : options?.goalEventName
        ? `COUNT(DISTINCT CASE WHEN event_type = 'custom' AND event_name = ${sqlString(options.goalEventName)} THEN visit_id END)`
        : "COUNT(DISTINCT CASE WHEN event_type = 'custom' THEN visit_id END)";
    const cte = dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive);
    const bucket = timeBucketSql("event_time", filter, granularity);
    const where = "campaign_bucket IS NOT NULL AND campaign_bucket != '' AND LOWER(campaign_bucket) != 'direct'";
    const topRows = await this.sql.query<Row>(`WITH ${cte} SELECT ${segment} AS segment, ${metricSql} AS total FROM deduped WHERE ${where} GROUP BY segment ORDER BY total DESC LIMIT ${segmentsLimit}`);
    const topSegments = topRows.map((r) => ({ key: String(r.segment), total: numeric(r.total) }));
    const topSet = new Set(topSegments.map((r) => r.key));
    const seriesRows = await this.sql.query<Row>(`WITH ${cte} SELECT ${bucket.expression} AS timestamp, ${segment} AS segment, ${metricSql} AS value FROM deduped WHERE ${where} GROUP BY timestamp, segment ORDER BY timestamp ASC`);
    const pointsMap = new Map<string, { timestamp: string; total: number; segments: Record<string, number> }>();
    for (const row of seriesRows) {
      const timestamp = String(row.timestamp);
      const key = topSet.has(String(row.segment)) ? String(row.segment) : "Other";
      const point = pointsMap.get(timestamp) || { timestamp, total: 0, segments: {} };
      const value = numeric(row.value); point.total += value; point.segments[key] = (point.segments[key] || 0) + value;
      pointsMap.set(timestamp, point);
    }
    const segmentKeys = [...topSet, "Other"];
    const points = fillTimeSeries<{ timestamp: string; total: number; segments: Record<string, number> }>(
      [...pointsMap.values()],
      bucket.labels,
      (timestamp) => ({ timestamp, total: 0, segments: {} }),
    );
    for (const point of points) for (const key of segmentKeys) point.segments[key] ??= 0;
    const totals = new Map<string, number>();
    for (const point of points) for (const [key, value] of Object.entries(point.segments)) totals.set(key, (totals.get(key) || 0) + value);
    return { granularity, metric, groupBy, segments: [...totals].map(([key, total]) => ({ key, total })).sort((a, b) => b.total - a.total), points };
  }

  async analyzeFunnel(filter: StatsFilter, steps: Array<{ type: "url" | "event"; value: string; name?: string }>, funnelType: "session" | "user" = "session") {
    if (!steps.length) return { steps: [], totalConversionRate: 0, totalEntries: 0 };
    if (steps.length > 8) throw new Error("Funnels support at most 8 steps");
    const { start, endExclusive } = analyticsRange(filter);
    const group = funnelType === "user" ? "visitor_id" : "visit_id";
    const base = dedupedEventsCte(this.sql.table, this.siteId, start, endExclusive);
    const ctes: string[] = [];
    steps.forEach((step, index) => {
      const condition = step.type === "url" ? `url_path = ${sqlString(step.value)}` : `event_type = 'custom' AND event_name = ${sqlString(step.value)}`;
      ctes.push(index === 0
        ? `step0 AS (SELECT ${group}, MIN(event_time) AS step_time FROM deduped WHERE ${condition} GROUP BY ${group})`
        : `step${index} AS (SELECT e.${group}, MIN(e.event_time) AS step_time FROM deduped e INNER JOIN step${index - 1} p ON e.${group} = p.${group} WHERE e.event_time > p.step_time AND ${condition} GROUP BY e.${group})`);
    });
    const counts = await this.sql.query<Row>(`WITH ${base}, ${ctes.join(", ")} SELECT ${steps.map((_, i) => `(SELECT COUNT(*) FROM step${i}) AS step_${i}`).join(", ")}`);
    const values = steps.map((_, index) => numeric(counts[0]?.[`step_${index}`]));
    const resultSteps = steps.map((step, index) => ({
      step: index + 1, name: step.name || step.value, type: step.type, value: step.value, count: values[index],
      conversionRate: index === 0 ? 100 : roundPercent(values[index], values[index - 1]),
      dropOffRate: index === 0 ? 0 : roundPercent(values[index - 1] - values[index], values[index - 1]),
    }));
    return { steps: resultSteps, totalConversionRate: roundPercent(values.at(-1) || 0, values[0]), totalEntries: values[0] };
  }

  saveFunnel(data: { id?: string; name: string; type: "session" | "user"; steps: unknown[] }) { return this.funnels.saveFunnel(data); }
  listFunnels() { return this.funnels.listFunnels(); }
  deleteFunnel(id: string) { return this.funnels.deleteFunnel(id); }

  async getActiveVisitors(): Promise<number> {
    const end = new Date(); const start = new Date(end.getTime() - 5 * 60_000);
    const rows = await this.sql.query<Row>(`WITH ${dedupedEventsCte(this.sql.table, this.siteId, start.toISOString(), end.toISOString())} SELECT COUNT(DISTINCT visitor_id) AS count FROM deduped`);
    return numeric(rows[0]?.count);
  }

  async rollupHourlyStats(): Promise<void> {
    // R2 SQL reads Iceberg directly; no mutable hourly rollup table is needed.
  }
}
