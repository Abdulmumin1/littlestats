import { afterEach, describe, expect, it, vi } from "vitest";
import type { Env } from "../../types";
import { R2Usage } from "./r2-usage";

const env = {
  CLOUDFLARE_ACCOUNT_ID: "account",
  R2_ANALYTICS_BUCKET: "bucket",
  R2_ANALYTICS_NAMESPACE: "analytics",
  R2_ANALYTICS_TABLE: "events_v1",
  R2_SQL_API_TOKEN: "token",
} as Env;

describe("R2 site-card metrics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("uses the same pageview-only UTC day as the overview Today range", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-13T12:00:00Z"));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      success: true,
      result: { rows: [{ site_id: "site-1", views_today: 42 }] },
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const metrics = await new R2Usage(env).getSiteMetrics(["site-1"]);
    const request = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));

    expect(request.query).toContain("event_type = 'pageview'");
    expect(request.query).toContain("event_time >= '2026-09-13T00:00:00Z'");
    expect(request.query).toContain("event_time < '2026-09-14T00:00:00Z'");
    expect(metrics.get("site-1")).toEqual({ viewsToday: 42 });
  });
});
