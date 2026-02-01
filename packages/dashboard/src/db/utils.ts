import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { eq, and } from "drizzle-orm";

export function createDashboardDB(d1: any) {
  return drizzle(d1, { schema });
}

// Export raw schema for direct use to avoid type mismatches
export const dashboardSchema = schema;
export { eq, and };
