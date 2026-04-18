import { Unit } from "@/app/generated/prisma";
import { Product, DishIngredient, WeekPlan, DayPlan, DayPlanEntry, Dish } from "@/app/generated/prisma/client";

export type FullWeekPlan = WeekPlan & {
  dayPlans: (DayPlan & {
    entries: (DayPlanEntry & {
      dish: Dish & {
        ingredients: (DishIngredient & {
          product: Product;
        })[];
      };
    })[];
  })[];
};

export interface AggregatedItem {
  productId: string;
  name: string;
  amount: number;
  unit: Unit;
  totalPrice: number;
  checked: boolean;
}

/**
 * Pure function to aggregate all products from a week plan into a shopping list.
 */
export function aggregateShoppingList(weekPlan: FullWeekPlan): AggregatedItem[] {
  const aggregation: Record<string, AggregatedItem> = {};

  for (const dayPlan of weekPlan.dayPlans) {
    for (const entry of dayPlan.entries) {
      for (const ingredient of entry.dish.ingredients) {
        const key = `${ingredient.productId}_${ingredient.unit}`;
        const totalAmount = ingredient.amount * entry.servings;
        
        // Calculate price: (price per unit * amount)
        // Assume product.price is per 100 for GRAM/ML, per 1 for PIECE/TBSP/TSP
        const baseAmount = (ingredient.unit === Unit.GRAM || ingredient.unit === Unit.ML) ? 100 : 1;
        const pricePerUnit = (ingredient.product.price || 0) / baseAmount;
        const itemPrice = pricePerUnit * totalAmount;

        if (aggregation[key]) {
          aggregation[key].amount += totalAmount;
          aggregation[key].totalPrice += itemPrice;
        } else {
          aggregation[key] = {
            productId: ingredient.productId,
            name: ingredient.product.name,
            amount: totalAmount,
            unit: ingredient.unit,
            totalPrice: itemPrice,
            checked: false,
          };
        }
      }
    }
  }

  return Object.values(aggregation).sort((a, b) => a.name.localeCompare(b.name));
}
