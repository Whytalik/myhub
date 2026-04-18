import { Priority, Unit } from "@/app/generated/prisma";
import { Product, Dish, DishIngredient, DayPlanEntry } from "@/app/generated/prisma/client";

/**
 * Extended types for the pure logic functions
 */
export type IngredientWithProduct = DishIngredient & { product: Product };
export type DishWithIngredients = Dish & { ingredients: IngredientWithProduct[] };
export type EntryWithDish = DayPlanEntry & { dish: DishWithIngredients };

export interface PlanSummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

/**
 * Calculates stats for a raw ingredient amount.
 */
export function calculateRawIngredientStats(product: Product, amount: number, unit: Unit): PlanSummary {
  const factor = (unit === Unit.GRAM || unit === Unit.ML) ? amount / 100 : amount;

  return {
    calories: (product.calories || 0) * factor,
    protein: (product.protein || 0) * factor,
    fat: (product.fat || 0) * factor,
    carbs: (product.carbs || 0) * factor,
    fiber: (product.fiber || 0) * factor,
  };
}

export function calculateIngredientStats(ing: IngredientWithProduct): PlanSummary {
  return calculateRawIngredientStats(ing.product, ing.amount, ing.unit);
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

  // Apply yield factor if present
  // If yield is e.g. 0.8 (weight loss during cooking), the density of nutrients per 100g increases.
  // But usually yield in these systems means "final total weight" or "multiplier".
  // Let's assume yield is a multiplier for the whole dish.
  const yieldFactor = dish.yield || 1.0;
  
  return {
    calories: totalNutrition.calories * yieldFactor,
    protein: totalNutrition.protein * yieldFactor,
    fat: totalNutrition.fat * yieldFactor,
    carbs: totalNutrition.carbs * yieldFactor,
    fiber: totalNutrition.fiber * yieldFactor,
  };
}

export function calculateEntryStats(entry: EntryWithDish): PlanSummary {
  const dishStats = calculateDishStats(entry.dish);
  return {
    calories: dishStats.calories * entry.servings,
    protein: dishStats.protein * entry.servings,
    fat: dishStats.fat * entry.servings,
    carbs: dishStats.carbs * entry.servings,
    fiber: dishStats.fiber * entry.servings,
  };
}

export function calculatePlanSummary(entries: EntryWithDish[]): PlanSummary {
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

/**
 * Core Logic: Calorie Recalculation
 * Adjusts servings of entries based on priority to hit a target.
 */
export function recalculatePlanServings(
  entries: EntryWithDish[],
  targetCalories: number
): { updatedEntries: EntryWithDish[]; summary: PlanSummary } {
  const currentSummary = calculatePlanSummary(entries);
  const totalDiff = targetCalories - currentSummary.calories;

  if (Math.abs(totalDiff) < 1) return { updatedEntries: entries, summary: currentSummary };

  // 1. Group by priority
  const flexible = entries.filter(e => e.priority === Priority.FLEXIBLE);
  const auto = entries.filter(e => e.priority === Priority.AUTO);

  // Determine which group to adjust (Flexible first, then Auto)
  const adjustable = flexible.length > 0 ? flexible : auto;
  
  if (adjustable.length === 0) {
    // No adjustable entries, return as is (or could throw error)
    return { updatedEntries: entries, summary: currentSummary };
  }

  const adjustableCalories = calculatePlanSummary(adjustable).calories;
  
  // If we need to reduce more calories than adjustable entries have, 
  // we just set them to 0 (cannot have negative servings)
  const targetForAdjustable = Math.max(0, adjustableCalories + totalDiff);
  const scaleFactor = adjustableCalories > 0 ? targetForAdjustable / adjustableCalories : 0;

  const updatedEntries = entries.map(entry => {
    const isAdjustable = flexible.length > 0 
      ? entry.priority === Priority.FLEXIBLE 
      : entry.priority === Priority.AUTO;

    if (isAdjustable) {
      return {
        ...entry,
        servings: Number((entry.servings * scaleFactor).toFixed(2))
      };
    }
    return entry;
  });

  return {
    updatedEntries,
    summary: calculatePlanSummary(updatedEntries)
  };
}
