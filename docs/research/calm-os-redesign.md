# Research: Calm OS — Full Design Redesign

**Date:** 2026-05-13
**Status:** Proposed
**Scope:** Full redesign — tokens, components, layout, pages

---

## 1. Problem Statement

Current design ("Sovereign Workspace") has several issues:
- **Eye fatigue**: High contrast (#f2ede9 on #0f0d0a), warm brown tones feel heavy
- **Visual monotony**: All cards use same `border + bg-surface` pattern
- **Accent overload**: Amber (#fbbf24) used everywhere, no visual hierarchy of importance
- **Heavy components**: Sidebar, headers, modals feel visually dense
- **Inconsistent spacing**: No unified spacing scale

**Goal:** Create "Calm OS" — eye-friendly, highly readable, visually cohesive design that reduces cognitive load.

---

## 2. Design Philosophy: "Calm OS"

### Principles
1. **Reduce, don't add** — fewer visual elements, more whitespace
2. **Colors inform, don't shout** — muted, pastel domain colors
3. **Typography carries hierarchy** — size, weight, color > borders, backgrounds
4. **Depth through subtlety** — soft shadows, thin borders, glass effects
5. **Neutral canvas** — background doesn't compete with content

---

## 3. New Design Tokens

### 3.1 Color System — Dark Mode

#### Backgrounds (neutral, no warm tint)
```
--color-bg:            #0a0a0b  (zinc-950 — neutral dark)
--color-surface:       #131316  (zinc-900)
--color-surface-hover: #1c1c21  (zinc-800)
--color-elevated:      #25252b  (zinc-750)
```

#### Borders (subtle)
```
--color-border-dim:    #18181b  (zinc-900)
--color-border:        #27272a  (zinc-800)
--color-border-strong: #3f3f46  (zinc-700)
```

#### Text (reduced contrast for eye comfort)
```
--color-text-primary:   #e4e4e7  (zinc-200 — not pure white)
--color-text-secondary: #a1a1aa  (zinc-400)
--color-text-muted:     #71717a  (zinc-500)
```

#### Accent — Muted Blue
```
--color-accent:         #60a5fa  (blue-400 — muted, not neon)
--color-accent-muted:   rgba(96, 165, 250, 0.15)
--color-accent-hover:   #93c5fd  (blue-300)
```

#### Domain Colors (pastel, muted)
```
--color-domain-ops:     #818cf8  (indigo-400 — planning/execution)
--color-domain-health:  #6ee7b7  (emerald-300 — health/nutrition)
--color-domain-mind:    #a5b4fc  (indigo-300 — learning/reading)
--color-domain-wealth:  #6ee7b7  (emerald-300 — finance)
--color-domain-vault:   #a1a1aa  (zinc-400 — storage)
--color-life:           #93c5fd  (blue-300 — life space)
```

#### Semantic Colors
```
--color-success:        #6ee7b7  (emerald-300)
--color-warning:        #fcd34d  (amber-300 — muted)
--color-danger:         #f87171  (red-400 — muted)
--color-info:           #60a5fa  (blue-400)
```

### 3.2 Color System — Light Mode

```
--color-bg:            #fafafa   (zinc-50)
--color-surface:       #ffffff
--color-surface-hover: #f4f4f5   (zinc-100)
--color-elevated:      #ffffff

--color-border-dim:    #f4f4f5
--color-border:        #e4e4e7   (zinc-200)
--color-border-strong: #d4d4d8   (zinc-300)

--color-text-primary:   #18181b   (zinc-900)
--color-text-secondary: #52525b   (zinc-600)
--color-text-muted:     #71717a   (zinc-500)

--color-accent:         #3b82f6   (blue-500 — darker for light bg)
```

### 3.3 Typography

#### Base Size
```
html { font-size: 15px; }  /* was 14px */
```

#### Scale (updated for readability)
```
--text-micro:    0.75rem;    /* 11.25px — badges */
--text-label:    0.8125rem;  /* 12.2px — form labels */
--text-caption:  0.875rem;   /* 13.1px — metadata */
--text-note:     0.9375rem;  /* 14px — supporting text */
--text-body:     1rem;       /* 15px — primary content */
--text-subtitle: 1.125rem;   /* 16.9px — card headers */
--text-heading:  1.25rem;    /* 18.75px — was 1.3125rem */
--text-title:    1.5rem;     /* 22.5px — was 1.5625rem */
--text-hero:     2rem;       /* 30px — was 2.25rem */
```

#### Heading Style
```
font-weight: 700;        /* was 800 — less visual weight */
letter-spacing: -0.02em; /* was -0.04em — more readable */
```

#### Body Text
```
line-height: 1.6;        /* was ~1.4 — better readability */
letter-spacing: 0;       /* normal tracking */
```

### 3.4 Shape & Structure

#### Border Radii (simplified)
```
--radius-sm:    0.375rem;  /* 5.6px — buttons, inputs */
--radius-md:    0.5rem;    /* 7.5px — small cards */
--radius-lg:    0.75rem;   /* 11.25px — standard cards */
--radius-xl:    1rem;      /* 15px — large cards, dialogs */
--radius-2xl:   1.25rem;   /* 18.75px — hero cards */
--radius-full:  9999px;    /* pills, avatars */
```

**Change:** Remove `radius-xs` and `radius-panel`. Use `sm` for buttons, `lg` for cards, `xl` for dialogs.

### 3.5 Shadows (soft, colored tint)

```
--shadow-sm:      0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-card:    0 2px 8px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15);
--shadow-elevated:0 8px 24px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.2);
--shadow-glow:    0 0 20px rgba(96, 165, 250, 0.1);  /* accent glow */
```

### 3.6 Spacing Scale (unified)
```
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

---

## 4. Component Specifications

### 4.1 Button

```
Base: rounded-lg, font-semibold, transition-all
Sizes:
  sm:  h-8  px-3  text-caption
  md:  h-10 px-4  text-body    (default)
  lg:  h-12 px-6  text-subtitle

Variants:
  primary:   bg-accent text-bg hover:bg-accent-hover shadow-sm
  secondary: bg-surface text-primary border border-border hover:bg-surface-hover
  ghost:     bg-transparent text-secondary hover:bg-surface-hover hover:text-primary
  outline:   border border-border text-secondary hover:border-accent hover:text-accent
  danger:    bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20
```

### 4.2 Input

```
Base: h-10, rounded-lg, bg-surface/50, border border-border
Focus: ring-2 ring-accent/20, border-accent/40
Placeholder: text-muted/50
Text: text-body
```

### 4.3 Card

```
Base: bg-surface, rounded-xl, NO border (use bg difference for separation)
Hover: bg-surface-hover, subtle shadow
Header: text-heading, font-semibold, text-primary
Description: text-note, text-secondary, line-height 1.6
```

### 4.4 Tabs

```
Container: inline-flex, p-1, bg-surface, rounded-xl, border border-border/50
Tab: px-4 py-2, rounded-lg, text-note, font-medium, text-secondary
Active: bg-accent, text-bg, font-semibold
Transition: layoutId spring animation
```

### 4.5 Dialog/Modal

```
Backdrop: bg-bg/70, backdrop-blur-xl
Content: bg-elevated, rounded-xl, shadow-elevated, border border-border/50
Header: text-title, font-bold, text-primary
Max width: 480px (sm), 640px (md), 800px (lg)
```

### 4.6 Sidebar

```
Width: 280px expanded, 72px collapsed
Bg: bg-surface, border-r border-border-dim
Item: h-11, rounded-lg, px-3
Active: bg-accent/10, text-accent, left border 2px accent
Hover: bg-surface-hover
Icon: 18px, stroke-width 2
Label: text-note, font-medium
Sub-item: text-caption, text-secondary, pl-8
```

### 4.7 Domain Header

```
Height: h-16 (was h-20)
Bg: bg-bg/60, backdrop-blur-xl, border-b border-border-dim
Domain pill: px-3 py-1.5, rounded-lg, text-note
Active: bg-accent/10, text-accent, border border-accent/20
Inactive: text-muted, hover:text-primary
```

### 4.8 Section Header

```
Layout: flex, items-center, justify-between, gap-4
Icon: 16px, p-1.5, rounded-md, bg-accent/10, text-accent
Label: text-note, font-medium, text-secondary
```

---

## 5. Page-Level Changes

### 5.1 Home Page

**Current:** Grid of square cards, stats strip, domain groups
**New:**
- Greeting: larger, more prominent, with subtle gradient text
- Stats: integrated into greeting area, not separate strip
- Domain cards: horizontal scroll on mobile, grid on desktop
- Each domain card: icon + name + description + space count
- Remove "aspect-square" constraint — use natural proportions
- Add subtle background gradient or pattern (very subtle)

### 5.2 Journal History

**Current:** Dense rows with metrics
**New:**
- More whitespace between entries
- Metrics as subtle badges, not inline text
- Better date grouping visual
- Hover state with subtle bg change

### 5.3 Sprint Board

**Current:** Heavy cards with nested sections
**New:**
- Flatter card hierarchy
- Progress bars with accent color
- Better visual separation of objective/key-result/tactic levels
- Reduced visual noise in stats panel

---

## 6. Migration Plan

### Phase 1: Tokens (30 min)
- [ ] Update `globals.css` — all color tokens, typography, radii, shadows
- [ ] Update light theme variables
- [ ] Add spacing scale as CSS custom properties

### Phase 2: UI Components (1 hour)
- [ ] `button.tsx` — new variants, sizes, rounded-lg
- [ ] `input.tsx` — h-10, rounded-lg, better focus
- [ ] `tabs.tsx` — pill style, updated colors
- [ ] `dialog.tsx` — glassmorphism backdrop, rounded-xl
- [ ] `heading.tsx` — 700 weight, relaxed tracking
- [ ] `section-header.tsx` — simplified
- [ ] `breadcrumb.tsx` — updated colors
- [ ] `skeleton.tsx` — updated bg

### Phase 3: Layout Components (1 hour)
- [ ] `sidebar.tsx` — simplified, active indicator, updated colors
- [ ] `domain-header.tsx` — glassmorphism, h-16
- [ ] `mobile-bottom-nav.tsx` — updated colors
- [ ] `dashboard-ui-wrapper.tsx` — max-width for content

### Phase 4: Pages (1.5 hours)
- [ ] `home/page.tsx` — new layout, greeting, domain cards
- [ ] `life/journal/page.tsx` — updated entry cards
- [ ] `life/tasks/page.tsx` — updated task cards
- [ ] `planning/sprints/page.tsx` — updated sprint board

### Phase 5: Feature Components (1 hour)
- [ ] `SprintBoard.tsx` — flatter cards
- [ ] `JournalHistoryView.tsx` — better spacing
- [ ] `AIChatWidget` — updated colors, glassmorphism
- [ ] `SettingsModal` — updated tabs, colors
- [ ] Other feature components as needed

### Phase 6: Verification (30 min)
- [ ] `pnpm tsc --noEmit`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Manual visual review

---

## 7. Tradeoffs & Risks

### Tradeoffs
1. **Less "character"** — neutral dark bg is less distinctive than warm brown
   - Mitigation: accent color and domain colors provide personality
2. **Smaller text** — 15px base might feel small for some
   - Mitigation: can easily adjust in globals.css
3. **Less border usage** — some cards might feel less defined
   - Mitigation: bg difference + hover states provide separation

### Risks
1. **Breaking changes** — some components might rely on current token values
   - Mitigation: test each component after token changes
2. **Light theme regression** — need to update both themes
   - Mitigation: check light theme after each phase
3. **Mobile responsiveness** — new layouts need testing
   - Mitigation: test on mobile viewport during implementation

---

## 8. Success Criteria

- [ ] All pages render correctly in dark mode
- [ ] Light mode works without regressions
- [ ] Text is readable (WCAG AA contrast ratio for body text)
- [ ] No visual clutter — whitespace feels intentional
- [ ] Accent color used purposefully, not everywhere
- [ ] `tsc`, `lint`, `build` all pass
- [ ] Sidebar feels lighter and more navigable
- [ ] Home page feels welcoming, not overwhelming
