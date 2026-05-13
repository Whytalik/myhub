## [2026-05-13] — Calm OS: Full Design Redesign

### Changed
- **Design Tokens**: Neutral dark bg (`#0a0a0b`), muted blue accent (`#60a5fa`), reduced-contrast text (`#e4e4e7`), pastel domain colors
- **Typography**: Base 15px, heading weight 700 (was 800), relaxed tracking, line-height 1.6 for body
- **UI Components**: rounded-lg buttons/inputs, pill-style tabs, glassmorphism dialogs, simplified section headers
- **Layout**: Sidebar simplified (active left-border indicator, no status badges), domain header h-16 with glassmorphism, max-w-7xl content container
- **Home Page**: Integrated greeting with accent name, flatter stats strip, domain cards without aspect-square constraint
- **Feature Components**: SprintBoard, JournalHistoryView, AIChat, SettingsModal — all updated with new tokens, spacing, and radii
- **Light Theme**: Updated to match new neutral palette with darker accent (`#3b82f6`)

### Verification Checklist:
- [x] Logic implemented (15+ files across tokens, components, layout, pages, features)
- [x] UI updated (full redesign)
- [x] Verified with `pnpm tsc --noEmit`
- [x] Verified with `pnpm lint`
- [x] Verified with `pnpm build`

## [2026-05-13] - Tailwind v4 Token Refactoring

### Changed
- Replaced `rounded-[var(--radius-*)]` with native Tailwind v4 utilities (`rounded-xs`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-t-xl`) across 7 component files (38 occurrences).
- Tailwind v4 `@theme` automatically generates utilities for all defined tokens — no need for arbitrary value syntax.

### Verification Checklist:
- [x] UI updated (7 files: settings-modal, dialog, button, section-header, space-intelligence, sidebar, domain-header)
- [x] Verified with `pnpm tsc --noEmit`
- [x] Verified with `pnpm lint`

## [2026-05-01] - Multi-Provider AI Support (Groq, Google, OpenRouter)

### Added
- Додано селектор провайдера (Groq, Google, OpenRouter) прямо у вікно чату AI.
- Можливість динамічно змінювати модель та провайдера для кожного запиту.
- Оновлено `ai-actions.ts` та `ai-service.ts` для підтримки вибору провайдера з клієнта.
- [x] Logic implemented
- [x] UI updated (added dropdown to AIChatWidget)
- [x] Verified type safety

### Fixed
- Виправлено критичну помилку синтаксису в `AIChatWidget` (константи були помилково розміщені всередині JSX).
- Виправлено Groq API Error 400 шляхом додавання слова "json" у системний промпт.
- Покращено інтеграцію `AISuggestions`: тепер вони відображаються всередині потоку чату, що дозволяє вікну динамічно підлаштовуватись під розмір контенту.
- Збільшено розмір вікна чату AI (`420px` ширина, `85vh` висота) для комфортної роботи з великими пропозиціями.
- [x] Syntax errors resolved
- [x] UI refactored for better UX
- [x] Groq API connectivity fixed

### Verification Checklist:
- [x] Logic implemented (multi-provider client + service refactor)
- [x] Documentation updated (docs/hub/ai.md)
- [x] Verified JSON enforcement for all providers

## [2026-04-30] - AI Agent: Switch to OpenRouter

### Changed
- Replaced Google Gemini API with OpenRouter (free models, no quota issues)
- Model: `google/gemma-3-12b-it:free` — completely free, no billing required
- Removed `@google/generative-ai` dependency
- New `callOpenRouter()` function using standard fetch + OpenAI-compatible format
- Updated `.env` to use `OPENROUTER_API_KEY` instead of `GOOGLE_AI_API_KEY`

### Why
- Gemini free tier had `limit: 0` quota issues that couldn't be resolved
- OpenRouter provides free models without Google Cloud project setup
- Same functionality, zero cost, no rate limit headaches

### Verification Checklist:
- [x] Logic updated (OpenRouter client + service refactor)
- [x] Dependencies cleaned up (removed Gemini SDK)
- [x] Verified with `pnpm build`

## [2026-04-30] - AI Agent Integration (Google Gemini)

### Added
- Created `src/lib/ai/` — AI client singleton (`ai-client.ts`), system prompts per domain (`ai-prompts.ts`), shared types (`ai-types.ts`)
- Created `src/features/ai/` — full AI agent feature with actions, services, and components
- `AIChat` model for persistent conversation history, `AISuggestion` model for AI-generated actionable suggestions
- `AIChatWidget` — floating chat interface with domain switching (Operations/Health)
- `AISuggestions` / `AISuggestionsPanel` — panels showing AI-generated suggestions with Accept/Reject buttons
- AI can create: Tasks, Habits, Sprints, Objectives, Daily Entries
- Proactive suggestions generated from user's current state (active sprint, tasks, habits, daily entry)
- Google Gemini 2.0 Flash via free tier API

### Optimized
- Prompts shortened with few-shot examples — ~60% fewer tokens per request
- Context compression: history truncated to last 10 messages, older messages summarized
- Model routing: `gemini-2.0-flash-lite` for simple chat, `gemini-2.0-flash` for action-heavy requests
- `maxOutputTokens` capped at 500-800 to prevent runaway responses
- Temperature tuned per use case (0.3 chat, 0.2 actions, 0.4 suggestions)
- `AIUsage` model tracks daily token consumption per user
- Usage stats visible in chat header (requests count, avg tokens/req)
- Custom `Input` component used instead of native input; clears value on re-focus
- Chat history auto-trimmed at 40 messages to prevent bloat

### Verification Checklist:
- [x] Logic implemented (AI client, prompts, service, actions, components)
- [x] UI components created (chat widget, suggestions panel)
- [x] Prisma schema updated and pushed
- [x] Verified with `pnpm tsc --noEmit`
- [x] Verified with `pnpm build`

## [2026-04-30] - Bundle Size & Code Optimization Pass

### Changed
- **RoutineSection.tsx**: Replaced `import * as LucideIcons` (1500+ icons, ~150KB) with explicit import of only 23 used icons.
- **TasksPageClient.tsx**: Converted `TaskCalendar` and `TaskGraph` to dynamic imports with `React.lazy` + `Suspense`. Only the active view is loaded, reducing initial bundle by ~200KB.
- **DailyEntryForm.tsx**: Converted `RoutineSection` to dynamic import with lazy loading.
- **notification-engine.ts**: Eliminated redundant `pushSubscription.findMany` query. Now uses already-loaded subscriptions from parent queries (4 N+1 queries removed).
- **auth.ts**: Removed unused `nutritionPerson` include from login query. JWT callback now only queries DB if `token.role` is missing (eliminates DB query on every request after first login).
- **cache.ts**: TASK_INCLUDE now uses `select` for sphere fields instead of `include: true` (smaller payloads).
- **package.json**: Removed unused `dotenv` dependency.
- **seed-templates.ts**: Fixed type error — added placeholder dish for skeleton template entries.
- **day-template-service.ts**: Fixed type error — filter out entries without dishId.

### Verification Checklist:
- [x] Logic implemented (bundle optimization + query reduction + auth optimization)
- [x] Verified with `pnpm build`

## [2026-04-30] - Full Database Optimization Pass

### Added
- Extended caching layer to Food domain (6 services): dishes, week plans, day plans, shopping lists, products, persons.
- Extended caching to Wishlist and Languages domains.
- Library page now uses `groupBy` for counts (1 query instead of 4 separate COUNT queries).
- 16 database indexes added to frequently queried fields (`userId`, `status`, `type`, `date`, etc.).

### Changed
- Languages page: Eliminated N+1 query pattern — batched all language stats in single query instead of N separate queries.
- Home page: Eliminated duplicate `getTodayEntry` call in crisis mode (was firing 2 identical queries).
- Notification engine: Removed redundant `allHabits` query (only used for debug logging).
- Language service: Combined ownership check with main query in `updateSphereProgress` (2 queries → 1).
- System service: Removed massive unused includes in `getFullExport` (was fetching entire user tree, returning only 2 fields).
- Week plan service: Limited to last 5 plans instead of fetching all history.
- Day plan service: Default window of -14 to +7 days when no dates provided (instead of all history).
- Shopping list service: Limited to last 10 lists.
- All food/wishlist/language actions now use `revalidateTag` instead of `revalidatePath`.

### Verification Checklist:
- [x] Logic implemented (cache extensions + query optimizations + indexes)
- [x] UI updated (pages use cached functions)
- [x] Verified with `pnpm tsc --noEmit`
- [x] Verified with `pnpm build`

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

## [2026-04-30] - Life Sphere Sync & Icon Fixes
### Added
- Implemented \sphereSyncService\ to automatically ensure all users have the default life spheres (Finance, University, etc.).
- Integrated sphere sync into the daily system check (\unDailyCheck\).

### Fixed
- Fixed missing 'Finance' and 'University' icons in the Task creation form by updating \lucide-icons-map.ts\.
- Standardized \DEFAULT_SPHERES\ in a shared constants file (\src/features/life/constants.ts\).

### Verification Checklist:
- [x] Logic implemented (Sync service + Daily check)
- [x] UI updated (Icon mapping fixed)
- [x] Verified with tsc --noEmit

## [2026-04-30] - Database Query Caching Layer

### Added
- Created `src/lib/cache.ts` — centralized module with `unstable_cache` wrapped query functions for high-frequency reads.
- Created `src/lib/revalidate.ts` — helper functions for precise cache invalidation using `revalidateTag` (Next.js 16 API).
- Cached 16+ read queries across 6 domains: user/profile, tasks, spheres, habits, sprints, journal entries.

### Changed
- Refactored `task-service.ts` — `getAllTasks`, `getCalendarTasks`, `getTasksByDate`, `getAllSpheres` now use cached reads.
- Refactored `journal-service.ts` — `getTodayEntry`, `getEntryByDate`, `getAllEntries` now use cached reads.
- Refactored `habit-service.ts` — `getActiveHabits` now uses cached reads.
- Refactored `sprint-service.ts` — `getAllSprints`, `getActiveSprint`, `getAlignmentData`, `getAnnualCompass` now use cached reads.
- Refactored `profile-service.ts` — `getUserProfile` now uses cached reads.
- Refactored `recovery-service.ts` — `processRecoveryTransition`, `evaluateDailyRecovery` now use cached reads.
- Updated all action files (task, journal, habit, sprint, recovery, profile) to use `revalidateTag` instead of `revalidatePath` for precise cache invalidation.
- Updated server component pages (`home`, `life`, `planning`) to use cached functions.
- Fixed pre-existing TypeScript error in `prisma.ts` (`isLocal` type).

### Verification Checklist:
- [x] Logic implemented (cache module + revalidation helpers + service refactors)
- [x] UI updated (pages use cached functions)
- [x] Verified with `pnpm tsc --noEmit`
- [x] Verified with `pnpm lint`
- [x] Verified with `pnpm build`
