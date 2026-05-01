import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Person } from "@office-chores/shared";
import { ChoreForm } from "@/components/chore-form/ChoreForm";

const PEOPLE: Person[] = [
  { id: "00000000-0000-7000-8000-000000000001", name: "Alex", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "00000000-0000-7000-8000-000000000002", name: "Bea", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("ChoreForm — edit mode", () => {
  it("pre-fills the form with the chore's current values", () => {
    render(
      <ChoreForm
        initial={{
          id: "00000000-0000-7000-8000-000000000099",
          title: "Vacuum",
          assigneeId: PEOPLE[1]!.id,
          date: "2026-06-05",
        }}
        people={PEOPLE}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect((screen.getByTestId("chore-form-title") as HTMLInputElement).value).toBe("Vacuum");
    expect((screen.getByTestId("chore-form-assignee") as HTMLSelectElement).value).toBe(
      PEOPLE[1]!.id,
    );
    expect((screen.getByTestId("chore-form-date") as HTMLInputElement).value).toBe(
      "2026-06-05",
    );
  });

  it("submits the changed values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ChoreForm
        initial={{
          id: "00000000-0000-7000-8000-000000000099",
          title: "Vacuum",
          assigneeId: PEOPLE[0]!.id,
          date: "2026-06-05",
        }}
        people={PEOPLE}
        onSubmit={onSubmit}
        onClose={vi.fn()}
      />,
    );
    await user.clear(screen.getByTestId("chore-form-title"));
    await user.type(screen.getByTestId("chore-form-title"), "Vacuum hallway");
    await user.click(screen.getByTestId("chore-form-submit"));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Vacuum hallway",
      assigneeId: PEOPLE[0]!.id,
      date: "2026-06-05",
    });
  });
});
