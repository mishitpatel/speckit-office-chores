import { createApp } from "./app.js";
import { openDatabase } from "./db/index.js";
import { migrate } from "./db/migrate.js";
import { seedRoster } from "./lib/seed.js";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = "127.0.0.1";
const DB_PATH = process.env.DB_PATH ?? "data/data.sqlite";

const db = openDatabase(DB_PATH);
migrate(db);
const seeded = seedRoster(db);

const app = createApp();

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`[office-chores] listening on http://${HOST}:${PORT} (seeded ${seeded.inserted})`);
});
