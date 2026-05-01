import { type ReactNode } from "react";
import { DndContext } from "@dnd-kit/core";

/** Wraps test renders that use draggable/droppable from @dnd-kit. */
export function WithDnd({ children }: { children: ReactNode }) {
  return <DndContext>{children}</DndContext>;
}
