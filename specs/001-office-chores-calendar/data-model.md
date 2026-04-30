# Phase 1 Data Model: Office Chores Calendar

## Entities

### Person

A member of the office roster.

| Field        | Type      | Constraints                                              |
|--------------|-----------|----------------------------------------------------------|
| `id`         | TEXT      | PRIMARY KEY (UUID v7).                                   |
| `name`       | TEXT      | NOT NULL, length 1–60. Unique on `LOWER(name)`.          |
| `created_at` | TEXT      | NOT NULL, ISO 8601 UTC timestamp. Default `CURRENT_TIMESTAMP`. |

**Validation rules** (zod, in `/shared/src/person.ts`):

- `name`: trimmed, 1–60 chars, no leading/trailing whitespace.
- Uniqueness on case-folded name is enforced by the DB unique index, surfaced as
  a 409 Conflict with a `code: "name_taken"` error body (FR-011a).

**Lifecycle**:

- *Create* (POST /api/people): inserts a new row.
- *Rename* (PATCH /api/people/:id): updates `name` if the new case-folded value
  is not in use by a different row.
- *Delete* (DELETE /api/people/:id): blocked while any chore references this
  person — see "Referential integrity" below (FR-013).

### Chore

A unit of work scheduled on a calendar date and assigned to one person.

| Field         | Type      | Constraints                                                       |
|---------------|-----------|-------------------------------------------------------------------|
| `id`          | TEXT      | PRIMARY KEY (UUID v7).                                            |
| `title`       | TEXT      | NOT NULL, length 1–120, single line (no `\n`/`\r`). (FR-007)      |
| `assignee_id` | TEXT      | NOT NULL, REFERENCES `person(id)` ON DELETE RESTRICT.             |
| `date`        | TEXT      | NOT NULL, exact format `YYYY-MM-DD` (CHECK constraint).           |
| `done`        | INTEGER   | NOT NULL, 0 or 1, default 0. (FR-009a)                            |
| `created_at`  | TEXT      | NOT NULL, ISO 8601 UTC, default `CURRENT_TIMESTAMP`.              |
| `updated_at`  | TEXT      | NOT NULL, ISO 8601 UTC, default `CURRENT_TIMESTAMP`.              |

**Validation rules** (zod, in `/shared/src/chore.ts`):

- `title`: trimmed, 1–120, no newline characters.
- `date`: exact `^\d{4}-\d{2}-\d{2}$` and a real calendar date.
- `assignee_id`: must be an existing `person.id`; FK violation → 422.
- `done`: boolean.

**State**:

- The only mutable booleans/states are `done` (toggle from calendar — FR-009a) and
  the value of any other field via the edit form (FR-008). All transitions are
  symmetric (done ↔ not done). No archived state.

## Relationships

```text
person (1) ────< chore (N)
       FK: chore.assignee_id → person.id
       ON DELETE RESTRICT (FR-013)
```

A chore has exactly one assignee. A person has zero or more chores. The RESTRICT
rule is the database-level enforcement of FR-013 ("block removal of a person who
has any chores assigned"). The route layer additionally produces a 409 Conflict
with `code: "person_has_chores"` rather than letting the bare SQL error bubble.

## Indexes

| Index                                         | Purpose                                        |
|-----------------------------------------------|------------------------------------------------|
| `UNIQUE INDEX person_name_ci ON person(LOWER(name))` | FR-011a uniqueness rule (case-insensitive). |
| `INDEX chore_date_assignee ON chore(date, assignee_id)` | Hot path: `GET /api/chores?from&to[&assigneeId]` (filtered month view). |
| `INDEX chore_assignee ON chore(assignee_id)`        | RESTRICT lookup on person delete; person filter without date range. |

The composite `chore_date_assignee` index satisfies both the unfiltered month
query (range scan on `date`) and the filtered query (range scan on `date` then
filter on `assignee_id`).

## Schema (SQL)

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS person (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS person_name_ci ON person (LOWER(name));

CREATE TABLE IF NOT EXISTS chore (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  assignee_id  TEXT NOT NULL REFERENCES person(id) ON DELETE RESTRICT,
  date         TEXT NOT NULL CHECK (date GLOB '????-??-??'),
  done         INTEGER NOT NULL DEFAULT 0 CHECK (done IN (0, 1)),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS chore_date_assignee ON chore (date, assignee_id);
CREATE INDEX IF NOT EXISTS chore_assignee      ON chore (assignee_id);

CREATE TRIGGER IF NOT EXISTS chore_touch_updated_at
AFTER UPDATE ON chore
FOR EACH ROW
WHEN OLD.updated_at = NEW.updated_at
BEGIN
  UPDATE chore SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = NEW.id;
END;
```

## Seeding (FR-015)

On server startup, if the `person` table is empty, insert 6 placeholder rows:
`Alex`, `Bea`, `Chen`, `Dani`, `Ezra`, `Farah`. The seed runs idempotently —
once any row exists in `person`, the seeder is a no-op.

## Wire Shapes (zod → TS)

These types live in `/shared/src/` and are imported by both packages:

```ts
// /shared/src/person.ts
export const PersonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(60),
  createdAt: z.string().datetime(),
});
export type Person = z.infer<typeof PersonSchema>;

export const PersonCreateSchema = z.object({
  name: z.string().trim().min(1).max(60),
});
export const PersonUpdateSchema = PersonCreateSchema;

// /shared/src/chore.ts
export const ChoreSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120).regex(/^[^\n\r]+$/),
  assigneeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  done: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Chore = z.infer<typeof ChoreSchema>;

export const ChoreCreateSchema = ChoreSchema.pick({
  title: true, assigneeId: true, date: true,
});
export const ChoreUpdateSchema = ChoreCreateSchema.partial().extend({
  done: z.boolean().optional(),
});
```

Wire format uses camelCase JSON; the repo layer maps to/from the snake_case DB
columns in one place (`server/src/repos/*.ts`).
