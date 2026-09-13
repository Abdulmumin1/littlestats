import type { StatsFilter } from "../../types";
import { getDateBounds, getDefaultDateRange } from "../stats/filter-utils";
import { sqlString } from "./r2-sql-client";

export function numeric(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function analyticsRange(filter: StatsFilter): {
  startDate: string;
  endDate: string;
  start: string;
  endExclusive: string;
} {
  const defaults = getDefaultDateRange();
  const startDate = filter.startDate || defaults.startDate;
  const endDate = filter.endDate || defaults.endDate;
  return { startDate, endDate, ...getDateBounds(startDate, endDate) };
}

export function eventFilterSql(filter: StatsFilter): string {
  const clauses: string[] = [];
  if (filter.urlPattern) clauses.push(`url_path = ${sqlString(filter.urlPattern)}`);
  if (filter.referrerDomain) {
    clauses.push(filter.referrerDomain.toLowerCase() === "direct"
      ? "referrer_domain IS NULL"
      : `referrer_domain = ${sqlString(filter.referrerDomain)}`);
  }
  if (filter.country) clauses.push(`COALESCE(country, 'XX') = ${sqlString(filter.country)}`);
  return clauses.length ? ` AND ${clauses.join(" AND ")}` : "";
}

export function searchSql(field: "url_path" | "referrer_domain" | "country", q?: string): string {
  if (!q) return "";
  return ` AND contains(LOWER(COALESCE(${field}, '')), ${sqlString(q.toLowerCase())})`;
}

export function dedupedEventsCte(table: string, siteId: string, start: string, endExclusive: string): string {
  return `deduped AS (
    SELECT * FROM (
      SELECT *, ROW_NUMBER() OVER (PARTITION BY event_id ORDER BY __ingest_ts DESC) AS _event_rank
      FROM ${table}
      WHERE site_id = ${sqlString(siteId)}
        AND event_time >= ${sqlString(`${start}Z`)}
        AND event_time < ${sqlString(`${endExclusive}Z`)}
    ) WHERE _event_rank = 1
  )`;
}

export function roundPercent(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 10_000) / 100 : 0;
}
