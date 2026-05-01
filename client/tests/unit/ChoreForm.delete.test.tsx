import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Person } from "@office-chores/shared";
import { ChoreForm } from "@/components/chore-form/ChoreForm";

const PEOPLE: Person[] = [
  { id: "00000000-0000-7000-8000-000000000001", name: "Alex", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("ChoreForm — delete confirmation", () => {
  it("requires a second click before invoking onDelete", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
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
        onSubmit={vi.fn()}
        onDelete={onDelete}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByTestId("chore-form-delete"));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByTestId("chore-form-delete-confirm")).toBeInTheDocument();
    expect(screen.getByTestId("chore-form-delete-cancel")).toBeInTheDocument();

    await user.click(screen.getByTestId("chore-form-delete-confirm"));
    expect(onDelete).toHaveBeenCalledWith("00000000-0000-7000-8000-000000000099");
    expect(onClose).toHaveBeenCalled();
  });

  it("cancel keeps the chore (no onDelete invocation)", async () => {
    const onDelete = vi.fn();
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
        onSubmit={vi.fn()}
        onDelete={onDelete}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByTestId("chore-form-delete"));
    await user.click(screen.getByTestId("chore-form-delete-cancel"));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByTestId("chore-form-delete")).toBeInTheDocument();
  });

  it("does not show a delete button when onDelete is not provided (create mode)", () => {
    render(
      <ChoreForm
        initial={{ date: "2026-06-05" }}
        people={PEOPLE}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("chore-form-delete")).not.toBeInTheDocument();
  });
});
