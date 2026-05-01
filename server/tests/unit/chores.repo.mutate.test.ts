import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { v7 as uuidv7 } from "uuid";
import { ChoresRepo } from "../../src/repos/chores.js";
import { bus, type DomainEvent } from "../../src/events/bus.js";
import { ApiHttpError } from "../../src/lib/errors.js";
import { makeTestDb } from "../helpers/db.js";

function seedPerson(db: ReturnType<typeof makeTestDb>, name: string): string {
  const id = uuidv7();
  db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(id, name);
  return id;
}

describe("ChoresRepo.update / delete", () => {
  const captured: DomainEvent[] = [];
  let off: (() => void) | null = null;

  beforeEach(() => {
    captured.length = 0;
    off = bus.onAny((e) => captured.push(e));
  });
  afterEach(() => {
    off?.();
    off = null;
  });

  it("update modifies fields and emits chore.updated", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    const repo = new ChoresRepo(db);
    const created = repo.create({ title: "old", assigneeId: alex, date: "2026-05-10" });
    captured.length = 0;

    const updated = repo.update(created.id, { title: "new", done: true });
    expect(updated.title).toBe("new");
    expect(updated.done).toBe(true);
    expect(updated.assigneeId).toBe(alex);
    expect(updated.date).toBe("2026-05-10");
    expect(captured.filter((e) => e.type === "chore.updated")).toHaveLength(1);
  });

  it("update with empty patch returns the unchanged row", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    const repo = new ChoresRepo(db);
    const created = repo.create({ title: "x", assigneeId: alex, date: "2026-05-10" });
    captured.length = 0;
    const result = repo.update(created.id, {});
    expect(result.id).toBe(created.id);
    expect(captured).toHaveLength(0);
  });

  it("update throws chore_not_found when id is unknown", () => {
    const db = makeTestDb();
    const repo = new ChoresRepo(db);
    expect(() => repo.update(uuidv7(), { title: "x" })).toThrow(ApiHttpError);
  });

  it("update throws assignee_not_found when new assignee FK is missing", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    const repo = new ChoresRepo(db);
    const created = repo.create({ title: "x", assigneeId: alex, date: "2026-05-10" });
    expect(() => repo.update(created.id, { assigneeId: uuidv7() })).toThrow(ApiHttpError);
  });

  it("delete removes the row and emits chore.deleted", () => {
    const db = makeTestDb();
    const alex = seedPerson(db, "Alex");
    const repo = new ChoresRepo(db);
    const created = repo.create({ title: "x", assigneeId: alex, date: "2026-05-10" });
    captured.length = 0;

    repo.delete(created.id);
    expect(repo.getById(created.id)).toBeNull();
    expect(captured.filter((e) => e.type === "chore.deleted")).toHaveLength(1);
  });

  it("delete throws chore_not_found when id is unknown", () => {
    const db = makeTestDb();
    const repo = new ChoresRepo(db);
    expect(() => repo.delete(uuidv7())).toThrow(ApiHttpError);
  });
});
