// Campaigns stats - Campaign tracking and goals
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter } from "../../types";
import { getDefaultDateRange } from "./filter-utils";

export class CampaignsStats {
  constructor(private db: D1Database, private siteId: string) {}

  async getCampaigns(filter: StatsFilter, limit: number = 20, goalEventName?: string): Promise<Array<{
    bucket: string;
    visits: number;
    conversions: number;
    conversionRate: number;
  }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const conversionExpr = goalEventName
      ? `SUM(CASE WHEN event_type = 2 AND event_name = '${goalEventName.replace(/'/g, "''")}' THEN 1 ELSE 0 END)`
      : `SUM(CASE WHEN event_type = 2 THEN 1 ELSE 0 END)`;

    const sql = `
      SELECT 
        campaign_bucket as bucket,
        COUNT(DISTINCT visit_id) as visits,
        ${conversionExpr} as conversions
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        AND campaign_bucket IS NOT NULL
        AND campaign_bucket != ''
        AND lower(campaign_bucket) != 'direct'
        AND campaign_bucket NOT LIKE 'localhost%'
        AND campaign_bucket NOT LIKE '127.0.0.1%'
      GROUP BY campaign_bucket
      ORDER BY conversions DESC, visits DESC
      LIMIT ?
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`,
      limit
    ).all<{ bucket: string; visits: number; conversions: number }>();

    return (results || []).map(r => ({
      bucket: r.bucket || 'Direct',
      visits: r.visits || 0,
      conversions: r.conversions || 0,
      conversionRate: r.visits > 0 ? Math.round((r.conversions / r.visits) * 10000) / 100 : 0,
    }));
  }

  async getGoalSummary(filter: StatsFilter, goalEventName: string): Promise<{
    conversions: number;
    conversionRate: number;
    byBucket: Array<{ bucket: string; conversions: number; conversionRate: number }>;
    timeSeries: Array<{ date: string; conversions: number }>;
  }> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const totalSql = `
      SELECT 
        COUNT(CASE WHEN event_type = 2 AND event_name = ? THEN 1 END) as conversions,
        COUNT(DISTINCT visit_id) as total_visits
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
    `;

    const totalResult = await this.db.prepare(totalSql).bind(
      goalEventName,
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`
    ).first<{ conversions: number; total_visits: number }>();

    const conversions = totalResult?.conversions || 0;
    const totalVisits = totalResult?.total_visits || 0;
    const conversionRate = totalVisits > 0 ? Math.round((conversions / totalVisits) * 10000) / 100 : 0;

    const byBucketSql = `
      WITH conversion_visits AS (
        SELECT DISTINCT visit_id
        FROM events
        WHERE site_id = ? AND event_type = 2 AND event_name = ?
          AND created_at >= ? AND created_at <= ?
      ),
      visit_attribution AS (
        SELECT 
          e.visit_id,
          COALESCE(
            (SELECT campaign_bucket FROM events e2 
             WHERE e2.site_id = e.site_id AND e2.visit_id = e.visit_id 
               AND e2.campaign_bucket != 'Direct'
             ORDER BY e2.created_at DESC LIMIT 1),
            'Direct'
          ) as attributed_bucket
        FROM conversion_visits cv
        JOIN events e ON e.visit_id = cv.visit_id AND e.site_id = ?
        GROUP BY e.visit_id
      )
      SELECT 
        attributed_bucket as bucket,
        COUNT(*) as conversions
      FROM visit_attribution
      GROUP BY attributed_bucket
      ORDER BY conversions DESC
    `;

    const { results: bucketResults } = await this.db.prepare(byBucketSql).bind(
      this.siteId, goalEventName,
      `${startDate}T00:00:00`, `${endDate}T23:59:59`,
      this.siteId
    ).all<{ bucket: string; conversions: number }>();

    const byBucket = (bucketResults || []).map(r => ({
      bucket: r.bucket || 'Direct',
      conversions: r.conversions || 0,
      conversionRate: totalVisits > 0 ? Math.round((r.conversions / totalVisits) * 10000) / 100 : 0,
    }));

    const timeSeriesSql = `
      SELECT 
        substr(created_at, 1, 10) as date,
        COUNT(*) as conversions
      FROM events
      WHERE site_id = ? AND event_type = 2 AND event_name = ?
        AND created_at >= ? AND created_at <= ?
      GROUP BY date
      ORDER BY date ASC
    `;

    const { results: tsResults } = await this.db.prepare(timeSeriesSql).bind(
      this.siteId, goalEventName,
      `${startDate}T00:00:00`, `${endDate}T23:59:59`
    ).all<{ date: string; conversions: number }>();

    const timeSeries = (tsResults || []).map(r => ({
      date: r.date,
      conversions: r.conversions || 0,
    }));

    return { conversions, conversionRate, byBucket, timeSeries };
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
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const groupBy = options?.groupBy || 'source';
    const metric = options?.metric || 'conversions';
    const granularity = options?.granularity || 'day';
    const segmentsLimit = Math.min(12, Math.max(2, options?.segmentsLimit || 6));

    const timestampExpr =
      granularity === 'hour'
        ? "substr(created_at, 1, 13) || ':00:00'"
        : "substr(created_at, 1, 10)";

    const sourceExpr = `CASE
      WHEN campaign_bucket IS NULL OR campaign_bucket = '' THEN 'Direct'
      WHEN instr(campaign_bucket, '|') = 0 THEN campaign_bucket
      ELSE substr(campaign_bucket, 1, instr(campaign_bucket, '|') - 1)
    END`;

    const mediumExpr = `CASE
      WHEN campaign_bucket IS NULL OR campaign_bucket = '' THEN 'Direct'
      WHEN instr(campaign_bucket, '|') = 0 THEN 'unknown'
      ELSE (
        CASE
          WHEN instr(substr(campaign_bucket, instr(campaign_bucket, '|') + 1), '|') = 0
            THEN substr(campaign_bucket, instr(campaign_bucket, '|') + 1)
          ELSE substr(
            substr(campaign_bucket, instr(campaign_bucket, '|') + 1),
            1,
            instr(substr(campaign_bucket, instr(campaign_bucket, '|') + 1), '|') - 1
          )
        END
      )
    END`;

    const segmentExpr = groupBy === 'medium' ? mediumExpr : sourceExpr;
    const goalEventName = options?.goalEventName;
    const metricExpr = metric === 'visits'
      ? 'COUNT(DISTINCT visit_id)'
      : goalEventName
        ? `SUM(CASE WHEN event_type = 2 AND event_name = '${goalEventName.replace(/'/g, "''")}' THEN 1 ELSE 0 END)`
        : 'SUM(CASE WHEN event_type = 2 THEN 1 ELSE 0 END)';

    const excludeNonCampaigns = `
      AND campaign_bucket IS NOT NULL
      AND campaign_bucket != ''
      AND lower(campaign_bucket) != 'direct'
      AND campaign_bucket NOT LIKE 'localhost%'
      AND campaign_bucket NOT LIKE '127.0.0.1%'
    `;

    const topSql = `
      SELECT
        ${segmentExpr} as segment,
        ${metricExpr} as total
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        ${excludeNonCampaigns}
      GROUP BY segment
      ORDER BY total DESC
      LIMIT ?
    `;

    const { results: topResults } = await this.db.prepare(topSql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`,
      segmentsLimit
    ).all<{ segment: string; total: number }>();

    const topSegments = (topResults || [])
      .map(r => ({ key: r.segment || 'unknown', total: Number(r.total || 0) }))
      .filter(r => r.key);

    const topSet = new Set(topSegments.map(s => s.key));

    const seriesSql = `
      SELECT
        ${timestampExpr} as timestamp,
        ${segmentExpr} as segment,
        ${metricExpr} as value
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        ${excludeNonCampaigns}
      GROUP BY timestamp, segment
      ORDER BY timestamp ASC
    `;

    const { results: seriesResults } = await this.db.prepare(seriesSql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`
    ).all<{ timestamp: string; segment: string; value: number }>();

    const pointsMap = new Map<string, { timestamp: string; total: number; segments: Record<string, number> }>();
    for (const row of seriesResults || []) {
      const ts = row.timestamp;
      const seg = row.segment || 'unknown';
      const v = Number(row.value || 0);
      if (!pointsMap.has(ts)) {
        pointsMap.set(ts, { timestamp: ts, total: 0, segments: {} });
      }
      const p = pointsMap.get(ts)!;
      p.total += v;
      const key = topSet.has(seg) ? seg : 'Other';
      p.segments[key] = (p.segments[key] || 0) + v;
    }

    const segmentKeys = [...topSegments.map(s => s.key), 'Other'];
    const points = Array.from(pointsMap.values()).map(p => {
      for (const k of segmentKeys) {
        if (p.segments[k] == null) p.segments[k] = 0;
      }
      return p;
    });

    const totals = new Map<string, number>();
    for (const p of points) {
      for (const [k, v] of Object.entries(p.segments)) {
        totals.set(k, (totals.get(k) || 0) + Number(v || 0));
      }
    }
    const segments = Array.from(totals.entries())
      .map(([key, total]) => ({ key, total }))
      .sort((a, b) => b.total - a.total);

    const filledPoints = fillMissingIntervals(points, segmentKeys, startDate, endDate, granularity);

    return { granularity, metric, groupBy, segments, points: filledPoints };
  }
}

function fillMissingIntervals(
  points: Array<{ timestamp: string; total: number; segments: Record<string, number> }>,
  segmentKeys: string[],
  startDate: string,
  endDate: string,
  granularity: 'day' | 'hour'
): Array<{ timestamp: string; total: number; segments: Record<string, number> }> {
  if (!startDate || !endDate) return points;

  const pointsMap = new Map(points.map((p) => [p.timestamp, p]));
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return points;

  const filled: Array<{ timestamp: string; total: number; segments: Record<string, number> }> = [];
  const cursor = new Date(start);
  const stepMs = granularity === 'hour' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  while (cursor.getTime() <= end.getTime()) {
    const iso = cursor.toISOString();
    const timestamp = granularity === 'hour' ? `${iso.slice(0, 13)}:00:00` : iso.slice(0, 10);
    const existing = pointsMap.get(timestamp);
    if (existing) {
      filled.push(existing);
    } else {
      const segments: Record<string, number> = {};
      for (const k of segmentKeys) segments[k] = 0;
      filled.push({ timestamp, total: 0, segments });
    }
    cursor.setTime(cursor.getTime() + stepMs);
  }

  return filled;
}
