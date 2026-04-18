# Hub Project (Food & Fishing System)

A Next.js application designed to manage personal data, primarily focused on nutrition/meal planning and fishing activities.

## Project Overview

- **Framework:** Next.js 16 (App Router) with Turbopack.
- **Language:** TypeScript.
- **Styling:** Tailwind CSS v4 (using `@theme` tokens in `src/app/globals.css`).
- **Database:** PostgreSQL managed via Prisma 7.
- **Package Manager:** pnpm.
- **Runtime Environment:** Docker for local PostgreSQL instance.

## Architecture & Conventions

### Directory Structure

- `src/app`: Next.js App Router (layouts, pages, API routes).
- `src/features/{feature}`: Modular feature logic.
  - `actions.ts`: Next.js Server Actions (`"use server"`).
  - `queries.ts`: Prisma database queries (server-side only).
  - `types.ts`: TypeScript definitions for the feature.
- `src/lib`: Shared utilities and singleton instances (e.g., `prisma.ts`).
- `src/components`: Generic UI components.
- `src/app/generated/prisma`: Custom output directory for the generated Prisma Client.
- `prisma/`: Database schema and migrations.

### Data Access (Prisma)

- **Singleton Client:** Always import the Prisma client from `@/lib/prisma`.
- **Custom Output:** Prisma Client is generated into `src/app/generated/prisma`. **DO NOT** edit these files manually.
- **Transactions:** Use `prisma.$transaction` for complex updates involving multiple related models (e.g., updating a dish with its ingredients).

### State Management & Mutations

- **Server Actions:** Use Server Actions in `actions.ts` for all mutations and data fetching from the client.
- **Action Results:** Actions should return a standardized `ActionResult<T>` type: `{ success: boolean; data?: T; error?: string }`.

### Styling Rules

- **Tailwind v4:** Use utility classes and design tokens defined in `src/app/globals.css`.
- **No Inline Styles:** Avoid `style={{}}` props unless absolutely necessary for dynamic values (e.g., calculations).

## UI & Component Guidelines

- **Custom UI Components:** ALWAYS use the custom UI components located in `src/components/ui` (e.g., `Input`, `Select`, `Button`, `Dialog`) instead of native HTML elements like `<input>` or `<select>`.
- **Modals & Alerts:** NEVER use native browser methods like `alert()`, `confirm()`, or `prompt()`. ALWAYS use the custom `Dialog` component for confirmations and `toast` (sonner) for notifications.
- **New Components:** If a required UI component does not exist in `src/components/ui`, you MUST create it as a reusable, styled component before using it in a feature. NEVER use native elements as a fallback.
- **Design System Adherence:** All components must strictly follow the specifications in `docs/design/design-system.md`.

## Development Principles

- **Research First:** Before any functional improvement, you MUST search the internet for best practices, technology documentation, and scientific research. Findings MUST be documented in `docs/research/` (create a new `.md` file for each topic).
- **Documentation Sync:** When implementing functional changes, you MUST update the corresponding space overview page (e.g., `src/app/(dashboard)/{space_name}/page.tsx`) and the Life System (formerly System Guide).
- **Up-to-Date Knowledge:** Before performing any task, always search the internet for the latest documentation (dated 2026) and best practices specifically for the technologies used in this project (Next.js 16, Prisma 7, Tailwind v4).
- **Security First:** Never expose secrets or hardcode sensitive data.

## Building and Running

### Prerequisites
- Node.js & pnpm.
- Docker (for PostgreSQL).

### Setup & Development
```bash
# Start local database
docker compose up -d

# Install dependencies
pnpm install

# Apply database migrations
pnpm prisma migrate dev

# Run development server
pnpm dev
```

### Other Commands
- `pnpm build`: Create a production build.
- `pnpm lint`: Run ESLint.
- `pnpm prisma generate`: Regenerate the Prisma Client.
- `pnpm prisma studio`: Open Prisma GUI for database management.

## Key Models (Nutrition)

- **Profile/Person:** Multi-user support within a single hub.
- **Product:** Individual food items with nutritional values (calories, protein, etc.).
- **Dish:** Collections of products (recipes).
- **DayTemplate:** Reusable meal plans.
- **WeekPlan/DayPlan:** Actual scheduled meal plans.
- **ShoppingList:** Automatically generated lists based on plans.

## Development TODOs
- [ ] Implement comprehensive test suite (Vitest/Playwright).
- [ ] Complete the `fishing` feature implementation.
- [ ] Add user authentication and authorization.
