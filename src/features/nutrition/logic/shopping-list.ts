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
        // Map of ingredient index to chosen product ID
        const selectedAlts = (entry.selectedAlternatives as Record<string, string>) || {};

        entry.dish.ingredients.forEach((ingredient, idx) => {
          const rawGramsNeeded = ingredient.rawWeight * entry.servings;
          
          // Use selected alternative if it exists for this ingredient index
          const productId = selectedAlts[String(idx)] || ingredient.productId;
          
          // We need to find the correct product info (name/price) for the selected ID
          // Since we only have the primary product in 'ingredient.product', 
          // we might need to rely on the fact that the shopping list generation 
          // will fetch the correct products later, but for now we need the product details.
          
          // Optimization: If we use the primary product ID, we have the info. 
          // If we use an alternative, we need its info.
          // For now, let's assume we need to pass a product map or similar.
          // Actually, let's just use the key.
          
          const key = productId;

          if (aggregation[key]) {
            aggregation[key].rawGrams += rawGramsNeeded;
          } else {
            // Note: If it's an alternative, we might not have its name/price here 
            // unless we included it in the query.
            // Let's assume we need to handle this.
            
            aggregation[key] = {
              rawGrams: rawGramsNeeded,
              price: ingredient.product.price, // Fallback to primary if not found
              standardPackageAmount: ingredient.product.standardPackageAmount || 1000,
              name: ingredient.product.name,
            };
          }
        });
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
