import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Person } from "@office-chores/shared";
import { usePeopleStore } from "@/store/people";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  usePeopleStore.setState({ byId: {}, ids: [], loading: false, error: null });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function person(overrides: Partial<Person> = {}): Person {
  return {
    id: "00000000-0000-7000-8000-000000000001",
    name: "Alex",
    createdAt: "2026-01-01T00:00:00.000Z",
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

describe("people store mutations", () => {
  it("createPerson upserts on success", async () => {
    fetchMock.mockResolvedValueOnce(ok(person({ name: "Greta" })));
    const created = await usePeopleStore.getState().createPerson("Greta");
    expect(created.name).toBe("Greta");
    expect(usePeopleStore.getState().byId[created.id]).toBeDefined();
  });

  it("createPerson surfaces 409 name_taken without changing state", async () => {
    fetchMock.mockResolvedValueOnce(err(409, { code: "name_taken", message: "name already in use" }));
    await expect(usePeopleStore.getState().createPerson("Alex")).rejects.toThrow();
    expect(Object.keys(usePeopleStore.getState().byId)).toHaveLength(0);
  });

  it("renamePerson optimistically updates and confirms", async () => {
    const initial = person();
    usePeopleStore.setState({ byId: { [initial.id]: initial }, ids: [initial.id] });
    fetchMock.mockResolvedValueOnce(ok(person({ name: "Alexandra" })));
    const promise = usePeopleStore.getState().renamePerson(initial.id, "Alexandra");
    expect(usePeopleStore.getState().byId[initial.id]!.name).toBe("Alexandra");
    await promise;
    expect(usePeopleStore.getState().byId[initial.id]!.name).toBe("Alexandra");
  });

  it("renamePerson reverts on 409 name_taken", async () => {
    const initial = person();
    usePeopleStore.setState({ byId: { [initial.id]: initial }, ids: [initial.id] });
    fetchMock.mockResolvedValueOnce(err(409, { code: "name_taken", message: "x" }));
    await expect(
      usePeopleStore.getState().renamePerson(initial.id, "Bea"),
    ).rejects.toThrow();
    expect(usePeopleStore.getState().byId[initial.id]!.name).toBe("Alex");
  });

  it("deletePerson removes on 204 success", async () => {
    const initial = person();
    usePeopleStore.setState({ byId: { [initial.id]: initial }, ids: [initial.id] });
    fetchMock.mockResolvedValueOnce(ok({}, 204));
    await usePeopleStore.getState().deletePerson(initial.id);
    expect(usePeopleStore.getState().byId[initial.id]).toBeUndefined();
  });

  it("deletePerson surfaces 409 person_has_chores and keeps the row", async () => {
    const initial = person();
    usePeopleStore.setState({ byId: { [initial.id]: initial }, ids: [initial.id] });
    fetchMock.mockResolvedValueOnce(
      err(409, { code: "person_has_chores", message: "x", details: { choreCount: 2 } }),
    );
    await expect(
      usePeopleStore.getState().deletePerson(initial.id),
    ).rejects.toThrow();
    expect(usePeopleStore.getState().byId[initial.id]).toEqual(initial);
  });
});
