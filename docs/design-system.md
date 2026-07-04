# 🪐 "Cyber-Craft Acrylic" Design System Specification

**myhub** is the user's personal digital environment. The **Cyber-Craft Acrylic** design system combines the high-contrast technical utility of developer command-line interfaces (inspired by Linear and Vercel) with the physical depth of macOS frosted glass (Glassmorphism) and the strict readability of technical terminal layouts (CLI).

---

## 🎨 1. Glassmorphism & Color Palette (Color Tokens)

The system uses an **Acrylic Layering Model** to establish hierarchy. Surfaces are translucent, refracting underlying graphics (blurs) to create depth.

### 🌑 Translucent Glass Surfaces

| Token | CSS / Tailwind Classes | Description | Purpose |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#08080a` (Solid) | Deep dark canvas | The primary background viewport. |
| `glass-sidebar` | `bg-surface/20 backdrop-blur-xl border-r border-white/5` | High-blur frosted glass | Sidebar navigation shell (Finder style). |
| `glass-card` | `bg-surface/45 backdrop-blur-md border border-white/8` | Standard frosted glass | Interactive widgets, content cards, and panels. |
| `glass-elevated`| `bg-elevated/75 backdrop-blur-lg border border-white/12 shadow-2xl` | Elevated glass | Dropdowns, calendar overlays, and modal dialogs. |
| `glass-input` | `bg-black/35 backdrop-blur-sm border border-white/8` | Hollow recessed glass | Inputs, select boxes, and textareas. |

### 🔵 Space-Specific System Accents

Accent colors are applied to active highlights, focus rings, select borders, and space badges:

| Space (Domain) | Token | Hex | Badge Style | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Universal** | `color-blue` | `#007aff` | `bg-blue-500/10 text-blue-400` | Core action buttons, active navigation, input focus. |
| **Health Space** | `color-emerald`| `#34c759` | `bg-emerald-500/10 text-emerald-400` | Training workouts, nutrition targets, completed metrics. |
| **Life Space** | `color-orange` | `#ff9500` | `bg-orange-500/10 text-orange-400` | Tasks, routines, active trackers, and focus of the day. |
| **Alert/Error** | `color-red` | `#ff3b30` | `bg-red-500/10 text-red-400` | Critical states, delete actions, overdue tasks. |

---

## 🔠 2. Typography Scale

1.  **Sans-Serif (Geist Sans / Inter / System-UI):** Default font for headings, text bodies, buttons, and reflections. Designed with a tight letter-spacing (`tracking-tight`) for a compact feel.
2.  **Monospace (Geist Mono / JetBrains Mono):** Mandatory for numbers, durations, times, status tags, and progress meters.

### Typography Hierarchy:
*   `text-page-title` — `1.5rem (24px) | Bold | tracking-tight`
*   `text-panel-title` — `1.125rem (18px) | SemiBold`
*   `text-body` — `0.9375rem (15px) | Regular | line-height: 1.6`
*   `text-caption` — `0.8125rem (13px) | Medium | text-text-secondary`
*   `text-label` — `0.75rem (12px) | Bold | Monospace | uppercase`

---

## 🧱 3. Form Input Elements Guide

All input components share a cohesive **recessed glass** appearance (`glass-input`). They feel hollow and sunken into the surface, becoming vibrant only upon focus.

### 📝 Text & Number Inputs (`Input`)
*   **Aesthetic:** `bg-black/35 backdrop-blur-sm border border-white/8 rounded-lg px-3 py-2 text-sm text-white transition-all`
*   **Focus State:** Smooth border highlight to `border-[var(--current-accent)]` and a glowing shadow glow.
*   **Number Variant:** Right-aligned numerical font (`font-mono text-right`).

### 📐 Textarea (`Textarea`)
*   **Aesthetic:** Same as text inputs, but with a multiline layout (`resize-none`). Line-height is adjusted (`leading-relaxed`).

### 🗂 Select Elements (`Select`)
*   **Standard Select:** A glass box with a custom caret arrow (`chevron-down`). Option lists render on an elevated glass container (`glass-elevated`).
*   **Custom Select (Combobox):** Includes a search input inside a glass dropdown overlay, highlighting matched results on hover.

### 📅 Date & Time Pickers
*   **Date Picker:** Trigger displays a calendar icon, selected date, and a clear cross button. The popup calendar renders as a `glass-elevated` grid of day cells. Active selections have a solid accent background.
*   **Date Range Picker:** Trigger displays start date and end date separated by a dash. Highlights dates in-between with a low-opacity accent background (`bg-[var(--current-accent-muted)]`).
*   **Time Picker:** Trigger displays current time. The popover displays scrollable columns (hours and minutes) or preset chips (e.g. "Morning", "Evening").

### 🟦 Checkbox
*   **Aesthetic:** A 20x20px square `bg-black/35 border border-white/8 rounded`.
*   **Checked State:** Fills with `bg-[var(--current-accent)]` and reveals a clean checkmark icon.

---

## ⚠️ 4. Implementation Guidelines

✅ **DO:**
*   Stack shadows on dropdowns to separate them from the glass surface underneath (`shadow-2xl shadow-black/60`).
*   Use a translucent border `border-white/10` to define input boundaries.
*   Enforce `backdrop-blur-md` on cards to maintain readability against high-contrast backgrounds.

❌ **DON'T:**
*   Use fully opaque backgrounds (`#ffffff` or `#121214`) for modals or sidebars.
*   Set input borders to solid opaque colors unless focused.
*   Animate text characters inside inputs—focus highlights must transition instantly or with a short delay (`duration-150`).
