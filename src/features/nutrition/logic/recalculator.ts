import { FoodProduct, Dish, DishEntry, CookingMethod, DishEntryIngredient } from "@/app/generated/prisma";

export interface IngredientWithProduct {
  id: string;
  dishId: string;
  productId: string;
  cookingMethodId: string | null;
  alternatives: string[];
  product: FoodProduct;
  cookingMethod: CookingMethod | null;
}

export type DishWithIngredients = Dish & { ingredients: IngredientWithProduct[] };
export type EntryWithIngredients = DishEntry & {
  dish: DishWithIngredients;
  ingredients: DishEntryIngredient[];
};

export interface PlanSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export function calculateRawIngredientStats(product: FoodProduct, grams: number): PlanSummary {
  const factor = grams / 100;

  return {
    calories: (product.caloriesPer100 || 0) * factor,
    protein: (product.proteinPer100 || 0) * factor,
    fat: (product.fatPer100 || 0) * factor,
    carbs: (product.carbsPer100 || 0) * factor,
    fiber: (product.fiberPer100 || 0) * factor,
  };
}

export function calculateIngredientStats(ing: IngredientWithProduct, rawWeight: number): PlanSummary {
  const cookedWeight = rawWeight * (ing.cookingMethod?.coefficient ?? 1);
  return calculateRawIngredientStats(ing.product, cookedWeight);
}

export function calculateDishStats(dish: DishWithIngredients, weights: { ingredientIndex: number; rawWeight: number }[]): PlanSummary {
  const totalNutrition = dish.ingredients.reduce(
    (acc, ing, idx) => {
      const weight = weights.find(w => w.ingredientIndex === idx)?.rawWeight ?? 0;
      const stats = calculateIngredientStats(ing, weight);
      return {
        calories: acc.calories + stats.calories,
        protein: acc.protein + stats.protein,
        fat: acc.fat + stats.fat,
        carbs: acc.carbs + stats.carbs,
        fiber: acc.fiber + stats.fiber,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );

  return totalNutrition;
}

export function calculateEntryStats(entry: EntryWithIngredients): PlanSummary {
  const weights = entry.ingredients.map(ing => ({ ingredientIndex: ing.ingredientIndex, rawWeight: ing.weight }));
  return calculateDishStats(entry.dish, weights);
}

export function calculateMealSlotStats(entries: EntryWithIngredients[]): PlanSummary {
  return entries.reduce(
    (acc, entry) => {
      const stats = calculateEntryStats(entry);
      return {
        calories: acc.calories + stats.calories,
        protein: acc.protein + stats.protein,
        fat: acc.fat + stats.fat,
        carbs: acc.carbs + stats.carbs,
        fiber: acc.fiber + stats.fiber,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );
}

export function calculateDayPlanStats(mealSlots: Array<{ entries: EntryWithIngredients[] }>): PlanSummary {
  return mealSlots.reduce(
    (acc, slot) => {
      const stats = calculateMealSlotStats(slot.entries);
      return {
        calories: acc.calories + stats.calories,
        protein: acc.protein + stats.protein,
        fat: acc.fat + stats.fat,
        carbs: acc.carbs + stats.carbs,
        fiber: acc.fiber + stats.fiber,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );
}
