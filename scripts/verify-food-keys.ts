import { WEEK_PLAN } from "../src/features/health/nutrition/data";
import { FOOD_NUTRITION } from "../src/features/health/nutrition/food-nutrition";

const known = new Set(Object.keys(FOOD_NUTRITION));
const used = new Set<string>();
for (const day of WEEK_PLAN) {
  for (const meal of day.meals) {
    for (const item of meal.macroItems ?? []) used.add(item.food);
  }
}

const unknown = [...used].filter((f) => !known.has(f));
console.log("Unknown food keys used in data.ts:", unknown.length ? unknown : "none");
console.log("Unused food keys in food-nutrition.ts:", [...known].filter((k) => !used.has(k)));
