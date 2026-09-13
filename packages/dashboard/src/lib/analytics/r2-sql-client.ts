import type { Env } from "../../types";

type R2SqlResponse<T> = {
  success?: boolean;
  result?: { rows?: T[] };
  errors?: Array<{ code?: number; message?: string }>;
};

export function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

export function sqlLike(value: string): string {
  return sqlString(`%${value.toLowerCase().replace(/[\\%_]/g, "\\$&")}%`);
}

export function assertSqlIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`Invalid ${label}`);
  }
  return value;
}

export class R2SqlClient {
  readonly table: string;
  private readonly endpoint: string;
  private readonly token: string;
  private readonly warehouse: string;

  constructor(env: Env) {
    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const bucket = env.R2_ANALYTICS_BUCKET;
    const token = env.R2_SQL_API_TOKEN;
    if (!accountId || !bucket || !token) {
      throw new Error("R2 SQL requires CLOUDFLARE_ACCOUNT_ID, R2_ANALYTICS_BUCKET, and R2_SQL_API_TOKEN");
    }

    const namespace = assertSqlIdentifier(env.R2_ANALYTICS_NAMESPACE || "analytics", "R2 namespace");
    const table = assertSqlIdentifier(env.R2_ANALYTICS_TABLE || "events_v1", "R2 table");
    this.table = `${namespace}.${table}`;
    this.endpoint = `https://api.sql.cloudflarestorage.com/api/v1/accounts/${accountId}/r2-sql/query/${encodeURIComponent(bucket)}`;
    this.token = token;
    this.warehouse = `${accountId}_${bucket}`;
  }

  async query<T extends Record<string, unknown>>(query: string): Promise<T[]> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort("R2 SQL query timed out"), 10_000);
      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ warehouse: this.warehouse, query }),
          signal: controller.signal,
        });
        const payload = await response.json<R2SqlResponse<T>>().catch(
          (): R2SqlResponse<T> => ({}),
        );
        if (response.ok && payload.success !== false) return payload.result?.rows || [];

        const detail = payload.errors?.map((error) => error.message || error.code).join("; ") || response.statusText;
        const error = new Error(`R2 SQL query failed (${response.status}): ${detail}`);
        if (attempt === 0 && (response.status === 408 || response.status === 429 || response.status >= 500)) {
          lastError = error;
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
        throw error;
      } catch (error) {
        lastError = error;
        if (attempt === 0 && (controller.signal.aborted || error instanceof TypeError)) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          continue;
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
    throw lastError instanceof Error ? lastError : new Error("R2 SQL query failed");
  }
}
