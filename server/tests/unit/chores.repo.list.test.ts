import { describe, it, expect } from "vitest";
import { v7 as uuidv7 } from "uuid";
import { ChoresRepo } from "../../src/repos/chores.js";
import { makeTestDb } from "../helpers/db.js";

function seedPerson(db: ReturnType<typeof makeTestDb>, name: string): string {
  const id = uuidv7();
  db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(id, name);
  return id;
}

function seedChore(
  db: ReturnType<typeof makeTestDb>,
  title: string,
  assigneeId: string,
  date: string,
): string {
  const id = uuidv7();
  db.prepare(
    "INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)",
  ).run(id, title, assigneeId, date);
  return id;
}

describe("ChoresRepo.listByDateRange", () => {
  it("returns chores within an inclusive date range, ordered by date asc", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    seedChore(db, "before", alex, "2026-04-30");
    seedChore(db, "first", alex, "2026-05-01");
    seedChore(db, "middle", alex, "2026-05-15");
    seedChore(db, "last", alex, "2026-05-31");
    seedChore(db, "after", alex, "2026-06-01");

    const result = new ChoresRepo(db).listByDateRange({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(result.map((c) => c.title)).toEqual(["first", "middle", "last"]);
  });

  it("filters to a single assignee when assigneeId is provided", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    const bea = seedPerson(db, "Bea");
    seedChore(db, "alex-1", alex, "2026-05-10");
    seedChore(db, "bea-1", bea, "2026-05-10");
    seedChore(db, "alex-2", alex, "2026-05-12");

    const result = new ChoresRepo(db).listByDateRange({
      from: "2026-05-01",
      to: "2026-05-31",
      assigneeId: alex,
    });
    expect(result.map((c) => c.title)).toEqual(["alex-1", "alex-2"]);
  });

  it("returns an empty array when no chores match the range", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    seedChore(db, "x", alex, "2026-05-15");
    const result = new ChoresRepo(db).listByDateRange({
      from: "2026-06-01",
      to: "2026-06-30",
    });
    expect(result).toEqual([]);
  });
});
