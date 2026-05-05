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
