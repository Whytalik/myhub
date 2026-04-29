# System Changelog

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
- [x] Verified build stability with `pnpm build`.

### Verification
- [x] Logic implemented in `recoveryService`.
- [x] `HomePage` updated to avoid Server Action call during render.
- [x] Verified with `pnpm tsc --noEmit`.
- [x] Verified with `pnpm build`.
