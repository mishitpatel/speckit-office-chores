import { describe, expect, it, vi } from "vitest";
import type { DragEndEvent } from "@dnd-kit/core";
import type { Chore } from "@office-chores/shared";
import { applyDragEnd } from "@/lib/dragEnd";

function makeChore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: "00000000-0000-7000-8000-000000000001",
    title: "x",
    assigneeId: "00000000-0000-7000-8000-000000000002",
    date: "2026-05-10",
    done: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeEvent({
  activeId,
  overDate,
}: {
  activeId: string;
  overDate: string | null;
}): DragEndEvent {
  return {
    active: { id: activeId, data: { current: undefined }, rect: { current: { initial: null, translated: null } } },
    over:
      overDate === null
        ? null
        : { id: `day:${overDate}`, data: { current: { date: overDate } }, rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }, disabled: false },
    delta: { x: 0, y: 0 },
    activatorEvent: new Event("pointerdown"),
    collisions: null,
  } as unknown as DragEndEvent;
}

describe("applyDragEnd", () => {
  it("reschedules the chore when dropped on a different valid date", () => {
    const chore = makeChore({ date: "2026-05-10" });
    const reschedule = vi.fn();
    applyDragEnd(makeEvent({ activeId: chore.id, overDate: "2026-05-15" }), {
      choresById: { [chore.id]: chore },
      reschedule,
    });
    expect(reschedule).toHaveBeenCalledWith(chore.id, "2026-05-15");
  });

  it("is a no-op when dropped outside any valid cell (over === null)", () => {
    const chore = makeChore();
    const reschedule = vi.fn();
    applyDragEnd(makeEvent({ activeId: chore.id, overDate: null }), {
      choresById: { [chore.id]: chore },
      reschedule,
    });
    expect(reschedule).not.toHaveBeenCalled();
  });

  it("is a no-op when dropped back on the same date", () => {
    const chore = makeChore({ date: "2026-05-10" });
    const reschedule = vi.fn();
    applyDragEnd(makeEvent({ activeId: chore.id, overDate: "2026-05-10" }), {
      choresById: { [chore.id]: chore },
      reschedule,
    });
    expect(reschedule).not.toHaveBeenCalled();
  });

  it("is a no-op when the active id is not in the store (stale drag)", () => {
    const reschedule = vi.fn();
    applyDragEnd(makeEvent({ activeId: "ghost-id", overDate: "2026-05-15" }), {
      choresById: {},
      reschedule,
    });
    expect(reschedule).not.toHaveBeenCalled();
  });

  it("is a no-op when the drop target has no date in its data", () => {
    const chore = makeChore();
    const reschedule = vi.fn();
    const event = {
      active: { id: chore.id, data: { current: undefined }, rect: { current: { initial: null, translated: null } } },
      over: { id: "not-a-day", data: { current: {} }, rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }, disabled: false },
      delta: { x: 0, y: 0 },
      activatorEvent: new Event("pointerdown"),
      collisions: null,
    } as unknown as DragEndEvent;
    applyDragEnd(event, { choresById: { [chore.id]: chore }, reschedule });
    expect(reschedule).not.toHaveBeenCalled();
  });
});
