## [2026-05-15] — UI: Standardized Nutrition Skeleton Padding

Updated all `loading.tsx` files within the Nutrition domain to use the consistent `px-8 py-8` container, ensuring the loading states perfectly match the recently standardized functional page layouts.

- **Files Updated**: `dishes/loading.tsx`, `plans/loading.tsx`, `products/loading.tsx`, `profiles/loading.tsx`, `shopping/loading.tsx`, `week/loading.tsx`.
- **Verification**:
    - [x] Logic implemented (padding standardized in skeletons)
    - [x] UI updated (loading states align with page content)
    - [x] Verified with `pnpm tsc --noEmit`
