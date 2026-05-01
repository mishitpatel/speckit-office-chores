import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { v7 as uuidv7 } from "uuid";
import { ChoresRepo } from "../../src/repos/chores.js";
import { bus, type DomainEvent } from "../../src/events/bus.js";
import { ApiHttpError } from "../../src/lib/errors.js";
import { makeTestDb } from "../helpers/db.js";

describe("ChoresRepo.create", () => {
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

  it("inserts a chore and emits chore.created", () => {
    const db = makeTestDb();
    const alex = uuidv7();
    db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(alex, "Alex");

    const repo = new ChoresRepo(db);
    const chore = repo.create({
      title: "Empty the dishwasher",
      assigneeId: alex,
      date: "2026-05-10",
    });

    expect(chore.title).toBe("Empty the dishwasher");
    expect(chore.assigneeId).toBe(alex);
    expect(chore.date).toBe("2026-05-10");
    expect(chore.done).toBe(false);

    const created = captured.filter((e) => e.type === "chore.created");
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ type: "chore.created", chore: { id: chore.id } });
  });

  it("throws assignee_not_found when the FK does not match", () => {
    const db = makeTestDb();
    const repo = new ChoresRepo(db);
    expect(() =>
      repo.create({
        title: "Orphan chore",
        assigneeId: uuidv7(),
        date: "2026-05-10",
      }),
    ).toThrow(ApiHttpError);
  });
});
