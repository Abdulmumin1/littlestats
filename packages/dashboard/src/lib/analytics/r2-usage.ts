import type { Env } from "../../types";
import { getDateBounds, getDefaultDateRange, normalizeTimezone } from "../stats/filter-utils";
import { numeric } from "./query-helpers";
import { R2SqlClient, sqlString } from "./r2-sql-client";

type Row = Record<string, unknown>;

export class R2Usage {
  private readonly sql: R2SqlClient;

  constructor(env: Env) {
    this.sql = new R2SqlClient(env);
  }

  private siteList(siteIds: string[]): string {
    if (siteIds.length === 0) return "NULL";
    return siteIds.map(sqlString).join(", ");
  }

  async getSiteMetrics(siteIds: string[], timezone?: string): Promise<Map<string, { viewsToday: number }>> {
    if (siteIds.length === 0) return new Map();
    const safeTimezone = normalizeTimezone(timezone);
    const { endDate: today } = getDefaultDateRange(safeTimezone);
    const { start, endExclusive } = getDateBounds(today, today, safeTimezone);
    const rows = await this.sql.query<Row>(`
      WITH deduped AS (
        SELECT * FROM ${this.sql.table}
        WHERE site_id IN (${this.siteList(siteIds)})
          AND event_type = 'pageview'
          AND event_time >= ${sqlString(start)}
          AND event_time < ${sqlString(endExclusive)}
        QUALIFY ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY __ingest_ts DESC) = 1
      )
      SELECT site_id,
        COUNT(*) AS views_today
      FROM deduped GROUP BY site_id
    `);
    return new Map(rows.map((row) => [String(row.site_id), {
      viewsToday: numeric(row.views_today),
    }]));
  }

  async getBillableEventCount(siteIds: string[], start: string, endExclusive: string): Promise<number> {
    if (siteIds.length === 0) return 0;
    const rows = await this.sql.query<Row>(`
      WITH deduped AS (
        SELECT * FROM ${this.sql.table}
        WHERE site_id IN (${this.siteList(siteIds)})
          AND event_time >= ${sqlString(start)} AND event_time < ${sqlString(endExclusive)}
        QUALIFY ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY __ingest_ts DESC) = 1
      )
      SELECT COUNT(*) AS total FROM deduped WHERE is_billable = TRUE
    `);
    return numeric(rows[0]?.total);
  }
}
