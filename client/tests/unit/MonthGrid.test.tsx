import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonthGrid } from "@/components/calendar/MonthGrid";
import { WithDnd } from "../helpers/dnd";

describe("MonthGrid", () => {
  it("renders 42 day cells regardless of which month is shown", () => {
    const months = [new Date(2026, 1, 1), new Date(2026, 4, 1), new Date(2024, 1, 1)];
    for (const month of months) {
      const { unmount } = render(
        <WithDnd>
          <MonthGrid
            month={month}
            chores={[]}
            peopleById={{}}
            onClickDay={() => {}}
            onClickChore={() => {}}
            onToggleDone={() => {}}
          />
        </WithDnd>,
      );
      expect(screen.getAllByRole("gridcell")).toHaveLength(42);
      unmount();
    }
  });

  it("renders Sun-Sat header columns", () => {
    render(
      <WithDnd>
        <MonthGrid
          month={new Date(2026, 4, 1)}
          chores={[]}
          peopleById={{}}
          onClickDay={() => {}}
          onClickChore={() => {}}
          onToggleDone={() => {}}
        />
      </WithDnd>,
    );
    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });
});
