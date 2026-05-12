## [2026-05-12] Protein Optimization & Calorie Strictness

Оптимізовано споживання білка для Олесі та підтверджено суворий ліміт калорій для Віталія.

- **Constants**: Оновлено `MEAL_VARIANTS` у `src/features/nutrition/constants/meal-variants.ts`:
    - **Олеся**: Збільшено порції білкових продуктів (куряче філе, яйця, сир, тунець) у всіх прийомах їжі для досягнення цілі ~95г білка на день.
    - **Віталій**: Порції залишено без змін для суворого дотримання ліміту 1700 ккал у дні залу.
- **Visual Plan**: Підтверджено стратегію домашнього фаст-фуду (High Protein quality) та самостійного контролю гідратації.
- **Verification**: 
    - [x] Logic implemented (Portions updated)
    - [x] Verified with `pnpm tsc --noEmit` (Success)

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
