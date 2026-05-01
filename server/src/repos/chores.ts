import { v7 as uuidv7 } from "uuid";
import type { DB } from "../db/index.js";
import type { Chore, ChoreCreate } from "@office-chores/shared";
import { bus } from "../events/bus.js";
import { errors } from "../lib/errors.js";

interface ChoreRow {
  id: string;
  title: string;
  assignee_id: string;
  date: string;
  done: number;
  created_at: string;
  updated_at: string;
}

function rowToChore(r: ChoreRow): Chore {
  return {
    id: r.id,
    title: r.title,
    assigneeId: r.assignee_id,
    date: r.date,
    done: r.done === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export interface ChoreListArgs {
  from: string;
  to: string;
  assigneeId?: string;
}

const SELECT_COLUMNS = "id, title, assignee_id, date, done, created_at, updated_at";

export class ChoresRepo {
  constructor(private readonly db: DB) {}

  listByDateRange({ from, to, assigneeId }: ChoreListArgs): Chore[] {
    if (assigneeId) {
      const rows = this.db
        .prepare(
          `SELECT ${SELECT_COLUMNS} FROM chore
           WHERE date BETWEEN ? AND ? AND assignee_id = ?
           ORDER BY date ASC, created_at ASC`,
        )
        .all(from, to, assigneeId) as ChoreRow[];
      return rows.map(rowToChore);
    }
    const rows = this.db
      .prepare(
        `SELECT ${SELECT_COLUMNS} FROM chore
         WHERE date BETWEEN ? AND ?
         ORDER BY date ASC, created_at ASC`,
      )
      .all(from, to) as ChoreRow[];
    return rows.map(rowToChore);
  }

  getById(id: string): Chore | null {
    const row = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM chore WHERE id = ?`)
      .get(id) as ChoreRow | undefined;
    return row ? rowToChore(row) : null;
  }

  create(input: ChoreCreate): Chore {
    const id = uuidv7();
    try {
      this.db
        .prepare(
          "INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)",
        )
        .run(id, input.title, input.assigneeId, input.date);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
        throw errors.assigneeNotFound();
      }
      throw e;
    }
    const created = this.getById(id);
    if (!created) throw new Error("invariant: just-created chore is missing");
    bus.emit({ type: "chore.created", chore: created });
    return created;
  }
}
