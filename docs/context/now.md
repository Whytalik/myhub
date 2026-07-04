# Now

Active-work scratchpad — update as focus shifts. Keep this short; it's read at the start of every coding session per `CLAUDE.md`.

## Current focus (2026-07-04)

Design system is being actively iterated on — several rewrites happened today:
Cyber-Craft Acrylic → macOS Sonoma Desktop → Linear Calm Density → **macOS Sonoma Minimalist** (current, see `docs/design-system.md`).

**Known gap:** the `.claude/skills/design-system/SKILL.md` project skill was written against the Cyber-Craft Acrylic spec and is now stale relative to the current macOS Sonoma Minimalist doc — needs a refresh before relying on it for new component work.

## Recently shipped
- Nutrition macro calculation system (actual kcal/protein/fat/carbs from meal ingredients) — shipped to main.
- Life domain restructuring: History split into its own space, day-type/routine consolidation.

## Open threads
- Confirm calorie/macro accuracy against real product labels once available (protein values most impactful).
- Vercel prod env: `POSTGRES_*` vars were found empty in production — not yet fixed, needs `vercel env add` + user confirmation before touching prod.
