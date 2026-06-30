# myhub

Personal life management system ("Calm OS") — daily execution + strategic planning.
Currently focused on the **life domain only** after cleanup of 10+ unused domains.

## Stack

- **Framework**: Next.js 16 App Router, React 19
- **DB**: PostgreSQL (Supabase) + Prisma 7 + `@prisma/adapter-pg`
- **Auth**: NextAuth v5 (Google OAuth only)
- **Styling**: Tailwind CSS 4
- **Validation**: Zod 4
- **Package manager**: pnpm

## Structure

```
src/
  app/(auth)/login/          — Google OAuth login (Void Terminal aesthetic)
  app/(dashboard)/life/      — Active domain: journal, tasks, habits, week, history
  features/life/             — Feature module (repository/action/service/component layers)
    repositories/            — DB access via Prisma
    actions/                 — Server Actions (mutations)
    services/                — Business logic
    components/              — UI components
    schemas.ts               — Zod schemas
    types.ts                 — Domain types
  lib/cache.ts               — unstable_cache wrappers for reads
  lib/revalidate.ts          — revalidateTag helpers
prisma/schema.prisma         — Source of truth for DB models
docs/                        — Project knowledge base (context, research)
```

## Commands

```bash
pnpm dev                     # Dev server
pnpm build                   # Production build
pnpm lint                    # ESLint
npx prisma db push           # Sync schema to DB (dev flow)
npx prisma studio            # DB GUI
npx tsc --noEmit             # Type check only
```

## Conventions

- **Server Components** by default; Client Components only when interactive
- **Mutations** → Server Actions in `actions/` (use `revalidateTag` not `revalidatePath`)
- **Reads** → wrap with `unstable_cache` in `src/lib/cache.ts`
- **Validation** → Zod schema at entry point of every action
- **Repository pattern** in `src/features/life/repositories/` — DB calls only, no business logic
- **SystemStatus** enum drives crisis/recovery UI: `STABLE → CRISIS_SURVIVAL → CRISIS_STABILIZATION → CRISIS_RE_ENTRY`
- Design language: **Void Terminal** — dark `#0a0a0b`, muted blue `#60a5fa`, glassmorphism

## Session Protocol

**На початку кожної сесії — прочитай:**
1. `docs/context/now.md` — поточний стан проекту
2. `docs/context/next.md` — що планувалось зробити

**Наприкінці сесії — онови:**
1. `docs/context/now.md` — що змінилось у стані
2. `docs/context/next.md` — що лишилось / нові кроки
3. Додай `docs/context/sessions/YYYY-MM-DD.md` — короткий лог (що зроблено, рішення, питання)

## Docs Map

- `docs/context/now.md` — поточний стан (читати першим)
- `docs/context/next.md` — наступні кроки
- `docs/context/decisions.md` — журнал архітектурних рішень
- `docs/context/sessions/` — логи сесій
- `docs/research/` — стратегічні нотатки
- `docs/changelog/` — версійний журнал змін
