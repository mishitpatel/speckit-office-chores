import type { Chore, Person } from "@office-chores/shared";
import { cn } from "@/lib/cn";

interface Props {
  chore: Chore;
  assignee: Person | undefined;
  onClick?: (chore: Chore) => void;
}

export function ChoreChip({ chore, assignee, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(chore)}
      title={`${chore.title} — ${assignee?.name ?? "unknown"}`}
      data-testid="chore-chip"
      data-done={chore.done ? "true" : "false"}
      className={cn(
        "block w-full truncate border px-1.5 py-0.5 text-left text-[11px] leading-tight",
        "hover:bg-[var(--color-bg)]",
        chore.done && "text-[var(--color-fg-muted)] line-through",
      )}
    >
      <span className="font-medium">{chore.title}</span>
      <span className="ml-1 text-[var(--color-fg-muted)]">{assignee?.name ?? "?"}</span>
    </button>
  );
}
