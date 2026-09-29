# Now

Active-work scratchpad — update as focus shifts. Keep this short; it's read at the start of every coding session per `CLAUDE.md`.

## Current focus (2026-07-04)

Design system is being actively iterated on — several rewrites happened today:
Cyber-Craft Acrylic → macOS Sonoma Desktop → Linear Calm Density → **macOS Sonoma Minimalist** (current, see `docs/design-system.md`).

**Known gap:** the `.claude/skills/design-system/SKILL.md` project skill was written against the Cyber-Craft Acrylic spec and is now stale relative to the current macOS Sonoma Minimalist doc — needs a refresh before relying on it for new component work.

## Recently shipped

- Goal Playbook (2026-09-29): the 12-step system per yearly goal at `/life/planning/playbook`
  (`GoalPlaybook` + `GoalPhase`, `Project.goalId`). Steps 2-8 and 12 are stored on the playbook;
  9-11 are derived from projects linked to the goal (current phase, this week's atoms, atoms
  without `hasPlannedTime`). The pedal creates today's frog task via `createPedalTask`. Step
  completion is computed in `goal-playbook-service.getStepDone`. Entry points: Focus panel, goal
  row icon, Planning nav.
- Year focus (2026-09-29): `YearFocus` = the ONE sphere of the year (unique per user+year) with an
  optional lever goal (a `SphereGoal` of that sphere), a "why" and an "imperfect on purpose" note.
  Set on `/life/planning/goals` (FocusPanel); highlighted on the goals page, the wall and the sprint
  Goals tab (focus sphere first, lever badge). Soft nudge only: creating a sprint objective outside
  the focus sphere shows a warning in the Planning Wizard, nothing is blocked. Objectives are not
  linked to `SphereGoal` yet (only via their sphere).
- Life Goals (2026-09-29): yearly measurable goals per life sphere (`SphereGoal`, 3-5 per sphere,
  types COUNTER / DAYS / VALUE). COUNTER/DAYS can be tracked by a habit (progress = year's
  `HabitCompletion` count, computed on read, so goals are deliberately not `unstable_cache`d).
  Pages: `/life/planning/goals` (scorecard) and `/life/planning/goals/wall` (print A4 + fullscreen).
  `SprintGoalSlice` = a sprint's share of a yearly goal, created lazily on the sprint dashboard
  (`ensureSprintSlices`), shown in the Sprint Goals tab. Slice targets aren't editable yet.
  Unused legacy models still in the schema: `KeyResult`, `Tactic`, `Milestone`, `AnnualCompass`.
- Sprint closure (2026-09-29): an expired ACTIVE sprint is closed lazily (`getOrCreateActiveSprint` →
  `rollOverExpiredSprint`, race-safe via `updateMany` on status) and the next 12-week sprint starts.
  `/life/sprint` shows a blocking `SprintClosureDialog` while a COMPLETED sprint still has
  IN_PROGRESS objectives: outcome per objective, per unfinished project CARRY / BACKLOG / DONE /
  CANCELLED, then `SprintAfterAction`. "Pending" = COMPLETED sprint with IN_PROGRESS objectives, no
  extra flag. Planning Wizard shows a banner linking to it. Logic verified with a throwaway tsx
  script on a temp user; not yet clicked through in the browser.
- Nutrition "sets" redesign (2026-08-14): 7 daily plans → 7 "sets" cooked once, eaten across
  2 calendar days each (14-day rotation instead of 7). New `cycle.ts` module (fixed epoch,
  `14 % 7 === 0` so the set↔real-weekday-pair mapping never drifts, first set starts Sunday).
  `DayPlan.weekday` → `setId`; the one dish that didn't fit the "same day1/day2" pattern
  (Wednesday's mackerel-lunch/tuna-dinner) became set3 with a real `day2Meals` exception,
  independently rebalanced to hit `PROFILES` targets on both days. `ComputedQuantity.weekdays`
  → `.sets`, `SHOPPING_LIST` fully re-authored (buyDay grouping kept as-is — see
  `docs/context/nutrition-next.md` for why). Verified via `tsc --noEmit` + browser walkthrough
  (Daily/Shopping List/Meal Prep all render, day1/day2 toggle works, macros match targets).
- Nutrition: dropped the 3 remaining sweet breakfasts (2026-08-14) — oatmeal (set2), cottage
  cheese+berries+protein powder (set3), syrniki (set6) all replaced with savory egg-based
  dishes. Syrniki moved to set6's snack (smaller portion) instead of being cut; vanilla protein
  removed from set3's breakfast with no replacement (waiting on a protein-dessert pass, see
  `nutrition-next.md` item 5). Each new breakfast rebalanced against `PROFILES` via a throwaway
  node script. Verified via `tsc --noEmit` + browser walkthrough.
- Planning Wizard deconstruction panel: Group/Atom toggle (create groups or standalone atoms), groups show as accordions with sub-atom management, atoms render as flat rows, sidebar counts include sub-atoms — shipped to main.
- Edit/delete project capabilities in Planning Wizard (dialog modals, optimistic updates) — shipped to main.
- Detailed thought capture in the Planning Wizard (multi-line textarea, sphere/type/template selection, and UI formatting preservation) — shipped to main.
- Nutrition macro calculation system (actual kcal/protein/fat/carbs from meal ingredients) — shipped to main.
- Life domain restructuring: History split into its own space, day-type/routine consolidation.

## Open threads

- Confirm calorie/macro accuracy against real product labels once available (protein values most impactful).
- Vercel prod env: `POSTGRES_*` vars were found empty in production — not yet fixed, needs `vercel env add` + user confirmation before touching prod.
- Rest of the nutrition feedback series (2026-08-14) not started yet: egg-muffin/casserole/
  sandwich breakfast variety, bulgur & lentils, daily dessert + 1-2 fast-food sets, protein
  desserts. Items 1 ("sets") and 2 (sweet breakfasts) are done — see `docs/context/nutrition-next.md`
  for the rest of the breakdown.
