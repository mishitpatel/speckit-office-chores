import { describe, expect, it } from "vitest";
import request from "supertest";
import { v7 as uuidv7 } from "uuid";
import { ChoreSchema } from "@office-chores/shared";
import { makeTestApp } from "../helpers/app.js";

function alexId(harness: ReturnType<typeof makeTestApp>): string {
  return (harness.db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
}

describe("POST /api/chores", () => {
  it("creates a chore (201) and returns the inserted row", async () => {
    const harness = makeTestApp({ seed: true });
    const res = await request(harness.app).post("/api/chores").send({
      title: "Empty dishwasher",
      assigneeId: alexId(harness),
      date: "2026-05-10",
    });
    expect(res.status).toBe(201);
    ChoreSchema.parse(res.body);
    expect(res.body.title).toBe("Empty dishwasher");
    expect(res.body.done).toBe(false);
  });

  it("returns 400 when the title is empty", async () => {
    const harness = makeTestApp({ seed: true });
    const res = await request(harness.app).post("/api/chores").send({
      title: "",
      assigneeId: alexId(harness),
      date: "2026-05-10",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 400 when the title contains a newline", async () => {
    const harness = makeTestApp({ seed: true });
    const res = await request(harness.app).post("/api/chores").send({
      title: "two\nlines",
      assigneeId: alexId(harness),
      date: "2026-05-10",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 400 when the title exceeds 120 characters", async () => {
    const harness = makeTestApp({ seed: true });
    const res = await request(harness.app).post("/api/chores").send({
      title: "x".repeat(121),
      assigneeId: alexId(harness),
      date: "2026-05-10",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 400 when the date is malformed", async () => {
    const harness = makeTestApp({ seed: true });
    const res = await request(harness.app).post("/api/chores").send({
      title: "ok",
      assigneeId: alexId(harness),
      date: "2026/05/10",
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("validation_error");
  });

  it("returns 422 when the assignee does not exist", async () => {
    const harness = makeTestApp({ seed: true });
    const res = await request(harness.app).post("/api/chores").send({
      title: "Orphan",
      assigneeId: uuidv7(),
      date: "2026-05-10",
    });
    expect(res.status).toBe(422);
    expect(res.body.code).toBe("assignee_not_found");
  });
});
