import type { Person } from "@office-chores/shared";

interface Props {
  people: Person[];
}

export function RosterList({ people }: Props) {
  if (people.length === 0) {
    return (
      <p className="text-xs text-[var(--color-fg-muted)]">
        No people yet. Adding people will land in User Story 5.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {people.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-[var(--color-bg)]"
        >
          <span>{p.name}</span>
        </li>
      ))}
    </ul>
  );
}
