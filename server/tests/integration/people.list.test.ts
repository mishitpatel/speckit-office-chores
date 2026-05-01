import { describe, it, expect } from "vitest";
import request from "supertest";
import { PersonSchema } from "@office-chores/shared";
import { makeTestApp } from "../helpers/app.js";

describe("GET /api/people", () => {
  it("returns the seeded roster as Person[]", async () => {
    const { app } = makeTestApp({ seed: true });
    const res = await request(app).get("/api/people");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(6);
    for (const p of res.body) PersonSchema.parse(p);
    const names = (res.body as { name: string }[]).map((p) => p.name);
    expect(names).toEqual(["Alex", "Bea", "Chen", "Dani", "Ezra", "Farah"]);
  });

  it("returns [] when the roster is empty", async () => {
    const { app } = makeTestApp();
    const res = await request(app).get("/api/people");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
