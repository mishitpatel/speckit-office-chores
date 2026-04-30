import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { DB } from "./index.js";

const here = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(here, "schema.sql");

export function migrate(db: DB): void {
  const sql = readFileSync(SCHEMA_PATH, "utf8");
  db.exec(sql);
}
