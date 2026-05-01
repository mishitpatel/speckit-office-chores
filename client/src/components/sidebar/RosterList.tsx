import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import type { Person } from "@office-chores/shared";
import { cn } from "@/lib/cn";

interface Props {
  people: Person[];
  selectedPersonId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: (name: string) => Promise<unknown>;
  onRename: (id: string, name: string) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

export function RosterList({
  people,
  selectedPersonId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    try {
      await onCreate(name);
      setNewName("");
      setAdding(false);
    } catch {
      /* toast surfaced by store */
    }
  }

  async function handleRename(id: string) {
    const name = editName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    try {
      await onRename(id, name);
      setEditingId(null);
    } catch {
      /* toast surfaced by store */
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        data-testid="roster-all"
        aria-pressed={selectedPersonId === null}
        className={cn(
          "flex items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-[var(--color-bg)]",
          selectedPersonId === null && "bg-[var(--color-bg)] font-medium",
        )}
      >
        <span>All</span>
      </button>
      <ul className="flex flex-col gap-0.5">
        {people.map((p) => {
          const isEditing = editingId === p.id;
          const isSelected = selectedPersonId === p.id;
          return (
            <li
              key={p.id}
              data-testid="roster-item"
              data-person-id={p.id}
              className={cn(
                "group flex items-center gap-1 rounded-sm px-2 py-1 text-sm hover:bg-[var(--color-bg)]",
                isSelected && "bg-[var(--color-bg)] font-medium",
              )}
            >
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleRename(p.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    data-testid="roster-rename-input"
                    className="h-6 flex-1 border bg-transparent px-1 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleRename(p.id)}
                    aria-label="Save name"
                    data-testid="roster-rename-save"
                    className="inline-flex h-5 w-5 items-center justify-center"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel rename"
                    data-testid="roster-rename-cancel"
                    className="inline-flex h-5 w-5 items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelect(isSelected ? null : p.id)}
                    aria-pressed={isSelected}
                    data-testid="roster-person-name"
                    className="flex-1 truncate text-left"
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditName(p.name);
                    }}
                    aria-label={`Rename ${p.name}`}
                    data-testid="roster-rename"
                    className="inline-flex h-5 w-5 items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(p.id)}
                    aria-label={`Remove ${p.name}`}
                    data-testid="roster-delete"
                    className="inline-flex h-5 w-5 items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-1">
        {adding ? (
          <form onSubmit={handleAdd} className="flex items-center gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setAdding(false);
                  setNewName("");
                }
              }}
              placeholder="Name"
              maxLength={60}
              data-testid="roster-add-input"
              className="h-7 flex-1 border bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <button
              type="submit"
              data-testid="roster-add-submit"
              className="h-7 rounded-sm border px-2 text-xs hover:bg-[var(--color-bg)]"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            data-testid="roster-add-open"
            className="flex w-full items-center gap-1 rounded-sm px-2 py-1 text-xs text-[var(--color-fg-muted)] hover:bg-[var(--color-bg)]"
          >
            <Plus className="h-3 w-3" /> Add person
          </button>
        )}
      </div>
    </div>
  );
}
