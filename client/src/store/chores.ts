import { create } from "zustand";
import { toast } from "sonner";
import type { Chore, ChoreCreate, ChoreUpdate } from "@office-chores/shared";
import { api, ApiClientError } from "@/lib/api";
import { formatYmd } from "@/lib/dates";
import { endOfMonth, startOfMonth } from "date-fns";

interface ChoresState {
  byId: Record<string, Chore>;
  loading: boolean;
  error: string | null;
  setAll: (chores: Chore[]) => void;
  applyUpsert: (chore: Chore) => void;
  applyDelete: (id: string) => void;
  loadMonth: (month: Date, assigneeId?: string | null) => Promise<void>;
  createChore: (input: ChoreCreate) => Promise<Chore>;
  updateChore: (id: string, patch: ChoreUpdate) => Promise<Chore>;
  deleteChore: (id: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
}

function readableError(e: unknown): string {
  if (e instanceof ApiClientError) return e.message;
  return e instanceof Error ? e.message : "Request failed";
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
        assigneeId: assigneeId ?? undefined,
      });
      get().setAll(chores);
    } catch (e) {
      set({ loading: false, error: readableError(e) });
      toast.error("Failed to load chores", { description: readableError(e) });
    }
  },
  createChore: async (input) => {
    const created = await api.post<Chore>("/api/chores", input);
    get().applyUpsert(created);
    return created;
  },
  updateChore: async (id, patch) => {
    const previous = get().byId[id];
    if (previous) {
      get().applyUpsert({
        ...previous,
        ...(patch.title !== undefined && { title: patch.title }),
        ...(patch.assigneeId !== undefined && { assigneeId: patch.assigneeId }),
        ...(patch.date !== undefined && { date: patch.date }),
        ...(patch.done !== undefined && { done: patch.done }),
      });
    }
    try {
      const updated = await api.patch<Chore>(`/api/chores/${id}`, patch);
      get().applyUpsert(updated);
      return updated;
    } catch (e) {
      if (previous) get().applyUpsert(previous);
      toast.error("Update failed", { description: readableError(e) });
      throw e;
    }
  },
  deleteChore: async (id) => {
    const previous = get().byId[id];
    get().applyDelete(id);
    try {
      await api.del(`/api/chores/${id}`);
    } catch (e) {
      if (previous) get().applyUpsert(previous);
      toast.error("Delete failed", { description: readableError(e) });
      throw e;
    }
  },
  toggleDone: async (id) => {
    const c = get().byId[id];
    if (!c) return;
    await get().updateChore(id, { done: !c.done });
  },
}));

export function choresForDate(state: ChoresState, ymd: string): Chore[] {
  return Object.values(state.byId).filter((c) => c.date === ymd);
}
