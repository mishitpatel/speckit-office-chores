import { createApp } from "../../src/app.js";
import type { Application } from "express";
import { PeopleRepo } from "../../src/repos/people.js";
import { ChoresRepo } from "../../src/repos/chores.js";
import { seedRoster } from "../../src/lib/seed.js";
import { makeTestDb } from "./db.js";
import type { DB } from "../../src/db/index.js";

export interface TestHarness {
  db: DB;
  app: Application;
  people: PeopleRepo;
  chores: ChoresRepo;
}

export function makeTestApp(opts: { seed?: boolean } = {}): TestHarness {
  const db = makeTestDb();
  if (opts.seed) seedRoster(db);
  const people = new PeopleRepo(db);
  const chores = new ChoresRepo(db);
  const app = createApp({ silent: true, people, chores });
  return { db, app, people, chores };
}
