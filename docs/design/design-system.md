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

## 3. Typography: "The Modern Engineer"
We use two primary fonts to balance aesthetic appeal with technical precision.

| Role      | Font Family     | Weight       | Tracking | Usage                            |
|-----------|-----------------|--------------|----------|----------------------------------|
| Headings  | DM Sans         | 900 (Black)  | -0.06em  | Hero titles, Domain headers      |
| UI / Body | DM Sans         | 400 - 600    | -0.015em | General interface, Descriptions  |
| Technical | Geist Mono      | 500 - 700    | 0.25em   | Metadata, Metrics, Sidenotes     |

### Heading Scale (Compact)
- **Hero Title**: `text-5xl md:text-7xl font-heading uppercase`
- **Section Label**: `text-[10px] font-mono uppercase tracking-[0.4em]`
- **Metric Value**: `text-2xl font-heading uppercase tracking-tighter`

---

## 4. Color Palette & Theming
The system supports full **Light** and **Dark** modes via CSS variables defined in `globals.css`.

| Token             | Dark (Default) | Light Mode   | Usage                                |
|-------------------|----------------|--------------|--------------------------------------|
| `--color-bg`      | `#0f0d0a`      | `#f7f5f2`    | Global canvas background             |
| `--color-surface` | `#1a1712`      | `#ffffff`    | Sidebar, Primary cards               |
| `--color-raised`  | `#221e18`      | `#efedea`    | Hover states, Secondary backgrounds  |
| `--color-border`  | `#2c271f`      | `#e2e0db`    | Structural dividers                  |
| `--color-text`    | `#ffffff`      | `#1a1712`    | Primary content                      |
| `--color-secondary`| `#d1c7bc`      | `#4a453e`    | Supporting information               |
| `--color-accent`  | Domain-linked  | Domain-linked| Dynamic accent based on Space        |

---

## 5. UI Components & Patterns

### 5.1 DomainHeader (Context Switcher)
- **Visuals**: Permanent horizontal bar (`h-14`) at the top.
- **Behavior**: Switches the active Domain, triggering a Sidebar filter and navigating to the Domain Hub.
- **Active State**: Inverted colors (Dark on Accent) with no underline.

### 5.2 Contextual Sidebar
- **States**: 
    - **Rail (w-20)**: Icon-only mode for focus.
    - **Expanded (w-64)**: Full labels and sub-navigation.
- **Pinning**: Manual toggle between Rail and Expanded states.
- **Interactivity**: Active Space card is highlighted with the Space's unique accent color (8% opacity bg, 25% opacity border).

### 5.3 Domain Hubs (Landing Pages)
Built using the **`DomainTemplate`** to ensure 100% visual stability during navigation.
- **Rules**: 
    - No vertical scroll for the main dashboard ("Single Screen Design").
    - **Top Area**: Breadcrumbs.
    - **Hero Area**: Big typography mission statement.
    - **Content Area**: Horizontal Space Cards.
    - **Bottom Area**: Fixed 3-column metrics strip.

---

## 6. Data Organization Principles

### Hierarchical Lineage
Every record must have a clear lineage:
`Domain` -> `Space` -> `Tool` -> `Sub-tool` -> `Entry`
*Example:* `Operations` -> `Life Space` -> `Journal` -> `Morning Routine` -> `Checkmark`.

### Data Governance (Export/Import)
- **Deep Restore**: The system must maintain relational integrity during imports by mapping old IDs to newly generated database IDs.
- **Recursive Tasks**: Parent-child relationships in tasks must be restored in order of depth.
- **Safe Migrations**: Always use `prisma db push` on production without `--accept-data-loss` to protect the state.

---

## 7. Interaction Rules for AI Agents
1.  **Always use `DomainTemplate`** for new high-level pages.
2.  **Never hardcode colors**: Use `var(--color-...)` or pass color props to template components.
3.  **Typography consistency**: Use `font-heading` for titles and `font-mono` for anything quantifiable.
4.  **Compactness first**: If adding content creates a scroll on a hub page, simplify or move to a sub-page.
