## [2026-05-15] — UI: Standardized Space Landing & Page Padding

Standardized the padding across all Nutrition domain pages (landing and functional pages) to ensure uniform visual spacing, matching the `Life` Space layout.

- **Landing Page**: Removed custom `px-[60px]` padding in `NutritionSpacePage` to align with the standard `px-8` used system-wide.
- **Functional Pages**: Updated all sub-pages (`dishes`, `plans`, `products`, `profiles`, `shopping`, `week`) to use a consistent `px-8 py-8` container, ensuring the same spacious layout as in the `Life` Space.
- **Verification**:
    - [x] Logic implemented (padding standardized across all pages)
    - [x] UI updated (consistent spacing)
    - [x] Verified with `pnpm tsc --noEmit`
