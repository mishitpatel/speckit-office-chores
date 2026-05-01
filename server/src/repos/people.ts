import { v7 as uuidv7 } from "uuid";
import type { DB } from "../db/index.js";
import type { Person } from "@office-chores/shared";
import { bus } from "../events/bus.js";
import { errors } from "../lib/errors.js";

interface PersonRow {
  id: string;
  name: string;
  created_at: string;
}

function rowToPerson(r: PersonRow): Person {
  return { id: r.id, name: r.name, createdAt: r.created_at };
}

const SELECT_COLUMNS = "id, name, created_at";

export class PeopleRepo {
  constructor(private readonly db: DB) {}

  list(): Person[] {
    const rows = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM person ORDER BY LOWER(name) ASC`)
      .all() as PersonRow[];
    return rows.map(rowToPerson);
  }

  getById(id: string): Person | null {
    const row = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM person WHERE id = ?`)
      .get(id) as PersonRow | undefined;
    return row ? rowToPerson(row) : null;
  }

  create(input: { name: string }): Person {
    const id = uuidv7();
    try {
      this.db.prepare("INSERT INTO person (id, name) VALUES (?, ?)").run(id, input.name);
    } catch (e) {
      if (isUniqueNameError(e)) throw errors.nameTaken();
      throw e;
    }
    const created = this.getById(id);
    if (!created) throw new Error("invariant: just-created person is missing");
    bus.emit({ type: "person.created", person: created });
    return created;
  }

  rename(id: string, name: string): Person {
    const existing = this.getById(id);
    if (!existing) throw errors.personNotFound();
    try {
      this.db.prepare("UPDATE person SET name = ? WHERE id = ?").run(name, id);
    } catch (e) {
      if (isUniqueNameError(e)) throw errors.nameTaken();
      throw e;
    }
    const updated = this.getById(id);
    if (!updated) throw new Error("invariant: just-renamed person is missing");
    bus.emit({ type: "person.updated", person: updated });
    return updated;
  }

  delete(id: string): void {
    const existing = this.getById(id);
    if (!existing) throw errors.personNotFound();
    const choreCount = (
      this.db.prepare("SELECT COUNT(*) AS n FROM chore WHERE assignee_id = ?").get(id) as { n: number }
    ).n;
    if (choreCount > 0) throw errors.personHasChores(choreCount);
    this.db.prepare("DELETE FROM person WHERE id = ?").run(id);
    bus.emit({ type: "person.deleted", id });
  }
}

function isUniqueNameError(e: unknown): boolean {
  const err = e as Error & { code?: string; message?: string };
  return (
    err.code === "SQLITE_CONSTRAINT_UNIQUE" &&
    typeof err.message === "string" &&
    err.message.toLowerCase().includes("person_name_ci")
  );
}
