import { beforeEach, describe, expect, it } from "vitest";
import { useFilterStore } from "@/store/filter";

beforeEach(() => {
  localStorage.clear();
  useFilterStore.setState({ selectedPersonId: null });
});

describe("filter store", () => {
  it("setSelectedPerson sets and clears", () => {
    useFilterStore.getState().setSelectedPerson("p1");
    expect(useFilterStore.getState().selectedPersonId).toBe("p1");
    useFilterStore.getState().setSelectedPerson(null);
    expect(useFilterStore.getState().selectedPersonId).toBeNull();
  });

  it("toggleSelectedPerson toggles the same id and switches between ids", () => {
    useFilterStore.getState().toggleSelectedPerson("p1");
    expect(useFilterStore.getState().selectedPersonId).toBe("p1");
    useFilterStore.getState().toggleSelectedPerson("p1");
    expect(useFilterStore.getState().selectedPersonId).toBeNull();
    useFilterStore.getState().toggleSelectedPerson("p1");
    useFilterStore.getState().toggleSelectedPerson("p2");
    expect(useFilterStore.getState().selectedPersonId).toBe("p2");
  });

  it("persists the selection to localStorage", () => {
    useFilterStore.getState().setSelectedPerson("p1");
    const stored = localStorage.getItem("office-chores:filter");
    expect(stored).toBeTruthy();
    expect(stored).toContain("p1");
  });
});
