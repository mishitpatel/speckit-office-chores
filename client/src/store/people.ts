import { create } from "zustand";
import type { Person } from "@office-chores/shared";

interface PeopleState {
  byId: Record<string, Person>;
  ids: string[];
  loading: boolean;
  error: string | null;
  /** Replace the roster from an authoritative list (e.g., REST response). */
  setAll: (people: Person[]) => void;
  /** Apply a single mutation regardless of whether it came from REST or a future event. */
  applyUpsert: (person: Person) => void;
  applyDelete: (id: string) => void;
}

export const usePeopleStore = create<PeopleState>((set) => ({
  byId: {},
  ids: [],
  loading: false,
  error: null,
  setAll: (people) =>
    set(() => ({
      byId: Object.fromEntries(people.map((p) => [p.id, p])),
      ids: people.map((p) => p.id),
      loading: false,
      error: null,
    })),
  applyUpsert: (person) =>
    set((s) => ({
      byId: { ...s.byId, [person.id]: person },
      ids: s.ids.includes(person.id) ? s.ids : [...s.ids, person.id],
    })),
  applyDelete: (id) =>
    set((s) => {
      const { [id]: _drop, ...rest } = s.byId;
      return { byId: rest, ids: s.ids.filter((x) => x !== id) };
    }),
}));
