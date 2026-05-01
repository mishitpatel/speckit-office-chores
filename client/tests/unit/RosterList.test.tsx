import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Person } from "@office-chores/shared";
import { RosterList } from "@/components/sidebar/RosterList";

const PEOPLE: Person[] = [
  { id: "00000000-0000-7000-8000-000000000001", name: "Alex", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "00000000-0000-7000-8000-000000000002", name: "Bea", createdAt: "2026-01-01T00:00:00.000Z" },
];

function renderList(overrides: Partial<React.ComponentProps<typeof RosterList>> = {}) {
  return render(
    <RosterList
      people={PEOPLE}
      selectedPersonId={null}
      onSelect={vi.fn()}
      onCreate={vi.fn().mockResolvedValue(undefined)}
      onRename={vi.fn().mockResolvedValue(undefined)}
      onDelete={vi.fn().mockResolvedValue(undefined)}
      {...overrides}
    />,
  );
}

describe("RosterList", () => {
  it("renders an All entry plus every person", () => {
    renderList();
    expect(screen.getByTestId("roster-all")).toBeInTheDocument();
    expect(screen.getAllByTestId("roster-item")).toHaveLength(2);
  });

  it("clicking a person calls onSelect with their id; clicking again clears", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { rerender } = renderList({ onSelect });
    await user.click(within(screen.getAllByTestId("roster-item")[0]!).getByTestId("roster-person-name"));
    expect(onSelect).toHaveBeenLastCalledWith(PEOPLE[0]!.id);

    rerender(
      <RosterList
        people={PEOPLE}
        selectedPersonId={PEOPLE[0]!.id}
        onSelect={onSelect}
        onCreate={vi.fn()}
        onRename={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await user.click(within(screen.getAllByTestId("roster-item")[0]!).getByTestId("roster-person-name"));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("clicking All clears the filter", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    renderList({ onSelect, selectedPersonId: PEOPLE[0]!.id });
    await user.click(screen.getByTestId("roster-all"));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("add flow: open input, type a name, submit → onCreate called", async () => {
    const onCreate = vi.fn().mockResolvedValue({ id: "new", name: "Greta" });
    const user = userEvent.setup();
    renderList({ onCreate });
    await user.click(screen.getByTestId("roster-add-open"));
    await user.type(screen.getByTestId("roster-add-input"), "Greta");
    await user.click(screen.getByTestId("roster-add-submit"));
    expect(onCreate).toHaveBeenCalledWith("Greta");
  });

  it("rename flow: open input pre-filled, type, save → onRename called", async () => {
    const onRename = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderList({ onRename });
    const item = screen.getAllByTestId("roster-item")[0]!;
    await user.click(within(item).getByTestId("roster-rename"));
    const input = screen.getByTestId("roster-rename-input") as HTMLInputElement;
    expect(input.value).toBe("Alex");
    await user.clear(input);
    await user.type(input, "Alexandra");
    await user.click(screen.getByTestId("roster-rename-save"));
    expect(onRename).toHaveBeenCalledWith(PEOPLE[0]!.id, "Alexandra");
  });

  it("delete invokes onDelete with the person id", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderList({ onDelete });
    const item = screen.getAllByTestId("roster-item")[0]!;
    await user.click(within(item).getByTestId("roster-delete"));
    expect(onDelete).toHaveBeenCalledWith(PEOPLE[0]!.id);
  });
});
