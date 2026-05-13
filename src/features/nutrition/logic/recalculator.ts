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

export function calculateDishStats(dish: DishWithIngredients, weights: { ingredientIndex: number; rawWeight: number }[]): PlanSummary {
  const totalNutrition = dish.ingredients.reduce(
    (acc, ing, idx) => {
      const weight = weights.find(w => w.ingredientIndex === idx)?.rawWeight ?? 0;
      const coeff = ing.cookingMethod?.coefficient ?? 1;
      const cookedWeight = weight * coeff;
      return {
        calories: acc.calories + (ing.product.caloriesPer100 || 0) * cookedWeight / 100,
        protein: acc.protein + (ing.product.proteinPer100 || 0) * cookedWeight / 100,
        fat: acc.fat + (ing.product.fatPer100 || 0) * cookedWeight / 100,
        carbs: acc.carbs + (ing.product.carbsPer100 || 0) * cookedWeight / 100,
        fiber: acc.fiber + (ing.product.fiberPer100 || 0) * cookedWeight / 100,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );

  return totalNutrition;
}
