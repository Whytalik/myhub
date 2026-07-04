---
name: design-system
description: macOS Sonoma Minimalist design system rules (glass tokens, typography, form aesthetics, do/don't). Use before creating or editing any component in src/components/ or src/features/**/components/.
---

# Skill: design-system

Read `docs/design-system.md` in full before writing or editing any frontend component — it is the source of truth. `docs/design-system.html` is the visual showcase (buttons, badges, cards, all inputs); open it for concrete markup examples when the `.md` doesn't cover a case.

This skill covers *which classes/tokens* to use. See `[[component-structure]]` for *where in the component* to compute them — token strings belong in a named variable above the `return`, never inline in JSX.

The design system has been rewritten several times (Cyber-Craft Acrylic → macOS Sonoma Desktop → Linear Calm Density → **macOS Sonoma Minimalist**, current). Always check `docs/design-system.md`'s H1 matches "macOS Sonoma Minimalist" before trusting this skill's cached values below — if it's changed again, re-derive this skill from the doc + `src/app/globals.css` rather than trusting stale notes.

## Tokens are live

Unlike earlier iterations, these tokens **are** wired into Tailwind v4 via `@theme`/`@utility` in `src/app/globals.css` — they're real utility classes, not aspirational spec. Check `globals.css` directly if a class here seems to not apply; that file is the actual source of truth for values, `docs/design-system.md` for intent/usage.

## Glass surface tokens

| Token | Utility definition | Use for |
| --- | --- | --- |
| `bg-canvas` | `--color-canvas: #1c1c1e` | Primary page viewport background (`html, body { @apply bg-canvas }`) |
| `glass-sidebar` | `bg-surface/40 backdrop-blur-3xl border-r border-white/[0.06]` | Sidebar shell |
| `glass-card` | `bg-surface/30 backdrop-blur-2xl border border-white/[0.06] rounded-2xl` | Cards, panels (includes the `rounded-2xl`, don't add it again) |
| `glass-elevated` | `bg-elevated/80 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/50` | Modals, dropdowns, popovers |
| `glass-input` | `bg-black/25 border border-white/[0.08] rounded-lg transition-all duration-150` | Inputs, selects, textareas (base state) |
| `glass-input-focus` | `border-accent bg-black/35 outline-none ring-2 ring-accent/20` | Apply on `focus:` alongside `glass-input` |

`bg-surface` = `rgba(30,30,30,0.45)`, `bg-elevated` = `rgba(45,45,45,0.85)` — both translucent, always paired with `backdrop-blur-*`.

## Accent tokens

Two separate systems — don't mix them up:

- **Global default accent**: `--color-accent` / `--color-accent-muted` (blue, `#007aff`) — used for the login page, generic focus rings, universal CTAs.
- **Per-domain accent** (baked into `@theme`, real Tailwind classes — no runtime CSS-var switching): `accent-life` (`#6fbfbf`), `accent-nutrition` (`#ff8c00`), `accent-training` (`#e87d88`). Use as `text-accent-life`, `bg-accent-life/15`, `border-accent-life/20`, etc. — see `sidebar.tsx`/`domain-header.tsx` for the active-state pattern (`bg-{accent}/15 text-{accent} border border-{accent}/20`).

Pick the accent by which domain/space the component lives under — don't hardcode a raw hex.

## Typography

Sans is the system font stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text"...`); mono (`SFMono-Regular, SF Mono, Menlo`) is mandatory for numbers, durations, times, status tags, uppercase labels.

| Class | Spec |
| --- | --- |
| `text-page-title` | 20px semibold, tracking-tight, `text-zinc-50` |
| `text-panel-title` | 15px semibold, `text-zinc-100` |
| `text-body` | 14px regular, leading-relaxed, `text-zinc-300` |
| `text-caption` | 13px regular, `text-zinc-400` |
| `text-label` | 11px semibold mono uppercase tracking-wider, `text-zinc-500` |

## Form elements

`glass-input` + `glass-input-focus` on focus is the shared look: `bg-black/25 border border-white/[0.08] rounded-lg`, focus → solid accent border + `ring-2 ring-accent/20`. Number inputs right-aligned mono (`font-mono text-right`).

**Reference implementation**: `src/components/ui/inputs/input.tsx` is fully styled — copy its pattern (base class + variant handling + focus class) for any other input primitive.

**Still bare shells, need the same treatment before/while editing them**: `textarea.tsx`, `select.tsx`, `checkbox.tsx` in `src/components/ui/inputs/` currently render raw unstyled elements. If you touch one of these, bring it up to the `input.tsx` standard rather than leaving it bare.

Per `CLAUDE.md`: never use raw `input`/`textarea`/`select`/`button` inside `src/features/` if a primitive already exists in `src/components/ui/<category>/` (`actions`, `display`, `inputs`, `navigation`, `overlays`).

## Do / Don't

✅ Use `border-white/[0.06]`–`/[0.12]` for panel/border hierarchy (thinner = more subtle surface).
✅ Rounded, spacious cards: `rounded-2xl` on card-level surfaces.
✅ Remove default browser focus rings (`outline-none focus:outline-none`) and replace with the `glass-input-focus` ring pattern.
✅ Keep transitions on hover/focus at `duration-150`.

❌ macOS traffic-light dots or other literal window-chrome decoration on panels.
❌ Raw custom properties/inline styles inside JSX — map everything to a Tailwind `@theme`/`@utility` token in `globals.css`.
❌ Inline `style={{ color: '#...' }}` / hardcoded hex — use tokens.
❌ Mixing the global `--color-accent` (blue) with a per-domain accent inside the same component — pick one based on context.
