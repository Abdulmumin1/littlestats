// Events stats - Custom events and event lists
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter } from "../../types";
import { getDefaultDateRange } from "./filter-utils";

export class EventsStats {
  constructor(private db: D1Database, private siteId: string) {}

  async getCustomEvents(filter: StatsFilter): Promise<Array<{ name: string; count: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const sql = `
      SELECT 
        event_name as name,
        COUNT(*) as count
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        AND event_type = 2
        AND event_name IS NOT NULL
      GROUP BY event_name
      ORDER BY count DESC
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      `${startDate}T00:00:00`,
      `${endDate}T23:59:59`
    ).all<{ name: string; count: number }>();

    return results || [];
  }

  async getEventsList(
    filter: StatsFilter,
    options?: {
      limit?: number;
      cursor?: { timestamp: string; id: number };
      eventName?: string;
    }
  ): Promise<{ events: any[]; total: number; nextCursor: { timestamp: string; id: number } | null }> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;
    const limit = options?.limit ?? 100;
    const eventNameFilter = options?.eventName;
    const excludePageview = filter.excludePageview;

    const eventNameClause = eventNameFilter 
      ? `AND (
          (event_type = 2 AND event_name = '${eventNameFilter.replace(/'/g, "''")}')
          OR (event_type = 1 AND '${eventNameFilter.replace(/'/g, "''")}' = 'Page View')
          OR (event_type = 3 AND '${eventNameFilter.replace(/'/g, "''")}' = 'Page Exit')
          OR (event_type = 4 AND '${eventNameFilter.replace(/'/g, "''")}' = 'Heartbeat')
        )`
      : '';
      
    const excludePageviewClause = excludePageview ? "AND event_type != 1" : "";

    const totalSql = `
      SELECT COUNT(*) as total
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        ${eventNameClause}
        ${excludePageviewClause}
    `;

    const totalResult = await this.db
      .prepare(totalSql)
      .bind(this.siteId, `${startDate}T00:00:00`, `${endDate}T23:59:59`)
      .first<{ total: number }>();

    const cursor = options?.cursor;

    const sql = `
      SELECT 
        id,
        CASE 
          WHEN event_type = 1 THEN 'Page View'
          WHEN event_type = 2 THEN COALESCE(NULLIF(event_name, 'null'), 'Custom Event')
          WHEN event_type = 3 THEN 'Page Exit'
          WHEN event_type = 4 THEN 'Heartbeat'
          ELSE 'Unknown'
        END as event_name,
        COALESCE(url_path, '/') as url,
        COALESCE(referrer_domain, 'Direct') as referrer,
        created_at as timestamp,
        COALESCE(timezone, 'UTC') as timezone,
        session_id as user_id,
        language,
        event_data
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at <= ?
        ${eventNameClause}
        ${excludePageviewClause}
        AND (
          ? IS NULL
          OR created_at < ?
          OR (created_at = ? AND id < ?)
        )
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `;

    const cursorTs = cursor?.timestamp ?? null;
    const cursorId = cursor?.id ?? null;

    const { results } = await this.db
      .prepare(sql)
      .bind(
        this.siteId,
        `${startDate}T00:00:00`,
        `${endDate}T23:59:59`,
        cursorTs,
        cursorTs,
        cursorTs,
        cursorId,
        limit
      )
      .all<{ id: number; timestamp: string }>();

    const events = results || [];
    const last = events.length ? events[events.length - 1] : null;
    const nextCursor = last ? { timestamp: last.timestamp, id: last.id } : null;

    return {
      events,
      total: totalResult?.total ?? 0,
      nextCursor
    };
  }

  async getEventNames(): Promise<string[]> {
    const sql = `
      SELECT event_name 
      FROM custom_event_registry
      WHERE site_id = ?
      ORDER BY last_seen_at DESC
    `;
    
    const { results } = await this.db.prepare(sql).bind(this.siteId).all<{ event_name: string }>();
    
    if (!results || results.length === 0) {
      const fallbackSql = `
        SELECT DISTINCT event_name
        FROM events
        WHERE site_id = ? AND event_type = 2 AND event_name IS NOT NULL
        ORDER BY event_name
        LIMIT 100
      `;
      const fallback = await this.db.prepare(fallbackSql).bind(this.siteId).all<{ event_name: string }>();
      return (fallback.results || []).map(r => r.event_name);
    }
    
    return results.map(r => r.event_name);
  }
}
