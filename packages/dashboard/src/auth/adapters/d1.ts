// D1 Adapter for Better-Auth
// Custom adapter for Cloudflare D1 (SQLite)

import type { Adapter } from "better-auth";
import type { D1Database } from "@cloudflare/workers-types";

export function D1Adapter(db: D1Database): Adapter {
  return {
    async create<T extends Record<string, any>>(data: {
      model: string;
      data: T;
    }): Promise<T> {
      const { model, data: recordData } = data;
      const tableName = modelNameToTableName(model);
      const fields = Object.keys(recordData);
      const values = Object.values(recordData);
      const placeholders = fields.map(() => "?").join(", ");
      
      const sql = `INSERT INTO ${tableName} (${fields.join(", ")}) VALUES (${placeholders})`;
      
      try {
        await db.prepare(sql).bind(...values).run();
        return recordData as T;
      } catch (error) {
        console.error(`[D1Adapter] Error creating ${model}:`, error);
        throw error;
      }
    },

    async findOne<T extends Record<string, any>>(data: {
      model: string;
      where: Partial<T>;
    }): Promise<T | null> {
      const { model, where } = data;
      const tableName = modelNameToTableName(model);
      const conditions = Object.entries(where)
        .map(([key]) => `${key} = ?`)
        .join(" AND ");
      const values = Object.values(where);
      
      const sql = `SELECT * FROM ${tableName} WHERE ${conditions} LIMIT 1`;
      
      try {
        const result = await db.prepare(sql).bind(...values).first<T>();
        return result || null;
      } catch (error) {
        console.error(`[D1Adapter] Error finding ${model}:`, error);
        throw error;
      }
    },

    async findMany<T extends Record<string, any>>(data: {
      model: string;
      where?: Partial<T>;
      limit?: number;
      offset?: number;
      sortBy?: { field: string; direction: "asc" | "desc" };
    }): Promise<T[]> {
      const { model, where, limit, offset, sortBy } = data;
      const tableName = modelNameToTableName(model);
      
      let sql = `SELECT * FROM ${tableName}`;
      const values: any[] = [];
      
      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where)
          .map(([key]) => `${key} = ?`)
          .join(" AND ");
        sql += ` WHERE ${conditions}`;
        values.push(...Object.values(where));
      }
      
      if (sortBy) {
        sql += ` ORDER BY ${sortBy.field} ${sortBy.direction.toUpperCase()}`;
      }
      
      if (limit) {
        sql += ` LIMIT ${limit}`;
      }
      
      if (offset) {
        sql += ` OFFSET ${offset}`;
      }
      
      try {
        const { results } = await db.prepare(sql).bind(...values).all<T>();
        return results || [];
      } catch (error) {
        console.error(`[D1Adapter] Error finding many ${model}:`, error);
        throw error;
      }
    },

    async update<T extends Record<string, any>>(data: {
      model: string;
      where: Partial<T>;
      data: Partial<T>;
    }): Promise<T | null> {
      const { model, where, data: updateData } = data;
      const tableName = modelNameToTableName(model);
      
      const setClause = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(", ");
      const whereClause = Object.entries(where)
        .map(([key]) => `${key} = ?`)
        .join(" AND ");
      
      const values = [...Object.values(updateData), ...Object.values(where)];
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
      
      try {
        await db.prepare(sql).bind(...values).run();
        // Return updated record
        return this.findOne({ model, where }) as Promise<T | null>;
      } catch (error) {
        console.error(`[D1Adapter] Error updating ${model}:`, error);
        throw error;
      }
    },

    async delete<T extends Record<string, any>>(data: {
      model: string;
      where: Partial<T>;
    }): Promise<void> {
      const { model, where } = data;
      const tableName = modelNameToTableName(model);
      
      const whereClause = Object.entries(where)
        .map(([key]) => `${key} = ?`)
        .join(" AND ");
      const values = Object.values(where);
      
      const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;
      
      try {
        await db.prepare(sql).bind(...values).run();
      } catch (error) {
        console.error(`[D1Adapter] Error deleting ${model}:`, error);
        throw error;
      }
    },

    async count(data: {
      model: string;
      where?: Record<string, any>;
    }): Promise<number> {
      const { model, where } = data;
      const tableName = modelNameToTableName(model);
      
      let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
      const values: any[] = [];
      
      if (where && Object.keys(where).length > 0) {
        const conditions = Object.entries(where)
          .map(([key]) => `${key} = ?`)
          .join(" AND ");
        sql += ` WHERE ${conditions}`;
        values.push(...Object.values(where));
      }
      
      try {
        const result = await db.prepare(sql).bind(...values).first<{ count: number }>();
        return result?.count || 0;
      } catch (error) {
        console.error(`[D1Adapter] Error counting ${model}:`, error);
        throw error;
      }
    },
  };
}

// Map better-auth model names to our table names
function modelNameToTableName(model: string): string {
  const mapping: Record<string, string> = {
    user: "users",
    session: "sessions_auth",
    account: "accounts",
    verification: "verifications",
  };
  
  return mapping[model] || model;
}
