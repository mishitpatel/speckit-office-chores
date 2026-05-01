import type { Chore, Person } from "@office-chores/shared";
import { ChoreChip } from "./ChoreChip";
import { cn } from "@/lib/cn";
import { formatYmd, isToday as isTodayHelper } from "@/lib/dates";

const MAX_VISIBLE = 25;

interface Props {
  date: Date;
  inMonth: boolean;
  chores: Chore[];
  peopleById: Record<string, Person>;
  onClickDay: (date: Date) => void;
  onClickChore: (chore: Chore) => void;
}

export function DayCell({ date, inMonth, chores, peopleById, onClickDay, onClickChore }: Props) {
  const today = isTodayHelper(date);
  const visible = chores.slice(0, MAX_VISIBLE);
  const overflow = chores.length - visible.length;
  const ymd = formatYmd(date);

  return (
    <div
      role="gridcell"
      aria-label={`Day ${ymd}${today ? " (today)" : ""}`}
      data-date={ymd}
      data-in-month={inMonth ? "true" : "false"}
      onClick={(e) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.daySurface === "true") {
          onClickDay(date);
        }
      }}
      className={cn(
        "flex min-h-24 cursor-pointer flex-col gap-0.5 border p-1 text-[var(--color-fg)]",
        "bg-[var(--color-bg-elev)]",
        !inMonth && "bg-[var(--color-bg)] text-[var(--color-fg-muted)]",
        today && "ring-1 ring-[var(--color-accent)] ring-inset",
      )}
    >
      <div data-day-surface="true" className="flex items-center justify-between text-xs">
        <span data-day-surface="true" className={cn("font-medium", today && "text-[var(--color-accent)]")}>
          {date.getDate()}
        </span>
      </div>
      <div data-day-surface="true" className="flex flex-1 flex-col gap-0.5">
        {visible.map((c) => (
          <ChoreChip
            key={c.id}
            chore={c}
            assignee={peopleById[c.assigneeId]}
            onClick={onClickChore}
          />
        ))}
        {overflow > 0 && (
          <div data-day-surface="true" className="text-[10px] text-[var(--color-fg-muted)]">
            +{overflow} more
          </div>
        )}
      </div>
    </div>
  );
}
