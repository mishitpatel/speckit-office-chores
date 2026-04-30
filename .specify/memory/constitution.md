<!--
SYNC IMPACT REPORT
- Version change: template (unfilled) → 1.0.0
- Bump rationale: First ratified version. All template placeholders replaced.
- Modified principles: N/A (initial ratification)
- Added principles:
  * I. Code Quality
  * II. Testing Standards (NON-NEGOTIABLE)
  * III. User Experience Consistency
  * IV. Performance Requirements
- Removed principles: PRINCIPLE_5 slot intentionally omitted (user requested 4 principles)
- Added sections:
  * Development Workflow
  * Quality Gates
- Removed sections: none
- Templates requiring updates:
  * .specify/templates/plan-template.md — ✅ no edit needed (Constitution Check is a
    generic gate that derives from this file)
  * .specify/templates/spec-template.md — ✅ no edit needed (no principle bindings)
  * .specify/templates/tasks-template.md — ✅ no edit needed (no principle bindings)
  * .specify/templates/commands/*.md — ✅ none present in repo
- Follow-up TODOs: none
-->

# Office Chores Constitution

## Core Principles

### I. Code Quality

Code merged to `main` MUST be readable, reviewed, and verifiably correct.

- Linting, formatting, and static type checks MUST pass in CI before merge.
- Functions and modules MUST be small, single-purpose, and named for intent. No
  commented-out code, dead code, or `TODO` markers without a tracked issue
  reference.
- Every change MUST be reviewed by at least one other contributor; reviewers
  MUST verify constitution compliance, not only correctness.
- Cyclomatic complexity per function SHOULD stay at or below 10. Deviations
  MUST be justified in the PR description.
- Public APIs and non-obvious internal contracts MUST be documented at the
  point of definition, not in external prose alone.

**Rationale**: Reading dominates writing in this codebase's lifetime;
enforcing consistency and review discipline keeps churn cheap.

### II. Testing Standards (NON-NEGOTIABLE)

Behavior is not "done" until it is covered by automated tests.

- Every new behavior MUST ship with automated tests written before or
  alongside the implementation. Retroactive tests are not acceptable.
- Unit tests MUST cover business logic; integration tests MUST cover
  persistence boundaries and any external service or contract surface.
- CI MUST run the full test suite on every pull request; merges are blocked
  on red builds.
- Line coverage MUST NOT decrease between releases. New modules require at
  least 80% line coverage.
- Flaky tests MUST be quarantined within one working day and fixed within
  one sprint. Silent retry loops to mask flakes are forbidden.

**Rationale**: Tests are the only durable specification of intended behavior
and the cheapest place to catch regressions.

### III. User Experience Consistency

Users MUST encounter one product, not a collection of screens.

- All user-facing surfaces MUST follow a single design system covering
  typography, spacing, color, and shared components. Ad-hoc styles require
  explicit justification.
- Interactive elements MUST share consistent labels, error messages, empty
  states, and loading patterns across the product.
- Accessibility: WCAG 2.1 AA conformance is mandatory. Keyboard navigation,
  visible focus, and screen-reader labels are required for every
  interactive element.
- Loading, error, and success states MUST be explicit. Silent failures and
  ambiguous spinners are not acceptable.
- Copy and terminology MUST be consistent across web, mobile, email, and
  in-app notifications.

**Rationale**: Inconsistency erodes user trust faster than missing features
and is disproportionately expensive to retrofit.

### IV. Performance Requirements

Performance is a feature and MUST be measured, not assumed.

- p95 interactive page-load target: under 2 seconds on a representative
  device and network profile.
- p95 API response targets: under 300 ms for read endpoints and under
  500 ms for write endpoints.
- Performance budgets (bundle size, time-to-interactive, key endpoint
  latency) MUST be enforced in CI.
- A regression greater than 10% on any tracked metric blocks merge unless
  explicitly approved with documented justification.
- Database queries MUST use appropriate indexes for hot paths; N+1 query
  patterns MUST be flagged and rejected in code review.

**Rationale**: Every unmeasured millisecond compounds into user-visible
slowness; budgets keep the cost of carelessness visible at PR time.

## Development Workflow

- The project uses trunk-based development on `main` with short-lived
  feature branches.
- Every non-trivial change MUST follow the spec-driven flow:
  `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` →
  `/speckit-implement`. Hotfixes follow the same flow with abbreviated
  specs; retrospective spec writing is forbidden.
- Pull requests MUST include: passing CI, at least one reviewer approval, an
  explicit constitution-compliance check, and updated tests and docs for any
  changed behavior.
- Commit messages MUST describe intent, not just diff contents; squash on
  merge is preferred.

## Quality Gates

The following gates MUST be wired into CI and MUST pass before merge:

- Linting, formatting, and type checks.
- Unit and integration test suites.
- Performance budget checks for tracked metrics.
- Accessibility checks (automated WCAG conformance scan).
- Security scanning: dependency CVE scan and secret scanning on every PR.

Production deploys MUST include automated smoke tests and a documented
rollback plan. A failed gate blocks the deploy; gates MUST NOT be bypassed
without a recorded incident-grade exception.

## Governance

This Constitution supersedes ad-hoc practices. Documents that conflict with
it MUST be updated to comply, not the other way around.

**Amendment procedure**: Amendments require a pull request modifying this
file with (a) a written justification, (b) a version bump per the policy
below, (c) reviewer approval from at least one project maintainer, and (d)
a migration note for any breaking governance change. The Sync Impact Report
HTML comment at the top of this file MUST be updated to reflect the change.

**Versioning policy** (semantic versioning applied to governance):

- MAJOR: Backward-incompatible governance changes — principle removals,
  redefinitions that invalidate prior compliance, or governance restructures.
- MINOR: New principles or sections added, or material expansion of
  existing guidance.
- PATCH: Clarifications, wording, typo fixes, and non-semantic refinements.

**Compliance review**: Every PR review MUST verify constitution compliance.
Complexity or deviations MUST be explicitly justified in the PR description
and, when sustained, captured in the plan's Complexity Tracking section.

Runtime development guidance (tooling specifics, agent prompts, repo
conventions) lives in `CLAUDE.md` and analogous agent guidance files; those
files implement this constitution but do not override it.

**Version**: 1.0.0 | **Ratified**: 2026-04-30 | **Last Amended**: 2026-04-30
