# 🍏 macOS Sonoma Minimalist Design System Specification

**myhub** is the user's personal digital environment. This design system is inspired by the premium, spacious, translucent glassmorphism aesthetics of **macOS Sonoma**. It features warm dark slate backdrops, frosted glass panels, spacious rounded layout systems, and elegant system typography.

> Visual showcase: `docs/design-system.html` (open in a browser). It renders exactly this system — no other aesthetic variants. Real Tailwind v4 tokens live in `src/app/globals.css`; this doc and the HTML showcase should stay in sync with that file.

---

## 🎨 1. Hierarchy & Color Palette

The system builds hierarchy using **translucent frosted panels** (`backdrop-filter`) and delicate borders.

### 🌑 Elevation Surfaces

| Token | CSS / Tailwind Classes | Description | Purpose |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#1c1c1e` (Solid) | Deep warm dark gray | Primary page viewport background. |
| `bg-surface` | `rgba(30, 30, 30, 0.45)` | Translucent frosted glass | Sidebar navigation, main content panels. |
| `bg-elevated`| `rgba(45, 45, 45, 0.85)` | Elevated glass overlay | Modals, context dropdowns, calendar pickers. |
| `border-subtle`| `rgba(255, 255, 255, 0.08)` | Razor-thin border separator | Defines boundaries between panels. |
| `bg-hover` | `rgba(255, 255, 255, 0.06)` | Translucent row hover | Interactive items list hover background. |

### 🔵 Dynamic System Accents
Accents are used with restraint (CTAs, focus rings, status indicators):

| Accent Color | Hex (Dark) | Badge Style | Purpose |
| :--- | :--- | :--- | :--- |
| **Blue (Default)**| `#007aff` | `bg-blue-500/10 text-blue-400` | Focus states, universal action buttons. |
| **Green (Health)**| `#34c759` | `bg-emerald-500/10 text-emerald-400`| Nutrition goals, completed metrics. |
| **Orange (Life)** | `#ff9500` | `bg-orange-500/10 text-orange-400` | Task reminders, routine highlights. |
| **Red (Alert)**   | `#ff3b30` | `bg-red-500/10 text-red-400`     | Destructive actions, warnings. |

---

## 🔠 2. Typography Scale

1.  **Sans-Serif (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif`):** Primary UI font stack.
2.  **Monospace (`SFMono-Regular, SF Mono, Menlo, monospace`):** Mandatory for numeric counters, dates, indicators, and uppercase labels.

### Typography Hierarchy:
*   `text-page-title` — `1.25rem (20px) | Semibold | tracking-tight` (Main Page Title)
*   `text-panel-title` — `0.9375rem (15px) | Semibold` (Section/Card Title)
*   `text-body` — `0.875rem (14px) | Regular | line-height: 1.6` (Paragraph body text)
*   `text-caption` — `0.8125rem (13px) | Regular | text-zinc-400` (List navigation text, subtitles)
*   `text-label` — `0.6875rem (11px) | Semibold | Monospace | uppercase | tracking-wider` (Metadata/Labels)

---

## 🧱 3. Form Input Elements

Inputs use a dark well style that recesses elegantly into the frosted glass panels.

### 📝 Text & Number Inputs (`Input`)
*   **Style:** `bg-black/30 border border-white/8 rounded-lg px-3 py-1.5 text-sm text-zinc-150 transition-all duration-150`
*   **Focus State:** High-contrast border `border-accent/80` and subtle glow `box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.2)`.
*   **Number Inputs:** Right-aligned numerical font (`font-mono text-right`).

---

## ⚠️ 4. Implementation Guidelines

✅ **DO:**
*   Rely on frosted glass borders (`border-white/8` or `border-zinc-800/40`) to organize content.
*   Enforce a clean, spacious sidebar layout with rounded card shapes (`rounded-2xl`).
*   Ensure that browser focus outlines on click are removed using `outline-none focus:outline-none`.

❌ **DON'T:**
*   Add macOS window traffic light dots on the layout panels (keep it clean).
*   Use raw custom properties inside JSX; map all styles to Tailwind's `@theme` or `@utility`.
