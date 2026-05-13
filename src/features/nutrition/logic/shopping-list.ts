import { FoodProduct, CookingMethod, Dish, DishIngredient, DishEntry, DishEntryIngredient, MealSlotInstance, DayPlan, WeekPlan, IngredientInputState } from "@/app/generated/prisma";

export type FullWeekPlan = WeekPlan & {
  dayPlans: (DayPlan & {
    mealSlots: (MealSlotInstance & {
      dishEntries: (DishEntry & {
        dish: Dish & {
          ingredients: (DishIngredient & {
            product: FoodProduct;
            cookingMethod: CookingMethod | null;
          })[];
        };
        ingredients: DishEntryIngredient[];
      })[];
    })[];
  })[];
};

function toRawWeight(weight: number, inputState: IngredientInputState, coefficient: number): number {
  return inputState === IngredientInputState.COOKED ? weight / coefficient : weight;
}

export interface AggregatedItem {
  productId: string;
  name: string;
  requiredRawGrams: number;
  packagesCount: number;
  totalCost: number;
}

export function aggregateShoppingList(weekPlan: FullWeekPlan, productMap: Map<string, FoodProduct>): AggregatedItem[] {
  const aggregation: Record<string, { rawGrams: number; price?: number | null; standardPackageAmount: number; name: string }> = {};

  for (const dayPlan of weekPlan.dayPlans) {
    for (const mealSlot of dayPlan.mealSlots) {
      for (const entry of mealSlot.dishEntries) {
        const selectedAlts = (entry.selectedAlternatives as Record<string, string>) || {};

        for (const ing of entry.ingredients) {
          const dishIng = entry.dish.ingredients[ing.ingredientIndex]
          if (!dishIng) continue
          const productId = selectedAlts[String(ing.ingredientIndex)] || dishIng.productId;
          const product = productMap.get(productId);
          if (!product) continue;

          const coeff = dishIng.cookingMethod?.coefficient ?? 1.0;
          const rawWeight = toRawWeight(ing.weight, ing.inputState, coeff);

          const key = productId;

          if (aggregation[key]) {
            aggregation[key].rawGrams += rawWeight;
          } else {
            aggregation[key] = {
              rawGrams: rawWeight,
              price: product.price,
              standardPackageAmount: product.standardPackageAmount || 1000,
              name: product.name,
            };
          }
        }
      }
    }
  }

  return Object.entries(aggregation)
    .map(([productId, data]) => {
      const packagesCount = Math.ceil(data.rawGrams / data.standardPackageAmount);
      const totalCost = data.price ? data.price * packagesCount : 0;
      return {
        productId,
        name: data.name,
        requiredRawGrams: data.rawGrams,
        packagesCount,
        totalCost,
      };
    })
    .sort((a, b) => a.productId.localeCompare(b.productId));
}
