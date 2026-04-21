# Hub Project (Personal OS)

A Next.js application designed to manage personal data, modeled as a modular "Personal Operating System".

## Project Overview

- **Framework:** Next.js 16 (App Router) with Turbopack.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS v4 (using `@theme` tokens in `src/app/globals.css`).
- **Architecture:** Domain-Driven Modular Monolith.
- **Database:** PostgreSQL via Prisma 7.
- **Authentication:** NextAuth v5 (Beta) with Session-DB sync.

## Core Architecture: The Domain Model

The system is organized into 5 high-level **Life Domains**, each serving as a self-contained hub:

1.  **Operations**: The "Engine". Handles 5-level planning (Vision, Milestones, Theme, Sprints, Reviews) and daily execution (Journal, Habits, Tasks).
2.  **Health**: Physical optimization. Nutrition (Food Space) and performance tracking (Fitness Space).
3.  **Mind**: Intellectual mastery. Knowledge management (Library Space) and skill acquisition (Language Space).
4.  **Wealth**: Financial resources. Portfolio tracking and market telemetry (Trading Space).
5.  **Vault**: System archives. Desires (Wishlist), utilities, and low-frequency tools.

### Directory Structure

- `src/app/(dashboard)`: Routing layer. Contains lightweight page wrappers for domain hubs.
- `src/features/{domain}`: The logic core.
  - `actions/`: Mutation logic (`"use server"`).
  - `services/`: Database interaction layer.
  - `components/`: Domain-specific UI elements.
- `src/components`:
  - `ui/`: Agnostic primitives (Shadcn-style).
  - `shared/`: Cross-domain components (`Sidebar`, `DomainHeader`, `SettingsModal`).
- `src/lib`: Singletons (`prisma.ts`), hooks, and global providers.

## UI & Navigation Systems

### Contextual Navigation
- **DomainHeader**: A global top bar for switching between high-level Domains.
- **Contextual Sidebar**: Dynamically filters content based on the active Domain. Supports collapsing (Rail mode) and manual pinning.
- **DomainHubs**: Dedicated landing pages for each domain built with a stable `DomainTemplate` to ensure visual consistency.

### Theme & Layout
- **Dynamic Theming**: Global support for **Light** and **Dark** modes via `SpaceProvider`.
- **Space Themes**: Each specific Space (e.g., Planning, Food) has its own accent color that propagates through the UI.

## Data Integrity & Governance

### Backup & Recovery
- **Full Export**: Generates a deep JSON snapshot of the entire system state (all related tables).
- **Deep Restore**: Implements intelligent ID mapping to restore the full relational structure from a backup file, including recursive tasks and linked ingredients.
- **System Reset**: Safe transactional wipe of all user-associated data.

### Database Sync
- **Safe Build**: Uses `prisma db push` (without data loss flags) on Vercel to protect data while ensuring schema alignment.
- **Session Sync**: Authentication callbacks are configured to fetch fresh data from the DB on every refresh, ensuring UI elements like "User Name" are always current.

## Engineering Standards

- **Source Control**: NEVER stage, commit, or push changes without explicit user permission. Always ask before performing any Git write operations.
- **Research First**: Document findings in `docs/research/` before implementation (e.g., `space-vs-system.md`).
- **Stable Layouts**: Use `DomainTemplate` for hub pages to prevent layout shifts during navigation.
- **Verification Mandate**: After every significant code modification, ALWAYS run `pnpm tsc --noEmit`, `pnpm lint`, and `pnpm build` to ensure the project's integrity. Never consider a task finished until these checks pass.
- **Component Integrity**: ALWAYS use custom UI components from `src/components/ui`. NEVER use native browser methods (`alert`, `prompt`).
- **Type Safety**: Avoid `any`. Use module augmentation for NextAuth types to maintain a strictly typed environment.

## Building and Running

### Prerequisites
- Node.js & pnpm.
- Docker (for PostgreSQL).

### Setup & Development
```bash
# Start database
docker compose up -d

# Generate Client
pnpm prisma generate

# Create/Sync Schema
pnpm prisma migrate dev

# Run
pnpm dev
```

## Development TODOs
- [ ] Complete 12-Week Sprint logic (OKRs & Tactics tracking).
- [ ] Implement automated Weekly Scorecard calculations.
- [ ] Add AI-powered reflection analysis in Daily Journal.
- [ ] Implement comprehensive test suite (Vitest/Playwright).
