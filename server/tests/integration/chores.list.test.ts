import { describe, it, expect } from "vitest";
import request from "supertest";
import { v7 as uuidv7 } from "uuid";
import { ChoreSchema } from "@office-chores/shared";
import { makeTestApp } from "../helpers/app.js";

describe("GET /api/chores", () => {
  it("returns chores in the requested range as Chore[]", async () => {
    const { app, db } = makeTestApp({ seed: true });
    const alex = (db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
    db.prepare("INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)").run(
      uuidv7(),
      "Empty dishwasher",
      alex,
      "2026-05-10",
    );

    const res = await request(app).get("/api/chores").query({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    ChoreSchema.parse(res.body[0]);
    expect(res.body[0].title).toBe("Empty dishwasher");
  });

  it("filters by assigneeId when supplied", async () => {
    const { app, db } = makeTestApp({ seed: true });
    const alex = (db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
    const bea = (db.prepare("SELECT id FROM person WHERE name = 'Bea'").get() as { id: string }).id;
    db.prepare("INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)").run(
      uuidv7(),
      "Alex-A",
      alex,
      "2026-05-10",
    );
    db.prepare("INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)").run(
      uuidv7(),
      "Bea-B",
      bea,
      "2026-05-10",
    );

    const res = await request(app).get("/api/chores").query({
      from: "2026-05-01",
      to: "2026-05-31",
      assigneeId: alex,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Alex-A");
  });

  it("returns 400 when from > to", async () => {
    const { app } = makeTestApp({ seed: true });
    const res = await request(app).get("/api/chores").query({
      from: "2026-05-31",
      to: "2026-05-01",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 400 when range exceeds 92 days", async () => {
    const { app } = makeTestApp({ seed: true });
    const res = await request(app).get("/api/chores").query({
      from: "2026-01-01",
      to: "2026-12-31",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 400 when from/to are missing or malformed", async () => {
    const { app } = makeTestApp({ seed: true });
    const res = await request(app).get("/api/chores").query({ from: "not-a-date" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });
});
