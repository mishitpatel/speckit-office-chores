import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";

describe("GET /api/health", () => {
  it("returns 200 and { status: 'ok' }", async () => {
    const app = createApp({ silent: true });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns 404 for unknown routes", async () => {
    const app = createApp({ silent: true });
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("not_found");
  });
});
