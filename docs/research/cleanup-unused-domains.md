# Research Note: Domain Deletion & Operations Only Cleanup

## Goal
Remove all life domains except the **Operations Domain** (Life Space / Planning Space / Tasks / Habits / Journal) to focus the application purely on core daily execution and strategic Scrum planning.

## Domains to Remove
1. **Health Domain**: Nutrition (Dishes, Products, Profiles, Week/Day Plans, Smart Cart) & Fitness (Workouts, Exercises, Progress).
2. **Mind Domain**: Library & Languages (Spaced Repetition Vocabulary, CEFR tracking, Immersion logs).
3. **Wealth Domain**: Trading / Portfolio.
4. **Vault Domain**: Wishlist / Misc.

## Strategy & Step-by-Step Execution

### 1. Database Schema Refactor (`prisma/schema.prisma`)
Delete the following database models and their associated enums:
- **Nutrition/Food**: `NutritionPerson`, `FoodProduct`, `CookingMethod`, `Dish`, `DishIngredient`, `DishEntryIngredient`, `WeekPlan`, `DayPlan`, `DayPrepNote`, `ShoppingList`, `ShoppingListItem`, `MealSlotInstance`, `ProductEntry`, `DishEntry`, `ShoppingCart`, `CartItem`.
- **Enums for Nutrition**: `Goal`, `PriceSource`, `NutritionSource`, `ProductStatus`, `Unit`, `PreparationMethod`, `IngredientInputState`, `CartItemStatus`, `DishType`, `Store`, `ProductState`, `ProductSource`.
- **Library**: `LibraryItem`.
- **Enums for Library**: `LibraryItemType`, `LibraryItemStatus`.
- **Wishlist**: `WishlistItem`.
- **Enums for Wishlist**: `WishlistStatus`.
- **Languages**: `Language`, `UserLanguage`, `LanguageSphereProgress`, `VocabularyItem`, `ImmersionLog`, `LanguageResource`.
- **Enums for Languages**: `LanguageSphere`, `CefrLevel`.

Remove relations to these models from the `User` model:
- `dishes`, `libraryItems`, `foodProducts`, `nutritionPersons`, `shoppingLists`, `userLanguages`, `weekPlans`, `wishlistItems`.

### 2. File and Directory Cleanup
Delete all feature folders and route pages related to the deleted domains:
- Delete `src/features/languages`
- Delete `src/features/library`
- Delete `src/features/nutrition`
- Delete `src/features/other`
- Delete the following subdirectories from `src/app/(dashboard)`:
  - `fishing`
  - `fitness`
  - `health`
  - `languages`
  - `library`
  - `life-system`
  - `mind`
  - `nutrition`
  - `other`
  - `trading`
  - `vault`
  - `wealth`

### 3. Code Integration Cleanup
- **Caching Layer (`src/lib/cache.ts`)**: Remove tags and query functions for `Dishes`, `Products`, `Persons`, `WeekPlans`, `DayPlans`, `ShoppingCarts`, `Wishlist`, `Languages`, `Library`. Remove unused `LanguageSphere` import from `@/app/generated/prisma`.
- **Revalidation Helpers (`src/lib/revalidate.ts`)**: Remove invalidation functions for Food, Wishlist, Languages, Library.
- **Sidebar Navigation (`src/components/sidebar.tsx`)**: Remove nav configs and render checks for Health, Mind, Wealth, and Vault domains. Leave only Operations (Planning Space & Life Space).
- **Domain Header (`src/components/domain-header.tsx`)**: Remove domain switcher buttons/tabs. Brand logo and User profile header will remain, but the switcher for other domains is removed.
- **Domain Spaces Resolver (`src/lib/spaces.ts` & `src/components/space-provider.tsx`)**: Simplify themes and path matches to only support `operations`, `planning`, `life`, and `default`.
- **Home Dashboard (`src/app/(dashboard)/home/page.tsx`)**: Remove Quick Access buttons and stat widgets linked to deleted domains (e.g. Nutrition, Library, Languages).

## Verification Plan
1. Generate the Prisma Client offline via `npx prisma generate` to reflect the updated schema without unused models.
2. Run Typecheck: `npx tsc --noEmit`.
3. Run Linter: `pnpm lint`.
4. Run Build: `npx next build`.
