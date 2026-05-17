# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Hub Project (Personal OS)

A Next.js application designed to manage personal data, modeled as a modular "Personal Operating System".

## Project Overview

- **Framework:** Next.js 16 (App Router) with Turbopack.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS v4 (using `@theme` tokens in `src/app/globals.css`).
- **Architecture:** Domain-Driven Modular Monolith.
- **Functional Index:** `docs/FEATURES.md` (Read this to understand current capabilities).
- **Database:** PostgreSQL via Prisma 7 (Driver Adapter: `@prisma/adapter-pg`).
- **Authentication:** NextAuth v5 (Beta) with Session-DB sync.
- **Package manager:** pnpm.

## Commands

```bash
# Development
pnpm dev

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Database
docker compose up -d          # start Postgres
pnpm prisma generate          # regenerate client after schema changes
pnpm prisma migrate dev       # create and apply a new migration (local)
pnpm prisma migrate deploy    # apply migrations in production

# Build (also runs prisma generate + db push)
pnpm build
```

> No test suite is configured in this project.

## Core Architecture: The Domain Model

The system is organized into 5 high-level **Life Domains**, each serving as a self-contained hub:

1. **Operations**: The "Engine". Handles 5-level planning (Vision, Milestones, Theme, Sprints, Reviews) and daily execution (Journal, Habits, Tasks).
2. **Health**: Physical optimization. Nutrition (Nutrition Space) and performance tracking (Fitness Space).
3. **Mind**: Intellectual mastery. Knowledge management (Library Space) and skill acquisition (Language Space).
4. **Wealth**: Financial resources. Portfolio tracking and market telemetry (Trading Space).
5. **Vault**: System archives. Desires (Wishlist), utilities, and low-frequency tools.

### Directory Structure

- `src/app/(dashboard)`: Routing layer. Contains lightweight page wrappers for domain hubs.
- `src/features/{domain}`: The logic core.
  - `actions/`: Server mutations (`"use server"`).
  - `services/`: Database interaction layer (called only by actions).
  - `components/`: Domain-specific UI elements.
  - `types.ts`, `schemas.ts`: Domain types and Zod validation schemas.
- `src/components/ui/`: Agnostic primitives (Shadcn-style). Always use these, never native browser methods.
- `src/components/shared/`: Cross-domain components (`Sidebar`, `DomainHeader`, `SettingsModal`).
- `src/lib/`: Singletons and shared utilities.
- `docs/changelog/{domain}.md`: Per-domain changelogs that must be updated after every change.

## Key Patterns

### Server Actions

All server actions wrap logic with `withAction()` from `src/lib/action-utils.ts`, which handles auth and returns a typed `ActionResult<T>`:

```ts
// src/lib/action-utils.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Usage in every action file:
export async function upsertHabitAction(data: UpsertHabitInput): Promise<ActionResult<...>> {
  return withAction(async (userId) => {
    const result = await habitService.upsertHabit(userId, data);
    invalidateHabitCache(userId);
    return result;
  });
}
```

### Cache Invalidation

After every mutation, call the appropriate invalidator from `src/lib/revalidate.ts`:

- `invalidateHabitCache(userId)`
- `invalidateTaskCache(userId)`
- `invalidateJournalCache(userId, date?)`
- `invalidateSprintCache(userId)`
- `invalidateFoodCache(userId)`
- etc.

Data fetching uses `unstable_cache` with tag constants from `src/lib/cache.ts`.

### Prisma

- Import client: `import { prisma } from "@/lib/prisma"`
- Import generated types/enums: `import { SphereLevel } from "@/app/generated/prisma"` (NOT from `@prisma/client`)
- After schema changes: always run `pnpm prisma generate` then `pnpm prisma migrate dev --name <description>`

### Forms

Forms use `react-hook-form` + `zodResolver` + Zod schemas. Use `useWatch({ control, name })` for reactive field values — **not** `watch()` from `useForm` (incompatible with React Compiler).

### Space Theming

Each route has an accent color via `SpaceKey` from `src/lib/spaces.ts`. The `SpaceProvider` reads the current path and injects CSS variables. Use `DomainTemplate` for all hub landing pages.

## Life Domain — Domain-Specific Notes

### Habits

- **BJ Fogg Tiny Habits**: every habit is structured as Anchor → Action → Celebration.
- `type`: `"positive"` (build) or `"avoidance"` (break). Anchor/Action are required only for positive.
- `sphereLevel`: `MINIMUM | MEDIUM | DESIRED` — effort tiers for different day types (minimum viable day vs. optimal day), not a classification of importance.
- `subcategory`: optional free-form label (e.g. "body", "mind") for grouping within a sphere.

### Tasks

- Tasks are recursive (parent-child) and belong to a `LifeSphere`.
- Tasks, Habits, Milestones, and Objectives all share the same flat `LifeSphere` model — no sphere hierarchy exists by design.

## Engineering Standards

### BEFORE any implementation

1. **Clarify before acting** — if the task is ambiguous, ask all clarifying questions in ONE message before reading code or writing anything.
2. **Read the changelog** for the relevant domain: `docs/changelog/{domain}.md`.

### AFTER any fix or feature

1. **Append to `docs/changelog/{domain}.md`** with a 1-2 sentence summary and verification checklist:
   - [ ] Logic implemented
   - [ ] UI updated
   - [ ] Verified with `pnpm tsc --noEmit`, `pnpm lint`

**A task is NOT complete without a changelog entry.**

### Other Standards

- **Source Control**: NEVER stage, commit, or push without explicit user permission.
- **Type Safety**: Avoid `any`. Use module augmentation for NextAuth types.
- **Component Integrity**: Use custom UI from `src/components/ui`. Never use `alert`, `prompt`, or other native browser methods.
- **Layouts**: Use `DomainTemplate` for hub pages.

## Building and Running

### Prerequisites

- Node.js & pnpm.
- Docker (for PostgreSQL).

### Setup & Development

```bash
docker compose up -d
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```
