import { create } from "zustand";
import { toast } from "sonner";
import type { Person } from "@office-chores/shared";
import { api, ApiClientError } from "@/lib/api";

interface PeopleState {
  byId: Record<string, Person>;
  ids: string[];
  loading: boolean;
  error: string | null;
  setAll: (people: Person[]) => void;
  applyUpsert: (person: Person) => void;
  applyDelete: (id: string) => void;
  loadAll: () => Promise<void>;
  createPerson: (name: string) => Promise<Person>;
  renamePerson: (id: string, name: string) => Promise<Person>;
  deletePerson: (id: string) => Promise<void>;
}

function readableError(e: unknown): string {
  if (e instanceof ApiClientError) return e.message;
  return e instanceof Error ? e.message : "Request failed";
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
      set({ loading: false, error: readableError(e) });
      toast.error("Failed to load people", { description: readableError(e) });
    }
  },
  createPerson: async (name) => {
    try {
      const created = await api.post<Person>("/api/people", { name });
      get().applyUpsert(created);
      return created;
    } catch (e) {
      toast.error("Add failed", { description: readableError(e) });
      throw e;
    }
  },
  renamePerson: async (id, name) => {
    const previous = get().byId[id];
    if (previous) get().applyUpsert({ ...previous, name });
    try {
      const updated = await api.patch<Person>(`/api/people/${id}`, { name });
      get().applyUpsert(updated);
      return updated;
    } catch (e) {
      if (previous) get().applyUpsert(previous);
      toast.error("Rename failed", { description: readableError(e) });
      throw e;
    }
  },
  deletePerson: async (id) => {
    try {
      await api.del(`/api/people/${id}`);
      get().applyDelete(id);
    } catch (e) {
      toast.error("Delete failed", { description: readableError(e) });
      throw e;
    }
  },
}));

export function getPerson(state: PeopleState, id: string): Person | undefined {
  return state.byId[id];
}
