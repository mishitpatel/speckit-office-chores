import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilterState {
  selectedPersonId: string | null;
  setSelectedPerson: (id: string | null) => void;
  toggleSelectedPerson: (id: string) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      selectedPersonId: null,
      setSelectedPerson: (id) => set({ selectedPersonId: id }),
      toggleSelectedPerson: (id) =>
        set({ selectedPersonId: get().selectedPersonId === id ? null : id }),
    }),
    { name: "office-chores:filter" },
  ),
);
