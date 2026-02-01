// Filter utilities for building SQL WHERE clauses
import type { StatsFilter } from "../../types";

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

export function getDefaultDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return { startDate, endDate };
}

export function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
