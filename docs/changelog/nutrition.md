## [2026-05-15] — UI: Standardized Space Landing Padding

Standardized the padding across all space landing pages by ensuring they use the consistent `px-8` layout padding, matching the dashboard container.

- **Nutrition Space**: Removed custom `px-[60px]` padding in `NutritionSpacePage` to align with the standard `px-8` padding used in `LifeSpacePage` and the rest of the application, ensuring uniform visual spacing across all domains.
- **Verification**:
    - [x] Logic implemented (padding updated)
    - [x] UI updated (consistent spacing)
    - [x] Verified with `pnpm tsc --noEmit`
