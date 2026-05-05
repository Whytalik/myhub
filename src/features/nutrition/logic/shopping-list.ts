import { FoodProduct, CookingMethod, Dish, DishIngredient, DishEntry, MealSlot, DayPlan, WeekPlan } from "@/app/generated/prisma";

export type FullWeekPlan = WeekPlan & {
  dayPlans: (DayPlan & {
    mealSlots: (MealSlot & {
      entries: (DishEntry & {
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
  const aggregation: Record<string, { rawGrams: number; price?: number | null; standardPackageAmount: number }> = {};

  for (const dayPlan of weekPlan.dayPlans) {
    for (const mealSlot of dayPlan.mealSlots) {
      for (const entry of mealSlot.entries) {
        for (const ingredient of entry.dish.ingredients) {
          const cookedWeight = ingredient.rawWeight * (ingredient.cookingMethod?.coefficient ?? 1);
          const portionRatio = entry.portionWeight / (cookedWeight || 1);
          const rawGramsNeeded = ingredient.rawWeight * portionRatio;

          const key = ingredient.productId;

          if (aggregation[key]) {
            aggregation[key].rawGrams += rawGramsNeeded;
          } else {
            aggregation[key] = {
              rawGrams: rawGramsNeeded,
              price: ingredient.product.price,
              standardPackageAmount: ingredient.product.standardPackageAmount,
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
        name: "", 
        requiredRawGrams: data.rawGrams,
        packagesCount,
        totalCost,
      };
    })
    .sort((a, b) => a.productId.localeCompare(b.productId));
}
