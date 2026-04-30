# Feature Specification: Office Chores Calendar (Phase 1 POC)

**Feature Branch**: `001-office-chores-calendar`
**Created**: 2026-04-30
**Status**: Draft
**Input**: User description: "POC web app called 'Office Chores'. Phase 1: calendar-first
view of office chores, sidebar of people, click-to-create chore, click-to-edit/delete,
drag-to-reschedule, server-persisted. No auth, no reminders, no recurring chores, no
real-time sync in this phase. Architecture must keep frontend and backend as separate
processes so a Phase 2 live-sync upgrade is additive."

## Clarifications

### Session 2026-04-30

- Q: Must each person in the roster have a unique name? → A: Yes — unique, case-insensitive.
- Q: How does a performed chore leave the calendar? → A: Chore has a `done` toggle; done chores stay visible in a muted/struck-through style; delete remains available for cleanup.
- Q: Where is the Phase 1 server expected to be reachable from? → A: Localhost only — single developer machine; multi-browser scenarios via `localhost`/`127.0.0.1`. Not deployable beyond one machine.
- Q: When removing a person who has chores assigned, how are those chores handled? → A: Block removal whenever any chore (done or not) is assigned; user must reassign or delete the chores first. (Confirms FR-013 as written.)
- Q: Does clicking a person in the sidebar filter the calendar? → A: Yes — single-select. Clicking a person filters the calendar to that person's chores; clicking the same person again or an explicit "All" entry clears the filter. Multi-select is out of scope.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View office chores on a monthly calendar (Priority: P1)

An office member opens the app and immediately sees the current month with every chore
laid out on its assigned date and the assignee visible. Navigation to other months loads
their chores in place.

**Why this priority**: Without a viewable calendar, the app delivers nothing. This is
the minimum viable surface and every other story builds on it.

**Independent Test**: With at least one chore seeded on today's date, open the app — the
current month is shown and the chore appears on today's cell with title and assignee.

**Acceptance Scenarios**:

1. **Given** the app loads with a chore on today's date, **When** the user opens the
   home view, **Then** the current month is displayed and the chore appears on today's
   cell with its title and assignee.
2. **Given** the user is viewing the current month, **When** they navigate to the next
   month, **Then** the calendar updates to show that month's chores without a full
   page reload.
3. **Given** the visible month contains no chores, **When** the user views the
   calendar, **Then** every day cell appears empty (no error or placeholder noise).
4. **Given** the user is on a non-current month, **When** they click a "Today" control,
   **Then** the calendar returns to the current month with today's cell visually
   distinguished.

---

### User Story 2 - Create a chore on a chosen date (Priority: P1)

An office member clicks any date on the calendar and adds a chore by entering a title,
picking an assignee, and confirming the date. The new chore appears on the calendar
immediately and is visible on subsequent visits.

**Why this priority**: Creation is the only way data enters the system; without it the
calendar is read-only and useless.

**Independent Test**: Click an empty day cell, enter a title, pick an assignee, save —
the new chore appears on that date with title and assignee, and is still there after a
page reload.

**Acceptance Scenarios**:

1. **Given** the user clicks an empty day cell, **When** the create form opens with the
   date pre-filled and they enter a title and pick an assignee, **Then** on save the
   chore appears on that date showing title and assignee.
2. **Given** the user opens the create form, **When** they leave the title blank and
   submit, **Then** save is blocked with a clear error indicating title is required.
3. **Given** the user opens the create form, **When** they submit without selecting an
   assignee, **Then** save is blocked with a clear error indicating assignee is required.
4. **Given** the create form is open, **When** the user dismisses it without saving,
   **Then** no chore is created and the calendar is unchanged.
5. **Given** a chore was just created, **When** the user reloads the page, **Then** the
   chore is still on the same date with the same title and assignee.

---

### User Story 3 - Edit or delete an existing chore (Priority: P2)

An office member clicks an existing chore to open an edit view where they can change
the title, assignee, or date, or delete the chore outright with a confirmation.

**Why this priority**: Required for normal operation, but the calendar still functions
for create-and-view use until this lands.

**Independent Test**: Click an existing chore — an edit form opens with current values;
change the title and save; the change is reflected on the calendar. From the same view,
delete the chore and verify it disappears.

**Acceptance Scenarios**:

1. **Given** a chore exists, **When** the user clicks it, **Then** an edit form opens
   populated with the chore's current title, assignee, and date.
2. **Given** the edit form is open, **When** the user changes the assignee and saves,
   **Then** the chore on the calendar shows the new assignee immediately.
3. **Given** the edit form is open, **When** the user clicks delete and confirms,
   **Then** the chore is removed from the calendar.
4. **Given** a delete confirmation prompt is shown, **When** the user cancels,
   **Then** the chore remains unchanged.

---

### User Story 4 - Drag a chore to reschedule (Priority: P2)

An office member drags a chore from one date to another to reschedule it. The chore
moves to the new date and the change persists.

**Why this priority**: Convenience layer over edit; the same outcome is achievable via
User Story 3 if drag is unavailable.

**Independent Test**: Pick up a chore on date A, drop it on date B — the chore now
appears on date B and is gone from date A; the change persists across page reloads.

**Acceptance Scenarios**:

1. **Given** a chore exists on date A, **When** the user drags it onto date B,
   **Then** the chore moves to date B and the change is persisted.
2. **Given** a drag is in progress, **When** the user drops the chore back on its
   original date, **Then** nothing changes and no error is shown.
3. **Given** a drag has started, **When** the user drops outside any valid date cell,
   **Then** the drag is cancelled and the chore stays on its original date.
4. **Given** a chore was just dragged to a new date, **When** the user reloads the
   page, **Then** the chore is still on the new date.

---

### User Story 5 - Manage the office roster (Priority: P2)

An office member adds, renames, or removes people in the sidebar so the assignee list
reflects who is actually in the office.

**Why this priority**: The seed list works for an initial demo; roster management is
needed once people join or leave.

**Independent Test**: Add a new person via the sidebar, then create a chore and confirm
the new person appears as an assignee option.

**Acceptance Scenarios**:

1. **Given** the sidebar is visible, **When** the user adds a new person with a name,
   **Then** that person appears in the sidebar and is selectable in the chore form.
2. **Given** a person exists, **When** the user renames them, **Then** the new name
   appears everywhere (sidebar, calendar chores assigned to them, chore form).
3. **Given** a person has chores assigned to them, **When** the user attempts to
   remove them, **Then** the system blocks the removal and explains that the chores
   must be reassigned or deleted first.

---

### User Story 6 - Filter the calendar by person (Priority: P2)

An office member clicks a person in the sidebar to see only that person's chores on
the calendar, and clicks the same person again (or "All") to clear the filter.

**Why this priority**: As the office grows the calendar becomes noisy; per-person
filtering converts the sidebar from a passive list into the primary navigation.

**Independent Test**: With chores assigned to multiple people, click one person —
only their chores remain on the calendar; click "All" — every chore returns.

**Acceptance Scenarios**:

1. **Given** the calendar shows chores for multiple people, **When** the user clicks
   a person in the sidebar, **Then** only that person's chores remain visible and
   the selected person is visually marked active in the sidebar.
2. **Given** a person filter is active, **When** the user clicks the same person
   again, **Then** the filter is cleared and every chore is visible.
3. **Given** a person filter is active, **When** the user clicks an explicit "All"
   entry in the sidebar, **Then** the filter is cleared and every chore is visible.
4. **Given** a person filter is active, **When** the user reloads the page, **Then**
   the filter is still applied to the same person.

---

### Edge Cases

- Toggling a chore's done state while a drag is in progress → the toggle is suppressed
  until the drag completes; only one interaction at a time.
- A chore is marked done and then dragged to a new date → the done state is preserved
  on the new date.
- A chore's assignee is removed while the chore exists → removal is blocked per FR-013.
- The user navigates to a far past or future month → the calendar still loads; chores
  for that month are fetched on demand.
- Two users edit the same chore at roughly the same time in this phase → last write
  wins; no conflict UI in Phase 1 (Phase 2 live sync will revisit).
- Network/server is briefly unavailable during a drag or save → the optimistic UI
  change is reverted with a non-blocking error message.
- A chore title is extremely long → display is truncated with an ellipsis and full
  text is available on hover/focus or in the edit form. Storage limit per FR-007.
- The roster is emptied → chore creation is blocked until at least one person exists,
  with a message directing the user to add someone first.
- The user is in a different timezone than another user → in Phase 1 dates have no
  time-of-day component and are interpreted in the user's local timezone, so no
  conversion is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a monthly calendar view as the primary
  application surface.
- **FR-002**: The system MUST allow the user to navigate to the previous and next
  month and to jump back to "today".
- **FR-003**: The system MUST render every chore on its assigned date showing at
  minimum the chore title and the assignee's name.
- **FR-004**: The system MUST present a sidebar listing every person currently in the
  office roster.
- **FR-005**: The sidebar MUST be collapsible and the collapsed/expanded state MUST
  persist across reloads.
- **FR-005a**: Clicking a person in the sidebar MUST filter the calendar to show only
  that person's chores. Clicking the same person again, or clicking an explicit "All"
  entry, MUST clear the filter and restore the full view. Only one person may be
  selected at a time; multi-select is out of scope for Phase 1.
- **FR-005b**: The active filter state (selected person or "All") MUST be visually
  indicated in the sidebar and MUST persist across page reloads within the same
  browser.
- **FR-006**: The system MUST allow the user to create a chore by clicking a day cell
  and providing a title (required), an assignee (required), and a date (required,
  defaulting to the cell that was clicked).
- **FR-007**: The chore title MUST be a single-line text value between 1 and 120
  characters; submissions outside this range MUST be rejected with a clear message.
- **FR-008**: The system MUST allow the user to edit any field of an existing chore
  via an edit view opened from clicking the chore.
- **FR-009**: The system MUST allow the user to delete an existing chore from the
  edit view, with a confirmation step that prevents accidental deletion.
- **FR-009a**: Each chore MUST have a `done` flag (default: not done). The user MUST
  be able to toggle this flag with a single interaction directly from the calendar
  (without opening the edit form), and the change MUST persist on the server.
- **FR-009b**: A chore in the `done` state MUST remain visible on its assigned date,
  rendered in a visually muted/struck-through style that is clearly distinguishable
  from chores that are not done.
- **FR-010**: The system MUST allow the user to reschedule a chore by dragging it
  from one date cell to another; the move MUST persist on the server.
- **FR-011**: The system MUST allow the user to add a new person to the roster from
  the sidebar.
- **FR-011a**: Person names MUST be unique within the roster, compared
  case-insensitively (e.g. "Alex" and "alex" are considered the same name). An
  attempt to add or rename a person to a name already in use MUST be rejected with
  a clear error message.
- **FR-012**: The system MUST allow the user to rename or remove an existing person
  from the sidebar, subject to the uniqueness rule in FR-011a.
- **FR-013**: When the user attempts to remove a person who has any chores assigned,
  the system MUST block the removal and explain that the chores must first be
  reassigned or deleted.
- **FR-014**: The system MUST persist all chores and people to a server-backed store
  so that data survives page reloads and is consistent across browser sessions.
- **FR-015**: On first launch with no roster present, the system MUST seed an initial
  office roster of 6 people; seed names are placeholder content and are user-editable.
- **FR-016**: The system MUST support a dark theme (default) and a light theme; the
  selected theme MUST persist across reloads, MUST respect the user's system
  preference on first load, and MUST be toggleable from the application header.
- **FR-017**: Switching themes MUST NOT produce a visible flash of the wrong theme on
  initial page load.
- **FR-018**: Every primary action (view month, create chore, edit chore, delete
  chore, reschedule, manage roster) MUST be performable with a pointing device, and
  primary mutating actions (create, edit, delete) MUST also be reachable via
  keyboard input.
- **FR-019**: A day cell MUST gracefully handle large numbers of chores (at least 25
  per cell) by visually capping visible items and providing a means to view the rest.
- **FR-020**: When a server request fails, the system MUST surface a non-blocking
  error to the user and revert any optimistic UI change to the last known good state.
- **FR-021**: The system architecture MUST keep the user-facing client and the
  data/persistence service as separate, independently deployable processes so that
  adding a server-to-client live update channel in a later phase is additive and does
  not require restructuring the client.
- **FR-022**: The Phase 1 server MUST bind to localhost only (not to a public network
  interface). Multi-browser demonstrations use multiple browser windows on the same
  developer machine.

### Key Entities

- **Chore**: A unit of work scheduled on a specific calendar date, assigned to exactly
  one person. Attributes: title, assignee, date, done (boolean, default false),
  creation timestamp, last-updated timestamp.
- **Person**: A member of the office roster, identified by name. Names are unique
  within the roster (case-insensitive). May be the assignee of any number of chores.
  Attributes: name, creation timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can open the app, see the current month, and identify
  any chore assigned to a known colleague within 10 seconds, with no instructions.
- **SC-002**: A user can create a new chore from a fresh calendar view in under 20
  seconds, including selecting an assignee.
- **SC-003**: A user can reschedule a chore via drag-and-drop in under 5 seconds; on
  success the new placement is visible immediately and persists across a page reload.
- **SC-004**: 95% of view-month and chore-mutation interactions complete and reflect
  their result on screen in under 1 second on a typical broadband connection.
- **SC-005**: When two browsers have the app open and one performs an edit, the other
  reflects the change after a manual reload (Phase 2 will replace "manual reload"
  with live sync without changing this user-facing outcome).
- **SC-006**: The dark/light toggle never produces a visible flash of the wrong theme
  on first paint, measured across the home view and the create-chore form.
- **SC-007**: A user can complete the demo script (open app → create one chore →
  reschedule it → delete it) without consulting documentation in 90% of trials.
- **SC-008**: All primary mutating actions (create, edit, delete) are reachable and
  completable using keyboard input alone.

## Assumptions

- Phase 1 has no authentication or access control; the server is bound to localhost
  on a single developer machine, so "anyone with the URL" effectively means anyone
  with shell access to that machine. Multi-tenant separation, network exposure, and
  authentication are out of scope and will be revisited before any LAN or public
  deployment.
- Reminders, notifications, and recurring chores are out of scope for Phase 1.
- Real-time multi-session sync is Phase 2; Phase 1 reflects other users' changes only
  on reload.
- The seeded roster contains 6 placeholder names; the user can rename or replace any
  of them at any time.
- Dates are calendar dates without a time-of-day component; timezone handling defers
  to the user's local timezone.
- Removal of a person who has chores follows the "block until reassigned" rule
  (FR-013); a different rule (e.g., reassign to a sentinel "Unassigned") may be
  revisited in a later phase.
- The application is desktop-first; mobile-specific UI optimizations are out of scope
  for Phase 1.
- The architecture is intentionally split into a client and a separate long-lived
  server process so that adding a server-pushed event channel in Phase 2 is additive
  rather than a rewrite (FR-021).
