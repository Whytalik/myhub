## 2026-05-15

### Fixed: Padding inconsistency in Life Space
- Added `px-8` padding to `SpaceLanding` component in `LifeSpacePage` to ensure consistency with other domain hubs.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Fixed: Tab navigation consistency
- Split the 'Calendar' view into two distinct primary tabs: 'Calendar' (Grid view) and 'Timeline' (Hourly day view) to prevent state conflicts and UI glitches.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Added: Quick presets for TimePicker
- Added optional `presets` prop to `TimePicker` component to allow quick value selection.
- Added "22:00" preset to Bedtime selector and "08:00" preset to Wakeup selector in SleepSection.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Fixed: Layout discrepancy in Life Space
- Removed redundant `src/app/(dashboard)/life/layout.tsx` that was causing inconsistent margins compared to other domain hubs. Life Space now correctly uses the standard `DashboardLayout`.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Fixed: Journal Form Layout & Encoding
- Fixed layout issue in the Daily Entry form where the save status and time would take up a full row instead of aligning to the right of the date header by moving the `Tabs` container outside of the header wrapper.
- Moved the `Body` metrics block (Weight) directly under the `Sleep` and `Energy` row in the Morning tab for better logical grouping.
- Fixed text encoding issues in `EmotionsSection` where cyrillic text for mental, emotional, and physical states was corrupted and displayed as question marks.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Redesigned: Life Space to Calm OS Design System
- Updated all pages and components within the Life Space (Journal, Tasks, Habits, History) to align with the new Calm OS design system.
- Replaced outdated styling (heavy shadows like `shadow-2xl`, hardcoded colors like `bg-[#0f0d0a]`, and large `rounded-2xl`/`rounded-3xl` radii) with the new semantic tokens (`bg-surface`, `bg-bg`, `shadow-elevated`, `shadow-card`, `rounded-xl`).
- Simplified layout gaps and visual hierarchy to reduce cognitive load and improve readability.
- Fixed text encoding for private task masking and password placeholders (`••••••••`).
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Fixed: Journal History Date Format
- Updated journal history view to display the full day name and date (e.g., 'Friday, May 15') for better readability.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc

## 2026-05-14

### Fixed: Journal Service Type Error
- Fixed type mismatch in `upsertEntry` where `DailyEntryUncheckedUpdateInput` was incorrectly being used as a source for `DailyEntryUncheckedCreateInput`, causing compatibility issues with update operation types.
- Refactored `upsertEntry` to use a clean base payload and explicit casting for Prisma's create/update operations.
- Verification:
  - [x] Logic implemented
  - [x] Verified with tsc / build

## 2026-05-13

### Enhanced: Global font size increase (+3px)
- Increased all CSS typography tokens in `globals.css` by +3px: label (10→13px), caption (12→15px), note (13→16px), xs (14→17px), body (16→19px), subtitle (18→21px), heading (22→25px), title (26→29px).
- Updated sidebar, settings modal, and domain header font tokens by +3px each.
- Applies globally across all domains and components via Tailwind `@theme` tokens.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

### Added: Graph view filters
- Implemented task filtering for the Graph (Mind Map) view.
- Added a "Hide Done" toggle that filters out completed subtasks while keeping active ones and roots.
- Integrated filtering state in `TasksPageClient` and updated `TaskGraph` to use memoized filtered tasks.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified (no regressions in life domain)

### Fixed: Month view calendar cell height adaptation
- Refactored calendar grid to group days by week rows, allowing each row to expand vertically independently based on its specific task count.
- Implemented row-based height calculation using individual task heights and levels, ensuring the grid cell backgrounds and borders perfectly match the task overlay.
- Fixed clipping issues where tasks would overflow the calendar cells when many tasks were scheduled on the same day.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

## 2026-05-12

### Enhanced: Global font size increase across all domains
- Updated CSS typography tokens in `globals.css`: increased all base sizes by ~15-30% (label: 7→8.75px, caption: 9.6→10.5px, note: 10.5→11.4px, body: 12.25→14px). Added new tokens: `subtitle`, `heading`, `title`.
- Updated all UI components: Tabs, Breadcrumb, Heading, SpaceHeader, SpaceIntelligence, ModuleQuickAccess, StatsSummary, DailyOverview, QuickActions, RecentItems.
- Updated all domain pages: Home, Life, Nutrition, Fitness, Languages, Planning, Library, Wealth, Health, Operations, Vault, Trading, Fishing, Other, Life System, Profile.
- Updated Journal: DailyEntryForm date header, section labels, JournalHistoryView group headers and entry texts.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / lint

## 2026-05-01

### Fixed: Task Resizing & Day View UI
- Optimized task card layout in Day view: Consolidated Status, Sphere, and Priority into a single compact footer row with visual dividers.
- Anchored the left side of task cards during resizing in Day view: the start time is now strictly fixed, ensuring the card only expands/contracts to the right.
- Removed left-side resize handle from hourly timeline tasks in Day view to simplify interaction (as requested).
- Implemented optimistic state updates in `handleTimelineResize` to prevent UI "jumping" when finishing a resize.
- Fixed double-transform issue where cards would jitter during drag/resize by disabling `dnd-kit`'s transform in favor of manual coordinate calculations.
- Fixed bug where task duration was reset to zero when saving from the form.
- Added separate "Start Time" and "End Time" pickers to `TaskFormDialog` with explicit `hasPlannedTime` and `hasPlannedEndTime` flags.
- Implemented 5-minute time snapping for both the `TimePicker` and the hourly board interactions (drag & resize), ensuring all tasks start and end at "clean" times.
- Added real-time visual feedback for hourly timeline resizing: cards stretch dynamically during interaction, and current start/end times are displayed in tooltips above the card for precision.
- Expanded hourly timeline to cover the full 24-hour day (00:00 - 24:00) and increased container height.
- Restructured hourly timeline task cards with a clear vertical hierarchy: Time -> Title -> Status -> Sphere & Priority.
- Implemented 1-hour minimum duration policy: tasks visually occupy at least 1 hour, resizing is restricted to 60+ minutes, and the form defaults to a 1-hour window.
- Implemented automatic scroll to current time on Day view and added visible custom scrollbars to improve discoverability.
- Refactored `upsertTask` service to support partial updates of boolean flags.
- Updated `TaskCalendar` timeline interactions to explicitly set time flags using `updateTaskTimeRangeAction`.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / logic review

## 2026-04-30

### Refactored: Timeline moved from standalone view to Calendar Day tab
- Removed standalone Timeline tab from Tasks page (was one of 4 views: Gallery/Calendar/Timeline/Graph)
- Deleted `TaskTimeline.tsx` component
- Added "Day" tab to TaskCalendar with horizontal hourly timeline view (5:00-23:00, 15-min grid lines)
- Day timeline cards show `HH:mm title HH:mm` — compact layout with drag & drop and resize
- Journal tasks tab now has Grid/Timeline sub-tabs, using Calendar's Day view for timeline
- Fixed task creation not appearing on Day timeline (added `onSuccess` callback to TaskFormDialog)
- Fixed time fields not showing when editing tasks (default `hasPlannedTime` to true when task has plannedDate)
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc / build

### Fixed: Task layout & overlaps in calendar
- Fixed vertical and horizontal task overlaps by refactoring the level assignment logic. Tasks now maintain a consistent level across multiple rows.
- Eliminated redundant overlapping blocks by removing the logic that caused parent tasks to "absorb" children's dates. Each task is now rendered strictly at its own planned date.
- Implemented dynamic vertical scaling: task cards now report their actual height, and the calendar dynamically adjusts the vertical position (level) of all tasks to prevent overlaps when cards grow or shrink (e.g., during resizing or content wrapping).
- Fixed grid positioning issue that caused tasks to overlap when dynamic scaling was first introduced.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc

### Fixed: Task resizing in calendar
- Added resize handle to task cards in the calendar view (right side).
- Fixed hardcoded cell width (50px) by calculating it dynamically from the calendar grid, ensuring accurate resizing on all screen sizes.
- Fixed 2-to-1 day transition: resizing a multi-day task back to a single day now correctly removes the end date instead of keeping a same-day range.
- Fixed state persistence: updated the server-side logic to correctly handle `null` values for dates, preventing the UI from jumping back to old values after a successful update.
- Dynamic Leveling: Tasks now automatically find a new available level (vertical position) if resizing them would cause an overlap at their current position, ensuring they can be expanded freely.
- Added state synchronization for local tasks to prevent UI inconsistencies after updates.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc

### Fixed: Dragged task goes under other tasks in calendar
- Elevated outer container z-index to `9999` when dragging/resizing via inline style so it stays above other overlay cards (which stay at `30 + level`)
- Added visual preview during resize: task stretches in real-time as the user drags the resize handle
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [ ] Verified with tsc / lint / build

### Added: Hourly Horizontal Timeline view for Tasks
- Created a new "Timeline" view in the Tasks section with a horizontal hourly grid.
- Implemented drag & drop and resizing (stretching) of tasks across the 24-hour timeline.
- Added a "Now" indicator line and 30-minute grid markers.
- Verification:
  - [x] Logic implemented
  - [x] UI updated
  - [x] Verified with tsc
