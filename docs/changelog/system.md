## [2026-04-29] - Fix Supabase Build Timeout (directUrl)

### Fixed
- Fixed Vercel build timeout (45m) caused by `prisma db push` hanging on Supabase connection pooler (port 6543).
- Configured `directUrl` in `prisma.config.ts` to use a direct connection (port 5432) for schema modifications.
- Support for both standard `DIRECT_URL` and Vercel-specific `POSTGRES_URL_NON_POOLING` environment variables.

### Verification
- [x] Verified `prisma.config.ts` validity with `pnpm prisma validate`.
- [x] Verified `prisma/schema.prisma` compatibility with Prisma 7 (removed deprecated `url`/`directUrl` from schema file).
- [ ] Needs verification on Vercel after adding `DIRECT_URL` to environment variables.

## [2026-04-29] - Fix revalidatePath during render

### Fixed
- Fixed "System check failed" error in `/home` caused by calling `revalidatePath` during Server Component render.
- Refactored `runDailySystemCheckAction` to separate logic from revalidation.
- Updated `HomePage` to use `recoveryService.runDailyCheck` directly.

## [2026-04-29] - Fix SOS Trigger User Not Found (P2025)

### Fixed
- Fixed Prisma P2025 error during SOS trigger and Crisis Mode exit by adding defensive user existence checks.
- Enhanced error logging for recovery actions to include user context.
- Improved error feedback to the UI when a user profile is missing from the database despite having an active session.

### Verification
- [x] Verified user record existence via `npx tsx`.
- [x] Verified manual `prisma.user.update` success for known ID.
- Verified build stability with `pnpm build`.

## [2026-04-29] - DB Migration & Build Optimization

### Changed
- Migrated database provider from Prisma Postgres to Supabase (Neon/Supabase compatible).
- Optimized `src/lib/prisma.ts` for standard PostgreSQL connection pooling.
- Decoupled database synchronization from the build process by removing `prisma db push` from `package.json`.
- Standardized build script to `prisma generate && next build`.

### Verification
- [x] `package.json` scripts updated.
- [x] Prisma singleton simplified for production scaling.
- [x] Local type check passed.

### Verification
- [x] Logic implemented in `recoveryService`.
- [x] `HomePage` updated to avoid Server Action call during render.
- [x] Verified with `pnpm tsc --noEmit`.
- [x] Verified with `pnpm build`.
