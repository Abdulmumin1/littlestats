// Dashboard API - Stats queries and aggregation
// Facade that composes all stats modules
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter, StatsSummary, TimeSeriesDataPoint } from "../types";
import { CoreStats } from "./stats/core-stats";
import { BreakdownStats } from "./stats/breakdown-stats";
import { EventsStats } from "./stats/events-stats";
import { CampaignsStats } from "./stats/campaigns-stats";
import { FunnelsStats } from "./stats/funnels-stats";

export class DashboardAPI {
  private db: D1Database;
  private siteId: string;
  
  private coreStats: CoreStats;
  private breakdownStats: BreakdownStats;
  private eventsStats: EventsStats;
  private campaignsStats: CampaignsStats;
  private funnelsStats: FunnelsStats;

  constructor(db: D1Database, siteId: string) {
    this.db = db;
    this.siteId = siteId;
    
    this.coreStats = new CoreStats(db, siteId);
    this.breakdownStats = new BreakdownStats(db, siteId);
    this.eventsStats = new EventsStats(db, siteId);
    this.campaignsStats = new CampaignsStats(db, siteId);
    this.funnelsStats = new FunnelsStats(db, siteId);
  }

  // ============================================
  // Core Stats (delegated to CoreStats)
  // ============================================

  async getStatsSummary(filter: StatsFilter): Promise<StatsSummary> {
    return this.coreStats.getStatsSummary(filter);
  }

  async getTimeSeries(filter: StatsFilter, granularity: 'hour' | 'day' = 'day'): Promise<TimeSeriesDataPoint[]> {
    return this.coreStats.getTimeSeries(filter, granularity);
  }

  // ============================================
  // Breakdown Metrics (delegated to BreakdownStats)
  // ============================================

  async getTopReferrers(
    filter: StatsFilter,
    limit: number = 10,
    options?: { q?: string }
  ): Promise<Array<{ referrer: string; views: number; visits: number }>> {
    return this.breakdownStats.getTopReferrers(filter, limit, options);
  }

  async getTopPages(
    filter: StatsFilter,
    limit: number = 10,
    options?: { q?: string }
  ): Promise<Array<{ path: string; views: number; visits: number }>> {
    return this.breakdownStats.getTopPages(filter, limit, options);
  }

  async getTopCountries(
    filter: StatsFilter,
    limit: number = 10,
    options?: { q?: string }
  ): Promise<Array<{ country: string; code: string; views: number; visits: number }>> {
    return this.breakdownStats.getTopCountries(filter, limit, options);
  }

  async getDeviceBreakdown(filter: StatsFilter): Promise<Array<{ device: string; views: number; visits: number }>> {
    return this.breakdownStats.getDeviceBreakdown(filter);
  }

  async getBrowserBreakdown(filter: StatsFilter, limit: number = 10): Promise<Array<{ browser: string; views: number; visits: number }>> {
    return this.breakdownStats.getBrowserBreakdown(filter, limit);
  }

  // ============================================
  // Events (delegated to EventsStats)
  // ============================================

  async getCustomEvents(filter: StatsFilter): Promise<Array<{ name: string; count: number }>> {
    return this.eventsStats.getCustomEvents(filter);
  }

  async getEventsList(
    filter: StatsFilter,
    options?: {
      limit?: number;
      cursor?: { timestamp: string; id: number };
      eventName?: string;
    }
  ): Promise<{ events: any[]; total: number; nextCursor: { timestamp: string; id: number } | null }> {
    return this.eventsStats.getEventsList(filter, options);
  }

  async getEventNames(): Promise<string[]> {
    return this.eventsStats.getEventNames();
  }

  // ============================================
  // Campaigns & Goals (delegated to CampaignsStats)
  // ============================================

  async getCampaigns(filter: StatsFilter, limit: number = 20, goalEventName?: string): Promise<Array<{
    bucket: string;
    visits: number;
    conversions: number;
    conversionRate: number;
  }>> {
    return this.campaignsStats.getCampaigns(filter, limit, goalEventName);
  }

  async getGoalSummary(filter: StatsFilter, goalEventName: string): Promise<{
    conversions: number;
    conversionRate: number;
    byBucket: Array<{ bucket: string; conversions: number; conversionRate: number }>;
    timeSeries: Array<{ date: string; conversions: number }>;
  }> {
    return this.campaignsStats.getGoalSummary(filter, goalEventName);
  }

  async getCampaignsSegmentedTimeSeries(
    filter: StatsFilter,
    options?: {
      groupBy?: 'source' | 'medium';
      metric?: 'conversions' | 'visits';
      granularity?: 'day' | 'hour';
      segmentsLimit?: number;
      goalEventName?: string;
    }
  ): Promise<{
    granularity: 'day' | 'hour';
    metric: 'conversions' | 'visits';
    groupBy: 'source' | 'medium';
    segments: Array<{ key: string; total: number }>;
    points: Array<{ timestamp: string; total: number; segments: Record<string, number> }>;
  }> {
    return this.campaignsStats.getCampaignsSegmentedTimeSeries(filter, options);
  }

  // ============================================
  // Funnels (delegated to FunnelsStats)
  // ============================================

  async analyzeFunnel(
    filter: StatsFilter,
    steps: Array<{ type: 'url' | 'event'; value: string; name?: string }>,
    funnelType: 'session' | 'user' = 'session'
  ) {
    return this.funnelsStats.analyzeFunnel(filter, steps, funnelType);
  }

  async saveFunnel(data: {
    id?: string;
    name: string;
    type: 'session' | 'user';
    steps: any[];
  }) {
    return this.funnelsStats.saveFunnel(data);
  }

  async listFunnels() {
    return this.funnelsStats.listFunnels();
  }

  async deleteFunnel(id: string) {
    return this.funnelsStats.deleteFunnel(id);
  }

  // ============================================
  // Real-Time Stats
  // ============================================

  async getActiveVisitors(): Promise<number> {
    const sql = `
      SELECT COUNT(DISTINCT session_id) as count
      FROM events
      WHERE site_id = ?
        AND created_at >= datetime('now', '-5 minutes')
    `;

    const result = await this.db.prepare(sql).bind(this.siteId).first<{ count: number }>();
    return result?.count || 0;
  }

  // ============================================
  // Aggregated Hourly Stats Rollup
  // ============================================

  async rollupHourlyStats(hour: string): Promise<void> {
    const startOfHour = `${hour}:00:00`;
    const endOfHour = `${hour}:59:59`;

    const statsSql = `
      SELECT 
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits,
        COUNT(DISTINCT session_id) as visitors,
        SUM(CASE WHEN event_type = 2 THEN 1 ELSE 0 END) as custom_events
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        AND event_type = 1
    `;

    const stats = await this.db.prepare(statsSql).bind(
      this.siteId,
      startOfHour,
      endOfHour
    ).first<{ views: number; visits: number; visitors: number; custom_events: number }>();

    const bounceSql = `
      SELECT 
        COUNT(CASE WHEN total_pageviews = 1 THEN 1 END) as bounce_count,
        AVG(total_engagement_time) as avg_duration
      FROM sessions
      WHERE site_id = ?
        AND first_visit_at >= ?
        AND first_visit_at <= ?
    `;

    const bounceStats = await this.db.prepare(bounceSql).bind(
      this.siteId,
      startOfHour,
      endOfHour
    ).first<{ bounce_count: number; avg_duration: number }>();

    const insertSql = `
      INSERT INTO hourly_stats (
        site_id, hour, views, visits, visitors, bounce_count, total_duration, custom_events
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(site_id, hour) DO UPDATE SET
        views = excluded.views,
        visits = excluded.visits,
        visitors = excluded.visitors,
        bounce_count = excluded.bounce_count,
        total_duration = excluded.total_duration,
        custom_events = excluded.custom_events
    `;

    await this.db.prepare(insertSql).bind(
      this.siteId,
      hour,
      stats?.views || 0,
      stats?.visits || 0,
      stats?.visitors || 0,
      bounceStats?.bounce_count || 0,
      Math.round((bounceStats?.avg_duration || 0) * (stats?.visits || 0)),
      stats?.custom_events || 0
    ).run();
  }
}

export default DashboardAPI;
