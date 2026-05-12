import { DishWithIngredients, calculateDishStats } from "./recalculator";

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
  const stats = calculateDishStats(dish);
  
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
