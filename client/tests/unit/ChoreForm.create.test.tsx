import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Person } from "@office-chores/shared";
import { ChoreForm } from "@/components/chore-form/ChoreForm";

const PEOPLE: Person[] = [
  { id: "00000000-0000-7000-8000-000000000001", name: "Alex", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "00000000-0000-7000-8000-000000000002", name: "Bea", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("ChoreForm — create mode", () => {
  it("submits a valid form with title, assignee, and date", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ChoreForm
        initial={{ date: "2026-05-10" }}
        people={PEOPLE}
        onSubmit={onSubmit}
        onClose={onClose}
      />,
    );
    await user.type(screen.getByTestId("chore-form-title"), "Empty dishwasher");
    await user.click(screen.getByTestId("chore-form-submit"));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Empty dishwasher",
      assigneeId: PEOPLE[0]!.id,
      date: "2026-05-10",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("blocks submission and shows an error when title is empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <ChoreForm
        initial={{ date: "2026-05-10" }}
        people={PEOPLE}
        onSubmit={onSubmit}
        onClose={() => {}}
      />,
    );
    await user.click(screen.getByTestId("chore-form-submit"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("error-chore-title")).toHaveTextContent(/required|too small|must contain/i);
  });

  it("blocks submission when no assignee is selected", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <ChoreForm
        initial={{ date: "2026-05-10", assigneeId: "" }}
        people={[]}
        onSubmit={onSubmit}
        onClose={() => {}}
      />,
    );
    await user.type(screen.getByTestId("chore-form-title"), "Anything");
    await user.click(screen.getByTestId("chore-form-submit"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("error-chore-assignee")).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <ChoreForm
        initial={{ date: "2026-05-10" }}
        people={PEOPLE}
        onSubmit={vi.fn()}
        onClose={onClose}
      />,
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
