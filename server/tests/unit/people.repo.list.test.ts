import { describe, it, expect } from "vitest";
import { v7 as uuidv7 } from "uuid";
import { PeopleRepo } from "../../src/repos/people.js";
import { makeTestDb } from "../helpers/db.js";

describe("PeopleRepo.list", () => {
  it("returns rows ordered case-insensitively by name", () => {
    const db = makeTestDb();
    db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(uuidv7(), "charlie");
    db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(uuidv7(), "Alice");
    db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(uuidv7(), "bob");
    db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(uuidv7(), "Dani");

    const result = new PeopleRepo(db).list().map((p) => p.name);
    expect(result).toEqual(["Alice", "bob", "charlie", "Dani"]);
  });

  it("returns an empty array when the roster is empty", () => {
    const db = makeTestDb();
    expect(new PeopleRepo(db).list()).toEqual([]);
  });
});
