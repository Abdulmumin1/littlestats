// Core stats - Summary and Time Series
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter, StatsSummary, TimeSeriesDataPoint } from "../../types";
import { hasEventFilters, buildEventsFilterWhere, getDefaultDateRange, calculateChange } from "./filter-utils";

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
    if (!hasEventFilters(filter)) {
      const sql = `
        SELECT 
          SUM(views) as views,
          SUM(visits) as visits,
          SUM(visitors) as visitors,
          SUM(bounce_count) as bounce_count,
          SUM(total_duration) as total_duration
        FROM hourly_stats
        WHERE site_id = ?
          AND hour >= ?
          AND hour < ?
      `;

      const result = await this.db.prepare(sql).bind(
        this.siteId,
        `${startDate}T00:00:00`,
        `${endDate}T23:59:59`
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

    const { whereSql, binds } = buildEventsFilterWhere(filter);

    const statsSql = `
      SELECT 
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits,
        COUNT(DISTINCT session_id) as visitors,
        SUM(CASE WHEN event_type = 3 AND engagement_time <= 10 THEN 1 ELSE 0 END) as bounce_count,
        SUM(CASE WHEN event_type = 3 THEN COALESCE(engagement_time, 0) ELSE 0 END) as total_duration
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        AND event_type IN (1, 3)
        ${whereSql}
    `;

    const result = await this.db.prepare(statsSql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`,
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

    if (hasEventFilters(filter)) {
      const { whereSql, binds } = buildEventsFilterWhere(filter);
      if (granularity === 'hour') {
        const sql = `
          SELECT 
            substr(created_at, 1, 13) || ':00:00Z' as timestamp,
            SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) as views,
            COUNT(DISTINCT visit_id) as visits,
            COUNT(DISTINCT session_id) as visitors
          FROM events
          WHERE site_id = ?
            AND created_at >= ?
            AND created_at <= ?
            AND event_type IN (1, 3)
            ${whereSql}
          GROUP BY timestamp
          ORDER BY timestamp ASC
        `;

        const { results } = await this.db.prepare(sql).bind(
          this.siteId,
          `${startDate}T00:00:00`,
          `${endDate}T23:59:59`,
          ...binds
        ).all<TimeSeriesDataPoint>();

        return results || [];
      }

      const sql = `
        SELECT 
          substr(created_at, 1, 10) || 'T00:00:00Z' as timestamp,
          SUM(CASE WHEN event_type = 1 THEN 1 ELSE 0 END) as views,
          COUNT(DISTINCT visit_id) as visits,
          COUNT(DISTINCT session_id) as visitors
        FROM events
        WHERE site_id = ?
          AND created_at >= ?
          AND created_at <= ?
          AND event_type IN (1, 3)
          ${whereSql}
        GROUP BY timestamp
        ORDER BY timestamp ASC
      `;

      const { results } = await this.db.prepare(sql).bind(
        this.siteId,
        `${startDate}T00:00:00`,
        `${endDate}T23:59:59`,
        ...binds
      ).all<TimeSeriesDataPoint>();

      return results || [];
    }

    if (granularity === 'hour') {
      return this.getHourlyTimeSeries(startDate, endDate);
    }
    
    return this.getDailyTimeSeries(startDate, endDate);
  }

  private async getHourlyTimeSeries(startDate: string, endDate: string): Promise<TimeSeriesDataPoint[]> {
    const sql = `
      SELECT 
        hour as timestamp,
        views,
        visits,
        visitors
      FROM hourly_stats
      WHERE site_id = ?
        AND hour >= ?
        AND hour <= ?
      ORDER BY hour ASC
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`
    ).all<TimeSeriesDataPoint>();

    return (results || []).map((r) => ({
      ...r,
      timestamp: typeof r.timestamp === 'string' && !r.timestamp.endsWith('Z')
        ? `${r.timestamp}Z`
        : r.timestamp
    }));
  }

  private async getDailyTimeSeries(startDate: string, endDate: string): Promise<TimeSeriesDataPoint[]> {
    const sql = `
      SELECT 
        substr(hour, 1, 10) as timestamp,
        SUM(views) as views,
        SUM(visits) as visits,
        SUM(visitors) as visitors
      FROM hourly_stats
      WHERE site_id = ?
        AND hour >= ?
        AND hour <= ?
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`
    ).all<TimeSeriesDataPoint>();

    return (results || []).map((r) => ({
      ...r,
      timestamp: typeof r.timestamp === 'string' ? `${r.timestamp}T00:00:00Z` : r.timestamp
    }));
  }
}
