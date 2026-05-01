import { create } from "zustand";
import type { Person } from "@office-chores/shared";
import { api } from "@/lib/api";

interface PeopleState {
  byId: Record<string, Person>;
  ids: string[];
  loading: boolean;
  error: string | null;
  setAll: (people: Person[]) => void;
  applyUpsert: (person: Person) => void;
  applyDelete: (id: string) => void;
  loadAll: () => Promise<void>;
}

export const usePeopleStore = create<PeopleState>((set, get) => ({
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
  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const people = await api.get<Person[]>("/api/people");
      get().setAll(people);
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
}));

export function getPerson(state: PeopleState, id: string): Person | undefined {
  return state.byId[id];
}
