# REST API Contract — Office Chores Calendar (Phase 1)

**Base URL**: `http://127.0.0.1:8787` (server binds to localhost only — FR-022).
**Content type**: `application/json; charset=utf-8` for all bodies.
**Auth**: none (Phase 1; FR-022 plus Assumptions).
**Error envelope** (any non-2xx): `{ "code": string, "message": string,
"details"?: object }`.

All schemas referenced below are defined in `/shared/src/*.ts` (zod) and
documented in `data-model.md`.

---

## People

### `GET /api/people`

List all people in the roster, sorted by `name` ascending (case-insensitive).

- **200 OK**: `Person[]`

### `POST /api/people`

Add a new person.

- **Request**: `PersonCreate` — `{ "name": string }`.
- **201 Created**: `Person`.
- **400 Bad Request**: `code: "validation_error"` — name length out of range
  or whitespace-only.
- **409 Conflict**: `code: "name_taken"` — case-insensitive duplicate of an
  existing name.

### `PATCH /api/people/:id`

Rename an existing person.

- **Request**: `PersonUpdate` — `{ "name": string }`.
- **200 OK**: `Person`.
- **400 Bad Request**: `code: "validation_error"`.
- **404 Not Found**: `code: "person_not_found"`.
- **409 Conflict**: `code: "name_taken"`.

### `DELETE /api/people/:id`

Remove a person.

- **204 No Content** on success.
- **404 Not Found**: `code: "person_not_found"`.
- **409 Conflict**: `code: "person_has_chores"` — FR-013. The response body
  includes `details: { choreCount: number }` so the client can surface a precise
  message ("Reassign or delete N chore(s) first").

---

## Chores

### `GET /api/chores`

List chores within a date range, optionally filtered by assignee.

- **Query parameters**:
  - `from` (required): inclusive start, `YYYY-MM-DD`.
  - `to` (required): inclusive end, `YYYY-MM-DD`. Must satisfy `from <= to` and
    `to - from <= 92` days (max one quarter per request — keeps payloads bounded).
  - `assigneeId` (optional): UUID. Filters to that person only (FR-005a).
- **200 OK**: `Chore[]` ordered by `(date asc, created_at asc)`.
- **400 Bad Request**: `code: "validation_error"` — bad date format, inverted
  range, or range too wide.

### `POST /api/chores`

Create a chore.

- **Request**: `ChoreCreate` — `{ "title": string, "assigneeId": string,
  "date": "YYYY-MM-DD" }`.
- **201 Created**: `Chore` (with `done: false`).
- **400 Bad Request**: `code: "validation_error"` — title or date format invalid.
- **422 Unprocessable Entity**: `code: "assignee_not_found"`.

### `GET /api/chores/:id`

Fetch a single chore.

- **200 OK**: `Chore`.
- **404 Not Found**: `code: "chore_not_found"`.

### `PATCH /api/chores/:id`

Edit any field, including `done`. Used by the edit form (FR-008), the
drag-to-reschedule drop handler (FR-010 — sends `{ date }`), and the
calendar's done toggle (FR-009a — sends `{ done }`).

- **Request**: `ChoreUpdate` — any non-empty subset of `{ "title", "assigneeId",
  "date", "done" }`. Empty body → 400.
- **200 OK**: `Chore` (with refreshed `updatedAt`).
- **400 Bad Request**: `code: "validation_error"`.
- **404 Not Found**: `code: "chore_not_found"`.
- **422 Unprocessable Entity**: `code: "assignee_not_found"`.

### `DELETE /api/chores/:id`

Delete a chore (FR-009).

- **204 No Content** on success.
- **404 Not Found**: `code: "chore_not_found"`.

---

## Health

### `GET /api/health`

Liveness probe used by the dev start script and integration tests.

- **200 OK**: `{ "status": "ok" }`.

---

## Latency budgets (constitution IV)

| Endpoint                       | p95 budget |
|--------------------------------|------------|
| `GET /api/health`              | < 50 ms    |
| `GET /api/people`              | < 100 ms   |
| `GET /api/chores?from&to[...]` | < 300 ms   |
| `POST/PATCH/DELETE` (any)      | < 500 ms   |

Budgets are asserted in integration tests against the in-memory SQLite (where
they should be met by orders of magnitude); a future deployment phase will
re-assert them on real hardware.

## Phase 2 forward-compatibility note

The Phase 2 WebSocket channel will publish events with names matching the
mutating endpoints (`chore.created`, `chore.updated`, `chore.deleted`,
`person.created`, `person.updated`, `person.deleted`) and a payload that is the
same `Chore` / `Person` shape returned by the REST handlers. Today, every
mutating route emits these events to an in-process bus
(`server/src/events/bus.ts`); only the listener is missing. The client store
already applies REST responses to its in-memory state, so the eventual swap is
"subscribe to bus events, route them through the same store mutations" — no
component or schema change required.
