# Design System — Personal OS (MyHub)

## 1. Core Philosophy: "The Sovereign Workspace"
MyHub is designed as a modular **Personal Operating System**. It prioritizes **contextual focus**, **information density**, and **cross-domain alignment**. 

### The System vs. Space Distinction:
- **The System (Logic):** The underlying engine, rules, and data schemas (The "How").
- **The Space (Environment):** The interactive UI dashboard where work happens (The "Where").

---

## 2. Information Architecture: 5-Domain Model
The entire OS is organized into 5 fundamental **Life Domains**. Every tool and piece of data must belong to a Domain.

1.  **Operations (Gold)**: The Engine. Planning, Tasks, Habits, Daily Journal.
2.  **Health (Orange)**: Physical foundation. Nutrition (Food), Fitness, Vitals.
3.  **Mind (Indigo)**: Intellectual mastery. Languages, Library, Knowledge Base.
4.  **Wealth (Green)**: Financial resources. Trading, Portfolio, Budgeting.
5.  **Vault (Gray)**: Secondary storage. Wishlist, Archives, Utilities.

---

## 3. Typography: "The Clean OS"
We prioritize readability and clarity, using a consistent typographic scale across the entire system.

| Role      | Font Family     | Usage                            |
|-----------|-----------------|----------------------------------|
| UI / Body | Inter           | General interface, Descriptions  |
| Technical | Geist Mono      | Metadata, Metrics, Sidenotes     |

### Semantic Scale
- **Micro**: `0.75rem` — Badges, micro-statuses.
- **Label**: `0.8125rem` — Form labels, tags.
- **Caption**: `0.875rem` — Metadata, dates.
- **Note**: `0.9375rem` — Supporting text in cards.
- **Body**: `1rem` — Primary content.
- **Subtitle**: `1.125rem` — Inner card headers.
- **Heading**: `1.3125rem` — Block headers, dialog titles.
- **Title**: `1.5625rem` — Page headers.
- **Hero**: `2.25rem` — Large metrics, status displays.

*Note: Avoid forced uppercase transformations and excessive letter-spacing unless specifically required for technical labels.*

---

## 4. Color Palette & Theming (Elevation & Hierarchy)
The system supports full **Light** and **Dark** modes via semantic CSS variables.

### Dark Mode (Default)
| Token             | Value          | Usage                                |
|-------------------|----------------|--------------------------------------|
| `--color-bg`      | `#0f0d0a`      | Base canvas background               |
| `--color-surface` | `#171410`      | Primary cards, sidebars              |
| `--color-surface-hover` | `#1f1b16`| Hover states for surfaces            |
| `--color-elevated`| `#26221c`      | Modals, dropdowns, overlays          |

### Text Hierarchy
- **Primary**: `#f2ede9` — High contrast content.
- **Secondary**: `#b5a89a` — Supporting information.
- **Muted**: `#786e63` — Non-essential metadata.

---

## 5. Shape & Structure (Radii)
We use a standardized radius system to ensure visual cohesion across all components.

- **XS**: `0.25rem` (4px) — Checkboxes.
- **SM**: `0.375rem` (6px) — Buttons, inputs.
- **MD**: `0.5rem` (8px) — Small cards.
- **LG**: `0.75rem` (12px) — Standard content cards.
- **XL**: `1rem` (16px) — Large blocks, dialogs.
- **Panel**: `1.5rem` (24px) — Large interactive containers (Graphs, Calendars).

---

## 6. UI Components & Patterns

### 6.1 DomainHeader (Context Switcher)
- **Visuals**: Permanent horizontal bar at the top.
- **Behavior**: Switches the active Domain, triggering a Sidebar filter and navigating to the Domain Hub.

### 6.2 Contextual Sidebar
- **States**: Rail and Expanded modes.
- **Pinning**: Manual toggle between states.

### 6.3 Domain Hubs (Landing Pages)
Built using the **`DomainTemplate`** for visual stability.
- **Principles**: Single screen focus, hierarchical grouping, clear navigation paths.
- **Accentuation**: Use domain-specific colors (`--color-domain-*`) sparingly to indicate active context.
