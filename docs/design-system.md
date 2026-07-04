# 🪐 Linear Calm Density Design System Specification

**myhub** is the user's personal digital environment. This design system is inspired by the structured, high-density, minimalist aesthetics of modern developer tools like **Linear** and **Vercel**. It focuses on razor-thin borders, solid dark nesting, clean sans-serif typography, and semantic, sparse accent highlights.

---

## 🎨 1. Hierarchy & Color Palette

Rather than using heavy frosted glass overlays, this system builds hierarchy using **solid nesting** (elevation colors) and **razor-thin borders**.

### 🌑 Elevation Surfaces

| Token | CSS / Tailwind Classes | Description | Purpose |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#09090b` (Solid) | Deep dark backing | Primary page viewport background. |
| `bg-surface` | `#121215` (Solid) | Mid-tone surface | Sidebar navigation, main content panels. |
| `bg-elevated`| `#18181b` (Solid) | Lighter elevated surface | Modals, context dropdowns, calendar pickers. |
| `border-subtle`| `border-zinc-800/80` or `border-white/5` | Razor-thin border separator | Defines boundaries between panels. |
| `bg-hover` | `bg-white/[0.04]` | Subtle row hover | Interactive items list hover background. |

### 🔵 Dynamic System Accents
Accents are used with extreme restraint (CTAs, focus rings, status indicators):

| Accent Color | Hex (Dark) | Badge Style | Purpose |
| :--- | :--- | :--- | :--- |
| **Blue (Default)**| `#3b82f6` | `bg-blue-500/10 text-blue-400` | Focus states, universal action buttons. |
| **Green (Health)**| `#22c55e` | `bg-emerald-500/10 text-emerald-400`| Nutrition goals, completed metrics. |
| **Orange (Life)** | `#f97316` | `bg-orange-500/10 text-orange-400` | Task reminders, routine highlights. |
| **Red (Alert)**   | `#ef4444` | `bg-red-500/10 text-red-400`     | Destructive actions, warnings. |

---

## 🔠 2. Typography Scale

1.  **Sans-Serif (`Geist Sans / Inter / system-ui`):** Primary UI font stack. Designed with a tight letter-spacing (`tracking-tight`) for high density.
2.  **Monospace (`Geist Mono / SF Mono`):** Mandatory for numeric counters, dates, indicators, and uppercase labels.

### Typography Hierarchy:
*   `text-page-title` — `1.25rem (20px) | Semibold | tracking-tight` (Main Page Title)
*   `text-panel-title` — `0.9375rem (15px) | Semibold` (Section/Card Title)
*   `text-body` — `0.875rem (14px) | Regular | line-height: 1.6` (Paragraph body text)
*   `text-caption` — `0.8125rem (13px) | Regular | text-zinc-400` (List navigation text, subtitles)
*   `text-label` — `0.6875rem (11px) | Semibold | Monospace | uppercase | tracking-wider` (Metadata/Labels)

---

## 🧱 3. Form Input Elements

Inputs use flat well styling that fits seamlessly into the panel structures.

### 📝 Text & Number Inputs (`Input`)
*   **Style:** `bg-zinc-950 border border-zinc-800 rounded-md px-3 py-1.5 text-sm text-zinc-150 transition-all duration-150`
*   **Focus State:** High-contrast border `border-accent/80` and zero glowing shadows (focus ring is clean and sharp).
*   **Number Inputs:** Right-aligned numerical font (`font-mono text-right`).

### 🟦 Checkbox
*   **Style:** `w-4 h-4 bg-zinc-950 border border-zinc-800 rounded`
*   **Checked:** Fills with `bg-accent` containing a clean checkmark icon.

---

## ⚠️ 4. Implementation Guidelines

✅ **DO:**
*   Rely on sharp, razor-thin borders (`border-white/5` or `border-zinc-800`) to organize content.
*   Enforce a clean, structured sidebar layout with solid backgrounds and sharp list elements.
*   Use a default UI font size of **13px** (`text-[13px]`) for sidebar items and secondary copy to maintain calm density.

❌ **DON'T:**
*   Use heavy blurred frosted glass overlays.
*   Add drop shadows on dark surfaces (they look muddy).
*   Hardcode hex colors inline in JSX.
