// Events stats - Custom events and event lists
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter } from "../../types";
import { getDateBounds, getDefaultDateRange } from "./filter-utils";

export class EventsStats {
  constructor(private db: D1Database, private siteId: string) {}

  async getCustomEvents(filter: StatsFilter): Promise<Array<{ name: string; count: number }>> {
    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;
    const { start, endExclusive } = getDateBounds(startDate, endDate);

    const sql = `
      SELECT 
        event_name as name,
        COUNT(*) as count
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        AND event_type = 2
        AND event_name IS NOT NULL
      GROUP BY event_name
      ORDER BY count DESC
    `;

    const { results } = await this.db.prepare(sql).bind(
      this.siteId,
      start,
      endExclusive
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
    const { start, endExclusive } = getDateBounds(startDate, endDate);
    const limit = Math.min(250, Math.max(1, options?.limit ?? 100));
    const eventNameFilter = options?.eventName;
    const excludePageview = filter.excludePageview;

    let eventNameClause = '';
    const eventNameBinds: Array<string | number> = [];
    if (eventNameFilter === 'Page View') {
      eventNameClause = 'AND event_type = 1';
    } else if (eventNameFilter === 'Page Exit') {
      eventNameClause = 'AND event_type = 3';
    } else if (eventNameFilter === 'Identify') {
      eventNameClause = 'AND event_type = 4';
    } else if (eventNameFilter) {
      eventNameClause = 'AND event_type = 2 AND event_name = ?';
      eventNameBinds.push(eventNameFilter);
    }
      
    const excludePageviewClause = excludePageview ? "AND event_type != 1" : "";

    const totalSql = `
      SELECT COUNT(*) as total
      FROM events
      WHERE site_id = ?
        AND created_at >= ?
        AND created_at < ?
        ${eventNameClause}
        ${excludePageviewClause}
    `;

    const totalResult = await this.db
      .prepare(totalSql)
      .bind(this.siteId, start, endExclusive, ...eventNameBinds)
      .first<{ total: number }>();

    const cursor = options?.cursor;

    const cursorClause = cursor
      ? 'AND (created_at < ? OR (created_at = ? AND id < ?))'
      : '';
    const sql = `
      SELECT 
        id,
        CASE 
          WHEN event_type = 1 THEN 'Page View'
          WHEN event_type = 2 THEN COALESCE(NULLIF(event_name, 'null'), 'Custom Event')
          WHEN event_type = 3 THEN 'Page Exit'
          WHEN event_type = 4 THEN 'Identify'
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
        AND created_at < ?
        ${eventNameClause}
        ${excludePageviewClause}
        ${cursorClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `;

    const cursorBinds = cursor ? [cursor.timestamp, cursor.timestamp, cursor.id] : [];

    const { results } = await this.db
      .prepare(sql)
      .bind(
        this.siteId,
        start,
        endExclusive,
        ...eventNameBinds,
        ...cursorBinds,
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
