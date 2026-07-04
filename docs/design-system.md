# 🪐 macOS Sonoma Desktop Design System Specification

**myhub** is the user's personal digital environment. This design system is inspired by the clean, layered aesthetics of modern **macOS Sonoma/Sequoia**. It combines frosted glass panels (glassmorphism), neutral slate foundations, system traffic light details, and strict Human Interface Guidelines (HIG) standards.

---

## 🎨 1. Materials & Color Palette

The layout uses a window-layering hierarchy where active application areas are built of translucent materials.

### 🌑 Translucent Glass Surfaces

| Token | CSS / Tailwind Classes | Description | Purpose |
| :--- | :--- | :--- | :--- |
| `bg-canvas` | `#1e1e1e` (Solid Dark) / `#f5f5f7` (Solid Light) | Solid window background | Primary window backing canvas. |
| `glass-sidebar` | `bg-neutral-900/40 backdrop-blur-3xl border-r border-white/5` | High-blur macOS sidebar | Left navigation sidebar. |
| `glass-card` | `bg-neutral-800/50 border border-white/5 shadow-md` | Standard window panel | Cards, modules, content containers. |
| `glass-elevated`| `bg-neutral-800/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60` | Elevated material | Dropdowns, dialog popovers, context menus. |
| `glass-input` | `bg-white/5 border border-white/10 rounded-md` | Recessed input well | Inputs, selects, checkbox backings. |

### 🔵 System Accents (Apple HIG Colors)
Accents are used for selection indicators, active toggles, and highlights. Default is Apple System Blue:

| Accent Color | Hex (Dark) | Hex (Light) | Purpose |
| :--- | :--- | :--- | :--- |
| **Blue** | `#0a84ff` | `#007aff` | Standard select highlights, focus rings, primary action buttons. |
| **Green** | `#30d158` | `#34c759` | Completed habits, healthy calories, profit markers. |
| **Orange** | `#ff9f0a` | `#ff9500` | Current tasks, reminders, warning states. |
| **Red** | `#ff453a` | `#ff3b30` | Destructive actions, delete buttons, error alerts. |

---

## 🔠 2. Typography Scale

1.  **System Sans-Serif (`-apple-system, BlinkMacSystemFont, "SF Pro Text"`):** macOS system UI font stack for standard controls, navigation, and text bodies.
2.  **System Monospace (`SFMono-Regular, SF Mono, Menlo`):** Mandatory for numeric counters, dates, indicators, and labels.

### Typography Hierarchy:
*   `text-page-title` — `1.375rem (22px) | Semibold | tracking-tight` (Window Title)
*   `text-panel-title` — `1rem (16px) | Semibold` (List Section Header)
*   `text-body` — `0.8125rem (13px) | Regular | line-height: 1.5` (macOS default UI body text)
*   `text-caption` — `0.6875rem (11px) | Regular | text-zinc-500` (Subtitles/Metadata)
*   `text-label` — `0.6875rem (11px) | Bold | Monospace | uppercase` (CLI labels)

---

## 🧱 3. Form Input Elements

Inputs look like recessed wells sunken into the window material.

### 📝 Text & Number Inputs (`Input`)
*   **Style:** `bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white transition-all`
*   **Focus State:** Smooth border highlight using `border-accent` and a glowing shadow `shadow-[0_0_8px_rgba(var(--color-accent),0.15)]`.
*   **Number Inputs:** Right-aligned numerical font (`font-mono text-right`).

### 🟦 Checkbox
*   **Style:** `w-4 h-4 bg-white/5 border border-white/10 rounded-md transition-all`
*   **Checked:** Fills with `bg-accent` showing a clean white checkmark.

---

## ⚠️ 4. Implementation Guidelines

✅ **DO:**
*   Implement traffic lights (red `#ff5f56`, yellow `#ffbd2e`, green `#27c93f` dots) in the window layout.
*   Enforce a clean sidebar look with list rows using rounded corners of **8px** (`rounded-lg`).
*   Set standard text sizes to **13px** (`text-[13px]`) for a native macOS desktop feel.

❌ **DON'T:**
*   Use fully black `#000000` or solid primary colors.
*   Add neon glowing grids or high-contrast tech borders.
*   Hardcode hex colors inline in JSX.
