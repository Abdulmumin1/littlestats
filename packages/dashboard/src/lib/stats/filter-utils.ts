// Filter utilities for building SQL WHERE clauses
import type { StatsFilter } from "../../types";

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const FORMATTERS = new Map<string, Intl.DateTimeFormat>();

export type AnalyticsGranularity = "hour" | "day";
export type AnalyticsBucket = { start: string; endExclusive: string; label: string };

export function hasEventFilters(filter: StatsFilter): boolean {
  return Boolean(filter.urlPattern || filter.referrerDomain || filter.country);
}

export function buildEventsFilterWhere(
  filter: StatsFilter,
  q?: { field: 'url_path' | 'referrer_domain' | 'country'; value?: string },
  options?: { tableAlias?: string; countryExpr?: string }
): { whereSql: string; binds: Array<string | number | null> } {
  const clauses: string[] = [];
  const binds: Array<string | number | null> = [];

  const tableAlias = options?.tableAlias ?? '';
  const countryExpr = options?.countryExpr ?? `COALESCE(${tableAlias}country, 'XX')`;

  if (filter.urlPattern) {
    clauses.push(`${tableAlias}url_path = ?`);
    binds.push(filter.urlPattern);
  }
  if (filter.referrerDomain) {
    if (filter.referrerDomain.toLowerCase() === 'direct') {
      clauses.push(`${tableAlias}referrer_domain IS NULL`);
    } else {
      clauses.push(`${tableAlias}referrer_domain = ?`);
      binds.push(filter.referrerDomain);
    }
  }
  if (filter.country) {
    clauses.push(`${countryExpr} = ?`);
    binds.push(filter.country);
  }

  if (q?.value) {
    if (q.field === 'country') {
      clauses.push(`LOWER(${countryExpr}) LIKE ?`);
    } else {
      clauses.push(`LOWER(COALESCE(${tableAlias}${q.field}, '')) LIKE ?`);
    }
    binds.push(`%${q.value.toLowerCase()}%`);
  }

  return {
    whereSql: clauses.length ? ` AND ${clauses.join(' AND ')}` : '',
    binds
  };
}

export function normalizeTimezone(value?: string): string {
  if (!value) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return value;
  } catch {
    return "UTC";
  }
}

function partsAt(date: Date, timezone: string): Record<string, number> {
  let formatter = FORMATTERS.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    FORMATTERS.set(timezone, formatter);
  }
  return Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

export function dateKeyInTimezone(date: Date, timezone = "UTC"): string {
  const { year, month, day } = partsAt(date, normalizeTimezone(timezone));
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function shiftDateKey(dateKey: string, days: number): string {
  if (!DATE_KEY.test(dateKey)) throw new Error("Invalid analytics date");
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function zonedMidnight(dateKey: string, timezone: string): string {
  if (!DATE_KEY.test(dateKey)) throw new Error("Invalid analytics date");
  const [year, month, day] = dateKey.split("-").map(Number);
  const wallClock = Date.UTC(year, month - 1, day);
  let instant = wallClock;

  // Two passes handle offsets that differ between the initial UTC guess and
  // the target local date (including daylight-saving transitions).
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = partsAt(new Date(instant), timezone);
    const offset = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - instant;
    instant = wallClock - offset;
  }
  return new Date(instant).toISOString();
}

export function getDefaultDateRange(timezone = "UTC", now = new Date()): { startDate: string; endDate: string } {
  const endDate = dateKeyInTimezone(now, timezone);
  const startDate = shiftDateKey(endDate, -29);
  return { startDate, endDate };
}

/**
 * Return a half-open UTC range. Using the next day's midnight avoids dropping
 * events recorded during the final second of the selected end date.
 */
export function getDateBounds(startDate: string, endDate: string, timezone = "UTC"): { start: string; endExclusive: string } {
  const safeTimezone = normalizeTimezone(timezone);
  return {
    start: zonedMidnight(startDate, safeTimezone),
    endExclusive: zonedMidnight(shiftDateKey(endDate, 1), safeTimezone),
  };
}

function bucketLabel(date: Date, timezone: string, granularity: AnalyticsGranularity): string {
  const parts = partsAt(date, timezone);
  const day = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
  return granularity === "day" ? day : `${day}T${String(parts.hour).padStart(2, "0")}:00:00`;
}

export function getAnalyticsBuckets(
  startDate: string,
  endDate: string,
  timezone = "UTC",
  granularity: AnalyticsGranularity = "day",
): AnalyticsBucket[] {
  const safeTimezone = normalizeTimezone(timezone);
  const { start, endExclusive } = getDateBounds(startDate, endDate, safeTimezone);
  const step = granularity === "hour" ? 3_600_000 : null;

  if (step) {
    const buckets: AnalyticsBucket[] = [];
    for (let time = Date.parse(start); time < Date.parse(endExclusive); time += step) {
      const next = Math.min(time + step, Date.parse(endExclusive));
      buckets.push({
        start: new Date(time).toISOString(),
        endExclusive: new Date(next).toISOString(),
        label: bucketLabel(new Date(time), safeTimezone, granularity),
      });
    }
    return buckets;
  }

  const buckets: AnalyticsBucket[] = [];
  for (let date = startDate; date <= endDate; date = shiftDateKey(date, 1)) {
    const bounds = getDateBounds(date, date, safeTimezone);
    buckets.push({ ...bounds, label: date });
  }
  return buckets;
}

export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
