import { afterEach, describe, expect, it, vi } from "vitest";
import { dateKeyInTimezone, getAnalyticsBuckets, getDateBounds, getDefaultDateRange, normalizeTimezone } from "./filter-utils";

describe("analytics date ranges", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses exactly 30 inclusive calendar days by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00Z"));

    const range = getDefaultDateRange("UTC");
    const bounds = getDateBounds(range.startDate, range.endDate, "UTC");

    expect(range).toEqual({ startDate: "2026-08-15", endDate: "2026-09-13" });
    expect(bounds).toEqual({
      start: "2026-08-15T00:00:00.000Z",
      endExclusive: "2026-09-14T00:00:00.000Z",
    });
  });

  it("uses the viewer's calendar day across timezones", () => {
    const now = new Date("2026-09-13T01:00:00.000Z");
    expect(dateKeyInTimezone(now, "America/Los_Angeles")).toBe("2026-09-12");
    expect(getDefaultDateRange("America/Los_Angeles", now).endDate).toBe("2026-09-12");
    expect(getDateBounds("2026-09-13", "2026-09-13", "America/Los_Angeles")).toEqual({
      start: "2026-09-13T07:00:00.000Z",
      endExclusive: "2026-09-14T07:00:00.000Z",
    });
  });

  it("keeps DST days exact", () => {
    const spring = getDateBounds("2026-03-08", "2026-03-08", "America/New_York");
    const autumn = getDateBounds("2026-11-01", "2026-11-01", "America/New_York");
    expect(Date.parse(spring.endExclusive) - Date.parse(spring.start)).toBe(23 * 3_600_000);
    expect(Date.parse(autumn.endExclusive) - Date.parse(autumn.start)).toBe(25 * 3_600_000);
    expect(getAnalyticsBuckets("2026-11-01", "2026-11-01", "America/New_York", "hour")).toHaveLength(25);
  });

  it("falls back safely for invalid timezone input", () => {
    expect(normalizeTimezone("Not/A_Timezone")).toBe("UTC");
  });
});
