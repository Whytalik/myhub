## [2026-04-27] Nutrition System (Products -> Dishes -> Shopping List)

Впроваджено повноцінну систему управління харчуванням з підтримкою коефіцієнтів приготування.

- **База Даних**: Додано `PreparationMethod`, `IngredientInputState` та `yieldFactor` до моделі `DishIngredient`.
- **Логіка**: Реалізовано конвертацію ваги між сирим та готовим станом для точного підрахунку калорій та формування списку покупок.
- **UI**: Оновлено конструктор страв — тепер можна вказувати метод приготування (варіння, смаження тощо) та стан продукту (сирий/готовий). Додано автоматичні коефіцієнти (напр. рис x2.5).
- **Корзина**: Реалізовано генерацію списку покупок на основі тижневого плану з агрегацією сирої ваги продуктів. Кнопка "Generate from Plan" тепер оновлює існуючий список для обраного тижня.

**Verification:**
- [x] Prisma schema updated & client generated.
- [x] Logic for raw/cooked conversion verified via `tsc`.
- [x] UI updated with new controls for ingredients.
- [x] Shopping list aggregation updated to use coefficients.
- [x] Verified with `pnpm tsc --noEmit` and `pnpm lint`.
