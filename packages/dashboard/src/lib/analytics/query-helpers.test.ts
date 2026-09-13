import { describe, expect, it } from "vitest";
import { analyticsRange, timeBucketSql } from "./query-helpers";

describe("timezone-aware analytics queries", () => {
  it("turns a viewer-local date into exact UTC storage bounds", () => {
    expect(analyticsRange({
      startDate: "2026-09-13",
      endDate: "2026-09-13",
      timezone: "America/Los_Angeles",
    })).toEqual({
      startDate: "2026-09-13",
      endDate: "2026-09-13",
      timezone: "America/Los_Angeles",
      start: "2026-09-13T07:00:00.000Z",
      endExclusive: "2026-09-14T07:00:00.000Z",
    });
  });

  it("builds local hour buckets through a DST change", () => {
    const bucket = timeBucketSql("event_time", {
      startDate: "2026-11-01",
      endDate: "2026-11-01",
      timezone: "America/New_York",
    }, "hour");

    expect(bucket.expression).toContain("2026-11-01T04:00:00.000Z");
    expect(bucket.expression).toContain("2026-11-02T05:00:00.000Z");
    expect(bucket.labels).toHaveLength(24);
    expect(bucket.labels[0]).toBe("2026-11-01T00:00:00");
    expect(bucket.labels.at(-1)).toBe("2026-11-01T23:00:00");
  });
});
