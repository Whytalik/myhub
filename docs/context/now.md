# Now

Active-work scratchpad — update as focus shifts. Keep this short; it's read at the start of every coding session per `CLAUDE.md`.

## Current focus (2026-07-04)

Design system is being actively iterated on — several rewrites happened today:
Cyber-Craft Acrylic → macOS Sonoma Desktop → Linear Calm Density → **macOS Sonoma Minimalist** (current, see `docs/design-system.md`).

**Known gap:** the `.claude/skills/design-system/SKILL.md` project skill was written against the Cyber-Craft Acrylic spec and is now stale relative to the current macOS Sonoma Minimalist doc — needs a refresh before relying on it for new component work.

## Recently shipped

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
