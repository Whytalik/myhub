# Operations Domain Changelog

## [2026-05-20] — Auto Carry-Over of Incomplete Tasks

Incomplete tasks (TODO / IN_PROGRESS / BACKLOG) planned for yesterday are now automatically moved to today when the journal page opens. Only single-day tasks (no `plannedEndDate`) are affected; multi-day tasks appear naturally via their date range. `carriedFromDate` is set to yesterday so the history is preserved.

### Verification Checklist:
- [x] Logic implemented (`autoCarryOverYesterdayTasks` in `task-service.ts`)
- [x] Called from `journal/page.tsx` before data fetch, today-only
- [x] Cache invalidated if any tasks were carried
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-18] — Completed Tasks Hidden from Day Timeline

Completed (DONE) tasks are now automatically excluded from the day-view timeline in TaskCalendar. Marking a task done via the StatusToggle inside a timeline card immediately removes it from the timeline without requiring a page reload.

### Verification Checklist:
- [x] Logic implemented (`scheduledTasks`/`unscheduledTasks` filter DONE; `StatusToggle` propagates status changes via `onStatusChange`)
- [x] UI updated (task disappears immediately on completion)
- [x] Verified with `pnpm tsc --noEmit`

## [2026-05-17] — Habits Evolution & Strategic Pillars

### Added
- **Habit Types**: Introduced `positive` (build) and `avoidance` (break) habit types. Avoidance habits focus on resistance and tracking streaks without mandatory anchors.
- **Sphere Levels**: Added `MINIMUM | MEDIUM | DESIRED` effort tiers for habits, allowing users to define what a "minimum viable day" looks like vs. an optimal one.
- **Flexible Scheduling**: Added `targetDaysPerWeek` to habits for non-daily tracking (e.g., 3 days a week).
- **Subcategories**: Habits can now have free-form subcategories (e.g., "Body", "Mind") for better grouping within spheres.
- **Carry Over**: Implemented "Carry Over" for tasks, allowing unfinished items to be moved to future dates with a reason.
- **5-Year Mission**: Rebranded "Vision" to "5-Year Mission" to align with long-term strategic planning.
- **Active Pillars**: Users can now toggle which Life Spheres are active "Strategic Pillars". Inactive spheres are hidden from the Alignment Map and OKR views.

### Changed
- **Alignment Map**: Refactored to focus on active strategic pillars and 5-year mission.
- **Habit UI**: Enhanced `HabitCard` and `HabitForm` with contextual logic for avoidance habits (Shield icons, "Resisted" status).
- **Task Model**: Added `isBlocked` flag for clearer status tracking.

### Verification Checklist:
- [x] Logic implemented (Schema updated, Services updated)
- [x] UI updated (Habit forms, Alignment Map, Task cards)
- [x] Verified with `pnpm tsc --noEmit`
- [x] Verified with `pnpm lint`

## [2026-04-22] - Performance & Architecture Refinement
Optimized Sprints page loading by moving data fetching from client-side `useEffect` to Server Components.
Implemented Streaming with `loading.tsx` to provide instant UI feedback via skeletons.

### Verification Checklist:
- [x] SSR Fetching implemented
- [x] Loading skeleton added
- [x] Verified with tsc/lint/build

## [2026-04-24] - Push Notifications & Type Safety Fix
Fixed push notification functionality by regenerating Prisma client with the userAgent field. Resolved cascading renders in SettingsModal and eliminated 'any' type violations across system services.

### Verification Checklist:
- [x] Push: userAgent field integrated in DB
- [x] UI: Dialog z-index updated to 8000
- [x] Code: Lint & Type checks passed (no 'any', no cascading renders)

- Fixed task view modal opening after task deletion in gallery by preventing React event bubbling in the Dialog component. [x] Logic implemented, [x] Verified with tsc/lint.


## 2026-04-28: Personal Scrum Phases 1 & 2

Implemented Personal Scrum Sprint Dashboard (Phase 1) including Kanban board for Projects/Tasks. Implemented Strategic Alignment Map (Phase 2) to visualize lineage from Vision to Pillars to Sprint Objectives.

- [x] Logic implemented for projects, tasks, vision, and alignment.
- [x] UI updated with SprintBacklog, ProjectDialog, AlignmentMap, and VisionPage.
- [x] Verified with tsc/lint/build.

## 2026-04-28: Personal Scrum Full Implementation

Completed all 5 levels of the Personal Scrum hierarchy.

- **Phase 1 & 2**: Sprint Dashboard (Kanban) and Alignment Map (Vision lineage) - [x] Done.
- **Phase 3 (Rhythm)**: Daily Standup integrated into Journal, Weekly Review Center with scorecard and narrative reflection - [x] Done.
- **Level 03 (Compass)**: Annual Compass with Theme, WIGs, and Focus Areas - [x] Done.

- [x] Database: Updated with Scrum standup fields and AnnualCompass model.
- [x] UI: Created StandupSection, SprintReviewView, and AnnualCompassView.
- [x] Verified with full production build (next build).

## 2026-04-28: UI & Logic Polish

Refined Personal Scrum components to meet Engineering Standards.

- [x] Removed alert() from Review Center, replaced with visual success indicator and showSaved state.
- [x] Optimized loadReview in SprintReviewView using useCallback and proper dependency tracking to avoid cascading renders.
- [x] Cleaned up unused imports in StandupSection and AnnualCompassView.
- [x] Verified with full production build (next build).
