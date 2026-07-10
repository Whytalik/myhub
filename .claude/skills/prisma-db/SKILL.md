---
name: prisma-db
description: Prisma/Supabase workflow for myhub -- generate vs db push, the IPv6/pooler connection gotcha, migrations, and data-verification scripts. Use before running any Prisma CLI command or touching prisma/schema.prisma.
---

# Skill: prisma-db

## `generate` vs `db push`

- `npx prisma generate` — reads `prisma/schema.prisma` only, **no DB connection needed**, always safe. Outputs the client to `src/app/generated/prisma/` (gitignored, eslint-ignored). Run after every schema edit to unblock TypeScript.
- `npx prisma db push` — needs a live DB connection. Use for iterating on schema during development (no migration history). Use `npx prisma migrate deploy` (via `pnpm db:migrate`) for the reviewed-migration path (`prisma/migrations/`).

Connection resolution is in `prisma.config.ts`: it picks `POSTGRES_URL_NON_POOLING` (falls back to `DIRECT_URL`, then `DATABASE_URL`) for CLI operations — this is deliberately the **non-pooled** URL, separate from what the running app uses at request time.

## The IPv6 / pooler gotcha

This machine has no usable IPv6 route to the internet. Supabase's **direct** connection host (`db.<project-ref>.supabase.co`) is IPv6-only unless the IPv4 add-on is purchased — so a raw direct connection from here always fails with `P1001: Can't reach database server`.

The fix already in place: `.env.local` points the Prisma-relevant vars at the **Supavisor pooler** (IPv4-reachable) instead of the direct host —

- `POSTGRES_PRISMA_URL` / `POSTGRES_URL` → transaction pooler, port `6543`, `pgbouncer=true` (used by the running app)
- `POSTGRES_URL_NON_POOLING` → session pooler, port `5432` (used by the Prisma CLI per `prisma.config.ts`)
- both on `aws-0-eu-west-1.pooler.supabase.com`, user `postgres.<project-ref>`

If `db push`/`migrate` suddenly starts failing with `P1001` again:

1. Don't retry blindly expecting it to self-heal.
2. Confirm the pooler vars are still set in `.env.local` (not the direct host).
3. If the DB password was recently reset, the pooler can take up to ~60s to start authenticating — a P1000 error immediately after a reset doesn't mean "wrong password."
4. `npx prisma generate` always works regardless (schema-only) — use it to keep type-checking unblocked while a connection issue is sorted out.

## Schema conventions

See `prisma/schema.prisma`. Every user-owned model: `id String @id @default(cuid())`, `userId String` + relation to `User` (add the reverse array field on `User` too), `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`. Cross-reference `[[new-feature]]` step 1 for the full feature-slice workflow this fits into.

## Data verification scripts

For one-off data integrity checks (e.g. validating nutrition data against the food database), the established pattern is a throwaway `tsx` script at the repo root or in a `scripts/` location, run via `npx tsx <script>.ts` — see the nutrition feature's `check-nutrition.ts` / `verify-food-keys.ts` for the shape (import `prisma` from `@/lib/db/prisma`, query, assert, print pass/fail). Prefer this over ad-hoc `psql` for anything that needs the Prisma types.

## Read-only DB queries without a script

For quick schema/data lookups during conversation, use the `supabase` MCP server (configured read-only in `.mcp.json`) instead of writing a verify script — it can run `SELECT`s directly against the project. It cannot run migrations or writes; use the CLI commands above for those.
