// Analytics payload and event types

export interface TrackPayload {
  eventId?: string; // Stable client-generated id used for idempotent retries
  type: 'pageview' | 'event' | 'identify' | 'page_exit';
  website: string; // site_id/domain_key
  url?: string;
  referrer?: string;
  title?: string;
  screen?: string;
  language?: string;
  timezone?: string;
  name?: string; // for custom events
  data?: Record<string, any>; // event properties
  duration?: number; // active page duration in seconds for page_exit
  id?: string; // for identify
  cache?: {
    visitId: string;
    iat: number;
  };
  visitorId?: string;
  userAgent?: string;
}

export interface AnalyticsEventRecord extends Record<string, unknown> {
  schema_version: number;
  event_id: string;
  site_id: string;
  event_time: string;
  event_type: 'pageview' | 'custom' | 'page_exit' | 'identify';
  visitor_id: string;
  visit_id: string;
  is_billable: boolean;
  identified_user_id?: string;
  url_path?: string;
  url_query?: string;
  url_hash?: string;
  page_title?: string;
  referrer_domain?: string;
  referrer_path?: string;
  event_name?: string;
  event_properties?: Record<string, unknown>;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  device?: string;
  screen?: string;
  country?: string;
  region?: string;
  city?: string;
  language?: string;
  timezone?: string;
  engagement_seconds?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  campaign_bucket?: string;
}

export interface Event {
  id: number;
  eventUid: string;
  siteId: string;
  sessionId: string;
  visitId: string;
  eventType: 1 | 2 | 3 | 4; // 1=pageview, 2=custom, 3=exit, 4=identify
  urlPath: string;
  urlQuery: string | null;
  urlHash: string | null;
  referrerDomain: string | null;
  referrerPath: string | null;
  pageTitle: string | null;
  eventName: string | null;
  eventData: string | null; // JSON string of custom event data
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: string | null;
  screen: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  language: string | null;
  timezone: string | null;
  engagementTime: number | null; // seconds
  createdAt: Date;
  // Campaign tracking (MVP)
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  campaignBucket: string; // "source|medium|campaign" or referrer domain or "Direct"
}

export interface EventProperty {
  id: number;
  eventId: number;
  siteId: string;
  propKey: string;
  dataType: 1 | 2 | 3 | 4; // 1=string, 2=number, 3=boolean, 4=date
  stringValue: string | null;
  numberValue: number | null;
  booleanValue: boolean | null;
  dateValue: Date | null;
  createdAt: Date;
}

// Legacy AnalyticsEvent type for compatibility
export interface AnalyticsEvent {
  eventType: string;
  url: string;
  referrer?: string;
  userAgent?: string;
  timestamp: string;
  duration?: number;
  host?: string;
  timezone?: string;
  sessionId?: string;
  userId?: string;
  screen?: string;
  language?: string;
  eventName?: string;
  eventData?: string;
}
