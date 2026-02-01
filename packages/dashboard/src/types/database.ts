// Database entity types

export interface Session {
  id: string;
  siteId: string;
  visitorId: string;
  firstVisitAt: Date;
  lastVisitAt: Date;
  visitCount: number;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: 'desktop' | 'mobile' | 'tablet' | null;
  screen: string | null;
  country: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
  language: string | null;
  timezone: string | null;
  totalPageviews: number;
  totalEvents: number;
  totalEngagementTime: number;
  identifiedUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HourlyStats {
  siteId: string;
  hour: Date;
  views: number;
  visits: number;
  visitors: number;
  bounceCount: number;
  totalDuration: number;
  customEvents: number;
  bounceRate?: number;
  avgDuration?: number;
}

export interface DailyStats {
  siteId: string;
  date: Date;
  views: number;
  visits: number;
  visitors: number;
  bounceCount: number;
  totalDuration: number;
  customEvents: number;
  bounceRate?: number;
  avgDuration?: number;
}

export interface ReferrerStats {
  siteId: string;
  hour: Date;
  referrerDomain: string;
  views: number;
  visits: number;
}

export interface PageStats {
  siteId: string;
  hour: Date;
  urlPath: string;
  views: number;
  visits: number;
}

export interface CountryStats {
  siteId: string;
  hour: Date;
  country: string;
  views: number;
  visits: number;
}

export interface DeviceStats {
  siteId: string;
  hour: Date;
  device: string;
  views: number;
  visits: number;
}

export interface CustomEventRegistry {
  siteId: string;
  eventName: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  totalCount24h: number;
  totalCount7d: number;
  totalCount30d: number;
}

// Legacy event record types for compatibility
export interface EventRecord {
  timestamp: string;
  user_id: string;
  url: string;
  event_name?: string;
  event_type: string;
  session_id?: string;
  duration?: number;
  ip?: string;
  referrer?: string;
  user_agent?: string;
  timezone?: string;
}

export interface EventData {
  domain_id: string;
  event_type: string;
  url: string;
  referrer?: string | null;
  user_agent?: string | null;
  timestamp: string;
  duration?: number | null;
  ip?: string | null;
  timezone?: string | null;
  created_at: string;
  user_id?: string | null;
  screen?: string | null;
  language?: string | null;
  event_name?: string | null;
  event_data?: string | null;
  session_id?: string | null;
  host?: string | null;
}
