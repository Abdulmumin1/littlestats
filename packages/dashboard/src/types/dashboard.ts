// Dashboard query and response types

export interface RealtimeStats {
  siteId: string;
  timestamp: number;
  activeVisitors: number;
  pageviewsLastMinute: number;
  eventsLastMinute: number;
  topPages: Array<{ path: string; count: number }>;
  topReferrers: Array<{ domain: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
}

export interface StatsFilter {
  startDate?: string;
  endDate?: string;
  urlPattern?: string;
  referrerDomain?: string;
  country?: string;
  device?: string;
  browser?: string;
  os?: string;
  eventName?: string;
  excludePageview?: boolean;
}

export interface StatsSummary {
  siteId: string;
  period: {
    start: string;
    end: string;
  };
  views: number;
  visits: number;
  visitors: number;
  bounceRate: number;
  avgDuration: number;
  change: {
    views: number;
    visits: number;
    visitors: number;
    bounceRate: number;
    avgDuration: number;
  };
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  views: number;
  visits: number;
  visitors: number;
}

// Legacy dashboard data types for compatibility
export interface DailyActiveUsers {
  [date: string]: number;
}

export interface WeeklyActiveUsers {
  [weekKey: string]: number;
}

export interface WeeklyUsersRaw {
  [weekKey: string]: Set<string>;
}

export interface RetentionData {
  [weekKey: string]: { [otherKey: string]: number };
}

export interface GraphDataPoint {
  myX: string;
  myY: number;
}
