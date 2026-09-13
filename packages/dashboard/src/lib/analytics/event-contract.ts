import type { AnalyticsEventRecord, Event, SessionState } from "../../types";

export const ANALYTICS_SCHEMA_VERSION = 1;

const EVENT_TYPE_NAMES = {
  1: "pageview",
  2: "custom",
  3: "page_exit",
  4: "identify",
} as const;

function optional<T>(value: T | null | undefined): T | undefined {
  return value == null || value === "" ? undefined : value;
}

function parseProperties(value: string | null): Record<string, unknown> | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : undefined;
  } catch {
    return undefined;
  }
}

export function toAnalyticsEventRecord(event: Event, session: SessionState): AnalyticsEventRecord {
  return {
    schema_version: ANALYTICS_SCHEMA_VERSION,
    event_id: event.eventUid,
    site_id: event.siteId,
    event_time: event.createdAt instanceof Date ? event.createdAt.toISOString() : new Date(event.createdAt).toISOString(),
    event_type: EVENT_TYPE_NAMES[event.eventType],
    visitor_id: session.visitorId,
    visit_id: event.visitId,
    is_billable: event.eventType === 1 || event.eventType === 2,
    identified_user_id: optional(session.identifiedUserId),
    url_path: optional(event.urlPath),
    url_query: optional(event.urlQuery),
    url_hash: optional(event.urlHash),
    page_title: optional(event.pageTitle),
    referrer_domain: optional(event.referrerDomain),
    referrer_path: optional(event.referrerPath),
    event_name: optional(event.eventName),
    event_properties: parseProperties(event.eventData),
    browser: optional(event.browser),
    browser_version: optional(event.browserVersion),
    os: optional(event.os),
    os_version: optional(event.osVersion),
    device: optional(event.device),
    screen: optional(event.screen),
    country: optional(event.country),
    region: optional(event.region),
    city: optional(event.city),
    language: optional(event.language),
    timezone: optional(event.timezone),
    engagement_seconds: optional(event.engagementTime),
    utm_source: optional(event.utmSource),
    utm_medium: optional(event.utmMedium),
    utm_campaign: optional(event.utmCampaign),
    utm_content: optional(event.utmContent),
    utm_term: optional(event.utmTerm),
    campaign_bucket: optional(event.campaignBucket),
  };
}

export function validateAnalyticsEventRecord(record: AnalyticsEventRecord): void {
  if (record.schema_version !== ANALYTICS_SCHEMA_VERSION) throw new Error("Unsupported analytics schema version");
  if (!record.event_id || !record.site_id || !record.event_time || !record.visitor_id || !record.visit_id) {
    throw new Error("Analytics event is missing a required identifier");
  }
  if (!Number.isFinite(Date.parse(record.event_time))) throw new Error("Analytics event_time is invalid");
}
