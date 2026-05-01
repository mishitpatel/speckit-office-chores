import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { v7 as uuidv7 } from "uuid";
import { PeopleRepo } from "../../src/repos/people.js";
import { ChoresRepo } from "../../src/repos/chores.js";
import { bus, type DomainEvent } from "../../src/events/bus.js";
import { ApiHttpError } from "../../src/lib/errors.js";
import { makeTestDb } from "../helpers/db.js";

describe("PeopleRepo.create", () => {
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

  it("inserts a person and emits person.created", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    const p = repo.create({ name: "Greta" });
    expect(p.name).toBe("Greta");
    expect(captured.filter((e) => e.type === "person.created")).toHaveLength(1);
  });

  it("rejects a duplicate name (case-insensitive) with name_taken", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    repo.create({ name: "Alex" });
    expect(() => repo.create({ name: "alex" })).toThrow(ApiHttpError);
  });
});

describe("PeopleRepo.rename", () => {
  it("renames the person and emits person.updated", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    const p = repo.create({ name: "Alex" });
    const updated = repo.rename(p.id, "Alexandra");
    expect(updated.name).toBe("Alexandra");
  });

  it("throws person_not_found when the id is unknown", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    expect(() => repo.rename(uuidv7(), "X")).toThrow(ApiHttpError);
  });

  it("throws name_taken when the new name collides", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    repo.create({ name: "Alex" });
    const bea = repo.create({ name: "Bea" });
    expect(() => repo.rename(bea.id, "alex")).toThrow(ApiHttpError);
  });
});

describe("PeopleRepo.delete", () => {
  it("deletes when the person has no chores and emits person.deleted", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    const p = repo.create({ name: "Alex" });
    repo.delete(p.id);
    expect(repo.getById(p.id)).toBeNull();
  });

  it("throws person_has_chores when chores reference this person", () => {
    const db = makeTestDb();
    const peopleRepo = new PeopleRepo(db);
    const choresRepo = new ChoresRepo(db);
    const p = peopleRepo.create({ name: "Alex" });
    choresRepo.create({ title: "x", assigneeId: p.id, date: "2026-05-10" });
    let thrown: unknown;
    try {
      peopleRepo.delete(p.id);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(ApiHttpError);
    expect((thrown as ApiHttpError).code).toBe("person_has_chores");
    expect((thrown as ApiHttpError).details).toEqual({ choreCount: 1 });
  });

  it("throws person_not_found when the id is unknown", () => {
    const db = makeTestDb();
    const repo = new PeopleRepo(db);
    expect(() => repo.delete(uuidv7())).toThrow(ApiHttpError);
  });
});
