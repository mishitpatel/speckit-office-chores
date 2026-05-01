import { describe, expect, it } from "vitest";
import request from "supertest";
import { v7 as uuidv7 } from "uuid";
import { PersonSchema } from "@office-chores/shared";
import { makeTestApp, type TestHarness } from "../helpers/app.js";

function alexId(h: TestHarness): string {
  return (h.db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
}

describe("POST /api/people", () => {
  it("returns 201 with the new person", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).post("/api/people").send({ name: "Greta" });
    expect(res.status).toBe(201);
    PersonSchema.parse(res.body);
    expect(res.body.name).toBe("Greta");
  });

  it("returns 400 when the name is empty", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).post("/api/people").send({ name: " " });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 409 with name_taken on a case-insensitive duplicate", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).post("/api/people").send({ name: "alex" });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("name_taken");
  });
});

describe("PATCH /api/people/:id", () => {
  it("returns 200 with the renamed person", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app)
      .patch(`/api/people/${alexId(h)}`)
      .send({ name: "Alexandra" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alexandra");
  });

  it("returns 404 when the id is unknown", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).patch(`/api/people/${uuidv7()}`).send({ name: "X" });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("person_not_found");
  });

  it("returns 409 when the new name collides (case-insensitive)", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app)
      .patch(`/api/people/${alexId(h)}`)
      .send({ name: "bea" });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("name_taken");
  });
});

describe("DELETE /api/people/:id", () => {
  it("returns 204 when the person has no chores", async () => {
    const h = makeTestApp({ seed: true });
    const greta = (
      await request(h.app).post("/api/people").send({ name: "Greta" })
    ).body;
    const res = await request(h.app).delete(`/api/people/${greta.id}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 when the id is unknown", async () => {
    const h = makeTestApp({ seed: true });
    const res = await request(h.app).delete(`/api/people/${uuidv7()}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("person_not_found");
  });

  it("returns 409 with person_has_chores and details.choreCount when chores exist", async () => {
    const h = makeTestApp({ seed: true });
    const id = alexId(h);
    h.db
      .prepare("INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)")
      .run(uuidv7(), "x", id, "2026-05-10");
    h.db
      .prepare("INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)")
      .run(uuidv7(), "y", id, "2026-05-11");
    const res = await request(h.app).delete(`/api/people/${id}`);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("person_has_chores");
    expect(res.body.details).toEqual({ choreCount: 2 });
  });
});
