import { getActiveSetPlan } from "./week";
import type { Meal, SetOccurrence } from "./types";

/**
 * Sum of macroItems grams (vitalii+olesia) for one product key, across the given
 * set-occurrences. Each occurrence contributes `meals` (day 1) and/or
 * `day2Meals ?? meals` (day 2) depending on `occ.day` (absent = both days) — for
 * the 6 sets without `day2Meals`, day1 and day2 resolve to the SAME meals array,
 * so a matching macroItem is naturally counted twice (once per real day it's
 * actually eaten), which is exactly "cook once, eat two days' worth" — no manual
 * ×2 anywhere. See `cycle.ts` for the set↔real-weekday mapping this replaces.
 */
export function sumMacroGramsForSets(
  productKey: string,
  occurrences: SetOccurrence[],
  weekStart?: string,
  seasonOverride?: string,
): number {
  const plan = getActiveSetPlan(weekStart, seasonOverride);
  let total = 0;
  for (const occ of occurrences) {
    const dayPlan = plan.find((d) => d.setId === occ.set);
    if (!dayPlan) continue;
    const passes: Meal[][] = [];
    if (occ.day === undefined || occ.day === 1) passes.push(dayPlan.meals);
    if (occ.day === undefined || occ.day === 2) passes.push(dayPlan.day2Meals ?? dayPlan.meals);
    for (const meals of passes) {
      for (const meal of meals) {
        for (const item of meal.macroItems ?? []) {
          if (item.food === productKey) total += item.vitalii + item.olesia;
        }
      }
    }
  }
  return total;
}

/** Same as `sumMacroGramsForSets`, but combines several product keys if needed. */
export function sumMacroGramsForSetsMulti(
  productKeys: string[],
  occurrences: SetOccurrence[],
  weekStart?: string,
  seasonOverride?: string,
): number {
  return productKeys.reduce(
    (sum, key) => sum + sumMacroGramsForSets(key, occurrences, weekStart, seasonOverride),
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
