# Research: Domain-Driven Architecture for MyHub

Date: 2026-04-21
Subject: Reorganizing project structure into a strictly modular, domain-centric architecture.

## 1. Current State Assessment
Currently, the project uses a hybrid approach:
- `src/features/*` for some domain logic.
- `src/app/(dashboard)/*` contains both routing and complex UI components.
- `src/components/ui` for primitive components.

## 2. Proposed Architecture: "Feature-Mini-Apps"
The goal is to make every major module (Life, Planning, Food, etc.) a self-contained "mini-app" within the `src/domains` (or `src/features`) directory.

### Structural Rules:
1.  **Routing Only in `app/`**: Pages should only fetch data (using queries) and pass it to domain-specific components. No complex JSX in `page.tsx`.
2.  **Strict Separation of Read/Write**:
    - `queries.ts`: Read-only Prisma calls (marked with `server-only`).
    - `actions.ts`: Write/Update operations (marked with `"use server"`).
3.  **Component Tiers**:
    - `src/components/ui`: Agnostic primitives (Button, Input).
    - `src/domains/{domain}/components`: Components aware of domain data.
4.  **No Cross-Domain Imports**: Domains should not import from each other directly. Shared logic moves to `src/lib` or `src/components/shared`.

## 3. The New Directory Map

```text
src/
├── domains/                # Self-contained modules
│   ├── {module_name}/
│   │   ├── actions.ts      # Server Actions (Mutations)
│   │   ├── queries.ts      # Database Queries (Read)
│   │   ├── components/     # Domain-specific UI
│   │   ├── hooks/          # Domain logic/state
│   │   ├── schemas.ts      # Zod validation
│   │   ├── types.ts        # TypeScript definitions
│   │   └── constants.ts    # Module configuration
├── components/
│   ├── ui/                 # Primitives (shadcn style)
│   └── shared/             # Cross-module components (Sidebar, Nav)
├── app/                    # Routing layer ONLY
│   └── (dashboard)/
│       └── {route}/        # Only page.tsx and layouts
└── lib/                    # Shared utilities & config (Prisma, Utils)
```

## 4. Implementation Steps
1.  **Rename `features` to `domains`** (optional, but clarifies intent).
2.  **Surgical Move**: For each space (e.g., Life):
    - Move components from `app/(dashboard)/life/_components` (if any) to `domains/life/components`.
    - Split `actions.ts` into `actions.ts` and `queries.ts`.
3.  **Refactor Pages**: Simplify `app/` pages to be data-fetching wrappers.

## 5. Benefits
- **Scalability**: Adding a new "Space" is predictable.
- **Maintainability**: Clear boundaries prevent the "big ball of mud" pattern.
- **Developer Experience**: Easier to find files; less mental mapping.
