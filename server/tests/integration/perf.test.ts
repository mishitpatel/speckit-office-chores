import { describe, expect, it } from "vitest";
import request from "supertest";
import { v7 as uuidv7 } from "uuid";
import { performance } from "node:perf_hooks";
import { makeTestApp } from "../helpers/app.js";

function p95(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));
  return sorted[idx]!;
}

async function timed<T>(fn: () => Promise<T>): Promise<number> {
  const t0 = performance.now();
  await fn();
  return performance.now() - t0;
}

describe("perf budgets — read endpoints (constitution: p95 < 300ms)", () => {
  it("GET /api/chores?from&to with 200 chores stays under 300ms p95 over 100 calls", async () => {
    const h = makeTestApp({ seed: true });
    const alex = (h.db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
    const insert = h.db.prepare(
      "INSERT INTO chore (id, title, assignee_id, date) VALUES (?, ?, ?, ?)",
    );
    const tx = h.db.transaction((rows: { id: string; title: string; date: string }[]) => {
      for (const r of rows) insert.run(r.id, r.title, alex, r.date);
    });
    tx(
      Array.from({ length: 200 }, (_, i) => ({
        id: uuidv7(),
        title: `c${i}`,
        date: `2026-05-${String((i % 28) + 1).padStart(2, "0")}`,
      })),
    );

    const samples: number[] = [];
    for (let i = 0; i < 100; i++) {
      samples.push(
        await timed(async () => {
          const res = await request(h.app).get("/api/chores").query({
            from: "2026-05-01",
            to: "2026-05-31",
          });
          expect(res.status).toBe(200);
        }),
      );
    }

    const budget = 300;
    const observed = p95(samples);
    expect(observed, `p95 latency ${observed.toFixed(1)}ms exceeds ${budget}ms budget`).toBeLessThan(budget);
  });

  it("GET /api/people stays well under budget", async () => {
    const h = makeTestApp({ seed: true });
    const samples: number[] = [];
    for (let i = 0; i < 100; i++) {
      samples.push(
        await timed(async () => {
          const res = await request(h.app).get("/api/people");
          expect(res.status).toBe(200);
        }),
      );
    }
    expect(p95(samples)).toBeLessThan(100);
  });
});

describe("perf budgets — write endpoints (constitution: p95 < 500ms)", () => {
  it("POST /api/chores stays under 500ms p95 over 50 calls", async () => {
    const h = makeTestApp({ seed: true });
    const alex = (h.db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;

    const samples: number[] = [];
    for (let i = 0; i < 50; i++) {
      samples.push(
        await timed(async () => {
          const res = await request(h.app).post("/api/chores").send({
            title: `t${i}`,
            assigneeId: alex,
            date: "2026-05-10",
          });
          expect(res.status).toBe(201);
        }),
      );
    }
    const observed = p95(samples);
    expect(observed, `POST p95 ${observed.toFixed(1)}ms`).toBeLessThan(500);
  });

  it("PATCH /api/chores/:id stays under 500ms p95 over 50 calls", async () => {
    const h = makeTestApp({ seed: true });
    const alex = (h.db.prepare("SELECT id FROM person WHERE name = 'Alex'").get() as { id: string }).id;
    const create = await request(h.app).post("/api/chores").send({
      title: "x",
      assigneeId: alex,
      date: "2026-05-10",
    });
    const id = (create.body as { id: string }).id;

    const samples: number[] = [];
    for (let i = 0; i < 50; i++) {
      samples.push(
        await timed(async () => {
          const res = await request(h.app).patch(`/api/chores/${id}`).send({ done: i % 2 === 0 });
          expect(res.status).toBe(200);
        }),
      );
    }
    expect(p95(samples)).toBeLessThan(500);
  });
});
