import { Check } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import type { Chore, Person } from "@office-chores/shared";
import { cn } from "@/lib/cn";

interface Props {
  chore: Chore;
  assignee: Person | undefined;
  onClick?: (chore: Chore) => void;
  onToggleDone?: (chore: Chore) => void;
  draggable?: boolean;
}

export function ChoreChip({ chore, assignee, onClick, onToggleDone, draggable = true }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: chore.id,
    data: { chore },
    disabled: !draggable,
  });

  return (
    <div
      ref={setNodeRef}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      data-testid="chore-chip"
      data-done={chore.done ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
      className={cn(
        "flex w-full items-center gap-1 border px-1.5 py-0.5 text-left text-[11px] leading-tight",
        "hover:bg-[var(--color-bg)]",
        chore.done && "text-[var(--color-fg-muted)] line-through",
        isDragging && "opacity-40",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
      title={`${chore.title} — ${assignee?.name ?? "unknown"}`}
    >
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone?.(chore);
        }}
        aria-label={chore.done ? "Mark as not done" : "Mark as done"}
        data-testid="chore-chip-done"
        className={cn(
          "inline-flex h-3 w-3 shrink-0 items-center justify-center border",
          chore.done && "bg-[var(--color-fg-muted)]",
        )}
      >
        {chore.done && <Check className="h-2 w-2 text-[var(--color-bg)]" />}
      </button>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(chore);
        }}
        data-testid="chore-chip-body"
        className="flex-1 truncate text-left"
      >
        <span className="font-medium">{chore.title}</span>
        <span className="ml-1 text-[var(--color-fg-muted)]">{assignee?.name ?? "?"}</span>
      </button>
    </div>
  );
}
