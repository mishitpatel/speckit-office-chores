# Quickstart — Office Chores Calendar (Phase 1 POC)

A 5-minute path from `git clone` to seeing a populated calendar in the browser.

## Prerequisites

- Node.js 20 LTS (`nvm install 20 && nvm use 20`)
- npm 10+ (ships with Node 20)
- Modern desktop browser (Chrome, Safari, or Firefox — latest two majors)

## Install

```bash
# from repo root
npm install            # installs every workspace (client, server, shared)
```

The repo is a single npm workspace. There is no separate install per package.

## Run (development)

Two processes, two terminals — kept separate from day one (FR-021).

```bash
# terminal 1
npm --workspace server run dev   # http://127.0.0.1:8787 — REST API
```

```bash
# terminal 2
npm --workspace client run dev   # http://localhost:5173  — Vite dev server
```

Open <http://localhost:5173>. On first launch the server seeds 6 placeholder
people. The current month is shown with an empty grid.

## Smoke test (the demo path)

This is the path covered by Playwright in `client/tests/e2e/demo.spec.ts`:

1. Sidebar shows the 6 seeded people. Calendar grid is empty.
2. Click any future day cell → the chore form opens with that date pre-filled.
3. Enter "Empty the dishwasher" and pick *Alex*. Save. The chore appears on
   that day.
4. Drag the chore to a neighboring day. The chore moves; reload — still there.
5. Click the chore → toggle done. Cell shows it muted/struck-through.
6. Click the chore again → delete (with confirmation). Cell empties.
7. Click *Alex* in the sidebar. Calendar filters to Alex only. Click "All" to
   clear.
8. Toggle the theme switch in the header. Reload — preference persists, no
   flash of wrong theme.

## Tests

```bash
npm --workspace server test           # Vitest (unit + Supertest integration)
npm --workspace client test           # Vitest (unit)
npm --workspace client run test:e2e   # Playwright demo smoke (chromium)
npm run check                          # lint + typecheck across workspaces
```

Coverage report (constitution-required ≥80% on new modules):

```bash
npm --workspace server run coverage
npm --workspace client run coverage
```

## Build (production-style local check)

```bash
npm --workspace client run build      # Vite production bundle in client/dist
npm --workspace server run build      # tsc emit in server/dist
```

The Vite build prints a per-chunk size table; the main chunk should stay below
the 250 KB gzipped working budget.

## Where to look

| You want to…                           | File / dir                                  |
|----------------------------------------|---------------------------------------------|
| Change the REST shape                  | `shared/src/*.ts` (zod schemas)             |
| Add a calendar interaction             | `client/src/components/calendar/`           |
| Add a sidebar action                   | `client/src/components/sidebar/`            |
| Add an endpoint                        | `server/src/routes/*` + `shared/src/api.ts` |
| Adjust SQLite schema                   | `server/src/db/schema.sql` + a new migration |
| Change theme tokens                    | `client/src/styles/theme.css`               |
| Read the spec                          | `specs/001-office-chores-calendar/spec.md`  |
| Read the implementation plan           | `specs/001-office-chores-calendar/plan.md`  |

## Reset

```bash
rm server/data/data.sqlite             # next server start re-seeds the roster
```
