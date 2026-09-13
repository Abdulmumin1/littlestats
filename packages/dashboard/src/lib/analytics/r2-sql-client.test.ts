import { describe, expect, it } from "vitest";
import { assertSqlIdentifier, sqlLike, sqlString } from "./r2-sql-client";

describe("R2 SQL safety helpers", () => {
  it("escapes SQL string literals", () => {
    expect(sqlString("O'Reilly")).toBe("'O''Reilly'");
  });

  it("escapes LIKE wildcards", () => {
    expect(sqlLike("50%_off")).toBe("'%50\\%\\_off%'");
  });

  it("allows only simple configured identifiers", () => {
    expect(assertSqlIdentifier("events_v1", "table")).toBe("events_v1");
    expect(() => assertSqlIdentifier("events_v1; DROP TABLE x", "table")).toThrow("Invalid table");
  });
});
