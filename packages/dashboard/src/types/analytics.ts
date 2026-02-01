// Analytics payload and event types

export interface TrackPayload {
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
  id?: string; // for identify
  cache?: {
    visitId: string;
    iat: number;
  };
  visitorId?: string;
  userAgent?: string;
}

export interface Event {
  id: number;
  siteId: string;
  sessionId: string;
  visitId: string;
  eventType: 1 | 2 | 3 | 4; // 1=pageview, 2=custom, 3=exit, 4=heartbeat
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
