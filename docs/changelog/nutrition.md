## [2026-05-18] — Fix: WeekPlanner mutations now refresh UI after server action

All mutation handlers in `WeekPlanner` (add dish, add product, remove dish, remove product, update ingredient weight, update product weight) now call `router.refresh()` on success. Previously the server action updated the DB but the client-side SSR snapshot never re-fetched, so newly added/removed items were invisible until a manual page reload. Also fixed a minor bug where `productWeight` was reset to `"1"` after adding a product (now resets to `"100"`).

- **File Updated**: `src/features/nutrition/components/planner/WeekPlanner.tsx`
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated (items appear immediately after mutation)
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-15] — UI: Standardized Nutrition Skeleton Padding

Updated all `loading.tsx` files within the Nutrition domain to use the consistent `px-8 py-8` container, ensuring the loading states perfectly match the recently standardized functional page layouts.

- **Files Updated**: `dishes/loading.tsx`, `plans/loading.tsx`, `products/loading.tsx`, `profiles/loading.tsx`, `shopping/loading.tsx`, `week/loading.tsx`.
- **Verification**:
    - [x] Logic implemented (padding standardized in skeletons)
    - [x] UI updated (loading states align with page content)
    - [x] Verified with `pnpm tsc --noEmit`
