import { DishWithIngredients, calculateDishStats } from "./recalculator";
import dishesData from "../data/dishes.json";

const dishJsonMap = new Map(
  (dishesData as { name: string; ingredients: { productName: string; rawWeight: number }[] }[]).map(d => [d.name, d])
)

function getDishWeights(dish: DishWithIngredients) {
  const dishJson = dishJsonMap.get(dish.name)
  return dishJson
    ? dishJson.ingredients.map((ing, idx) => ({ ingredientIndex: idx, rawWeight: ing.rawWeight }))
    : dish.ingredients.map((_, idx) => ({ ingredientIndex: idx, rawWeight: 0 }))
}

/**
 * Calculates how many servings of a dish are needed to fulfill a target calorie count.
 * 
 * @param dish The dish with its ingredients to calculate base calories per serving
 * @param targetKcal The desired calorie target for this meal entry
 * @returns The number of servings (float)
 */
export function calculateRequiredServings(
  dish: DishWithIngredients,
  targetKcal: number
): number {
  const weights = getDishWeights(dish)
  const stats = calculateDishStats(dish, weights);
  
  if (stats.calories <= 0) return 1; // Prevent division by zero
  
  // servings = target / (total_dish_calories / base_servings)
  // Our calculateDishStats already returns calories per 1 base serving if dish.servings > 0
  return targetKcal / stats.calories;
}

/**
 * Calculates raw weight of an ingredient based on dish servings.
 * 
 * @param rawWeightPerBaseServing Original raw weight in the dish definition for 1 base serving
 * @param requiredServings The calculated servings needed for the person
 * @returns Total raw weight required
 */
export function calculateIngredientRawWeight(
  rawWeightPerBaseServing: number,
  requiredServings: number
): number {
  return rawWeightPerBaseServing * requiredServings;
}
