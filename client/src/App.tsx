import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { MonthNav } from "@/components/header/MonthNav";
import { RosterList } from "@/components/sidebar/RosterList";
import { ChoreForm, type ChoreFormInitial } from "@/components/chore-form/ChoreForm";
import { usePeopleStore } from "@/store/people";
import { useChoresStore } from "@/store/chores";
import { formatYmd } from "@/lib/dates";

export function App() {
  const [month, setMonth] = useState(() => new Date());
  const [formInitial, setFormInitial] = useState<ChoreFormInitial | null>(null);

  const people = usePeopleStore((s) =>
    s.ids.flatMap((id) => (s.byId[id] ? [s.byId[id]!] : [])),
  );
  const peopleById = usePeopleStore((s) => s.byId);
  const loadAllPeople = usePeopleStore((s) => s.loadAll);

  const choresMap = useChoresStore((s) => s.byId);
  const loadMonth = useChoresStore((s) => s.loadMonth);
  const createChore = useChoresStore((s) => s.createChore);

  useEffect(() => {
    void loadAllPeople();
  }, [loadAllPeople]);

  useEffect(() => {
    void loadMonth(month);
  }, [month, loadMonth]);

  const chores = useMemo(() => Object.values(choresMap), [choresMap]);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar>
          <RosterList people={people} />
        </Sidebar>
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <MonthNav month={month} onChange={setMonth} />
          </div>
          <div className="flex-1 overflow-auto p-4">
            <MonthGrid
              month={month}
              chores={chores}
              peopleById={peopleById}
              onClickDay={(d) => setFormInitial({ date: formatYmd(d) })}
              onClickChore={() => {
                /* US3: open edit form */
              }}
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
            await createChore(values);
          }}
        />
      )}
    </div>
  );
}
