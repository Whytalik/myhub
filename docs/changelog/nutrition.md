## [2026-05-18] — Feat: Збільшення жирового вмісту страв у dishes.json

Додано або збільшено олію у 6 стравах з низьким вмістом жиру:
- Зібраний Боул: Олія оливкова 7г → 15г
- Овочеве Рагу: додано Олія 15г (раніше — жодного жирного інгредієнта)
- Риба + Зелень: Олія оливкова 3г → 12г
- Паста-конструктор: Олія 1г → 10г, Твердий сир 20г → 30г
- Зігріваючий Суп: додано Олія оливкова 10г
- Протеїновий Салат: додано Олія оливкова 10г, Грецький йогурт 4г → 20г

Результат для понеділка: Vitalii Ж 37→53г (ціль 57г), Olesia Ж 50→58г (ціль 64г).

- **Файл**: `src/features/nutrition/data/dishes.json`
- **Верифікація**:
    - [x] Логіка реалізована
    - [x] JSON валідний

## [2026-05-18] — Feat: Макро-розумне масштабування порцій у seed-action

Замість рівномірного `scale = targetKcal / dishKcal` для обох людей, тепер `computeIngredientWeights` застосовує диференційний коефіцієнт для кожного інгредієнта залежно від його макро-профілю і цілей конкретної людини. Білкові інгредієнти (курка) масштабуються більше для Віталія і менше для Олесі, вуглеводні (гречка, картопля) — навпаки. Після першого проходу нормалізація гарантує `∑kcal = slotTargetKcal`. Коефіцієнти затискаються в [0.25, 4.0], дрібні приправи (<0.5 kcal) не коригуються.

Результат для понеділка: Vitalii P 136→162г / C 191→148г; Olesia P 182→146г / C 257→306г.

- **Файл**: `src/features/system/actions/seed-action.ts`
- **Верифікація**:
    - [x] Логіка реалізована
    - [x] Перевірено `pnpm tsc --noEmit`

## [2026-05-18] — Fix: Condiment/spice ingredients no longer show "0ст.л." / "0шт" in WeekPlanner

When a non-gram ingredient (TBSP, PIECE) has a stored weight smaller than half its `standardPackageAmount`, `Math.round` would produce 0. Now `toDisplayAmount` falls back to showing grams and `toDisplayUnit` returns "г" in that case, so small condiment amounts like 3g of soy sauce display as "3г" instead of "0ст.л.".

- **Files Updated**: `src/features/nutrition/components/planner/WeekPlanner.tsx`
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit`

## [2026-05-18] — Fix: Dish ingredient units now display correctly in WeekPlanner

Ingredient rows in the WeekPlanner were showing all amounts with a hardcoded "г" (gram) label regardless of the product's actual unit (PIECE, TBSP, ML, etc.). Fixed display to convert stored gram values through `toDisplayAmount` using the product's unit and `standardPackageAmount`. Inline editing now shows the correct unit label and converts display amounts back to grams before saving. Also fixed `updateDishEntryIngredient` not to reset the stored `unit` to `null` when no unit argument is passed.

- **Files Updated**: `src/features/nutrition/components/planner/WeekPlanner.tsx`, `src/features/nutrition/actions/planning.ts`
- **Verification**:
    - [x] Logic implemented
    - [x] UI updated
    - [x] Verified with `pnpm tsc --noEmit`, `pnpm lint`

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
