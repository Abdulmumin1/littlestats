import type { Env } from "../../types";
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

  async getSiteMetrics(siteIds: string[]): Promise<Map<string, { sessionCount: number; events24h: number }>> {
    if (siteIds.length === 0) return new Map();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const rows = await this.sql.query<Row>(`
      WITH deduped AS (
        SELECT * FROM ${this.sql.table}
        WHERE site_id IN (${this.siteList(siteIds)})
        QUALIFY ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY __ingest_ts DESC) = 1
      )
      SELECT site_id,
        COUNT(DISTINCT visit_id) AS session_count,
        SUM(CASE WHEN event_time >= ${sqlString(yesterday.toISOString())} AND event_time < ${sqlString(now.toISOString())} THEN 1 ELSE 0 END) AS events_24h
      FROM deduped GROUP BY site_id
    `);
    return new Map(rows.map((row) => [String(row.site_id), {
      sessionCount: numeric(row.session_count),
      events24h: numeric(row.events_24h),
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
