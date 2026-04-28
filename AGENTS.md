# AGENTS.md — Hub (Personal OS)

## Quick Start

```bash
docker compose up -d          # PostgreSQL (localhost:5432, db: myhub)
pnpm install                  # triggers prisma generate via postinstall
pnpm prisma migrate dev       # create/apply schema
pnpm dev                      # Next.js 16 dev server (Turbopack)
```

## Critical Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Production build | `pnpm build` (runs `prisma generate && prisma db push && next build`) |
| Sync schema (safe, no data loss) | `pnpm db:push` |
| Deploy migrations | `pnpm db:migrate` (runs `prisma migrate deploy`) |
| Lint | `pnpm lint` |
| Typecheck | `pnpm tsc --noEmit` |
| Full verification after changes | `pnpm tsc --noEmit && pnpm lint && pnpm build` |

**No test framework is configured.** Do not invent one or write tests unless explicitly asked.

## Architecture

**Domain-Driven Modular Monolith.** Next.js 16 App Router + Prisma 7 + PostgreSQL + NextAuth v5 (beta, credentials + JWT).

### Directory Boundaries

- `src/app/(dashboard)/` — routing layer, lightweight page wrappers per domain
- `src/app/(auth)/` — login/register pages
- `src/app/api/auth/[...nextauth]/` — NextAuth handlers
- `src/features/{domain}/` — logic core per domain. Each has `actions/`, `services/`, `components/`, `logic/`, `types.ts`
- `src/components/` — shared UI: `ui/` (primitives), `DomainHeader`, `DomainTemplate`, `Sidebar`, `MobileBottomNav`
- `src/lib/` — singletons (`prisma.ts`), constants, hooks
- `src/proxy.ts` — Next.js middleware: auth gating + role-based routing. Non-admin users are redirected from `/food`, `/languages`, `/library`, `/fitness` to `/life/journal`
- `prisma/schema.prisma` — single schema, Prisma client output at `src/app/generated/prisma`

### Path Alias

`@/*` resolves to `./src/*`

## Prisma Quirks

- Client is generated to **`src/app/generated/prisma`** (not default `node_modules`)
- Uses `@prisma/adapter-pg` with a `pg.Pool` — **connection_limit=1** for serverless (Vercel) compatibility
- SSL is disabled for local connections, enabled for remote
- Prisma client is a singleton via `globalThis` to avoid hot-reload leaks
- ESLint ignores `src/app/generated/**`

## Auth

- NextAuth v5 beta, JWT strategy, credentials provider with bcrypt
- Session includes `user.id` and `user.role` (Role enum: USER | ADMIN)
- Default role for new users is **ADMIN** (schema line 25)
- `AUTH_SECRET` or `SESSION_SECRET` env var required
- Sign-in page at `/login`

## Mandatory Workflow — Execute on Every Request

### BEFORE any implementation:

0. **Clarify before acting** — if the task is ambiguous, ask targeted questions BEFORE reading changelogs or writing code. Do NOT make assumptions. Ask all questions in ONE message.

1. **Read the changelog** for the relevant domain: `docs/changelog/{domain}.md`

2. **Research first** — for non-trivial decisions (architecture, library choice, pattern), create a research note in `docs/research/` BEFORE writing code.

### AFTER any fix or feature:

1. **Append to the domain changelog** `docs/changelog/{domain}.md`:
   - 1-2 sentence summary of what changed
   - Verification checklist:
     - [ ] Logic implemented
     - [ ] UI updated
     - [ ] Verified with tsc / lint / build
   - **This step is not optional. A task is NOT complete without a changelog entry.**

2. **Run verification**: `pnpm tsc --noEmit && pnpm lint && pnpm build` — task is not done until all pass.

## Conventions

- **Never stage/commit/push without explicit permission.** Always ask first.
- **Use custom UI components** from `src/components/ui/`. Never use native `alert()`, `prompt()`, `confirm()`.
- **Avoid `any`**. Use module augmentation for NextAuth types.
- **Use `DomainTemplate`** for hub pages to prevent layout shifts.
- Tailwind CSS v4 uses `@theme` tokens in `src/app/globals.css`.

## Env Vars

Required in `.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — NextAuth secret
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — Web Push credentials

## Deployment

Deployed on Vercel. Build runs `prisma db push` (safe sync, no `--force-reset`).
