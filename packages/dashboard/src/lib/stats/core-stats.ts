// Core stats - Summary and Time Series
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter, StatsSummary, TimeSeriesDataPoint } from "../../types";
import { buildEventsFilterWhere, getAnalyticsBuckets, getDateBounds, getDefaultDateRange, calculateChange, normalizeTimezone, shiftDateKey } from "./filter-utils";

export class CoreStats {
  constructor(private db: D1Database, private siteId: string) {}

  async getStatsSummary(filter: StatsFilter): Promise<StatsSummary> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange(filter.timezone);
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const currentStats = await this.getPeriodStats(startDate, endDate, filter);
    
    const daysDiff = Math.max(
      1,
      Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86_400_000) + 1
    );

    const prevStats = await this.getPeriodStats(
      shiftDateKey(startDate, -daysDiff),
      shiftDateKey(endDate, -daysDiff),
      filter
    );

    const change = {
      views: calculateChange(currentStats.views, prevStats.views),
      visits: calculateChange(currentStats.visits, prevStats.visits),
      visitors: calculateChange(currentStats.visitors, prevStats.visitors),
      bounceRate: calculateChange(currentStats.bounceRate, prevStats.bounceRate),
      avgDuration: calculateChange(currentStats.avgDuration, prevStats.avgDuration),
    };

    return {
      siteId: this.siteId,
      period: { start: startDate, end: endDate, timezone: normalizeTimezone(filter.timezone) },
      ...currentStats,
      change,
    };
  }

  private async getPeriodStats(startDate: string, endDate: string, filter: StatsFilter) {
    const { whereSql, binds } = buildEventsFilterWhere(filter);
    const { start, endExclusive } = getDateBounds(startDate, endDate, filter.timezone);

    const statsSql = `
      WITH relevant AS (
        SELECT event_type, visit_id, session_id, engagement_time
        FROM events
        WHERE site_id = ?
          AND created_at >= ?
          AND created_at < ?
          AND event_type IN (1, 3)
          ${whereSql}
      ),
      visit_counts AS (
        SELECT visit_id, COUNT(*) AS pageviews
        FROM relevant
        WHERE event_type = 1
        GROUP BY visit_id
      )
      SELECT
        SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) as views,
        (SELECT COUNT(*) FROM visit_counts) as visits,
        COUNT(DISTINCT CASE WHEN event_type = 1 THEN session_id END) as visitors,
        (SELECT COUNT(*) FROM visit_counts WHERE pageviews = 1) as bounce_count,
        SUM(CASE WHEN event_type = 3 THEN COALESCE(engagement_time, 0) ELSE 0 END) as total_duration
      FROM relevant
    `;

    const result = await this.db.prepare(statsSql).bind(
      this.siteId,
      start,
      endExclusive,
      ...binds
    ).first<{ 
      views: number;
      visits: number;
      visitors: number;
      bounce_count: number;
      total_duration: number;
    }>();

    const views = result?.views || 0;
    const visits = result?.visits || 0;
    const visitors = result?.visitors || 0;
    const bounceCount = result?.bounce_count || 0;
    const totalDuration = result?.total_duration || 0;

    return {
      views,
      visits,
      visitors,
      bounceRate: visits > 0 ? Math.round((bounceCount / visits) * 100) : 0,
      avgDuration: visits > 0 ? Math.round(totalDuration / visits) : 0,
    };
  }

  async getTimeSeries(filter: StatsFilter, granularity: 'hour' | 'day' = 'day'): Promise<TimeSeriesDataPoint[]> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange(filter.timezone);
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const { whereSql, binds } = buildEventsFilterWhere(filter);
    const { start, endExclusive } = getDateBounds(startDate, endDate, filter.timezone);
    const buckets = getAnalyticsBuckets(startDate, endDate, filter.timezone, granularity);
    const bucketExpression = `CASE ${buckets.map(() => "WHEN created_at >= ? AND created_at < ? THEN ?").join(" ")} END`;
    const bucketBinds = buckets.flatMap((bucket) => [bucket.start, bucket.endExclusive, bucket.label]);
    const sql = `
      SELECT ${bucketExpression} as timestamp,
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits,
        COUNT(DISTINCT session_id) as visitors
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type = 1
        ${whereSql}
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `;
    const { results } = await this.db.prepare(sql).bind(
      ...bucketBinds,
      this.siteId,
      start,
      endExclusive,
      ...binds
    ).all<TimeSeriesDataPoint>();
    const byTimestamp = new Map((results || []).map((point) => [point.timestamp, point]));
    return [...new Set(buckets.map((bucket) => bucket.label))].map((timestamp) =>
      byTimestamp.get(timestamp) || { timestamp, views: 0, visits: 0, visitors: 0 },
    );
  }
}
