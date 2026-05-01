import { create } from "zustand";
import type { Chore, ChoreCreate } from "@office-chores/shared";
import { api } from "@/lib/api";
import { formatYmd } from "@/lib/dates";
import { endOfMonth, startOfMonth } from "date-fns";

interface ChoresState {
  byId: Record<string, Chore>;
  loading: boolean;
  error: string | null;
  setAll: (chores: Chore[]) => void;
  applyUpsert: (chore: Chore) => void;
  applyDelete: (id: string) => void;
  loadMonth: (month: Date, assigneeId?: string) => Promise<void>;
  createChore: (input: ChoreCreate) => Promise<Chore>;
}

export const useChoresStore = create<ChoresState>((set, get) => ({
  byId: {},
  loading: false,
  error: null,
  setAll: (chores) =>
    set(() => ({
      byId: Object.fromEntries(chores.map((c) => [c.id, c])),
      loading: false,
      error: null,
    })),
  applyUpsert: (chore) => set((s) => ({ byId: { ...s.byId, [chore.id]: chore } })),
  applyDelete: (id) =>
    set((s) => {
      const { [id]: _drop, ...rest } = s.byId;
      return { byId: rest };
    }),
  loadMonth: async (month, assigneeId) => {
    set({ loading: true, error: null });
    try {
      const from = formatYmd(startOfMonth(month));
      const to = formatYmd(endOfMonth(month));
      const chores = await api.get<Chore[]>("/api/chores", {
        from,
        to,
        assigneeId,
      });
      get().setAll(chores);
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  createChore: async (input) => {
    const created = await api.post<Chore>("/api/chores", input);
    get().applyUpsert(created);
    return created;
  },
}));

export function choresForDate(state: ChoresState, ymd: string): Chore[] {
  return Object.values(state.byId).filter((c) => c.date === ymd);
}
