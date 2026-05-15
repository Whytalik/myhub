## [2026-05-15] — UI: Standardized and Refactored Life Space Skeletons

Refactored all loading skeletons (`loading.tsx`) and page containers in the `Life` Space to accurately mirror the functional page structure, ensuring visual consistency during data fetching.

- **Pages Updated**: `habits/page.tsx`, `tasks/page.tsx`, `journal/page.tsx`, `history/page.tsx`.
- **Skeletons Updated**: `habits/loading.tsx`, `tasks/loading.tsx`, `journal/loading.tsx`, `history/loading.tsx`.
- **Improvements**:
    - Skeletons now include headers, breadcrumbs, and filter controls where applicable, matching page structure.
    - Grid layouts in skeletons accurately represent the actual cards/task items.
    - Padding standardized to `px-8 py-8` container across all pages and skeletons to match the new UI standard.
- **Verification**:
    - [x] Logic implemented (padding standardized in pages and skeletons)
    - [x] UI updated (loading states align with page content)
    - [x] Verified with `pnpm tsc --noEmit`
