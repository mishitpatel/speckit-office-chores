import { create } from "zustand";
import type { Chore } from "@office-chores/shared";

interface ChoresState {
  byId: Record<string, Chore>;
  loading: boolean;
  error: string | null;
  setAll: (chores: Chore[]) => void;
  applyUpsert: (chore: Chore) => void;
  applyDelete: (id: string) => void;
}

export const useChoresStore = create<ChoresState>((set) => ({
  byId: {},
  loading: false,
  error: null,
  setAll: (chores) =>
    set(() => ({
      byId: Object.fromEntries(chores.map((c) => [c.id, c])),
      loading: false,
      error: null,
    })),
  applyUpsert: (chore) =>
    set((s) => ({ byId: { ...s.byId, [chore.id]: chore } })),
  applyDelete: (id) =>
    set((s) => {
      const { [id]: _drop, ...rest } = s.byId;
      return { byId: rest };
    }),
}));
