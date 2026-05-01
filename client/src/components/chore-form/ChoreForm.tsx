import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { Chore, Person } from "@office-chores/shared";
import { ChoreCreateSchema } from "@office-chores/shared";
import { cn } from "@/lib/cn";

export interface ChoreFormInitial {
  /** Existing chore id when editing; undefined when creating. */
  id?: string;
  title?: string;
  assigneeId?: string;
  date: string;
}

interface Props {
  initial: ChoreFormInitial;
  people: Person[];
  onSubmit: (values: { title: string; assigneeId: string; date: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onClose: () => void;
}

interface FieldErrors {
  title?: string;
  assigneeId?: string;
  date?: string;
  form?: string;
}

export function ChoreForm({ initial, people, onSubmit, onDelete, onClose }: Props) {
  const isEdit = Boolean(initial.id);
  const [title, setTitle] = useState(initial.title ?? "");
  const [assigneeId, setAssigneeId] = useState(
    initial.assigneeId ?? (people[0]?.id ?? ""),
  );
  const [date, setDate] = useState(initial.date);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = ChoreCreateSchema.safeParse({ title, assigneeId, date });
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "title") fieldErrors.title = issue.message;
        else if (key === "assigneeId") fieldErrors.assigneeId = issue.message;
        else if (key === "date") fieldErrors.date = issue.message;
      }
      if (!title.trim()) fieldErrors.title = "Title is required";
      if (!assigneeId) fieldErrors.assigneeId = "Assignee is required";
      if (!date) fieldErrors.date = "Date is required";
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
      onClose();
    } catch (err) {
      setErrors({ form: (err as Error).message });
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!initial.id || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete(initial.id);
      onClose();
    } catch (err) {
      setErrors({ form: (err as Error).message });
      setSubmitting(false);
    }
  }

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chore-form-title"
        className="w-full max-w-sm border bg-[var(--color-bg-elev)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="chore-form-title" className="mb-4 text-sm font-medium tracking-tight">
          {isEdit ? "Edit chore" : "New chore"}
        </h2>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <Field label="Title" error={errors.title} htmlFor="chore-title">
            <input
              id="chore-title"
              ref={titleInputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className={fieldClass}
              data-testid="chore-form-title"
            />
          </Field>
          <Field label="Assignee" error={errors.assigneeId} htmlFor="chore-assignee">
            <select
              id="chore-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className={fieldClass}
              data-testid="chore-form-assignee"
            >
              <option value="" disabled>
                Select…
              </option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date" error={errors.date} htmlFor="chore-date">
            <input
              id="chore-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
              data-testid="chore-form-date"
            />
          </Field>
          {errors.form && (
            <p role="alert" className="text-xs text-red-500">
              {errors.form}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              {isEdit && onDelete && !confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  data-testid="chore-form-delete"
                  className="h-8 rounded-sm border px-3 text-xs text-red-500 hover:bg-[var(--color-bg)]"
                >
                  Delete
                </button>
              )}
              {confirmDelete && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--color-fg-muted)]">Are you sure?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    data-testid="chore-form-delete-cancel"
                    className="h-8 rounded-sm border px-2 hover:bg-[var(--color-bg)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    data-testid="chore-form-delete-confirm"
                    disabled={submitting}
                    className="h-8 rounded-sm border bg-red-600 px-2 text-white disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-8 rounded-sm border px-3 text-xs hover:bg-[var(--color-bg)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="chore-form-submit"
                className="h-8 rounded-sm border bg-[var(--color-fg)] px-3 text-xs text-[var(--color-bg)] disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

const fieldClass = cn(
  "h-8 w-full rounded-sm border bg-transparent px-2 text-sm",
  "focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]",
);

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-xs text-[var(--color-fg-muted)]">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[11px] text-red-500" data-testid={`error-${htmlFor}`}>
          {error}
        </p>
      )}
    </div>
  );
}
