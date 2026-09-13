import { describe, expect, it } from "vitest";
import type { Event, SessionState } from "../../types";
import { toAnalyticsEventRecord, validateAnalyticsEventRecord } from "./event-contract";

const event: Event = {
  id: 0,
  eventUid: "evt-1",
  siteId: "site-1",
  sessionId: "session-1",
  visitId: "visit-1",
  eventType: 2,
  urlPath: "/signup",
  urlQuery: null,
  urlHash: null,
  referrerDomain: "example.com",
  referrerPath: "/",
  pageTitle: "Signup",
  eventName: "registered",
  eventData: '{"plan":"pro"}',
  browser: "Firefox",
  browserVersion: "130",
  os: "Linux",
  osVersion: null,
  device: "desktop",
  screen: "1440x900",
  country: "GB",
  region: null,
  city: null,
  language: "en-GB",
  timezone: "Europe/London",
  engagementTime: null,
  createdAt: new Date("2026-09-13T08:00:00.000Z"),
  utmSource: "newsletter",
  utmMedium: "email",
  utmCampaign: "launch",
  utmContent: null,
  utmTerm: null,
  campaignBucket: "newsletter|email|launch",
};

const session = {
  visitorId: "visitor-1",
  identifiedUserId: "user-1",
} as SessionState;

describe("analytics event contract", () => {
  it("maps the hot-path event to the immutable stream schema", () => {
    const record = toAnalyticsEventRecord(event, session);
    expect(record).toMatchObject({
      schema_version: 1,
      event_id: "evt-1",
      event_type: "custom",
      visitor_id: "visitor-1",
      is_billable: true,
      event_properties: { plan: "pro" },
    });
    expect(() => validateAnalyticsEventRecord(record)).not.toThrow();
  });

  it("rejects an invalid event timestamp before Pipelines can silently drop it", () => {
    const record = { ...toAnalyticsEventRecord(event, session), event_time: "not-a-date" };
    expect(() => validateAnalyticsEventRecord(record)).toThrow("event_time");
  });
});
