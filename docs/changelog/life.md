## [2026-05-15] — UI: Standardized Life Space Padding

Updated all functional pages and loading skeletons in the `Life` domain to use a consistent `px-8 py-8` container, ensuring uniform visual spacing across the `Life` Space.

- **Pages Updated**: `habits/page.tsx`, `tasks/page.tsx`, `journal/page.tsx`.
- **Skeletons Updated**: `habits/loading.tsx`, `tasks/loading.tsx`, `journal/loading.tsx`.
- **Verification**:
    - [x] Logic implemented (padding standardized in pages and skeletons)
    - [x] UI updated (loading states align with page content)
    - [x] Verified with `pnpm tsc --noEmit`
