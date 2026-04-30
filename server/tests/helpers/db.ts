import { openDatabase, type DB } from "../../src/db/index.js";
import { migrate } from "../../src/db/migrate.js";

export function makeTestDb(): DB {
  const db = openDatabase(":memory:");
  migrate(db);
  return db;
}
