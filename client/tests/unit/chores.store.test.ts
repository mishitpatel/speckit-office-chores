import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Chore } from "@office-chores/shared";
import { useChoresStore } from "@/store/chores";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  useChoresStore.setState({ byId: {}, loading: false, error: null });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function chore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: "00000000-0000-7000-8000-000000000001",
    title: "x",
    assigneeId: "00000000-0000-7000-8000-000000000002",
    date: "2026-05-10",
    done: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function ok(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: status === 204 ? {} : { "content-type": "application/json" },
  });
}

function err(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("chores store — optimistic updateChore", () => {
  it("applies the patch immediately and confirms on success", async () => {
    const initial = chore({ done: false });
    useChoresStore.setState({ byId: { [initial.id]: initial } });
    fetchMock.mockResolvedValueOnce(ok(chore({ done: true, updatedAt: "later" })));

    const promise = useChoresStore.getState().updateChore(initial.id, { done: true });
    // Optimistic state visible before await resolves.
    expect(useChoresStore.getState().byId[initial.id]!.done).toBe(true);
    await promise;
    expect(useChoresStore.getState().byId[initial.id]!.updatedAt).toBe("later");
  });

  it("reverts to the previous state when the server returns an error", async () => {
    const initial = chore({ done: false, title: "before" });
    useChoresStore.setState({ byId: { [initial.id]: initial } });
    fetchMock.mockResolvedValueOnce(err(404, { code: "chore_not_found", message: "x" }));

    await expect(
      useChoresStore.getState().updateChore(initial.id, { title: "after" }),
    ).rejects.toThrow();
    expect(useChoresStore.getState().byId[initial.id]).toEqual(initial);
  });
});

describe("chores store — optimistic deleteChore", () => {
  it("removes immediately and stays gone on success", async () => {
    const initial = chore();
    useChoresStore.setState({ byId: { [initial.id]: initial } });
    fetchMock.mockResolvedValueOnce(ok({}, 204));

    const promise = useChoresStore.getState().deleteChore(initial.id);
    expect(useChoresStore.getState().byId[initial.id]).toBeUndefined();
    await promise;
    expect(useChoresStore.getState().byId[initial.id]).toBeUndefined();
  });

  it("restores the chore when the server returns an error", async () => {
    const initial = chore();
    useChoresStore.setState({ byId: { [initial.id]: initial } });
    fetchMock.mockResolvedValueOnce(err(500, { code: "internal_error", message: "boom" }));

    await expect(useChoresStore.getState().deleteChore(initial.id)).rejects.toThrow();
    expect(useChoresStore.getState().byId[initial.id]).toEqual(initial);
  });
});

describe("chores store — toggleDone", () => {
  it("flips the done flag via updateChore", async () => {
    const initial = chore({ done: false });
    useChoresStore.setState({ byId: { [initial.id]: initial } });
    fetchMock.mockResolvedValueOnce(ok(chore({ done: true })));
    await useChoresStore.getState().toggleDone(initial.id);
    expect(useChoresStore.getState().byId[initial.id]!.done).toBe(true);
  });
});
