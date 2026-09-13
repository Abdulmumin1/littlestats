import type { Env } from "../../types";
import { DashboardAPI } from "../dashboard-api";
import { R2DashboardAPI } from "./r2-dashboard-api";

export type AnalyticsDashboard = DashboardAPI | R2DashboardAPI;

export function createDashboardAPI(env: Env, siteId: string): AnalyticsDashboard {
  const d1 = new DashboardAPI(env.DB, siteId);
  if (env.ANALYTICS_READ_MODE === "r2") return new R2DashboardAPI(env.DB, env, siteId);
  if (env.ANALYTICS_READ_MODE !== "shadow") return d1;

  const r2 = new R2DashboardAPI(env.DB, env, siteId);
  const controlPlaneMethods = new Set(["saveFunnel", "listFunnels", "deleteFunnel", "rollupHourlyStats"]);

  return new Proxy(d1, {
    get(target, property, receiver) {
      const primary = Reflect.get(target, property, receiver);
      if (typeof property !== "string" || typeof primary !== "function" || controlPlaneMethods.has(property)) {
        return typeof primary === "function" ? primary.bind(target) : primary;
      }

      return async (...args: unknown[]) => {
        const [d1Result, r2Result] = await Promise.allSettled([
          primary.apply(target, args),
          (r2 as unknown as Record<string, (...params: unknown[]) => Promise<unknown>>)[property](...args),
        ]);
        if (r2Result.status === "rejected") {
          console.error("[analytics-shadow] R2 query failed", { method: property, error: String(r2Result.reason) });
        } else if (d1Result.status === "fulfilled") {
          const d1Json = stableJson(d1Result.value);
          const r2Json = stableJson(r2Result.value);
          if (d1Json !== r2Json) {
            console.warn("[analytics-shadow] result mismatch", {
              method: property,
              d1Length: d1Json.length,
              r2Length: r2Json.length,
            });
          }
        }
        if (d1Result.status === "rejected") throw d1Result.reason;
        return d1Result.value;
      };
    },
  }) as AnalyticsDashboard;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
