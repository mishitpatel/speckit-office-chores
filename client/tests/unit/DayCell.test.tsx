import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Chore, Person } from "@office-chores/shared";
import { DayCell } from "@/components/calendar/DayCell";

const alex: Person = {
  id: "00000000-0000-7000-8000-000000000001",
  name: "Alex",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function makeChores(n: number): Chore[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `00000000-0000-7000-8000-${String(i + 1).padStart(12, "0")}`,
    title: `c${i + 1}`,
    assigneeId: alex.id,
    date: "2026-05-10",
    done: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }));
}

describe("DayCell", () => {
  it("calls onClickDay when the surface is clicked", async () => {
    const user = userEvent.setup();
    const onClickDay = vi.fn();
    render(
      <DayCell
        date={new Date(2026, 4, 10)}
        inMonth
        chores={[]}
        peopleById={{ [alex.id]: alex }}
        onClickDay={onClickDay}
        onClickChore={() => {}}
      />,
    );
    await user.click(screen.getByRole("gridcell"));
    expect(onClickDay).toHaveBeenCalledTimes(1);
  });

  it("renders chore chips", () => {
    render(
      <DayCell
        date={new Date(2026, 4, 10)}
        inMonth
        chores={makeChores(2)}
        peopleById={{ [alex.id]: alex }}
        onClickDay={() => {}}
        onClickChore={() => {}}
      />,
    );
    const chips = screen.getAllByTestId("chore-chip");
    expect(chips).toHaveLength(2);
  });

  it("caps visible chips at 25 and shows a +N more indicator", () => {
    render(
      <DayCell
        date={new Date(2026, 4, 10)}
        inMonth
        chores={makeChores(28)}
        peopleById={{ [alex.id]: alex }}
        onClickDay={() => {}}
        onClickChore={() => {}}
      />,
    );
    expect(screen.getAllByTestId("chore-chip")).toHaveLength(25);
    expect(screen.getByText("+3 more")).toBeInTheDocument();
  });

  it("uses the today indicator for the current date", () => {
    render(
      <DayCell
        date={new Date()}
        inMonth
        chores={[]}
        peopleById={{}}
        onClickDay={() => {}}
        onClickChore={() => {}}
      />,
    );
    const cell = screen.getByRole("gridcell");
    expect(cell.getAttribute("aria-label")).toMatch(/\(today\)/);
  });
});
