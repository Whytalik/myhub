## [2026-05-14] — Fix: Shopping Cart Cost Calculation

Fixed an issue where the shopping cart total cost was inflated because it didn't account for existing stock.

- **Stock-Aware Calculation**: Updated `generateShoppingCart` server action to subtract `availableGrams` from the total required weight before calculating the number of packages to buy and the total cost.
- **Verification**:
    - [x] Logic implemented
    - [x] Verified with manual inspection of calculation logic
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-14] — Fix: Product Deletion & Cleanup

Fixed an issue where products could not be deleted even after dishes were removed.

- **Robust Deletion**: Updated `deleteProduct` and `deleteAllUserProducts` server actions to explicitly clean up related transient records (`CartItem`, `ShoppingListItem`, `ProductEntry`) before deleting products. This prevents foreign key constraint violations from standalone items in the planner or cart.
- **Verification Logic**: Added clear error messages informing users if a product is still blocked by remaining dishes.
- **Verification**:
    - [x] Logic implemented (Cleanup added to server actions)
    - [x] Verified with `pnpm tsc --noEmit`


Fixed issues where users were unable to duplicate or delete week plans.

- **Schema Fix**: Added `onDelete: Cascade` to `ShoppingList` and `DayPlan` relations with `WeekPlan`. This ensures that deleting a week plan also removes (or allows removal of) associated data without foreign key constraint violations.
- **Robust Duplication**: Refactored the `duplicateWeekPlan` server action to use a single nested Prisma `create` call. This replaces the multiple sequential awaits and separate model creations, making the duplication process atomic, faster, and more reliable.
- **Database Sync**: Synchronized the database schema with the new cascade rules.
- **Verification**:
    - [x] Logic refactored (nested create)
    - [x] Schema updated (cascade delete)
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-14] — UI: Rolled back aggressive input borders

Reverted the aggressive border opacity changes to restore the subtle, clean aesthetic preferred for Calm OS.

- **`Input` & `Select`**: Reset resting border opacity to `20%`.
- **Global Styles**: Restored the universal border-color override in `globals.css` to ensure visual consistency across the system.

## [2026-05-14] — UI Consistency: Space-Aware Input Borders

Updated the base UI components and Nutrition space components to ensure inputs respect the active space's accent color.

- **`Input` & `Select` Base Components**: Refactored to use `border-accent/20` by default, with `hover:border-accent/50` and `focus-visible:border-accent`. This replaces hardcoded `amber-500` and `border-strong` values, making all inputs across the system space-aware.
- **Product Addition Modal**: Verified that all inputs in the "Add Product" form now correctly display the Nutrition space's accent border.
- **Verification**:
    - [x] Logic implemented (UI components updated)
    - [x] UI updated (Inputs are now space-aware)
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-14] — Nutrition Summary: 4-Card Grid Layout

Refactored the nutrition summaries into a 4-card grid layout for better scannability and person-specific focus.

- **Unified Callouts**: Refactored `MacroSummary` to include built-in card styling and titles, transforming them into standalone "callouts".
- **4-Card Layout**: Split the previously combined "Week Overview" and "Day Nutrition" blocks into individual cards for each person. This creates 4 distinct callouts (2 for Week, 2 for Day).
- **Grid Structure**: Implemented a responsive grid (`grid-cols-1 sm:grid-cols-2`) to display person cards side-by-side, improving layout balance.
- **Verification**:
    - [x] Logic implemented (Refactored MacroSummary & Grid layouts)
    - [x] UI updated (4 separate summary cards with headers)
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

## [2026-05-14] — Nutrition Summary Unification & Layout Polish

Unified the "Week Overview" and "Day Nutrition" components into a single shared component for consistency and improved the layout with better spacing.

- **Unified `MacroSummary`**: Extracted the inline nutrition summary from `WeekPlanner` into a shared `MacroSummary` component.
- **Consistency**: Refactored `WeekSummary` and `WeekPlanner` to use the same `MacroSummary` component, ensuring identical visual style across the application.
- **Layout Polish**: Added a 20px gap (`gap-x-5`) between macro labels (К, Б, Ж, В, Кл) and their respective progress bars for better readability.
- **Cleanup**: Deleted the unused `DayNutritionSummary.tsx` component.
- **Verification**:
    - [x] Logic implemented (Shared component + Refactoring)
    - [x] UI updated (Unified style, 20px indent added)
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

## [2026-05-14] — UI Consistency: Products Skeleton

Updated the products loading skeleton to match the card-based grid layout of the Dishes page.

- **`ProductsLoading`**: Refactored from a list/table structure to a card-based grid layout, synchronizing it with the actual `ProductLibrary` component and ensuring visual consistency with the Dishes page.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated (Skeleton synchronized with UI)
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-14] Shopping List Layout & Grouping

Improved the shopping list usability by expanding it to full width and adding grouping by stores.

- **Full-Width Layout**: Removed max-width constraints from `ShoppingCartView` to utilize the entire screen width, improving readability for long product names.
- **Store Grouping**: Replaced category-based grouping with store-based grouping. Items are now organized by their primary store (ATB, Silpo, etc.) using `STORE_META` for visual differentiation (labels and colors).
- **Multi-Store Visibility**: Added a notice in the expanded item view showing all available stores for a product if it's sold in multiple locations.
- **Unified Budget**: Removed the per-person budget distribution to show one clear total cost for the entire list.
- **Verification**:
    - [x] Logic implemented (Store-based grouping & unified cost)
    - [x] UI updated (Full-width layout, store-themed headers, removed breakdown)
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-14] Nutrition Space Skeleton Adaptation

Adapted loading skeletons for all pages in the Nutrition Space (excluding landing) to accurately mirror their actual content structure and ensure visual consistency during data fetching.

- **Header Skeleton**: Standardized the top-level navigation skeleton (Breadcrumbs + Heading + Description) across all sub-pages.
- **Page-Specific Skeletons**:
    - **Dishes**: Mirrored the `DishLibrary` grid layout with card placeholders.
    - **Plans**: Mirrored the `PlanList` with `CreatePlanForm` skeleton and multi-person macro summaries.
    - **Products**: Mirrored the `ProductLibrary` table with grouped category headers and product rows.
    - **Shopping**: Mirrored the `ShoppingCartView` with category-grouped item lists and the cost breakdown sidebar.
    - **Profiles**: Created new skeleton for `PersonForm` mirroring profile cards with macro distribution bars.
    - **Week**: Created detailed skeleton for `WeekPlanner` including day selector, `WeekSummary` bars, and meal slot tables.
- **Layout Consistency**: Removed inconsistent hardcoded paddings from `loading.tsx` files to rely on the global `DashboardUIWrapper` container padding.
- **Verification**:
    - [x] Logic implemented (Adapted skeletons for 6 sub-pages)
    - [x] UI updated (Visual consistency during navigation)
    - [x] Verified with `pnpm tsc --noEmit`


Updated nutrition seed data to reflect actual May 2026 market prices and consolidated seeding logic into a single server action.

- **Seed Consolidation**: Deleted legacy scripts (`seed-global-visual-plan.ts`, `generate-visual-week.ts`) and removed dependency on external JSON seed files (`dishes.json`, `products.json`).
- **Price Synchronization**: Updated `seedVisualPlanAction` with realistic May 2026 prices for 30+ products, synchronized with `PRODUCT_INFO` market ranges.
- **Infrastructure Update**: Added **AUCHAN** to the supported stores list in UI constants to ensure full visibility of all seed data locations.
- **Verification**:
    - [x] Logic implemented (Seed action updated, legacy scripts removed)
    - [x] UI updated (AUCHAN store badge support)
    - [x] Verified with `pnpm tsc --noEmit`

---

## [2026-05-14] Shopping Cart Redesign — Weekly Product List

Transformed the shopping cart into a clean, compact, and structured weekly product list for better scannability and store usage.

- **Compact List Layout**: Replaced bulky cards with a tight, category-grouped list layout. 
- **Status Tracking**: 
    - **One-tap Checkbox**: Quickly mark items as "Bought" (strikethrough and green checkbox).
    - **"Have" Status**: New "Home" icon toggle to mark items as already in stock, excluding them from budget while keeping them in the list.
- **Smart Information Architecture**:
    - **Primary Info**: Bold product name and total required weight (e.g., 1.25kg).
    - **Secondary Info**: Estimated cost and package calculations.
    - **Expandable Details**: Tap an item to see which dishes it's used in and adjust suggested package counts.
- **Utility Features**:
    - **Copy to Clipboard**: One-click to copy the "To Buy" list as text for sharing via messengers.
    - **Budget Distribution**: Clear breakdown of costs per person at the bottom.
- **Mobile Optimized**: Large hit areas for status toggles and expandable rows for better store experience.
- **Verification**:
    - [x] Logic implemented (Status toggling, quantity editing)
    - [x] UI updated (New compact layout, expandable rows)
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

---

## [2026-05-14] Nutrition UI Polish — Status Colors, Overlap Fixes & Styling

Refined nutrition summaries with status-based coloring, fixed layout collisions, and corrected modal input styling.

- **Status Colors**: Implemented dynamic coloring for progress bars in `WeekSummary` and `WeekPlanner`:
  - **Red**: Excess (>110% of target).
  - **Amber**: Deficit (<90% of target).
  - **Green**: Norm (within 90-110%).
- **Overlap Fixes**: Added `min-w-0` to flex/grid containers and increased gaps (gap-6 -> gap-8) in `WeekSummary` and `WeekPlanner` to prevent content collision after bars were expanded to `flex-1`.
- **Stores & Infrastructure**:
  - **New Store**: Added "Рудь" (RUD) to the supported stores list, including database schema updates (Prisma enum) and UI metadata.
  - **Input Styling**: Ensured default borders (`border-border-strong`) are visible and increased placeholder contrast. Removed default browser arrows from number inputs for a cleaner design.
- **UI Styling & Readability**: 
  - **Readability**: Improved contrast in modals by replacing low-contrast `text-muted` labels with `text-secondary`.
  - **Dialog**: Removed experimental colored frames from `Dialog`, restoring a clean system look.
- **Verification**:
    - [x] Logic implemented (Prisma schema + Store constants)
    - [x] UI updated (New store badges, improved inputs, compact shopping list)
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

---

## [2026-05-14] Progress Bar Width Expansion — Reduced Unused Space

Increased the width of macro progress bars in the Nutrition domain to utilize available screen space more effectively.

- **WeekSummary**: Replaced fixed `w-32` width with `flex-1` in `MiniBar`, allowing progress bars to expand between labels and values. Removed unused `macros` variable.
- **WeekPlanner**: Replaced fixed `w-32` width with `flex-1` and increased bar height from `h-px` (1px) to `h-1` (4px) for better visibility in the Day Nutrition summary.
- **Verification**:
    - [x] Logic implemented (Flexbox layout)
    - [x] UI updated (Wider and more visible progress bars)
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

---

## [2026-05-14] WeekPlanner UI Refactor — Inline Product Editing & Unified Add Buttons

Refined the WeekPlanner interface for faster data entry and cleaner layout.

- **Inline Product Editing**: Added support for inline weight editing for standalone products (ProductEntry), matching the behavior of dish ingredients. Added `updateProductEntryWeight` server action.
- **Unified Add Buttons**: Replaced person-specific "Add" buttons with unified "Додати страву" and "Додати продукт" buttons per meal group (e.g., Before-workout, Breakfast).
- **Table Grouping**: Refactored product entry rendering to group items by product ID across all persons in a meal group, ensuring a consistent table layout.
- **Visual Improvements**: Increased width of macro progress bars in `PersonMacroChip` (80px → 140px) and Day Summary (20px → 120px) for better readability. Added weight rounding to integers and automatic text selection on focus for inline editing fields.
- **Verification**:
    - [x] Logic implemented (Action + UI state)
    - [x] UI updated (Unified buttons, grouped product rows, wider progress bars, improved inline inputs)
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

---

## [2026-05-13] Week Plan Redesign — Color-coded Meals, Visual Stats, Notes, Editable Cooking List

Major redesign of the week plan page with color-coded meal slots, visual person macro chips, editable notes block, and editable cooking list per day.

- **Schema**: Added `notes` field to `WeekPlan` model. Added `updateWeekPlanNotes` action.
- **Week page**: Dynamic breadcrumbs (`Nutrition Space / Plans / Week_Name`), dynamic page title from plan name. Fixed Plans tab active state for `/nutrition/week` route.
- **WeekPlanner**: Each meal type (Передтрен/Сніданок/Обід/Вечеря) gets unique color scheme (purple/amber/emerald/blue) across borders, backgrounds, icons, badges, and hover states. Person macro stats rendered as `PersonMacroChip` with mini bar chart showing protein/fat/carbs ratios. Replaced auto-generated cooking algorithm with editable cooking list per day (uses existing `DayPrepNote.content`). Added editable notes block for the whole week plan.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-13] Nutrition UI Polish — Modals, Tabs, Badges, Planner Redesign

Refactored nutrition domain UI for better UX: moved inline forms to modals, added two-level category navigation, added "Actual" badge to latest week plan, and redesigned WeekPlanner and DishLibrary components.

- **PersonForm**: Moved "Add New Profile" from inline form to a modal dialog triggered by button. Cleaner profiles page with profile count and single action button.
- **ProductLibrary**: Replaced single-row Tabs with two-level navigation: main group tabs (ALL, Fresh, Protein, Pantry, Other) with counts + subcategory pills. Fixed "Delete All" button disabled state.
- **CreatePlanForm**: Moved "Create New Week Plan" from inline card to a modal dialog triggered by button.
- **PlanList**: Added "Actual" badge to the most recently created week plan with highlighted border.
- **WeekPlanner**: Redesigned meal slot cards with header icons (Flame/Clock), per-person KBJU chips, colored status borders (green/yellow/red by kcal deviation), hover-reveal delete buttons, and redesigned cooking algorithm with numbered step timeline.
- **DishLibrary**: Added two-level navigation (groups: ALL/Main/Other + subcategory pills with emojis). Extracted DishCard component for consistent styling.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-13] Dead Code Cleanup — Nutrition Domain

Removed all dead/unused code from the nutrition domain.

- **Deleted 7 files**: `actions/prices.ts` (stub Silpo price fetcher), `logic/portion-calculator.ts`, `logic/importers/index.ts` (web scraper never wired up), `logic/shopping-list.ts` (superseded by `actions/shopping.ts`), `components/visual-plan/SaucesAndMarinades.tsx`, `components/visual-plan/Favorites.tsx`, `scripts/test-shopping-list.ts` (test script for deleted shopping-list.ts).
- **Cleaned `actions/planning.ts`**: Removed 5 dead exports — `updateProductEntryWeight`, `updateDayActivity`, `importWeekPlanFromJson`, `exportWeekPlan`, `getDayPrepNote`.
- **Cleaned `logic/recalculator.ts`**: Removed 5 dead exports — `calculateRawIngredientStats`, `calculateIngredientStats`, `calculateEntryStats`, `calculateMealSlotStats`, `calculateDayPlanStats`. Kept `DishWithIngredients`, `IngredientWithProduct`, `EntryWithIngredients`, `PlanSummary` types and `calculateDishStats`.
- **Cleaned `types.ts`**: Removed 6 dead interfaces — `CreateProductInput`, `UpdateProductInput`, `UpdateDishInput`, `CreateProductEntryInput`, `CreatePersonInput`, `UpdatePersonInput`, `CreateWeekPlanInput`. Removed unused `Store` re-export.
- **Cleaned `schemas.ts`**: Removed 8 dead exports — `createPersonSchema`, `dishIngredientSchema`, `createDishSchema`, `createProductEntrySchema`, `CreatePersonFormData`, `CreateDishFormData`, `CreateProductEntryFormData`. Kept only `createProductSchema` (used by JSON import).
- **Cleaned `constants/meal-variants.ts`**: Removed empty `SCHEDULE_DEFAULT_CHOICES` export.
- **Verification**:
    - [x] Logic implemented
    - [x] UI unchanged
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-13] Raw/Cooked Weight States + Day Prep Block

Added support for entering ingredient weights as either raw or cooked, with automatic conversion for shopping cart calculations. Added per-day prep block with auto-generated steps, editable notes, and daily product list.

- **Schema**: `DishEntryIngredient` now has `weight` (input weight), `inputState` (RAW | COOKED) instead of `rawWeight`. Added `DayPrepNote` model (content, steps[]) with 1:1 relation to DayPlan.
- **Calculations**: Added `toRawWeight(weight, inputState, coefficient)` helper — converts cooked weight back to raw using cooking method coefficient. `calculateEntryNutrition` accepts `EntryWeightInput` with inputState.
- **Planning Actions**: `addDishToSlot` accepts `inputState` per ingredient. `updateDishEntryIngredient` accepts `weight` + `inputState`. `getWeekPlan` returns `weight`, `inputState`, `rawWeight` (computed), `cookedWeight`, `coefficient` per ingredient. Added `getDayPrepNote` and `updateDayPrepNote` actions. Days include `dayPlanId` and `prepNote`.
- **Shopping Cart**: `generateShoppingCart` computes raw weight from `weight / coefficient` when inputState is COOKED, ensuring cart always shows raw ingredient needs.
- **UI**: `DayPrepBlock` component — auto-generates numbered prep steps from dish ingredients (grouped by cooking method), shows daily raw product list, editable notes textarea. `WeekPlanner` shows input weight with "готове" indicator for cooked entries and "≈Xг сире" hint when coefficient ≠ 1.
- **Duplicate**: Week plan duplication now copies `DayPrepNote` data.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-13] Per-Person Ingredient Weights via DishEntryIngredient Table

Major refactor: replaced shared/serving-based portioning with per-person ingredient weights stored in new `DishEntryIngredient` table.

- **Schema**: Removed `isShared`, `portionWeight`, `servings`, `manualWeight`, `fitScore` from `DishEntry`. Removed `rawWeight` from `DishIngredient`. Added `DishEntryIngredient` (dishEntryId, ingredientIndex, rawWeight, unit).
- **Calculations**: Rewrote `calculations.ts` — `calculateEntryNutrition` accepts explicit weight array per ingredient index. `calculateDishNutrition` requires weights parameter (no fallback to template weights).
- **Planning Actions**: `addDishToSlot` now accepts `ingredientWeights[]` instead of `isShared/servings/manualWeight`. `updatePortionWeight`/`updateDishServings` replaced with `updateDishEntryIngredient`. `getWeekPlan` returns per-entry nutrition totals and ingredient-level weights. Added `duplicateWeekPlan` action.
- **Shopping Cart**: `generateShoppingCart` now aggregates directly from `DishEntryIngredient` rows instead of computing ratios from servings.
- **UI**: `DishPicker` removed "Shared" checkbox; calculates per-ingredient weights by scaling template to target portion weight. `WeekPlanner` shows per-ingredient weight editing, nutrition totals (kcal/P/F/C) per entry. `PlanList` has Duplicate button.
- **Seed/Scripts**: Updated `seed-action.ts`, `generate-visual-week.ts`, `seed-global-visual-plan.ts`, `test-shopping-list.ts` to populate/use `DishEntryIngredient`.
- **Supporting files**: Updated `recalculator.ts`, `shopping-list.ts`, `portion-calculator.ts`, `DishBuilder.tsx`, `DishLibrary.tsx`, `dishes.ts` actions to work without `DishIngredient.rawWeight`.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-13] Plans page revalidation, profile name editing, and UI fixes

- **Plans page**: Added `revalidatePath("/nutrition/plans")` to `createWeekPlan` action so the plans list updates immediately after creating a new week plan.
- **Profile name editing**: Added inline name editing to `PersonForm` profile cards — hover over the name to see the edit pencil, click to edit inline with save/cancel buttons.
- **Sidebar**: `/nutrition/week` now activates the Plans tab in the sidebar.
- **WeekPlanner**: Now shows all dish ingredients with weights, not just alternatives. Alternative buttons are shown inline next to each ingredient.
- **Shopping**: Auto-generates shopping cart on page load if it doesn't exist.
- **Seed action**: Reduced Передтрен kcal targets (Vitalii: 200→100, GF: 300→150) to prevent unrealistic portion sizes.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint`

---

## [2026-05-13] Ingredient Alternatives in Week Planner & Cart

Реалізовано підтримку вибору альтернативних інгредієнтів у тижневому планувальнику з автоматичним оновленням кошика.

- **Schema**: Додано поле `selectedAlternatives Json?` до моделі `DishEntry` для збереження вибору користувача.
- **Planner UI**: У `WeekPlanner` додано відображення альтернатив для кожного інгредієнта страви. Користувач може перемикатися між варіантами (наприклад, "Яблуко" vs "Груша"), і цей вибір зберігається в БД.
- **Server Actions**: Створено екшн `updateDishEntryAlternative` для оновлення вибраних продуктів у записі страви. Оновлено `getWeekPlan` для повернення даних про інгредієнти та вибрані альтернативи.
- **Shopping Cart**: Оновлено логіку `generateShoppingCart` — тепер при генерації кошика система враховує вибрані альтернативи та додає саме ці продукти до списку покупок замість основних.
- **Verification**:
    - [x] Logic implemented (Database + Actions)
    - [x] UI updated (Planner with alternative buttons)
    - [x] Verified with `pnpm tsc --noEmit`

---

## [2026-05-13] Exhaustive Visual Plan Seeding & Data Sync

Повна синхронізація сід-логіки з вичерпними даними Visual Plan.

- **Data Sync**: Оновлено `scripts/seed-global-visual-plan.ts` та `seedVisualPlanAction` у `src/features/system/actions/seed-action.ts` для використання повних наборів даних з `products.json` та `dishes.json`.
- **1:1 Week Plan**: Реалізовано автоматичне створення тижневого плану "Visual Plan Week (1:1)", що повністю відповідає розкладу та вибору страв на сторінці Visual Plan (включаючи Передтрен, Сніданок, Обід та Вечерю для кожного дня тижня).
- **Composite Products**: Реалізовано автоматичне створення глобальних продуктів для соусів та маринадів, що складаються з кількох інгредієнтів, на основі їхнього складу в `dishes.json`.
- **Logic Refinement**: Додано мапінг методів приготування (`cookingMethodId`) на основі категорій продуктів та виправлено невідповідність назв (наприклад, "Ткемалі").
- **Exhaustive Dataset**: Тепер сід завантажує всі 103 продукти та 37 еталонних страв, забезпечуючи 100% відповідність Visual Plan.
- **Verification**:
    - [x] Logic implemented (Sync CLI & UI actions)
    - [x] Exhaustive seeding verified with `npx tsx scripts/seed-global-visual-plan.ts`
    - [x] Verified with `pnpm tsc --noEmit`

---

## [2026-05-12] Grocery Price Update — May 2026 Ukraine Prices

Updated all product prices in `product-info.ts` based on real Silpo.ua data for May 2026.

- **All categories**: fruits, bread, meat/fish, dairy/eggs, vegetables, grains/flour, spices, drinks — prices reduced ~25-40% to reflect actual 2026 Ukrainian market rates
- **Key changes**: куряче філе 170-230 грн/кг (was 320-390), сир кисломолочний 50-85 грн/250г (was 120-180/200г), яйця 8-12 грн/шт (was 12-18), твердий сир 350-500 грн/кг (was 450-650)
- **Verification**:
    - [x] Logic implemented
    - [x] Verified with `pnpm tsc --noEmit` (no new errors)

---

## [2026-05-12] Week Plan Management & Bulk Deletion

Реалізовано повний цикл керування планами та можливість масового очищення бібліотеки.

- **Plan Management**:
    - Додано можливість редагування назви плану прямо у ворвклері.
    - Додано видалення всього тижневого плану з автоматичним редиректом.
    - Оновлено сторінку списку планів — тепер кожен план має власне посилання (`/nutrition/week?id=...`).
    - **Server Actions**: Додано `updateWeekPlanName`, оновлено `getWeekPlan` для підтримки ID з параметрів.
- **Bulk Deletion**:
    - Додано кнопки "Delete All" у бібліотеку страв та продуктів.
    *   **Dishes**: Видаляє всі страви користувача та пов'язані з ними записи в планах (`DishEntry`).
    *   **Products**: Видаляє всі продукти користувача, очищуючи кошик та записи в планах (`ProductEntry`). Глобальні продукти залишаються.
- **Verification**:
    - [x] Logic implemented (CRUD + Bulk delete)
    - [x] UI updated (Edit name, delete buttons)
    - [x] Verified with `pnpm tsc --noEmit`

---

## [2026-05-12] Dynamic Portion Calculation & Visual Plan Automation

Реалізовано систему динамічного розрахунку порцій та автоматизацію генерації тижневого плану на основі Visual Plan.

- **Portion Calculator**: Створено `portion-calculator.ts` — логіка розрахунку `servings` на основі `targetKcal` слота та калорійності страви.
- **Server Actions**: Оновлено `addDishToSlot` у `planning.ts` — тепер система автоматично вираховує `servings` та `portionWeight` при додаванні страви, щоб вона ідеально вписувалася в калорійний ліміт користувача.
- **Shopping List**: Оновлено `shopping-list.ts` — агрегація продуктів тепер базується на полі `servings`, що забезпечує точність закупівлі до грама.
- **Data Seeding**: Створено `seed-visual-plan.ts` та `generate-visual-week.ts` — скрипти для миттєвого розгортання еталонного Visual Plan (Vitalii 1700 / GF 2300) з бейглами та кебабами.
- **Verification**:
    - [x] Logic implemented (Portion calculator, aggregation)
    - [x] Portions auto-calculated in actions
    - [x] Verified with scripts (Shopping list matches expectations)
    - [x] Verified with `pnpm tsc --noEmit`

---

## [2026-05-12] Week Planner Rewrite — Date Removal, Servings, Table Layout

Rewrote week planner to remove date binding, add servings support, and switch to table layout.

- **Schema**: Removed `startDate` from `WeekPlan`, `date` from `DayPlan`. Days now use `dayOfWeek` (0-6). `MealSlotInstance` uses `name`, `timeWindow`, `order` fields directly. `DishEntry` has `servings` field.
- **Server Actions**: Updated `planning.ts` — `getWeekPlan` returns `dayOfWeek` instead of `date`, slots use `name` instead of `templateSlotName`. Added `updateDishServings` action. Simplified `calculateFitScore` (no slot param).
- **WeekPlanner**: Complete rewrite — day selector uses `DAY_NAMES` array, table layout with meal slots as columns, inline editing for both weight and servings.
- **DishPicker**: Removed `slot` prop, simplified `calculateFitScore` calls to use person targets directly.
- **Cleanup**: Removed `getMealTemplateSlots` from persons actions, removed template slot display from `PersonForm`. Fixed `shopping.ts`, `shopping-list.ts`, `system-service.ts`, `WeekSummary`, `ShoppingCartView` to use new data shapes (`dayOfWeek`, `MealSlotInstance`, `dishEntries`).
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-12] JSON Import/Export for Dishes with Alternatives Support

Додано імпорт/експорт страв у JSON форматі з підтримкою альтернативних інгредієнтів.

- **Schema**: Додано `alternatives String[] @default([])` в `DishIngredient` — зберігає назви альтернативних продуктів.
- **Server Actions**: Додано `importDishesFromJson` (upsert by name, product lookup, auto-create cooking methods) та `exportDishes` у `dishes.ts`.
- **UI**: Додано кнопки `Import JSON` / `Export JSON` в DishLibrary + модальне вікно з drag-and-drop.
- **Data**: Оновлено `dishes.json` — 37 страв з полями `alternatives` для всіх інгредієнтів що мають заміни.
- **Types**: Додано `alternatives?: string[]` в `DishIngredientInput`.
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-12] Detailed Calorie Audit & Fast Food Integration

Проведено повний аудит калорійності кожного дня та інтегровано розрахунок фаст-фуду в загальну статистику.

- **Fast Food Engine**:
    - Додано вагу інгредієнтів (`youGrams`, `herGrams`) до всіх варіантів `FAST_FOOD_PICKS`.
    - Впроваджено функцію `calcFfKcal` у `WeeklySchedule.tsx`, що дозволяє динамічно враховувати обраний фаст-фуд у денний ліміт.
- **Calorie Balancing**:
    - **Віталій (Target 1700)**: Скориговано порції круп (враховуючи суху вагу) та білка. Усунено перебор у дні залу (~1900 -> 1700) та недобор у дні кардіо (~1100 -> 1650).
    - **Олеся (Target 2300)**: Оптимізовано порції для стабільного профіциту 2200-2400 ккал, уникаючи надмірного перебору в окремі дні.
- **Portion Accuracy**: Всі крупи (гречка, рис, макарони) тепер розраховуються за суху вагу, що забезпечує точність плану.
- **Verification**: 
    - [x] Logic implemented (Calorie formulas updated)
    - [x] Portions tuned in `meal-variants.ts`
    - [x] Verified with `pnpm tsc --noEmit` (Success)

---

## [2026-05-12] Protein Optimization & Calorie Strictness

---

## [2026-05-12] JSON Import/Export for Products + Data Deduplication

Додано можливість імпорту/експорту продуктів у JSON форматі та очищено дані від дублікатів.

- **Server Actions**: Додано `importProductsFromJson` (upsert by name, partial update) та `exportProducts` у `products.ts`.
- **UI**: Додано кнопки `Import JSON` / `Export JSON` в toolbar ProductLibrary + модальне вікно з drag-and-drop підтримкою.
- **Data**: Створено `src/features/nutrition/data/products.json` — ~94 продукти з правильними категоріями, одиницями виміру та цінами.
- **Deduplication**: Видалено 6 дублікатів з `product-info.ts` (Яйце/Яйця, Тунець/Тунець у вл. соку, Яловичий фарш ×2, Томат/Помідор, Арахіс/Арахіс смажений, Курка/Куряче філе).
- **Verification**:
    - [ ] Logic implemented
    - [ ] UI updated
    - [ ] Verified with `pnpm tsc --noEmit && pnpm lint && pnpm build`

---

## [2026-05-12] Ingredient Updates & Tabular Visual Plan

Оновлено інгредієнти та впроваджено табличне відображення для візуального плану.

- **Ingredients**:
    - **Bowl (Зібраний Боул)**: Замінено тунець на смажений курячий фарш та курячі серця.
    - **No Chickpeas**: Нут видалено з усіх варіантів страв (Суп, Рагу).
    - **Toasts**: Повернуто тости з тунцем (реверт попередньої зміни).
- **Visual Plan UI**:
    - **Tabular Breakdown**: Всі списки продуктів у тижневому розкладі замінено на таблиці з колонками "Продукт", "Віталій" (В) та "Олеся" (О).
    - **Fast Food**: Розділ Fast Food тепер також використовує табличний вигляд для порцій "В" та "О".
- **Verification**: 
    - [x] Logic implemented (Constants updated)
    - [x] UI updated (Tabular layouts in WeeklySchedule and VisualPlanPage)
    - [x] Verified with `pnpm tsc --noEmit` (Success)

---

## [2026-05-12] Fiber Data for Visual Plan

Додано дані про клітковину для всіх продуктів у `PRODUCT_INFO` для візуального плану.

- **Constants**: Оновлено тип `ProductInfo` та константу `PRODUCT_INFO` — додано поле `fiber` (клітковина на 100г) для всіх 100+ продуктів.
- **Verification**: 
    - [x] Logic implemented (Fiber values researched and added)
    - [x] Verified with `pnpm tsc --noEmit` (0 errors)
    - [x] Verified with `pnpm build` (Success)

---

## [2026-05-05] Product Grouping & Library Tabs

Додано групування продуктів по категоріях та фільтрацію через таби.

- **Product Library**: 
    - Продукти тепер групуються по категоріях у вертикальному списку з роздільниками.
    - Додано панель табів зверху для швидкої фільтрації ("ALL" + активні категорії).
    - Оптимізовано рендеринг через `useMemo` для розрахунку груп та активних категорій.
- **Shopping Cart**:
    - Виправлено логіку групування: тепер продукти дійсно розбиваються по категоріях (раніше всі потрапляли в "All Items").
    - Оновлено інтерфейси для підтримки полів категорій у всьому ланцюжку даних кошика.

- **Database**: Проведено початкове засідування бази (`db:seed:fs-bootstrap`) продуктами з FatSecret (Bananas, Chicken, Rice тощо).
**Verification:**
- [x] Logic implemented
- [x] UI updated (Tabs in Library + Real groups in Cart)
- [x] Verified with `pnpm tsc --noEmit`
- [x] Database seeded with FS bootstrap

---

## [2026-05-05] Allow Multiple Nutrition Persons per User

Дозволено створювати кілька профілів харчування для одного користувача.

- **Schema**: Видалено `@unique` з `userId` в `NutritionPerson`, змінено реляцію `User.nutritionPerson` → `User.nutritionPersons` (one-to-many)
- **System Service**: Замінено `findUnique` на `findFirst` для отримання профілю

**Verification:**
- [x] Logic implemented
- [x] UI unchanged
- [x] Verified with `pnpm tsc --noEmit && pnpm lint`

---

## [2026-05-03] FatSecret API Integration & Smart Seeding

Інтеграція FatSecret API для динамічного пошуку та автоматичного наповнення бази.

- **FatSecret API Integration**: 
    - Оновлено схему: додано `FATSECRET` до `NutritionSource`.
    - Реалізовано `FatSecretService`: авторизація (OAuth2), пошук (`foods.search.v2`) та отримання деталей (`food.get.v2`) з автоматичним перерахунком на 100г.
    - Додано `FatSecretImportModal`: модальне вікно для пошуку будь-якого продукту в FatSecret та миттєвого імпорту в локальну базу.
    - **Smart Seeding**: Створено скрипт `db:seed:fs-bootstrap`, який автоматично наповнює базу базовими продуктами (80+ позицій), отримуючи актуальні дані КБЖВ з FatSecret.
- **Product Library**: Додано кнопку "Import from FatSecret" та оновлено бейджі джерел даних.

**Verification:**
- [x] Logic implemented (Service + Actions)
- [x] UI updated (Import Modal + ProductLibrary)
- [x] Verified with `pnpm tsc --noEmit`

---

## [2026-05-02] Nutrition Module UI — Full Feature Coverage


Повне покриття UI функціоналу модуля харчування.

- **Products**: Додано форму створення продукту (модалка), редагування продукту, імпорт з OpenFoodFacts (пошук + імпорт по barcode), відображення джерела даних (MANUAL/OFF/USDA badge)
- **Dishes**: Додано кнопку редагування на картці страви, DishBuilder тепер підтримує edit mode (`?edit=<id>`)
- **Week Plan**: Додано форму створення тижневого плану на `/nutrition/plans` (вибір дати + персони), inline редагування ваги порції (клік на вагу → input → Enter), відображення ккал для кожної страви, відображення targetFiberGrams для слоту
- **Persons**: Додано відображення MealTemplateSlots для цілі кожної персони
- **Shopping Cart**: Відновлено групування по категоріях, додано variety warnings, розбивка по персонах (personCosts), відображення packagesCount, підтвердження regenerate, поле "є вдома (г)" для часткового введення
- **Landing**: Виправлено посилання `/food/*` → `/nutrition/*`
- **AI SDK v6**: Оновлено `CoreMessage` → `ModelMessage`, `maxTokens` → `maxOutputTokens`, `maxSteps` видалено, `tr.result` → `tr.output`, `tr.args` → `tr.input`, `parameters` → `inputSchema` в tools
- **Seed scripts**: Виправлено `ProductCategory` → видалено, `prisma.product` → `prisma.foodProduct`, мапінг полів
- **Renaming**: Остаточне перейменування "Food Space" → "Nutrition Space" та `/food` → `/nutrition` у всіх UI компонентах та конфігураціях (Sidebar, SpaceProvider, HealthPage, HomePage, NutritionPage).

**Verification:**
- [x] `pnpm tsc --noEmit` — 0 errors
- [x] `pnpm lint` — 0 errors (тільки warnings)
- [x] `pnpm build` — compiled successfully

---
