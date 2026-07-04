# 🪐 myhub — Developer Context

This file serves as the system "constitution" for AI coding assistants. Keep it concise (<100 lines) to save context window tokens.

---

## 🛠️ Build & Development Commands
*   **Dev Server:** `pnpm dev`
*   **Production Build:** `pnpm build`
*   **Type Check:** `npx tsc --noEmit`
*   **Database Schema Push:** `npx prisma db push`
*   **Database Client Generate:** `npx prisma generate`

---

## 📂 Folder Structure
*   `src/app/` — Next.js 16 App Router (Layouts & Pages)
*   `src/components/layout/` — Global shell, headers, and sidebar
*   `src/components/providers/` — React context providers (sidebar, spaces)
*   `src/components/ui/` — Categorized UI primitives (`actions/`, `inputs/`, `display/`, etc.)
*   `src/features/` — Domain modules (`life/`, `health/`) containing:
    *   `components/` — Feature-specific views
    *   `actions/` — Server Actions (Mutations)
    *   `services/` — Business logic
    *   `repositories/` — Prisma DB queries
*   `src/lib/` — Shared libraries (`cache/`, `db/`, `spaces/`, `actions/`)
*   `docs/context/` — Modular workspace context files (`now.md`, `next.md`)

---

## 📝 Code Style & Guidelines
*   **Naming:** Avoid abbreviations (use `user`, `database`, `config` instead of `usr`, `db`, `cfg`).
*   **Imports:** Prefer absolute aliases `@/...` over complex relative paths.
*   **Styling:** Tailwind CSS v4 loaded via `@import "tailwindcss";` in `globals.css`.
*   **Primitives:** Never use raw HTML elements (`input`, `textarea`, `select`, `button`) inside features if a UI primitive exists in `components/ui/`.
*   **Commits:** Follow Conventional Commits format: `type(scope): description`.

---

## 🧠 Session Context
Before coding, read **`docs/context/now.md`** to load the active feature context and tasks.
