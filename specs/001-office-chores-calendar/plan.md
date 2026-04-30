# Implementation Plan: Office Chores Calendar (Phase 1 POC)

**Branch**: `001-office-chores-calendar` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-office-chores-calendar/spec.md`

## Summary

Phase 1 ships a localhost POC web app with a month-view calendar of office chores,
a collapsible sidebar of people that doubles as a per-person filter, click-to-create /
click-to-edit / drag-to-reschedule of chores, and a `done` toggle that mutes (but
keeps visible) completed chores. Data is persisted in SQLite on a Node + Express
REST server. The frontend is a Vite + React + TypeScript SPA shipped from a separate
process; the architecture is intentionally split now so a Phase 2 WebSocket upgrade
is purely additive (the same server gains a `/ws` endpoint, the same UI swaps its
data-source). No auth, no recurring chores, no notifications, no live sync in Phase 1.

## Technical Context

**Language/Version**: TypeScript 5.6 on Node.js 20 LTS (server) and modern evergreen
browsers (client)
**Primary Dependencies**:

- *Client*: Vite 5, React 19, react-dom, Tailwind CSS 4, shadcn/ui (Radix primitives),
  lucide-react, @dnd-kit/core + @dnd-kit/sortable, date-fns, Geist Sans font.
  Theming is a tiny first-party hook (≈30 LOC) — `next-themes` is Next.js–only and
  is **not** used. See research.md.
- *Server*: Express 4, better-sqlite3, zod (request validation), pino (logging).
- *Shared*: zod schemas + inferred TypeScript types under `/shared`, imported by
  both packages.

**Storage**: SQLite (single `data.sqlite` file in `server/data/`) via better-sqlite3
synchronous driver. WAL mode on. Schema enforced by a small migration runner.
**Testing**: Vitest (unit + integration) on both packages; jsdom env for client,
node env for server. Supertest for HTTP integration tests against an in-memory
SQLite. Playwright for one end-to-end smoke covering the demo script (open → create
→ reschedule → mark done → delete).
**Target Platform**: Modern desktop browsers (Chrome, Safari, Firefox, latest two
majors). Server runs on the developer's machine, bound to `127.0.0.1`.
**Project Type**: Web application — separate `client/` SPA and `server/` HTTP API,
plus a shared types package. (Plan-template "Option 2".)
**Performance Goals**: p95 month-view paint < 2 s on cold load; p95 GET endpoint
< 300 ms; p95 mutating endpoint < 500 ms (constitution targets — easy to meet on
localhost SQLite, but tracked from day one to keep the discipline).
**Constraints**: Server binds to `127.0.0.1` only (FR-022); client bundle main
chunk ≤ 250 KB gzipped budget; theme switch produces no FOUC (FR-017); all primary
mutating actions reachable by keyboard (FR-018, SC-008); WCAG 2.1 AA conformance
on home view and chore form.
**Scale/Scope**: 6 seed people, expected steady-state ≤ 30 people and ≤ 200 chores
per month per person (well within SQLite). Single-machine, single-developer demo;
≤ 3 concurrent browser sessions assumed.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution is at `.specify/memory/constitution.md` (v1.0.0). Each
principle is evaluated below.

### I. Code Quality — PASS

- ESLint + Prettier + `tsc --noEmit` wired into both packages and runnable via a
  single root `npm run check` script.
- Reviewer step is honored on every PR (single-developer POC; self-review still
  produces a written compliance note).
- No commented-out code, dead code, or untracked TODOs at merge.
- Module size and cyclomatic complexity stay within the constitution's defaults;
  any exception captured in the PR description.

### II. Testing Standards (NON-NEGOTIABLE) — PASS with notes

- Tests are written alongside implementation, never retroactively.
- Vitest unit tests cover business logic on both packages.
- Supertest integration tests cover every REST endpoint against a fresh
  in-memory SQLite, hitting the real schema and migration code.
- Playwright smoke covers the demo path (open → create → reschedule → done → delete).
- New modules ship with ≥80% line coverage (verified locally with v8).
- *Note*: A minimal GitHub Actions workflow runs `lint + typecheck + test + build`
  on push/PR. Full performance-budget enforcement and dependency CVE scanning in
  CI are deferred to a later phase (see Complexity Tracking).

### III. User Experience Consistency — PASS

- shadcn/ui supplies a single component system (Radix primitives + Tailwind tokens).
- Color tokens, spacing scale, and typography are centralized in `tailwind.config.ts`
  and a `theme.css` token layer; no ad-hoc hex values in components.
- Loading, empty, and error states are first-class for the calendar, sidebar, and
  chore form. No silent failures (FR-020).
- Accessibility: keyboard reachability of every primary mutating action (FR-018);
  visible focus rings; `aria-*` on dialog/dragged items; an axe-core check is run
  manually at PR time and added as a Vitest assertion for the home view and the
  chore form.

### IV. Performance Requirements — PASS

- Latency targets are tracked from day one as part of the integration-test
  expectations, not enforced via CI budget yet.
- Vite production build emits a bundle-size report; main chunk ≤ 250 KB gzipped
  is the working budget.
- DB queries on hot paths (`GET /api/chores?from&to`, `GET /api/people`) use
  composite indexes on `(date, assignee_id)` and a unique index on `LOWER(name)`.
  No N+1 patterns: chores are joined to people in one query.
- Theme application is inlined in `index.html` to prevent FOUC (FR-017).

**Initial gate result**: PASS. Two CI gates (perf budget enforcement,
dependency CVE scan) are deferred — see Complexity Tracking.

**Post-design re-check (after Phase 1 artifacts)**: PASS. The data-model and
REST contract introduce no new violations: indexes on hot paths are in place
(data-model.md), endpoint latency budgets are stated explicitly
(contracts/rest-api.md), and the Phase 2 push channel is left as a single
additive seam (`server/src/events/bus.ts`) per FR-021.

## Project Structure

### Documentation (this feature)

```text
specs/001-office-chores-calendar/
├── plan.md              # This file
├── spec.md              # Feature specification (already written)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── rest-api.md      # REST endpoint contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist (already written)
└── tasks.md             # Generated by /speckit-tasks (NOT created here)
```

### Source Code (repository root)

```text
client/                            # Vite + React + TS SPA
├── index.html                     # Inline theme bootstrap (FOUC-safe)
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                   # Entry point
│   ├── App.tsx                    # Layout: header + sidebar + calendar
│   ├── components/
│   │   ├── calendar/              # Month grid, day cell, chore chip
│   │   ├── sidebar/               # Roster + filter
│   │   ├── chore-form/            # Create/edit dialog
│   │   ├── header/                # Theme toggle, month nav
│   │   └── ui/                    # shadcn/ui re-exports
│   ├── hooks/
│   │   ├── useTheme.ts            # Local replacement for next-themes
│   │   └── useChores.ts           # Data layer (REST today, events tomorrow)
│   ├── store/                     # Zustand store; mutations driven by REST
│   │   │                          #   responses now, server-pushed events later
│   │   ├── chores.ts
│   │   ├── people.ts
│   │   └── filter.ts
│   ├── lib/
│   │   ├── api.ts                 # Typed fetch wrapper
│   │   └── dates.ts               # date-fns helpers
│   └── styles/
│       └── theme.css              # Color/spacing tokens
└── tests/
    ├── unit/                      # Components & hooks
    └── e2e/                       # Playwright demo path

server/                            # Node + Express + better-sqlite3
├── package.json
├── tsconfig.json
├── data/                          # data.sqlite (gitignored)
├── src/
│   ├── index.ts                   # Bootstraps Express, binds 127.0.0.1
│   ├── app.ts                     # Express app factory (test-friendly)
│   ├── db/
│   │   ├── index.ts               # better-sqlite3 connection
│   │   ├── schema.sql
│   │   └── migrate.ts             # Idempotent migration runner
│   ├── repos/
│   │   ├── people.ts
│   │   └── chores.ts
│   ├── routes/
│   │   ├── people.ts              # /api/people
│   │   └── chores.ts              # /api/chores
│   ├── events/                    # Phase-2 placeholder; emits domain events
│   │   │                          #   today via in-process EventEmitter so the
│   │   │                          #   later WS layer can subscribe
│   │   └── bus.ts
│   └── lib/
│       └── seed.ts                # First-launch roster seeding
└── tests/
    ├── unit/
    └── integration/               # Supertest against in-memory SQLite

shared/                            # Cross-package types & schemas
├── package.json
├── tsconfig.json
└── src/
    ├── chore.ts                   # zod schema → TS type
    ├── person.ts
    └── api.ts                     # Request/response shapes

package.json                       # Root npm workspace
.github/workflows/ci.yml           # lint + typecheck + test + build
```

**Structure Decision**: Web-app layout (Option 2 from the template). The
`client/`, `server/`, and `shared/` packages live as workspaces in a root
`package.json`. The `events/bus.ts` placeholder on the server emits domain events
to an in-process bus today and is the single seam where the Phase 2 WS layer will
fan out to connected sockets — no client component needs to know which mode is
active because mutations are driven through `store/*` regardless of source.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| CI does not enforce performance budgets in Phase 1 | POC has no perf-regression history yet, and main chunk size + endpoint latency are tracked locally and asserted in tests. Wiring a budget gate before any production deploy would be premature optimization. | Adding a budget-checker action would create flaky failures on minor dep bumps without a baseline; it will be added the first time we deploy beyond localhost. |
| CI does not run a dependency CVE scan in Phase 1 | The server is bound to `127.0.0.1`, dependencies are pinned, and the surface area is small enough that GitHub Dependabot alerts on the repo cover the gap. | A dedicated CI scan step adds ~30 s per run and zero signal at this scope; revisit when the server is reachable beyond the developer's machine. |
| CI does not run an automated WCAG scan in Phase 1 | shadcn/ui covers most a11y by construction; the home view and chore form are checked manually with axe DevTools at PR time, plus an axe-core assertion in Vitest for those two views. | An automated full-site scan in CI requires Playwright + axe wiring across many flows that don't yet exist. |
| `next-themes` was specified by the user but is Next.js–only | A 30-line `useTheme` hook (writes `localStorage`, sets `class="dark"` on `<html>`, listens to `prefers-color-scheme`) is FOUC-safe with a 4-line inline script in `index.html`. | Pulling Next.js for this one library would invert the architecture choice (FR-021); a Vite-compatible alternative library (`use-theme`, `theme-ui`) adds weight for no benefit. |
