import { FoodProduct, Dish, DishEntry, CookingMethod } from "@/app/generated/prisma";

export interface IngredientWithProduct {
  id: string;
  dishId: string;
  productId: string;
  cookingMethodId: string | null;
  rawWeight: number;
  product: FoodProduct;
  cookingMethod: CookingMethod | null;
}

export type DishWithIngredients = Dish & { ingredients: IngredientWithProduct[] };
export type EntryWithDish = DishEntry & { dish: DishWithIngredients };

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

export function calculateIngredientStats(ing: IngredientWithProduct): PlanSummary {
  const cookedWeight = ing.rawWeight * (ing.cookingMethod?.coefficient ?? 1);
  return calculateRawIngredientStats(ing.product, cookedWeight);
}

export function calculateDishStats(dish: DishWithIngredients): PlanSummary {
  const totalNutrition = dish.ingredients.reduce(
    (acc, ing) => {
      const stats = calculateIngredientStats(ing);
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

  const perServing = dish.servings > 0 ? dish.servings : 1;

  return {
    calories: totalNutrition.calories / perServing,
    protein: totalNutrition.protein / perServing,
    fat: totalNutrition.fat / perServing,
    carbs: totalNutrition.carbs / perServing,
    fiber: totalNutrition.fiber / perServing,
  };
}

export function calculateEntryStats(entry: EntryWithDish): PlanSummary {
  const dishStats = calculateDishStats(entry.dish);
  const portionFactor = entry.portionWeight / 100;

  return {
    calories: dishStats.calories * portionFactor,
    protein: dishStats.protein * portionFactor,
    fat: dishStats.fat * portionFactor,
    carbs: dishStats.carbs * portionFactor,
    fiber: dishStats.fiber * portionFactor,
  };
}

export function calculateMealSlotStats(entries: EntryWithDish[]): PlanSummary {
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

export function calculateDayPlanStats(mealSlots: Array<{ entries: EntryWithDish[] }>): PlanSummary {
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
