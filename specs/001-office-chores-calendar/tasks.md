---

description: "Task list for Office Chores Calendar (Phase 1 POC)"
---

# Tasks: Office Chores Calendar (Phase 1 POC)

**Input**: Design documents from `/specs/001-office-chores-calendar/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/rest-api.md, quickstart.md

**Tests**: Tests are REQUIRED for this project. The constitution (Principle II — Testing
Standards, NON-NEGOTIABLE) mandates automated tests written alongside implementation,
≥80% line coverage on new modules, and Supertest integration tests on every REST
endpoint. Test tasks are therefore inlined per user story, not optional.

**Organization**: Tasks are grouped by user story (US1–US6 from spec.md) so each story
can be implemented and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Different file, no in-flight dependency — parallelizable.
- **[Story]**: User-story label (US1–US6) for traceability. Setup, Foundational, and
  Polish tasks have no story label.
- File paths are explicit on every implementation task.

## Path Conventions

Repo layout (per plan.md):

```text
client/   # Vite + React + TS SPA
server/   # Node + Express + better-sqlite3 REST API
shared/   # Cross-package zod schemas + TS types
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Workspace scaffolding, tooling, and CI plumbing.

- [X] T001 Initialize npm workspaces at repo root in `package.json` (workspaces: `client`, `server`, `shared`; add root scripts `check`, `test`, `build`)
- [X] T002 [P] Add repo `.gitignore` (entries: `node_modules`, `dist`, `coverage`, `server/data/*.sqlite*`, `.env.local`, `client/playwright-report`)
- [X] T003 [P] Create `tsconfig.base.json` at repo root with `"strict": true`, `"target": "ES2022"`, `"module": "NodeNext"`
- [X] T004 [P] Add `eslint.config.js` and `.prettierrc` at repo root (typescript-eslint flat config; consistent rules across workspaces)
- [X] T005 [P] Initialize shared package: `shared/package.json`, `shared/tsconfig.json`, empty `shared/src/index.ts`
- [X] T006 [P] Initialize server package: `server/package.json` (Express 4, better-sqlite3, zod, pino), `server/tsconfig.json`, `server/vitest.config.ts` (node env, v8 coverage)
- [X] T007 [P] Initialize client package: `client/package.json` (Vite 5, React 19, react-dom, TypeScript 5.6), `client/tsconfig.json`, `client/vite.config.ts`
- [X] T008 [P] Configure Tailwind v4 in `client/tailwind.config.ts` and add `@tailwindcss/vite` plugin to `client/vite.config.ts`
- [X] T009 [P] Initialize shadcn/ui: `client/components.json` with `style: "new-york"`, `baseColor: "neutral"`
- [X] T010 [P] Add `client/vitest.config.ts` (jsdom env, v8 coverage, setupFiles for testing-library)
- [X] T011 [P] Add `client/playwright.config.ts` for the demo smoke (Chromium only)
- [X] T012 [P] Add GitHub Actions workflow `.github/workflows/ci.yml` running `npm ci`, `npm run check`, `npm test`, `npm run build`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be
implemented — shared schemas, DB plumbing, server app shell, client layout shell.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Shared schemas

- [X] T013 [P] Define Person zod schemas (`PersonSchema`, `PersonCreateSchema`, `PersonUpdateSchema`) in `shared/src/person.ts`
- [X] T014 [P] Define Chore zod schemas (`ChoreSchema`, `ChoreCreateSchema`, `ChoreUpdateSchema`) in `shared/src/chore.ts`
- [X] T015 [P] Define error envelope and shared API helper types in `shared/src/api.ts`
- [X] T016 Re-export every schema/type from `shared/src/index.ts`

### Server infrastructure

- [X] T017 Author full schema and indexes (per data-model.md) in `server/src/db/schema.sql`
- [X] T018 Create better-sqlite3 connection helper (WAL mode, FK pragma) in `server/src/db/index.ts`
- [X] T019 Create idempotent migration runner that exec()s `schema.sql` in `server/src/db/migrate.ts`
- [X] T020 Create idempotent seed routine inserting 6 placeholder names when roster is empty in `server/src/lib/seed.ts`
- [X] T021 Create typed in-process event bus (EventEmitter; events: `chore.created` / `chore.updated` / `chore.deleted` / `person.created` / `person.updated` / `person.deleted`) in `server/src/events/bus.ts`
- [X] T022 Create Express app factory (json middleware, request logger via pino, central error handler returning `{code, message, details?}`, `GET /api/health`) in `server/src/app.ts`
- [X] T023 Create server entry point (boots app, runs migrate + seed, listens on `127.0.0.1:8787` per FR-022) in `server/src/index.ts`
- [X] T024 [P] Server unit test: migration runs idempotently in `server/tests/unit/migrate.test.ts`
- [X] T025 [P] Server unit test: seed inserts 6 rows on empty DB and is no-op when populated in `server/tests/unit/seed.test.ts`
- [X] T026 [P] Server integration test: `GET /api/health` returns 200 in `server/tests/integration/health.test.ts`

### Client infrastructure

- [X] T027 [P] Author dark+light token layer (1px borders, no shadows, near-black `#0d0d0d`/`#171717`, off-white `#fafafa`, single muted accent) in `client/src/styles/theme.css`
- [X] T028 [P] Add base resets and Geist Sans font import via `geist/font/sans` in `client/src/styles/globals.css`
- [X] T029 [P] Add FOUC-safe inline theme bootstrap script in `client/index.html` (reads `localStorage["theme"]`, falls back to `prefers-color-scheme`, sets `class="dark"` on `<html>` before React mounts)
- [X] T030 [P] Implement `useTheme` hook (get/set/toggle, writes localStorage, listens to system change) in `client/src/hooks/useTheme.ts`
- [X] T031 [P] Implement typed fetch wrapper (parses error envelope from shared, surfaces typed responses via shared schemas) in `client/src/lib/api.ts`
- [X] T032 [P] Implement date helpers (`monthMatrix`, `formatYmd`, `isToday`, `addMonths` via date-fns) in `client/src/lib/dates.ts`
- [X] T033 [P] Add Zustand and create store skeletons (`client/src/store/people.ts`, `client/src/store/chores.ts`, `client/src/store/filter.ts`) with mutation handlers shaped to accept either REST responses or future server-pushed events
- [X] T034 [P] Add shadcn/ui base components (`button`, `input`, `label`, `dialog`, `select`, `popover`, `calendar`, `tooltip`, `dropdown-menu`, `separator`, `sonner`) into `client/src/components/ui/`
- [X] T035 Implement layout shell (header + collapsible sidebar + main calendar area) in `client/src/App.tsx`
- [X] T036 Implement header skeleton with theme toggle in `client/src/components/header/Header.tsx`
- [X] T037 Implement sidebar chrome with collapse persistence (localStorage; FR-005) in `client/src/components/sidebar/Sidebar.tsx`
- [X] T038 Wire `App` and global styles in `client/src/main.tsx`
- [X] T039 [P] Client unit test: `useTheme` defaults, persists, toggles in `client/tests/unit/useTheme.test.ts`
- [X] T040 [P] Client unit test: date helpers (month matrix shape, isToday) in `client/tests/unit/dates.test.ts`
- [X] T041 [P] Client unit test: theme bootstrap sets `dark` class synchronously in `client/tests/unit/themeBootstrap.test.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — View office chores on a monthly calendar (Priority: P1) 🎯 MVP

**Goal**: Open the app and immediately see the current month with every chore on its
assigned date and the assignee visible. Navigate between months without a reload.

**Independent Test**: Seed at least one chore on today's date in the SQLite file,
start client + server, open `http://localhost:5173` — current month is shown with the
chore on today's cell rendering its title and assignee.

### Server (read paths)

- [X] T042 [P] [US1] Add `list()` method (alphabetical by `LOWER(name)`) to `server/src/repos/people.ts`
- [X] T043 [P] [US1] Add `listByDateRange({from, to, assigneeId?})` method using `chore_date_assignee` index to `server/src/repos/chores.ts`
- [X] T044 [P] [US1] Server route: `GET /api/people` in `server/src/routes/people.ts`
- [X] T045 [P] [US1] Server route: `GET /api/chores?from&to[&assigneeId]` (validates date format, range ≤92 days, ordering by `(date, created_at)`) in `server/src/routes/chores.ts`
- [X] T046 [US1] Wire the new routes into `server/src/app.ts`
- [X] T047 [P] [US1] Server unit test: people repo `list()` returns case-insensitive alphabetical order in `server/tests/unit/people.repo.list.test.ts`
- [X] T048 [P] [US1] Server unit test: chores repo `listByDateRange()` respects date range and `assigneeId` filter in `server/tests/unit/chores.repo.list.test.ts`
- [X] T049 [P] [US1] Server integration test: `GET /api/people` 200 + body matches `Person[]` in `server/tests/integration/people.list.test.ts`
- [X] T050 [P] [US1] Server integration test: `GET /api/chores?from&to` 200 happy path; 400 on inverted range; 400 on >92-day range in `server/tests/integration/chores.list.test.ts`

### Client (calendar + sidebar render)

- [X] T051 [US1] Implement `loadAll()` action backed by `GET /api/people` in `client/src/store/people.ts`
- [X] T052 [US1] Implement `loadMonth(monthDate)` action backed by `GET /api/chores?from&to` (with current-filter `assigneeId` if set) in `client/src/store/chores.ts`
- [X] T053 [P] [US1] Implement `MonthGrid` component (Tailwind grid, 6×7 cells, weekday header) in `client/src/components/calendar/MonthGrid.tsx`
- [X] T054 [P] [US1] Implement `DayCell` component (date number, today indicator, chore list, "+N more" overflow at >25) in `client/src/components/calendar/DayCell.tsx`
- [X] T055 [P] [US1] Implement `ChoreChip` component (title + assignee; `done` muted/struck variant — visual ready, toggle wired in US3) in `client/src/components/calendar/ChoreChip.tsx`
- [X] T056 [US1] Implement `MonthNav` (prev/next/Today) inside header in `client/src/components/header/MonthNav.tsx`
- [X] T057 [US1] Implement read-only `RosterList` in `client/src/components/sidebar/RosterList.tsx` (interactivity added in US5/US6)
- [X] T058 [US1] Wire `App.tsx` to load people + chores for the visible month and render `MonthGrid`
- [X] T059 [P] [US1] Client unit test: `MonthGrid` renders 42 cells for any month start in `client/tests/unit/MonthGrid.test.tsx`
- [X] T060 [P] [US1] Client unit test: `DayCell` shows today indicator, lists chores, renders "+N more" at >25 in `client/tests/unit/DayCell.test.tsx`
- [X] T061 [P] [US1] Client unit test: `ChoreChip` honors `done` styling in `client/tests/unit/ChoreChip.test.tsx`
- [X] T062 [P] [US1] Client a11y assertion (axe-core) for the home view in `client/tests/unit/a11y.home.test.tsx`

**Checkpoint**: US1 functional. App opens, shows the current month with chores, navigates
between months. This is the MVP.

---

## Phase 4: User Story 2 — Create a chore on a chosen date (Priority: P1)

**Goal**: Click any day cell, fill in title + assignee, save — the chore appears
immediately and persists across reloads.

**Independent Test**: From a fresh calendar view, click an empty future day, enter
"Empty the dishwasher" + pick *Alex*, save — the chore is on that day; reload → still there.

### Server

- [X] T063 [US2] Add `create({title, assigneeId, date})` (returns inserted row, emits `chore.created` on the bus, FK violation → typed `AssigneeNotFoundError`) to `server/src/repos/chores.ts`
- [X] T064 [US2] Server route: `POST /api/chores` (parses `ChoreCreateSchema`; 400 on validation error; 422 on assignee FK miss) in `server/src/routes/chores.ts`
- [X] T065 [P] [US2] Server unit test: chores repo `create()` inserts the row and emits `chore.created` in `server/tests/unit/chores.repo.create.test.ts`
- [X] T066 [P] [US2] Server integration test: `POST /api/chores` 201 happy path; 400 on bad title (empty / >120 chars / contains newline); 422 on missing assignee in `server/tests/integration/chores.create.test.ts`

### Client

- [X] T067 [US2] Add optimistic `createChore(input)` action with rollback on error to `client/src/store/chores.ts`
- [X] T068 [US2] Implement `ChoreForm` create mode (shadcn `Dialog` + `Calendar` + `Input` + `Select`; date pre-fillable from `DayCell` click; required-field errors; disabled-save-while-pending) in `client/src/components/chore-form/ChoreForm.tsx`
- [X] T069 [US2] Update `DayCell` click handler to open `ChoreForm` with that date pre-filled in `client/src/components/calendar/DayCell.tsx`
- [X] T070 [P] [US2] Client unit test: `ChoreForm` rejects empty title and missing assignee with explicit error messages in `client/tests/unit/ChoreForm.create.test.tsx`
- [X] T071 [P] [US2] Client component-integration test: clicking a `DayCell`, filling the form, saving causes the chore to appear on the calendar (mocked fetch) in `client/tests/unit/createChore.flow.test.tsx`

**Checkpoint**: Combined US1 + US2 form a usable MVP — anyone can view and add chores.

---

## Phase 5: User Story 3 — Edit or delete an existing chore (Priority: P2)

**Goal**: Click a chore → edit any field, save; or click delete → confirm. Done toggle
also lives here (PATCH on `done`).

**Independent Test**: Click an existing chore — form pre-fills; change the title and save → calendar
updates; click delete + confirm → chore is gone. Toggle done from the chip — chip
becomes muted/struck.

### Server

- [X] T072 [P] [US3] Add `getById(id)` to `server/src/repos/chores.ts`
- [X] T073 [P] [US3] Add `update(id, partial)` (emits `chore.updated`; not-found → `ChoreNotFoundError`; FK miss → `AssigneeNotFoundError`) to `server/src/repos/chores.ts`
- [X] T074 [P] [US3] Add `delete(id)` (emits `chore.deleted`; not-found → `ChoreNotFoundError`) to `server/src/repos/chores.ts`
- [X] T075 [US3] Server routes: `GET /api/chores/:id`, `PATCH /api/chores/:id` (parses `ChoreUpdateSchema`; rejects empty body 400), `DELETE /api/chores/:id` in `server/src/routes/chores.ts`
- [X] T076 [P] [US3] Server unit test: chores repo `update`/`delete` mutate row and emit the correct bus event in `server/tests/unit/chores.repo.mutate.test.ts`
- [X] T077 [P] [US3] Server integration test: `PATCH /api/chores/:id` 200 partial / 400 empty body / 404 not-found / 422 bad assignee in `server/tests/integration/chores.patch.test.ts`
- [X] T078 [P] [US3] Server integration test: `DELETE /api/chores/:id` 204 success / 404 not-found in `server/tests/integration/chores.delete.test.ts`
- [X] T079 [P] [US3] Server integration test: `GET /api/chores/:id` 200 / 404 in `server/tests/integration/chores.get.test.ts`

### Client

- [X] T080 [US3] Add optimistic `updateChore(id, patch)` and `deleteChore(id)` actions with rollback + Sonner error toast (FR-020) to `client/src/store/chores.ts`
- [X] T081 [US3] Extend `ChoreForm` with edit + delete modes (loads current values; Save → PATCH; Delete → confirm dialog → DELETE) in `client/src/components/chore-form/ChoreForm.tsx`
- [X] T082 [US3] Make `ChoreChip` body click open the edit form, and add a separate done-toggle affordance (checkbox icon, click-stops-propagation; PATCH `{done}`) in `client/src/components/calendar/ChoreChip.tsx`
- [X] T083 [US3] Update `DayCell` to render done chores in muted/struck style (FR-009b) in `client/src/components/calendar/DayCell.tsx`
- [X] T084 [P] [US3] Client unit test: `ChoreForm` edit mode pre-fills and PATCHes only changed fields in `client/tests/unit/ChoreForm.edit.test.tsx`
- [X] T085 [P] [US3] Client unit test: delete confirmation blocks accidental deletion (cancel keeps chore) in `client/tests/unit/ChoreForm.delete.test.tsx`
- [X] T086 [P] [US3] Client unit test: done toggle dispatches PATCH and updates UI immediately in `client/tests/unit/ChoreChip.done.test.tsx`
- [X] T087 [P] [US3] Client unit test: failing PATCH/DELETE reverts optimistic state and surfaces toast in `client/tests/unit/error.revert.test.tsx`

**Checkpoint**: Full chore CRUD via the calendar, including done state.

---

## Phase 6: User Story 4 — Drag a chore to reschedule (Priority: P2)

**Goal**: Drag a chore from one date to another. The move persists. Keyboard drag also
works (FR-018, SC-008). No new server endpoints — uses `PATCH /api/chores/:id` from US3.

**Independent Test**: Drag a chore from date A to date B → it appears on B and is gone
from A; reload — still on B. Pick up via keyboard, navigate, drop — same result.

- [X] T088 [US4] Install `@dnd-kit/core` and configure `DndContext` with `PointerSensor` + `KeyboardSensor` in `client/src/App.tsx`
- [X] T089 [US4] Make `ChoreChip` draggable via `useDraggable` (with appropriate `aria-grabbed`) in `client/src/components/calendar/ChoreChip.tsx`
- [X] T090 [US4] Make `DayCell` a drop target via `useDroppable` (aria-label includes the cell's date) in `client/src/components/calendar/DayCell.tsx`
- [X] T091 [US4] Wire `onDragEnd` to apply optimistic store update + dispatch PATCH; revert on error (toast) in `client/src/App.tsx`
- [X] T092 [P] [US4] Client unit test: drag from date A to date B updates store and dispatches PATCH `{date: B}`; drop on same cell does nothing in `client/tests/unit/dragReschedule.test.tsx`
- [X] T093 [P] [US4] Client unit test: drop outside any droppable cancels the drag (no PATCH) in `client/tests/unit/dragReschedule.cancel.test.tsx`
- [X] T094 [P] [US4] Client unit test: keyboard reschedule path (pick up → arrow keys → enter to drop) succeeds in `client/tests/unit/dragReschedule.keyboard.test.tsx`

**Checkpoint**: Full chore lifecycle (US1+US2+US3+US4) — view, create, edit, done, delete, drag.

---

## Phase 7: User Story 5 — Manage the office roster (Priority: P2)

**Goal**: Add, rename, and remove people in the sidebar. Removal is blocked while any
chore (done or not) references the person (FR-013).

**Independent Test**: Add "Greta" via the sidebar — she appears and is selectable as
an assignee. Rename "Alex" to "Alexandra" → name updates everywhere. Try to delete a
person with chores — blocked with a clear message.

### Server

- [X] T095 [P] [US5] Add `create({name})` with case-insensitive uniqueness (uses `person_name_ci`; surfaces `NameTakenError` on conflict) to `server/src/repos/people.ts`
- [X] T096 [P] [US5] Add `rename(id, name)` (404 `PersonNotFoundError`; 409 `NameTakenError`; emits `person.updated`) to `server/src/repos/people.ts`
- [X] T097 [P] [US5] Add `delete(id)` (counts referencing chores; throws `PersonHasChoresError` with `choreCount` if any; otherwise emits `person.deleted`) to `server/src/repos/people.ts`
- [X] T098 [US5] Server routes: `POST /api/people`, `PATCH /api/people/:id`, `DELETE /api/people/:id` (maps typed errors to 400/404/409 with the contract envelope) in `server/src/routes/people.ts`
- [X] T099 [P] [US5] Server unit test: people repo `create` / `rename` / `delete` (incl. uniqueness and chore-blocked delete) in `server/tests/unit/people.repo.mutate.test.ts`
- [X] T100 [P] [US5] Server integration test: `POST /api/people` 201 / 400 / 409 in `server/tests/integration/people.create.test.ts`
- [X] T101 [P] [US5] Server integration test: `PATCH /api/people/:id` 200 / 404 / 409 in `server/tests/integration/people.patch.test.ts`
- [X] T102 [P] [US5] Server integration test: `DELETE /api/people/:id` 204 success / 404 / 409 with `details: { choreCount }` in `server/tests/integration/people.delete.test.ts`

### Client

- [X] T103 [US5] Add `createPerson`, `renamePerson`, `deletePerson` actions to `client/src/store/people.ts` (optimistic where safe; surfaces 409 toast)
- [X] T104 [US5] Extend `RosterList` with inline-add input, click-to-rename inline edit, hover delete-with-confirm in `client/src/components/sidebar/RosterList.tsx`
- [X] T105 [P] [US5] Client unit test: add-person flow (success + 409 surfaces toast) in `client/tests/unit/RosterList.add.test.tsx`
- [X] T106 [P] [US5] Client unit test: rename-person flow (success + 409 conflict) in `client/tests/unit/RosterList.rename.test.tsx`
- [X] T107 [P] [US5] Client unit test: delete-person blocked when chores exist (409 with `choreCount` shown in toast) in `client/tests/unit/RosterList.delete.test.tsx`

**Checkpoint**: Roster fully manageable; chore form's assignee picker stays in sync.

---

## Phase 8: User Story 6 — Filter the calendar by person (Priority: P2)

**Goal**: Click a person in the sidebar → calendar filters to that person. Click "All"
or the same person again to clear. State persists across reloads (FR-005b). No new
server endpoints — `GET /api/chores` already accepts `assigneeId`.

**Independent Test**: With chores assigned to multiple people, click *Alex* — only
Alex's chores remain; click *All* — every chore returns; reload — filter persists.

- [X] T108 [US6] Add persisted `selectedPersonId` (Zustand + localStorage) and selectors to `client/src/store/filter.ts`
- [X] T109 [US6] Make `chores.loadMonth` consume `selectedPersonId` (refetches on change) in `client/src/store/chores.ts`
- [X] T110 [US6] Add an "All" entry above the roster, click handlers, and active-state styling in `client/src/components/sidebar/RosterList.tsx`
- [X] T111 [P] [US6] Client unit test: clicking a person sets the filter and triggers a refetch; clicking the same person clears it in `client/tests/unit/filter.select.test.tsx`
- [X] T112 [P] [US6] Client unit test: clicking "All" clears the filter in `client/tests/unit/filter.all.test.tsx`
- [X] T113 [P] [US6] Client unit test: filter persists across a reload (rehydrates from localStorage) in `client/tests/unit/filter.persist.test.tsx`

**Checkpoint**: All Phase-1 user stories complete and independently demoable.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final accessibility, performance, and end-to-end validations.

- [X] T114 [P] Client a11y assertion (axe-core) for `ChoreForm` in create + edit modes in `client/tests/unit/a11y.choreform.test.tsx`
- [X] T115 [P] Playwright E2E demo path (open → create → reschedule → done → delete → filter) in `client/tests/e2e/demo.spec.ts`
- [X] T116 [P] Server perf assertion: `GET /api/chores?from&to` p95 < 300 ms across N=1000 calls on in-memory SQLite in `server/tests/integration/perf.test.ts`
- [X] T117 [P] Server perf assertion: mutating endpoints p95 < 500 ms in `server/tests/integration/perf.mutate.test.ts`
- [X] T118 [P] Document the bundle-size budget (≤250 KB gzipped main chunk) and how to inspect Vite's report in `client/README.md`
- [X] T119 [P] Add repo `README.md` pointing at `specs/001-office-chores-calendar/quickstart.md` and listing top-level scripts
- [X] T120 Run quickstart validation manually: `npm install` → start client and server → execute the demo path in a real browser; capture any deltas back into `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS every user story.
- **User Stories (Phases 3–8)**: All depend on Foundational. Can run in priority order
  (P1 → P2) or in parallel by separate developers after Foundational completes.
- **Polish (Phase 9)**: Depends on every user story being complete (E2E covers them all).

### User Story Dependencies

- **US1 (P1, MVP)**: independent of all other stories. Demoable on its own.
- **US2 (P1)**: independent of US1 server-side; functionally easier to demo with US1
  in place but server tests cover it standalone.
- **US3 (P2)**: independent of US1/US2. Adds PATCH/DELETE endpoints used by **US4**.
- **US4 (P2)**: server-side **soft dependency on US3** (reuses `PATCH /api/chores/:id`).
  If US4 is built before US3, the PATCH endpoint must be moved into US4 instead. Default
  order: US3 → US4.
- **US5 (P2)**: independent of US1–US4 (touches `people.*` only).
- **US6 (P2)**: independent server-side; UX depends on US5 having multiple people and
  US1+US2 having chores to filter.

### Within Each Story

- Repository methods → routes → tests (unit + integration).
- On the client: store actions → components → component tests + a11y.

### Parallel Opportunities

- All Setup tasks marked `[P]` (T002–T012) run in parallel after T001.
- Foundational `[P]` tasks (T013–T015, T024–T034, T039–T041) run in parallel within
  their groupings; sequential tasks (T016–T023, T035–T038) gate them.
- Within each user story, repo methods, route files, integration tests, components,
  and unit tests marked `[P]` run in parallel.
- Across user stories: once Foundational is done, US1 / US3 / US5 are fully independent
  and can be staffed concurrently.

---

## Parallel Example: User Story 1 server slice

```bash
# After Foundational completes, all four [P] server tasks run in parallel:
Task: "Add list() method to server/src/repos/people.ts"          # T042
Task: "Add listByDateRange() to server/src/repos/chores.ts"      # T043
Task: "Server route: GET /api/people in server/src/routes/people.ts"  # T044
Task: "Server route: GET /api/chores in server/src/routes/chores.ts"  # T045
# Then T046 (wire into app.ts) runs once they're all in.
# Then the four [P] tests (T047–T050) all run in parallel.
```

---

## Implementation Strategy

### MVP first (US1 + US2)

1. Complete **Phase 1: Setup**.
2. Complete **Phase 2: Foundational** (CRITICAL — blocks every story).
3. Complete **Phase 3: US1** → demo (open app, see seeded chores).
4. Complete **Phase 4: US2** → demo (create a chore from a click).
5. **STOP, validate, demo.** This is a usable MVP.

### Incremental delivery

1. Setup + Foundational → infra ready.
2. Add US1 → independently testable, demoable.
3. Add US2 → MVP.
4. Add US3 → full chore CRUD.
5. Add US4 → drag-to-reschedule.
6. Add US5 → roster management.
7. Add US6 → per-person filter.
8. Phase 9 polish → constitution-compliance checks (a11y, perf, E2E).

### Parallel team strategy (not required for a single-developer POC, but supported)

After Foundational:

- Developer A: US1 (calendar surface)
- Developer B: US3 (edit/delete + done) — server PATCH/DELETE unblocks US4 too
- Developer C: US5 (roster management)
- Once those land, US2 (creates), US4 (drag), and US6 (filter) can be picked up by
  whoever finishes first. Each story remains independently testable.

---

## Notes

- `[P]` tasks are different files with no in-flight dependency.
- Every story's tests live with the story — when the story merges, its tests merge.
- Verify failing tests before implementing (constitution Principle II).
- Commit after each task or each logical group — auto-commit can be enabled in
  `.specify/extensions/git/git-config.yml` if desired.
- The Phase 2 push channel is intentionally absent here. The forward-compat seam
  (`server/src/events/bus.ts`, T021; client store mutation handlers, T033) is in
  place so the future WS upgrade is purely additive.
