import { FoodProduct, CookingMethod, Dish, DishIngredient, DishEntry, MealSlotInstance, DayPlan, WeekPlan } from "@/app/generated/prisma";

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
      })[];
    })[];
  })[];
};

export interface AggregatedItem {
  productId: string;
  name: string;
  requiredRawGrams: number;
  packagesCount: number;
  totalCost: number;
}

export function aggregateShoppingList(weekPlan: FullWeekPlan): AggregatedItem[] {
  const aggregation: Record<string, { rawGrams: number; price?: number | null; standardPackageAmount: number; name: string }> = {};

  for (const dayPlan of weekPlan.dayPlans) {
    for (const mealSlot of dayPlan.mealSlots) {
      for (const entry of mealSlot.dishEntries) {
        for (const ingredient of entry.dish.ingredients) {
          const rawGramsNeeded = ingredient.rawWeight * entry.servings;

          const key = ingredient.productId;

          if (aggregation[key]) {
            aggregation[key].rawGrams += rawGramsNeeded;
          } else {
            aggregation[key] = {
              rawGrams: rawGramsNeeded,
              price: ingredient.product.price,
              standardPackageAmount: ingredient.product.standardPackageAmount || 1000,
              name: ingredient.product.name,
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
