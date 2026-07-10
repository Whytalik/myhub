import { getActiveWeekPlan } from "./week";
import type { Weekday } from "./types";

/** Sum of macroItems grams (vitalii+olesia) for one product key, across the given weekdays for the seasonal plan. */
export function sumMacroGrams(
  productKey: string,
  weekdays: Weekday[],
  weekStart?: string,
  seasonOverride?: string,
): number {
  const plan = getActiveWeekPlan(weekStart, seasonOverride);
  const days = new Set(weekdays);
  let total = 0;
  for (const day of plan) {
    if (!days.has(day.weekday)) continue;
    for (const meal of day.meals) {
      for (const item of meal.macroItems ?? []) {
        if (item.food === productKey) total += item.vitalii + item.olesia;
      }
    }
  }
  return total;
}

/** Same as `sumMacroGrams`, but combines several product keys if needed. */
export function sumMacroGramsMulti(
  productKeys: string[],
  weekdays: Weekday[],
  weekStart?: string,
  seasonOverride?: string,
): number {
  return productKeys.reduce(
    (sum, key) => sum + sumMacroGrams(key, weekdays, weekStart, seasonOverride),
    0,
  );
}

export type QuantityUnit = "g" | "piece" | "ml";

/**
 * Grams → display string. "piece" needs `gramsPerPiece` (from `products.ts`) to convert.
 * "ml" reuses the gram total as-is (water-based liquids — milk, cream — are ~1g/ml,
 * close enough for a shopping quantity) but labels it "мл" instead of "г"/"кг".
 */
export function formatGrams(
  grams: number,
  unit: QuantityUnit = "g",
  gramsPerPiece?: number,
): string {
  if (unit === "piece") {
    if (!gramsPerPiece) throw new Error("formatGrams: unit 'piece' requires gramsPerPiece");
    const val = grams / gramsPerPiece;
    const formatted = Number(val.toFixed(1));
    return `${formatted} шт`;
  }
  if (unit === "ml") {
    return `${Math.round(grams)} мл`;
  }
  if (grams >= 1000) {
    return `${Number((grams / 1000).toFixed(2))} кг`;
  }
  return `${Math.round(grams)} г`;
}
