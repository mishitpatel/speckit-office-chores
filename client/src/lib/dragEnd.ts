import type { DragEndEvent } from "@dnd-kit/core";
import type { Chore } from "@office-chores/shared";

export interface DragEndContext {
  choresById: Record<string, Chore>;
  reschedule: (id: string, date: string) => void;
}

/**
 * Pure function: given a DragEndEvent and the current store, decide whether
 * to reschedule a chore. Lives outside App.tsx so it is unit-testable
 * without DOM/dnd-kit setup.
 *
 * - drop with no `over` target → no-op (cancelled drag).
 * - drop on a target whose data has no `date` → no-op.
 * - drop on the same date as the chore's current date → no-op.
 * - drop on a different date → calls reschedule(id, newDate).
 */
export function applyDragEnd(event: DragEndEvent, ctx: DragEndContext): void {
  const { active, over } = event;
  if (!over) return;
  const targetDate = (over.data.current as { date?: string } | undefined)?.date;
  if (!targetDate) return;
  const choreId = String(active.id);
  const current = ctx.choresById[choreId];
  if (!current || current.date === targetDate) return;
  ctx.reschedule(choreId, targetDate);
}
