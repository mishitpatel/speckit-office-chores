import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Toaster } from "sonner";
import type { Chore } from "@office-chores/shared";
import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { MonthNav } from "@/components/header/MonthNav";
import { RosterList } from "@/components/sidebar/RosterList";
import { ChoreForm, type ChoreFormInitial } from "@/components/chore-form/ChoreForm";
import { usePeopleStore } from "@/store/people";
import { useChoresStore } from "@/store/chores";
import { useFilterStore } from "@/store/filter";
import { useTheme } from "@/hooks/useTheme";
import { formatYmd } from "@/lib/dates";
import { applyDragEnd } from "@/lib/dragEnd";

export function App() {
  const { theme } = useTheme();
  const [month, setMonth] = useState(() => new Date());
  const [formInitial, setFormInitial] = useState<ChoreFormInitial | null>(null);

  const peopleIds = usePeopleStore((s) => s.ids);
  const peopleById = usePeopleStore((s) => s.byId);
  const people = useMemo(
    () => peopleIds.flatMap((id) => (peopleById[id] ? [peopleById[id]!] : [])),
    [peopleIds, peopleById],
  );
  const loadAllPeople = usePeopleStore((s) => s.loadAll);
  const createPerson = usePeopleStore((s) => s.createPerson);
  const renamePerson = usePeopleStore((s) => s.renamePerson);
  const deletePerson = usePeopleStore((s) => s.deletePerson);

  const choresMap = useChoresStore((s) => s.byId);
  const loadMonth = useChoresStore((s) => s.loadMonth);
  const createChore = useChoresStore((s) => s.createChore);
  const updateChore = useChoresStore((s) => s.updateChore);
  const deleteChore = useChoresStore((s) => s.deleteChore);
  const toggleDone = useChoresStore((s) => s.toggleDone);

  const selectedPersonId = useFilterStore((s) => s.selectedPersonId);
  const setSelectedPerson = useFilterStore((s) => s.setSelectedPerson);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    void loadAllPeople();
  }, [loadAllPeople]);

  useEffect(() => {
    void loadMonth(month, selectedPersonId);
  }, [month, selectedPersonId, loadMonth]);

  const chores = useMemo(() => Object.values(choresMap), [choresMap]);

  function handleDragEnd(event: DragEndEvent) {
    applyDragEnd(event, {
      choresById: choresMap,
      reschedule: (id, date) => void updateChore(id, { date }),
    });
  }

  function openCreateForm(d: Date) {
    setFormInitial({ date: formatYmd(d) });
  }

  function openEditForm(c: Chore) {
    setFormInitial({ id: c.id, title: c.title, assigneeId: c.assigneeId, date: c.date });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar>
            <RosterList
              people={people}
              selectedPersonId={selectedPersonId}
              onSelect={setSelectedPerson}
              onCreate={createPerson}
              onRename={renamePerson}
              onDelete={deletePerson}
            />
          </Sidebar>
          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <MonthNav month={month} onChange={setMonth} />
              {selectedPersonId && peopleById[selectedPersonId] && (
                <span className="text-xs text-[var(--color-fg-muted)]">
                  Filtered to {peopleById[selectedPersonId]!.name}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4">
              <MonthGrid
                month={month}
                chores={chores}
                peopleById={peopleById}
                onClickDay={openCreateForm}
                onClickChore={openEditForm}
                onToggleDone={(c) => void toggleDone(c.id)}
              />
            </div>
          </main>
        </div>
        {formInitial && (
          <ChoreForm
            initial={formInitial}
            people={people}
            onClose={() => setFormInitial(null)}
            onSubmit={async (values) => {
              if (formInitial.id) {
                await updateChore(formInitial.id, values);
              } else {
                await createChore(values);
              }
            }}
            onDelete={
              formInitial.id
                ? async (id) => {
                    await deleteChore(id);
                  }
                : undefined
            }
          />
        )}
        <Toaster theme={theme} richColors position="bottom-right" />
      </div>
    </DndContext>
  );
}
