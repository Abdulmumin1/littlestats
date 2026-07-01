// Core stats - Summary and Time Series
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter, StatsSummary, TimeSeriesDataPoint } from "../../types";
import { buildEventsFilterWhere, getDateBounds, getDefaultDateRange, calculateChange } from "./filter-utils";

export class CoreStats {
  constructor(private db: D1Database, private siteId: string) {}

  async getStatsSummary(filter: StatsFilter): Promise<StatsSummary> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const currentStats = await this.getPeriodStats(startDate, endDate, filter);
    
    const prevStart = new Date(startDate);
    const prevEnd = new Date(endDate);
    const daysDiff = Math.max(
      1,
      Math.floor((prevEnd.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
    
    prevStart.setDate(prevStart.getDate() - daysDiff);
    prevEnd.setDate(prevEnd.getDate() - daysDiff);
    
    const prevStats = await this.getPeriodStats(
      prevStart.toISOString().split('T')[0],
      prevEnd.toISOString().split('T')[0],
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
      period: { start: startDate, end: endDate },
      ...currentStats,
      change,
    };
  }

  private async getPeriodStats(startDate: string, endDate: string, filter: StatsFilter) {
    const { whereSql, binds } = buildEventsFilterWhere(filter);
    const { start, endExclusive } = getDateBounds(startDate, endDate);

    const statsSql = `
      SELECT 
        SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) as views,
        COUNT(DISTINCT CASE WHEN event_type = 1 THEN visit_id END) as visits,
        COUNT(DISTINCT CASE WHEN event_type = 1 THEN session_id END) as visitors,
        SUM(CASE WHEN event_type = 3 AND engagement_time <= 10 THEN 1 ELSE 0 END) as bounce_count,
        SUM(CASE WHEN event_type = 3 THEN COALESCE(engagement_time, 0) ELSE 0 END) as total_duration
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type IN (1, 3)
        ${whereSql}
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
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const { whereSql, binds } = buildEventsFilterWhere(filter);
    const { start, endExclusive } = getDateBounds(startDate, endDate);
    if (granularity === 'hour') {
        const sql = `
          SELECT 
            substr(created_at, 1, 13) || ':00:00Z' as timestamp,
            SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) as views,
            COUNT(DISTINCT CASE WHEN event_type = 1 THEN visit_id END) as visits,
            COUNT(DISTINCT CASE WHEN event_type = 1 THEN session_id END) as visitors
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
          this.siteId,
          start,
          endExclusive,
          ...binds
        ).all<TimeSeriesDataPoint>();

        return results || [];
    }

      const sql = `
        SELECT 
          substr(created_at, 1, 10) || 'T00:00:00Z' as timestamp,
          SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) as views,
          COUNT(DISTINCT CASE WHEN event_type = 1 THEN visit_id END) as visits,
          COUNT(DISTINCT CASE WHEN event_type = 1 THEN session_id END) as visitors
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
        this.siteId,
        start,
        endExclusive,
        ...binds
      ).all<TimeSeriesDataPoint>();

      return results || [];
  }
}
