# 🪐 "Cyber-Craft Acrylic" Design System Specification

**myhub** is the user's personal digital environment. The **Cyber-Craft Acrylic** design system combines the high-contrast technical utility of developer command-line interfaces (inspired by Linear and Vercel) with the physical depth of macOS frosted glass (Glassmorphism) and the strict readability of technical terminal layouts (CLI).

---

## 🎨 1. Color Palette (Color Tokens)

The design system is built upon an **Elevation Level** model. Instead of relying on traditional drop shadows (which disappear on dark backgrounds), depth in dark mode is achieved through stepped background brightness adjustments and fine catch-light borders.

### 🌑 Base Interface Surfaces

| Token | Color (Hex / RGBA) | Description | Purpose |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#08080a` | Deep pure dark ("the void") | Primary background of the application viewport. |
| `bg-surface` | `#121214` | Dark charcoal gray | Background for cards, sections, lists, and tables. |
| `bg-elevated` | `#1c1c1f` | Medium gray | Dropdowns, popups, and modal dialog containers. |
| `bg-hover` | `#232327` | Interactive lighter gray | Highlight background for interactive elements on hover. |
| `border-stroke`| `rgba(255, 255, 255, 0.08)` | Semi-transparent white | 1px hairline borders separating content blocks. |

### 🧪 Frosted Acrylic (macOS Vibrancy)

Applied **exclusively** to structural layout containers (sidebar, domain header, modal dialogs):

*   **Acrylic Formula:** `backdrop-blur-md bg-surface/50 border border-white/8 shadow-2xl shadow-black/40`
*   When hovering over glassmorphic elements, the border highlights to: `border-white/15`

### 🔵 System Accents (Apple System Colors)

Accent colors are applied sparingly to call-to-action buttons (CTAs), input focuses, and space-specific branding contexts:

| Space (Domain) | Token | Hex | Badge Style | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Universal** | `color-blue` | `#007aff` | `bg-blue-500/10 text-blue-400` | Core action buttons, input focus rings, active navigation tabs. |
| **Health Space** | `color-emerald`| `#34c759` | `bg-emerald-500/10 text-emerald-400` | Training workouts, nutrition targets, completed goals. |
| **Life Space** | `color-orange` | `#ff9500` | `bg-orange-500/10 text-orange-400` | Tasks, routines, active trackers, and focus of the day. |
| **Destructive/Alert**| `color-red` | `#ff3b30` | `bg-red-500/10 text-red-400` | Delete buttons, overdue deadlines, system errors. |

---

## 🔠 2. Typography Scale

Typography is split into two distinct font families to balance readability of long-form text with technical grid alignments:

1.  **Sans-Serif (Geist Sans / Inter / System-UI):** Default font for the user interface, headers, buttons, and journal reflections. It features tight letter-spacing (tracking) for a premium, compact look.
2.  **Monospace (Geist Mono / JetBrains Mono):** Mandated for numerical data, durations, times, status tags, progress rings, and code logs.

### Type Sizes Hierarchy:

*   `text-page-title` — `1.5rem (24px) | Bold | tracking-tight` (Page headers)
*   `text-panel-title` — `1.125rem (18px) | SemiBold` (Card headings)
*   `text-body` — `0.9375rem (15px) | Regular | line-height: 1.6` (Main narrative content)
*   `text-caption` — `0.8125rem (13px) | Medium | text-text-secondary` (Metadata, labels, hints)
*   `text-label` — `0.75rem (12px) | Bold | Monospace | uppercase` (Status badges, tabs)

---

## 📐 3. Spacing & Border Radii

### Corner Rounding (Border Radius):
*   `rounded-2xl` (16px) — Page cards, overlay dialog wrappers, dashboard blocks.
*   `rounded-lg` (8px) — Buttons, form inputs, dropdown selectors.
*   `rounded-full` (9999px) — Chips, status indicator dots, avatars.

### Spacing Grid:
Based on a clean 4px step system:
*   `space-1` (4px) / `space-2` (8px) — Micro-paddings (e.g. form label below input).
*   `space-4` (16px) — Standard inner card paddings.
*   `space-6` (24px) / `space-8` (32px) — Layout spacing between panels and columns.

---

## 🧱 4. Component Rules

### 🔘 Button
*   **Primary:** Solid accent background (`bg-blue-500 text-white`). Smooth scale-down transition on click (`active:scale-98`).
*   **Secondary:** Muted base surface fill (`bg-surface`) with 1px border. Darker hover state.
*   **Danger:** Low-opacity red background with matching border, highlighting only on destructive actions.
*   **Ghost/Icon:** Completely borderless and transparent. Highlights with `bg-hover` solely on mouseover.

### 📝 Form Fields (`Input` / `Textarea`)
*   Designed with a deep, border-less aesthetic: `bg-canvas/50 border border-white/8 rounded-lg`.
*   Focus transitions smoothly into the space's specific accent color with a subtle inner glow.
*   Placeholder text uses low-contrast `text-text-muted` to stay out of focus.

### 🟦 Checkbox
*   Custom UI primitive. Unchecked state is a clean hollow square with a fine border.
*   On check, it transitions to solid space-accent color with a clean glyph checkmark.

---

## ⚠️ 5. Implementation Do's & Don'ts

✅ **DO:**
*   Use monospace font styles for representing progress counters (e.g. `font-mono 8/10`).
*   Keep the canvas structured: `bg-canvas` -> `bg-surface` -> `bg-elevated`.
*   Always include smooth hover transitions (`transition-all duration-150`).

❌ **DON'T:**
*   Use multi-colored icons (icons must always inherit text colors).
*   Add heavy blurred drop-shadows around flat cards (rely on elevation levels and subtle borders).
*   Mix more than two accent colors within a single panel.
