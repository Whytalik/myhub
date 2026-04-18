# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build
pnpm lint         # ESLint

docker compose up -d          # запустити PostgreSQL локально
pnpm prisma migrate dev       # застосувати міграції
pnpm prisma generate          # регенерувати Prisma Client
pnpm prisma studio            # GUI для бази
```

## Architecture

**Next.js 16 App Router** з `src/` директорією.

### Routing

- `src/app/page.tsx` — home (`/`), рендерить `<Sidebar>` напряму (поза dashboard layout)
- `src/app/(dashboard)/layout.tsx` — shared layout з sidebar для `/food`, `/fishing`
- Нові секції додавати як `src/app/(dashboard)/{section}/page.tsx`

### Feature structure

Кожна секція (food, fishing) має свій модуль у `src/features/{section}/`:

```
actions.ts   — Next.js Server Actions ("use server")
queries.ts   — Prisma-запити (тільки server-side)
types.ts     — TypeScript типи модуля
```

Сторінки в `src/app/(dashboard)/{section}/page.tsx` імпортують з `src/features/{section}/`.

### Database

- PostgreSQL через Docker (`docker-compose.yml`, порт 5432, база `myhub`)
- Prisma Client генерується в `src/app/generated/prisma/` (не редагувати вручну)
- Singleton клієнт: `src/lib/prisma.ts` → імпортувати як `import { prisma } from "@/lib/prisma"`
- `DATABASE_URL` у `.env` вже налаштований під docker-compose

### Styling

Tailwind v4. Всі дизайн-токени в `@theme {}` у `src/app/globals.css` — тільки вони і Tailwind-класи в JSX, ніяких `style={{}}`. Дизайн система задокументована в `docs/design/design-system.md`.
