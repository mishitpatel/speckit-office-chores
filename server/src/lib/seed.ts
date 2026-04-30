import { v7 as uuidv7 } from "uuid";
import type { DB } from "../db/index.js";

const SEED_NAMES = ["Alex", "Bea", "Chen", "Dani", "Ezra", "Farah"] as const;

/**
 * Inserts the placeholder roster on first launch. No-op when any person row
 * already exists so the call is idempotent.
 */
export function seedRoster(db: DB): { inserted: number } {
  const count = db.prepare("SELECT COUNT(*) AS n FROM person").get() as { n: number };
  if (count.n > 0) return { inserted: 0 };

  const insert = db.prepare("INSERT INTO person (id, name) VALUES (?, ?)");
  const tx = db.transaction((names: readonly string[]) => {
    for (const name of names) insert.run(uuidv7(), name);
  });
  tx(SEED_NAMES);
  return { inserted: SEED_NAMES.length };
}
