// Funnels stats - Funnel analysis and persistence
import type { D1Database } from "@cloudflare/workers-types";
import type { StatsFilter } from "../../types";
import { getDefaultDateRange } from "./filter-utils";

export class FunnelsStats {
  constructor(private db: D1Database, private siteId: string) {}

  async analyzeFunnel(
    filter: StatsFilter,
    steps: Array<{ type: 'url' | 'event'; value: string; name?: string }>,
    funnelType: 'session' | 'user' = 'session'
  ): Promise<{
    steps: Array<{
      step: number;
      name: string;
      type: 'url' | 'event';
      value: string;
      count: number;
      conversionRate: number;
      dropOffRate: number;
    }>;
    totalConversionRate: number;
    totalEntries: number;
  }> {
    if (!steps || steps.length === 0) {
      return { steps: [], totalConversionRate: 0, totalEntries: 0 };
    }

    const { startDate: defaultStart, endDate: defaultEnd } = getDefaultDateRange();
    const startDate = filter.startDate || defaultStart;
    const endDate = filter.endDate || defaultEnd;

    const groupByColumn = funnelType === 'user' ? 'session_id' : 'visit_id';

    const results: Array<{
      step: number;
      name: string;
      type: 'url' | 'event';
      value: string;
      count: number;
      conversionRate: number;
      dropOffRate: number;
    }> = [];

    let previousCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      const stepCondition = step.type === 'url'
        ? `url_path = '${step.value.replace(/'/g, "''")}'`
        : `event_type = 2 AND event_name = '${step.value.replace(/'/g, "''")}'`;

      let sql: string;
      
      if (i === 0) {
        sql = `
          SELECT COUNT(DISTINCT ${groupByColumn}) as count
          FROM events
          WHERE site_id = ?
            AND created_at >= ?
            AND created_at <= ?
            AND ${stepCondition}
        `;
      } else {
        const cteSteps: string[] = [];
        
        for (let j = 0; j <= i; j++) {
          const s = steps[j];
          const cond = s.type === 'url'
            ? `url_path = '${s.value.replace(/'/g, "''")}'`
            : `event_type = 2 AND event_name = '${s.value.replace(/'/g, "''")}'`;
          
          if (j === 0) {
            cteSteps.push(`
              step${j} AS (
                SELECT ${groupByColumn}, MIN(created_at) as step_time
                FROM events
                WHERE site_id = '${this.siteId}'
                  AND created_at >= '${startDate}T00:00:00'
                  AND created_at <= '${endDate}T23:59:59'
                  AND ${cond}
                GROUP BY ${groupByColumn}
              )
            `);
          } else {
            cteSteps.push(`
              step${j} AS (
                SELECT e.${groupByColumn}, MIN(e.created_at) as step_time
                FROM events e
                INNER JOIN step${j - 1} prev ON e.${groupByColumn} = prev.${groupByColumn}
                WHERE e.site_id = '${this.siteId}'
                  AND e.created_at >= '${startDate}T00:00:00'
                  AND e.created_at <= '${endDate}T23:59:59'
                  AND e.created_at > prev.step_time
                  AND ${cond}
                GROUP BY e.${groupByColumn}
              )
            `);
          }
        }

        sql = `
          WITH ${cteSteps.join(', ')}
          SELECT COUNT(DISTINCT ${groupByColumn}) as count FROM step${i}
        `;
      }

      let count = 0;
      try {
        if (i === 0) {
          const result = await this.db.prepare(sql).bind(
            this.siteId,
            `${startDate}T00:00:00`,
            `${endDate}T23:59:59`
          ).first<{ count: number }>();
          count = result?.count || 0;
        } else {
          const result = await this.db.prepare(sql).first<{ count: number }>();
          count = result?.count || 0;
        }
      } catch (err) {
        console.error(`Funnel step ${i} query error:`, err);
        count = 0;
      }

      const conversionRate = previousCount > 0 ? Math.round((count / previousCount) * 10000) / 100 : (i === 0 ? 100 : 0);
      const dropOffRate = previousCount > 0 ? Math.round(((previousCount - count) / previousCount) * 10000) / 100 : 0;

      results.push({
        step: i + 1,
        name: step.name || step.value,
        type: step.type,
        value: step.value,
        count,
        conversionRate: i === 0 ? 100 : conversionRate,
        dropOffRate: i === 0 ? 0 : dropOffRate,
      });

      previousCount = count;
    }

    const totalEntries = results[0]?.count || 0;
    const finalCount = results[results.length - 1]?.count || 0;
    const totalConversionRate = totalEntries > 0 ? Math.round((finalCount / totalEntries) * 10000) / 100 : 0;

    return { steps: results, totalConversionRate, totalEntries };
  }

  async saveFunnel(data: {
    id?: string;
    name: string;
    type: 'session' | 'user';
    steps: any[];
  }) {
    const id = data.id || crypto.randomUUID();
    const stepsJson = JSON.stringify(data.steps);
    const now = Date.now();

    const sql = `
      INSERT INTO funnels (id, site_id, name, type, steps, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        type = excluded.type,
        steps = excluded.steps,
        updated_at = excluded.updated_at
    `;

    await this.db.prepare(sql).bind(
      id,
      this.siteId,
      data.name,
      data.type,
      stepsJson,
      now,
      now
    ).run();

    return { id };
  }

  async listFunnels() {
    const sql = `
      SELECT id, name, type, steps, created_at as createdAt, updated_at as updatedAt
      FROM funnels
      WHERE site_id = ?
      ORDER BY updated_at DESC
    `;

    const { results } = await this.db.prepare(sql).bind(this.siteId).all<any>();
    
    return (results || []).map(f => ({
      ...f,
      steps: JSON.parse(f.steps)
    }));
  }

  async deleteFunnel(id: string) {
    const sql = `
      DELETE FROM funnels
      WHERE id = ? AND site_id = ?
    `;

    await this.db.prepare(sql).bind(id, this.siteId).run();
    return { success: true };
  }
}
