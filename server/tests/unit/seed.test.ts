import { describe, it, expect } from "vitest";
import { seedRoster } from "../../src/lib/seed.js";
import { makeTestDb } from "../helpers/db.js";

describe("seedRoster", () => {
  it("inserts six placeholder people on an empty DB", () => {
    const db = makeTestDb();
    const result = seedRoster(db);
    expect(result.inserted).toBe(6);
    const count = db.prepare("SELECT COUNT(*) AS n FROM person").get() as { n: number };
    expect(count.n).toBe(6);
  });

  it("is a no-op when any person already exists", () => {
    const db = makeTestDb();
    seedRoster(db);
    const second = seedRoster(db);
    expect(second.inserted).toBe(0);
    const count = db.prepare("SELECT COUNT(*) AS n FROM person").get() as { n: number };
    expect(count.n).toBe(6);
  });
});
