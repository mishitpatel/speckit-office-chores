import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import axe, { type Result } from "axe-core";
import type { Person } from "@office-chores/shared";
import { Header } from "@/components/header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { RosterList } from "@/components/sidebar/RosterList";
import { ChoreForm } from "@/components/chore-form/ChoreForm";

async function violations(container: HTMLElement): Promise<Result[]> {
  const result = await axe.run(container, {
    rules: {
      // axe-core flags a missing landmark on isolated component renders;
      // the real App provides a <main>. Suppress for unit-level a11y.
      region: { enabled: false },
      "color-contrast": { enabled: false },
    },
  });
  return result.violations;
}

const PEOPLE: Person[] = [
  { id: "00000000-0000-7000-8000-000000000001", name: "Alex", createdAt: "2026-01-01T00:00:00.000Z" },
  { id: "00000000-0000-7000-8000-000000000002", name: "Bea", createdAt: "2026-01-01T00:00:00.000Z" },
];

describe("a11y", () => {
  it("Header has no axe violations", async () => {
    const { container } = render(<Header />);
    expect(await violations(container)).toEqual([]);
  });

  it("Sidebar (with RosterList) has no axe violations", async () => {
    const { container } = render(
      <Sidebar>
        <RosterList
          people={PEOPLE}
          selectedPersonId={null}
          onSelect={() => {}}
          onCreate={async () => {}}
          onRename={async () => {}}
          onDelete={async () => {}}
        />
      </Sidebar>,
    );
    expect(await violations(container)).toEqual([]);
  });

  it("ChoreForm (create mode) has no axe violations", async () => {
    const { container, baseElement } = render(
      <ChoreForm
        initial={{ date: "2026-05-10" }}
        people={PEOPLE}
        onSubmit={async () => {}}
        onClose={() => {}}
      />,
    );
    // Dialog is portaled to document.body; pass the baseElement to scan it.
    expect(await violations(baseElement)).toEqual([]);
    expect(container).toBeTruthy();
  });

  it("ChoreForm (edit mode) has no axe violations", async () => {
    const { baseElement } = render(
      <ChoreForm
        initial={{
          id: "00000000-0000-7000-8000-000000000099",
          title: "Vacuum",
          assigneeId: PEOPLE[0]!.id,
          date: "2026-05-10",
        }}
        people={PEOPLE}
        onSubmit={async () => {}}
        onDelete={async () => {}}
        onClose={() => {}}
      />,
    );
    expect(await violations(baseElement)).toEqual([]);
  });
});
