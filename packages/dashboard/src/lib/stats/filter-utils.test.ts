import { afterEach, describe, expect, it, vi } from "vitest";
import { getDateBounds, getDefaultDateRange } from "./filter-utils";

describe("analytics date ranges", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses exactly 30 inclusive calendar days by default", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00Z"));

    const range = getDefaultDateRange();
    const bounds = getDateBounds(range.startDate, range.endDate);

    expect(range).toEqual({ startDate: "2026-08-15", endDate: "2026-09-13" });
    expect(bounds).toEqual({
      start: "2026-08-15T00:00:00",
      endExclusive: "2026-09-14T00:00:00",
    });
  });
});
