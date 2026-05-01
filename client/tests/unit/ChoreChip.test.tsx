import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Chore, Person } from "@office-chores/shared";
import { ChoreChip } from "@/components/calendar/ChoreChip";

const alex: Person = {
  id: "00000000-0000-7000-8000-000000000001",
  name: "Alex",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function makeChore(overrides: Partial<Chore> = {}): Chore {
  return {
    id: "00000000-0000-7000-8000-000000000002",
    title: "Empty dishwasher",
    assigneeId: alex.id,
    date: "2026-05-10",
    done: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ChoreChip", () => {
  it("renders title and assignee name", () => {
    render(<ChoreChip chore={makeChore()} assignee={alex} />);
    expect(screen.getByTestId("chore-chip")).toHaveTextContent("Empty dishwasher");
    expect(screen.getByTestId("chore-chip")).toHaveTextContent("Alex");
  });

  it("marks done state via data-done and styles it as struck-through", () => {
    render(<ChoreChip chore={makeChore({ done: true })} assignee={alex} />);
    const chip = screen.getByTestId("chore-chip");
    expect(chip.dataset.done).toBe("true");
    expect(chip.className).toMatch(/line-through/);
  });

  it("falls back to '?' when assignee is unknown", () => {
    render(<ChoreChip chore={makeChore()} assignee={undefined} />);
    expect(screen.getByTestId("chore-chip")).toHaveTextContent("?");
  });

  it("dispatches onClick with the chore", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const chore = makeChore();
    render(<ChoreChip chore={chore} assignee={alex} onClick={onClick} />);
    await user.click(screen.getByTestId("chore-chip"));
    expect(onClick).toHaveBeenCalledWith(chore);
  });
});
