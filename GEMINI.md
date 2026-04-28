# Hub Project (Personal OS)

A Next.js application designed to manage personal data, modeled as a modular "Personal Operating System".

## Project Overview

- **Framework:** Next.js 16 (App Router) with Turbopack.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS v4 (using `@theme` tokens in `src/app/globals.css`).
- **Architecture:** Domain-Driven Modular Monolith.
- **Database:** PostgreSQL via Prisma 7.
- **Authentication:** NextAuth v5 (Beta) with Session-DB sync.
- **PowerShell**
- **Always use Engineering Standards**

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

# Engineering Standards

## 🔴 MANDATORY WORKFLOW — NEVER SKIP THESE STEPS

### BEFORE any implementation:

0. **Clarify before acting** — if the task is ambiguous or lacks details, ask
   targeted clarifying questions BEFORE reading changelogs or writing any code.
   Do NOT make assumptions. Ask about:
   - Exact scope ("which domain / space / component?")
   - Expected behavior ("what should happen when...?")
   - Edge cases or constraints ("should this work offline / for all users?")
   Ask all questions in ONE message — do not ask one at a time.

1. **Read the changelog** for the relevant domain:
   `docs/changelog/{domain}.md`
   — Understand recent context before touching any code.

2. **Research first** — if the task involves a non-trivial decision (architecture,
   library choice, pattern), create a research note in `docs/research/`
   (e.g., `space-vs-system.md`) BEFORE writing any code.

### AFTER any fix or feature:

1. **Append to the domain changelog** `docs/changelog/{domain}.md`:
   - 1-2 sentence summary of what changed.
   - Verification checklist:
     - [ ] Logic implemented
     - [ ] UI updated
     - [ ] Verified with tsc / lint / build
   **This step is not optional. A task is NOT complete without a changelog entry.**

---

## Other Standards

- **Source Control**: NEVER stage, commit, or push without explicit user permission.
- **Verification Mandate**: After every significant change, run:
  `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` — task is not done until all pass.
- **Stable Layouts**: Use `DomainTemplate` for hub pages.
- **Component Integrity**: Use custom UI from `src/components/ui`.
  NEVER use `alert`, `prompt`, or other native browser methods.
- **Type Safety**: Avoid `any`. Use module augmentation for NextAuth types.

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
