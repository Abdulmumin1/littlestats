// Breakdown stats - Referrers, Pages, Countries, Devices, Browsers
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter } from "../../types";
import { buildEventsFilterWhere, getDateBounds, getDefaultDateRange } from "./filter-utils";
import { COUNTRY_NAMES } from "../utils/country-names";

function getCountryName(code: string): string {
  if (!code || code === 'Unknown' || code === 'XX') return 'Unknown';
  return COUNTRY_NAMES[code] || code;
}

export class BreakdownStats {
  constructor(private db: D1Database, private siteId: string) {}

  async getTopReferrers(
    filter: StatsFilter,
    limit: number = 10,
    options?: { q?: string }
  ): Promise<Array<{ referrer: string; views: number; visits: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;
    const { start, endExclusive } = getDateBounds(startDate, endDate);

    const { whereSql, binds } = buildEventsFilterWhere(filter, {
      field: 'referrer_domain',
      value: options?.q
    });

    const sql = `
      SELECT 
        referrer_domain as referrer,
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type = 1
        AND referrer_domain IS NOT NULL
        ${whereSql}
      GROUP BY referrer_domain
      ORDER BY views DESC
      LIMIT ?
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      start,
      endExclusive,
      ...binds,
      limit
    ).all<{ referrer: string; views: number; visits: number }>();

    return results || [];
  }

  async getTopPages(
    filter: StatsFilter,
    limit: number = 10,
    options?: { q?: string }
  ): Promise<Array<{ path: string; views: number; visits: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;
    const { start, endExclusive } = getDateBounds(startDate, endDate);

    const { whereSql, binds } = buildEventsFilterWhere(filter, {
      field: 'url_path',
      value: options?.q
    });

    const sql = `
      SELECT 
        url_path as path,
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type = 1
        ${whereSql}
      GROUP BY url_path
      ORDER BY views DESC
      LIMIT ?
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      start,
      endExclusive,
      ...binds,
      limit
    ).all<{ path: string; views: number; visits: number }>();

    return results || [];
  }

  async getTopCountries(
    filter: StatsFilter,
    limit: number = 10,
    options?: { q?: string }
  ): Promise<Array<{ country: string; code: string; views: number; visits: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;
    const { start, endExclusive } = getDateBounds(startDate, endDate);

    const countryExpr = "COALESCE(NULLIF(e.country, ''), NULLIF(s.country, ''), 'XX')";

    const { whereSql, binds } = buildEventsFilterWhere(filter, {
      field: 'country',
      value: options?.q
    }, {
      tableAlias: 'e.',
      countryExpr
    });

    const sql = `
      SELECT 
        ${countryExpr} as country,
        COUNT(*) as views,
        COUNT(DISTINCT e.visit_id) as visits
      FROM events e
      JOIN sessions s ON s.id = e.session_id
      WHERE e.site_id = ?
        AND e.created_at >= ?
        AND e.created_at < ?
        AND e.event_type = 1
        ${whereSql}
      GROUP BY ${countryExpr}
      ORDER BY views DESC
      LIMIT ?
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      start,
      endExclusive,
      ...binds,
      limit
    ).all<{ country: string; views: number; visits: number }>();

    return (results || []).map(r => ({
      country: getCountryName(r.country),
      code: r.country,
      views: r.views,
      visits: r.visits
    }));
  }

  async getDeviceBreakdown(filter: StatsFilter): Promise<Array<{ device: string; views: number; visits: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;
    const { start, endExclusive } = getDateBounds(startDate, endDate);

    const { whereSql, binds } = buildEventsFilterWhere(filter);

    const sql = `
      SELECT 
        device,
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type = 1
        ${whereSql}
      GROUP BY device
      ORDER BY views DESC
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      start,
      endExclusive,
      ...binds
    ).all<{ device: string; views: number; visits: number }>();

    return results || [];
  }

  async getBrowserBreakdown(filter: StatsFilter, limit: number = 10): Promise<Array<{ browser: string; views: number; visits: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const { start, endExclusive } = getDateBounds(startDate, endDate);
    const { whereSql, binds } = buildEventsFilterWhere(filter);

    const sql = `
      SELECT 
        browser,
        COUNT(*) as views,
        COUNT(DISTINCT visit_id) as visits
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type = 1
        ${whereSql}
      GROUP BY browser
      ORDER BY views DESC
      LIMIT ?
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      start,
      endExclusive,
      ...binds,
      limit
    ).all<{ browser: string; views: number; visits: number }>();

    return results || [];
  }
}
