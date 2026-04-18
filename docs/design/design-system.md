# Design System — Vitalii's Hub (v0.3.0)

## Core Philosophy

A "personal operating system" aesthetic. High-contrast, warm dark theme, focused on modularity and information density. Inspired by Notion's structure and Linear's precision.

---

## Typography (Updated: "The Classics")

We use **Inter** for its neutral, premium feel and high readability.

| Role      | Font Family     | Weight       | Tracking | Purpose                          |
|-----------|-----------------|--------------|----------|----------------------------------|
| Headings  | Inter           | 800 (Black)  | -0.04em  | Page titles, Section headers     |
| UI / Body | Inter           | 400 - 600    | -0.015em | General interface, Data tables   |
| Mono      | Geist Mono      | 400 - 500    | 0.2em    | Metadata, Labels, Status, Breadcrumb |

### Header Scale
- **Page Title**: `text-5xl font-black uppercase tracking-tighter`
- **Module Title**: `text-4xl font-black uppercase tracking-tight`
- **Sidebar Brand**: `text-xl font-black`
- **Nav Label**: `text-[11px] font-mono uppercase tracking-[0.2em]`
- **Metadata**: `text-[11px] font-mono uppercase tracking-wider` (Increased for legibility)

---

## Colors (High-Contrast Warm Dark)

Updated for maximum legibility on dark backgrounds.

| Token             | Hex       | Tailwind Class        | Usage                                |
|-------------------|-----------|-----------------------|--------------------------------------|
| `--color-bg`      | `#0f0d0a` | `bg-bg`               | Canvas background                    |
| `--color-surface` | `#1a1712` | `bg-surface`          | Sidebar, Primary cards               |
| `--color-raised`  | `#221e18` | `bg-raised`           | Hover states, Active nav items       |
| `--color-border`  | `#2c271f` | `border-border`       | Main structural dividers             |
| `--color-text`    | `#ffffff` | `text-text`           | Primary content, High contrast       |
| `--color-secondary`| `#d1c7bc` | `text-secondary`      | Secondary information, metadata      |
| `--color-muted`   | `#a3968a` | `text-muted`          | Inactive labels, placeholder text    |
| `--color-accent`  | `#e09b2f` | `text-accent`, `bg-accent` | Primary branding, Active indicators |
| `--color-accent-muted` | `#3a2a0e` | `bg-accent-muted` | Subtle highlights, Selection         |

---

## UI Components (Modular Library)

### Form Elements
- **Input**: Custom borderless `inline` variant for tables and bordered `default` variant for standalone forms. Spinners (arrows) are disabled for `type="number"`.
- **Select**: Custom dropdown with Lucide chevrons. Maintains mono-font uppercase style.
- **Tabs**: Linear-style (Pills). Rounded-full buttons with subtle borders. Active tab uses `bg-accent` with a glow effect (`shadow-accent`).
- **Interactivity**: All inputs use `focus:ring-1 focus:ring-accent` for consistent feedback.

### Feedback System
- **Toasts**: Handled by **sonner**. Dark theme, positioned `top-right`. Matches structural colors (`bg-surface`, `border-border`).

---

## structural Components

### Data Tables (Notion-style)
- **Border**: Minimal horizontal dividers (`border-b border-border/50`).
- **Header**: Mono font, uppercase, tracking `0.18em`.
- **Hover**: Subtle background lift (`hover:bg-raised/50`).
- **Editing**: Seamless inline editing using `Input[variant="inline"]`.

### Sidebar (Modular)
- **Width**: `w-64`
- **Padding**: `p-4`
- **Groups**: Each module is wrapped in a `bg-surface/40` container with `rounded-2xl` and `border-border/40`.
- **Interactivity**: Headers toggle visibility via CSS grid transitions.

---

## Layout & Spacing (Density over White-space)

- **Page Inset**: `px-14 py-10` (Reduced from `py-16` for density)
- **Component Gap**: `gap-12` (Standard gap between page sections)
- **Module Gap**: `gap-16` (Major module-level separation)
