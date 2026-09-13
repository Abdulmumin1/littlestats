import type { StatsFilter } from "../../types";
import { getAnalyticsBuckets, getDateBounds, getDefaultDateRange, normalizeTimezone } from "../stats/filter-utils";
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
  timezone: string;
} {
  const timezone = normalizeTimezone(filter.timezone);
  const defaults = getDefaultDateRange(timezone);
  const startDate = filter.startDate || defaults.startDate;
  const endDate = filter.endDate || defaults.endDate;
  return { startDate, endDate, timezone, ...getDateBounds(startDate, endDate, timezone) };
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
        AND event_time >= ${sqlString(start)}
        AND event_time < ${sqlString(endExclusive)}
    ) WHERE _event_rank = 1
  )`;
}

export function timeBucketSql(
  column: string,
  filter: StatsFilter,
  granularity: "hour" | "day",
): { expression: string; labels: string[] } {
  const { startDate, endDate, timezone } = analyticsRange(filter);
  const buckets = getAnalyticsBuckets(startDate, endDate, timezone, granularity);
  const cases = buckets.map(({ start, endExclusive, label }) =>
    `WHEN ${column} >= ${sqlString(start)} AND ${column} < ${sqlString(endExclusive)} THEN ${sqlString(label)}`,
  );
  return {
    expression: `CASE ${cases.join(" ")} END`,
    labels: [...new Set(buckets.map((bucket) => bucket.label))],
  };
}

export function fillTimeSeries<T extends { timestamp: string }>(
  points: T[],
  labels: string[],
  empty: (timestamp: string) => T,
): T[] {
  const byTimestamp = new Map(points.map((point) => [point.timestamp, point]));
  return labels.map((label) => byTimestamp.get(label) || empty(label));
}

export function roundPercent(numerator: number, denominator: number): number {
  return denominator > 0 ? Math.round((numerator / denominator) * 10_000) / 100 : 0;
}
