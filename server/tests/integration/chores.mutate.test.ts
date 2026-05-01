import { describe, expect, it } from "vitest";
import request from "supertest";
import { v7 as uuidv7 } from "uuid";
import { ChoreSchema } from "@office-chores/shared";
import { makeTestApp, type TestHarness } from "../helpers/app.js";

function alexId(h: TestHarness): string {
  return (h.db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
}

function seedChore(h: TestHarness, title = "x", date = "2026-05-10"): string {
  const id = uuidv7();
  h.db.prepare("INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)").run(
    id,
    title,
    alexId(h),
    date,
  );
  return id;
}

describe("GET /api/chores/:id", () => {
  it("returns 200 with the chore", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h);
    const res = await request(h.app).get(`/api/chores/${id}`);
    expect(res.status).toBe(200);
    ChoreSchema.parse(res.body);
    expect(res.body.id).toBe(id);
  });

  it("returns 404 when the chore does not exist", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).get(`/api/chores/${uuidv7()}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("chore_not_found");
  });
});

describe("PATCH /api/chores/:id", () => {
  it("returns 200 with the updated chore on a partial patch", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h);
    const res = await request(h.app).patch(`/api/chores/${id}`).send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it("returns 200 when only the date is changed (drag-to-reschedule path)", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h, "x", "2026-05-10");
    const res = await request(h.app)
      .patch(`/api/chores/${id}`)
      .send({ date: "2026-05-11" });
    expect(res.status).toBe(200);
    expect(res.body.date).toBe("2026-05-11");
  });

  it("returns 400 when the body is empty", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h);
    const res = await request(h.app).patch(`/api/chores/${id}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 400 when the title is invalid", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h);
    const res = await request(h.app)
      .patch(`/api/chores/${id}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the chore does not exist", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app)
      .patch(`/api/chores/${uuidv7()}`)
      .send({ done: true });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("chore_not_found");
  });

  it("returns 422 when the new assignee does not exist", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h);
    const res = await request(h.app)
      .patch(`/api/chores/${id}`)
      .send({ assigneeId: uuidv7() });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("assignee_not_found");
  });
});

describe("DELETE /api/chores/:id", () => {
  it("returns 204 and removes the chore", async () => {
    const h = makeTestApp({ seed: true });
    const id = seedChore(h);
    const del = await request(h.app).delete(`/api/chores/${id}`);
    expect(del.status).toBe(204);
    const getRes = await request(h.app).get(`/api/chores/${id}`);
    expect(getRes.status).toBe(404);
  });

  it("returns 404 when the chore does not exist", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).delete(`/api/chores/${uuidv7()}`);
    expect(res.status).toBe(404);
  });
});
