# Phase 0 Research: Office Chores Calendar

This document resolves the open technical questions surfaced by the Technical
Context section of `plan.md`.

## R1 — Theming on a Vite SPA (without next-themes)

**Decision**: Roll a tiny first-party `useTheme` hook plus a 4-line inline script
in `index.html` that runs **before** React mounts.

**Rationale**: `next-themes` was named in the user's stack proposal but it is
Next.js–only — it relies on Next's `<Script strategy="beforeInteractive">` to set
the theme class before paint. Using it in a Vite app either fails outright or
forces a Next.js dependency that conflicts with FR-021's "separate SPA + server"
architecture. The needed behavior is small:

- Read `localStorage["theme"]`; if absent, fall back to
  `matchMedia("(prefers-color-scheme: dark)").matches`.
- Set `<html class="dark">` accordingly *before* any React render — done with an
  inline `<script>` in `index.html`.
- React `useTheme()` hook exposes `{ theme, setTheme, toggle }` and writes
  back to `localStorage`.

This satisfies FR-016 (default dark, persists, respects system) and FR-017 (no
FOUC) with ≈30 LOC and zero new dependencies.

**Alternatives considered**:

- `next-themes` itself — rejected (Next-only).
- `use-theme` / `theme-ui` — rejected (heavier than the problem).
- Tailwind's `darkMode: "class"` with a React-only setter — chosen, but the inline
  bootstrap is what prevents the FOUC.

## R2 — SQLite driver: better-sqlite3 vs node-sqlite3

**Decision**: `better-sqlite3`.

**Rationale**: synchronous API simplifies Express handlers (no async wrappers
around trivial reads), 2–10× faster on small queries, single-file binary
distribution. The performance constitution's p95 < 300 ms read target is
trivially met (sub-millisecond on local SQLite).

**Alternatives considered**:

- `node-sqlite3` — async, slower, more boilerplate.
- `drizzle-orm` / `kysely` — rejected for a Phase 1 POC; raw prepared statements
  in `repos/*.ts` keep the surface area small. Revisit if/when the schema grows.

## R3 — Drag-and-drop library: @dnd-kit vs react-dnd vs HTML5

**Decision**: `@dnd-kit/core` (+ `@dnd-kit/sortable` only if list reordering
inside a day cell becomes a feature; not needed for FR-010).

**Rationale**: dnd-kit is the modern, accessible, performant choice for React.
Built-in keyboard sensor satisfies FR-018 / SC-008 for drag-to-reschedule;
react-dnd has weaker keyboard support and a heavier API. Native HTML5 DnD is
out — it's notoriously inconsistent and has no keyboard story.

**Alternatives considered**: `react-dnd` (rejected — older, no keyboard sensor),
HTML5 native DnD (rejected — accessibility gap).

## R4 — Tailwind v4 vs v3

**Decision**: Tailwind CSS **v4**.

**Rationale**: v4 is GA, ships with the new Oxide engine (faster builds), and
the CSS-first config (`@theme` in CSS) is a better fit for the
ChatGPT-aesthetic single-token-layer design (`theme.css`) than v3's
JavaScript-config-only path. The shadcn/ui Tailwind v4 preset (`@tailwindcss/vite`)
is documented and stable as of early 2026.

**Alternatives considered**: Tailwind v3 — only worth choosing if a transitive
dep blocked v4; none does in this stack.

## R5 — shadcn/ui on Vite + React 19 + Tailwind v4

**Decision**: Initialize shadcn/ui via the official Vite + Tailwind v4 recipe
(`shadcn` CLI; `components.json` with `"style": "new-york"`, `"baseColor":
"neutral"`). Pull in only the components actually used:
`button`, `dialog`, `input`, `select`, `popover`, `calendar` (date picker only),
`tooltip`, `dropdown-menu`, `toast` (for FR-020 errors), `separator`.

**Rationale**: shadcn/ui isn't a runtime dependency — components are vendored
into `src/components/ui/`. That keeps the bundle lean and lets us tweak any
component to match the ChatGPT-style 1px-border / no-shadow aesthetic without
forking a library.

**Alternatives considered**: Headless UI + hand-rolled — too much wheel-reinvention
for an aesthetic-driven POC. Mantine / MUI — rejected as too opinionated for
the ChatGPT-style minimal look.

## R6 — Phase 2 push channel: socket.io vs ws

**Decision**: **Defer the choice to Phase 2.** Phase 1 ships zero ws-related
dependencies. The seam that makes the Phase 2 upgrade additive is in
`server/src/events/bus.ts` (an in-process `EventEmitter` that all mutating
routes already publish to today) and in `client/src/store/*` (mutations are
applied from REST responses today and will accept events of the same shape from
a socket subscription tomorrow).

**Rationale**: choosing now risks locking in a dependency that won't fit the
Phase 2 sync semantics. Both candidates remain viable: `socket.io` brings
auto-reconnect, room broadcast, and a JS client; native `ws` is lighter but
hands you reconnection semantics. Either plugs into the existing event bus.

**Alternatives considered**: pre-installing `socket.io` "just in case" — rejected
to avoid carrying a dependency that does nothing in Phase 1.

## R7 — Date handling

**Decision**: Use `date-fns` (modular, tree-shakable) with all chore dates stored
as `YYYY-MM-DD` strings. No time-of-day component (per spec Assumptions). The
client treats them as local-day strings — no timezone conversion.

**Rationale**: ISO calendar-date strings sort lexicographically, are
unambiguous, and avoid the entire JS `Date` timezone class of bugs. `date-fns`
is preferred over `dayjs`/Luxon in this stack for tree-shaking.

**Alternatives considered**: storing UTC `Date`/timestamps — rejected, would
introduce TZ bugs for a feature that has no time component. Storing
`YYYY-MM-DDTHH:mm:ssZ` — rejected, same reason.

## R8 — Font: Geist vs Inter

**Decision**: **Geist Sans** via the official `geist` package (Vercel),
self-hosted at build time.

**Rationale**: matches the ChatGPT-leaning aesthetic the user described better
than Inter (Geist's terminal-style numerals and tighter geometry feel closer to
ChatGPT/Vercel than Inter's broader humanist forms). License is OFL.

**Alternatives considered**: Inter — perfectly acceptable fallback; pick if a
build issue with `geist` ever surfaces.

## R9 — Validation: zod in shared

**Decision**: zod schemas live in `/shared/src/*.ts`, exported as both runtime
parsers and TypeScript types via `z.infer`. Server uses them in route handlers
for request validation; client uses the inferred types for typed `fetch`.

**Rationale**: single source of truth for the wire format. A breaking schema
change is a TypeScript error in both packages on the next build.

**Alternatives considered**: hand-written types + ad-hoc validators — rejected
(drift risk). io-ts — rejected (more boilerplate, smaller community).

## R10 — Test stack

**Decision**: Vitest on both packages (jsdom env on client, node env on server),
Supertest for HTTP integration, Playwright for one E2E smoke (`demo.spec.ts`)
covering open → create → reschedule → done → delete.

**Rationale**: Vitest is faster than Jest, shares Vite's transformer (zero
duplicate config), and has a v8 coverage reporter aligned with the
constitution's ≥80% line-coverage rule on new modules. Playwright is overkill
for unit work but the right tool for the demo path because it exercises real
drag-and-drop via the browser.

**Alternatives considered**: Jest — rejected (slower, redundant transformer).
Cypress — rejected (heavier than Playwright for a single smoke).
