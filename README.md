# Office Chores

A localhost POC web app: a monthly calendar of office chores assigned to people in
the office. Built with the [GitHub spec-kit](https://github.com/github/spec-kit)
spec-driven workflow. Phase 1 is a single-machine demo; a Phase 2 WebSocket
upgrade is intentionally additive (the server already publishes domain events to
an in-process bus that a `/ws` handler can subscribe to).

## Quickstart

```bash
npm install                       # installs every workspace
npm --workspace server run dev    # http://127.0.0.1:8989 — REST API
npm --workspace client run dev    # http://localhost:5273  — Vite dev server
```

On first launch the server creates `server/data/data.sqlite` and seeds 6
placeholder people (Alex, Bea, Chen, Dani, Ezra, Farah). Open the client URL
in two browser windows to see the same data — note that Phase 1 reflects
other browsers' changes only on reload.

## Demo path

Mirrors the smoke covered by `client/tests/e2e/demo.spec.ts` (Polish phase):

1. Sidebar shows the seeded roster. Calendar grid is empty.
2. Click any future day cell → the chore form opens with that date pre-filled.
3. Enter a title, pick an assignee, save → chore appears.
4. Drag the chore to a neighboring day → it moves and persists.
5. Click the chore's checkbox → muted/struck-through (done state).
6. Click the chore body → edit form. Delete with two-step confirmation.
7. Click a person in the sidebar → calendar filters to their chores. "All"
   clears the filter; the selection persists across reloads.
8. Toggle the theme switch in the header → no FOUC, persists, respects the
   system preference on first load.

## Running checks

```bash
npm run check     # tsc --noEmit across all workspaces
npm test          # vitest unit + Supertest integration on each workspace
npm run build     # tsc + vite build (client) + tsc check (server)
npm run lint      # eslint with typescript-eslint
```

Per-workspace coverage:

```bash
npm --workspace server run coverage
npm --workspace client run coverage
```

## Project layout

```text
client/   # Vite + React + TS + Tailwind v4 SPA
server/   # Node + Express + better-sqlite3 REST API (binds 127.0.0.1)
shared/   # zod schemas + inferred TS types, imported by both
specs/    # spec-kit artifacts: spec.md, plan.md, tasks.md, contracts/, ...
```

The single source of truth for the wire format is `shared/src/{person,chore,api}.ts`.
A breaking change there is a TypeScript error in both packages on the next build.

## Spec-kit artifacts

- [`specs/001-office-chores-calendar/spec.md`](./specs/001-office-chores-calendar/spec.md) — feature specification
- [`specs/001-office-chores-calendar/plan.md`](./specs/001-office-chores-calendar/plan.md) — implementation plan
- [`specs/001-office-chores-calendar/research.md`](./specs/001-office-chores-calendar/research.md) — technical decisions
- [`specs/001-office-chores-calendar/data-model.md`](./specs/001-office-chores-calendar/data-model.md) — DB schema + zod types
- [`specs/001-office-chores-calendar/contracts/rest-api.md`](./specs/001-office-chores-calendar/contracts/rest-api.md) — REST contract
- [`specs/001-office-chores-calendar/quickstart.md`](./specs/001-office-chores-calendar/quickstart.md) — extended quickstart
- [`specs/001-office-chores-calendar/tasks.md`](./specs/001-office-chores-calendar/tasks.md) — execution checklist
- [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) — project constitution

## Performance budgets

- Client main JS chunk: ≤ 250 KB gzipped (Vite build prints the table).
- API p95 — read endpoints < 300 ms, mutating endpoints < 500 ms (constitution).
- Trivially met on localhost SQLite; tracked from day one to keep the discipline.

## Reset

```bash
rm server/data/data.sqlite*    # next server start re-seeds the roster
```

## Out of scope (Phase 1)

Auth, multi-tenancy, reminders, notifications, recurring chores, mobile-specific
UI, real-time multi-session sync. The architecture (separate client process +
in-process event bus on the server) keeps the Phase 2 live-sync upgrade purely
additive.
