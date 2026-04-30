import { describe, it, expect } from "vitest";
import { openDatabase } from "../../src/db/index.js";
import { migrate } from "../../src/db/migrate.js";

describe("migrate", () => {
  it("creates the expected tables and indexes", () => {
    const db = openDatabase(":memory:");
    migrate(db);
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    expect(tables.map((t) => t.name)).toEqual(expect.arrayContaining(["chore", "person"]));

    const indexes = db
      .prepare("SELECT name FROM sqlite_master WHERE type='index' ORDER BY name")
      .all() as { name: string }[];
    expect(indexes.map((i) => i.name)).toEqual(
      expect.arrayContaining(["chore_assignee", "chore_date_assignee", "person_name_ci"]),
    );
  });

  it("is idempotent (running twice does not throw)", () => {
    const db = openDatabase(":memory:");
    migrate(db);
    expect(() => migrate(db)).not.toThrow();
  });
});
