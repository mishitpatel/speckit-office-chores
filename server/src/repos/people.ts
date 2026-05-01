import type { DB } from "../db/index.js";
import type { Person } from "@office-chores/shared";

interface PersonRow {
  id: string;
  name: string;
  created_at: string;
}

function rowToPerson(r: PersonRow): Person {
  return { id: r.id, name: r.name, createdAt: r.created_at };
}

export class PeopleRepo {
  constructor(private readonly db: DB) {}

  list(): Person[] {
    const rows = this.db
      .prepare("SELECT id, name, created_at FROM person ORDER BY LOWER(name) ASC")
      .all() as PersonRow[];
    return rows.map(rowToPerson);
  }
}
