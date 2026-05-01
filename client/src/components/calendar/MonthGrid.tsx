import { useMemo } from "react";
import type { Chore, Person } from "@office-chores/shared";
import { DayCell } from "./DayCell";
import { formatYmd, isInMonth, monthMatrix } from "@/lib/dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface Props {
  month: Date;
  chores: Chore[];
  peopleById: Record<string, Person>;
  onClickDay: (date: Date) => void;
  onClickChore: (chore: Chore) => void;
  onToggleDone: (chore: Chore) => void;
}

export function MonthGrid({
  month,
  chores,
  peopleById,
  onClickDay,
  onClickChore,
  onToggleDone,
}: Props) {
  const days = useMemo(() => monthMatrix(month), [month]);
  const choresByDate = useMemo(() => {
    const map: Record<string, Chore[]> = {};
    for (const c of chores) {
      (map[c.date] ??= []).push(c);
    }
    return map;
  }, [chores]);

  return (
    <div role="grid" aria-label="Month calendar" className="flex h-full flex-col">
      <div role="row" className="grid grid-cols-7 border-b text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-muted)]">
        {WEEKDAYS.map((d) => (
          <div role="columnheader" key={d} className="px-2 py-1.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {days.map((d) => {
          const ymd = formatYmd(d);
          return (
            <DayCell
              key={ymd}
              date={d}
              inMonth={isInMonth(d, month)}
              chores={choresByDate[ymd] ?? []}
              peopleById={peopleById}
              onClickDay={onClickDay}
              onClickChore={onClickChore}
              onToggleDone={onToggleDone}
            />
          );
        })}
      </div>
    </div>
  );
}
