import { SUMMER_SET_PLAN, PROFILES } from "../src/features/health/nutrition/data";
import { PRODUCTS } from "../src/features/health/nutrition/products";
import type { Meal } from "../src/features/health/nutrition/types";

interface DayMacros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

function isRepeatPortion(meal: Meal): boolean {
  return (
    (meal.macroItems ?? []).length === 0 &&
    meal.ingredients.some((ing) => {
      const lower = ing.toLowerCase();
      return lower.includes("друга порція") || lower.includes("обідньої страви");
    })
  );
}

function calculateDayMacrosRaw(meals: Meal[], person: "vitalii" | "olesia"): DayMacros {
  const processedMeals = meals.map((meal) => ({
    ...meal,
    macroItems: meal.macroItems?.map((i) => ({ ...i })),
  }));

  for (let i = 0; i < processedMeals.length; i++) {
    const meal = processedMeals[i];
    if (meal.type === "dinner" && isRepeatPortion(meal)) {
      const lunch = processedMeals.find((m) => m.type === "lunch");
      if (lunch && lunch.macroItems && lunch.macroItems.length > 0) {
        const half = lunch.macroItems.map((item) => ({
          ...item,
          vitalii: Math.round((item.vitalii / 2) * 10) / 10,
          olesia: Math.round((item.olesia / 2) * 10) / 10,
        }));
        lunch.macroItems = half;
        meal.macroItems = half;
      }
    }
  }

  const totals = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

  for (const meal of processedMeals) {
    for (const item of meal.macroItems ?? []) {
      const grams = person === "vitalii" ? item.vitalii : item.olesia;
      if (grams <= 0) continue;
      const macros = PRODUCTS[item.food]?.macros;
      if (!macros) continue;
      const factor = grams / 100;
      totals.kcal += macros.kcal * factor;
      totals.protein += macros.protein * factor;
      totals.fat += macros.fat * factor;
      totals.carbs += macros.carbs * factor;
    }
  }

  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein),
    fat: Math.round(totals.fat),
    carbs: Math.round(totals.carbs),
  };
}

const profile = PROFILES.find((p) => p.id === "vitalii")!;
console.log("Target (Plan) for Vitalii:");
console.log(
  `  Kcal: ${profile.kcal}, Protein: ${profile.macros.protein}g, Fat: ${profile.macros.fat}g, Carbs: ${profile.macros.carbs}g`,
);
console.log();

console.log("=== Daily macros for Vitalii (SUMMER) ===");
const weekTotal = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

for (const day of SUMMER_SET_PLAN) {
  const macros = calculateDayMacrosRaw(day.meals, "vitalii");
  console.log(
    `  ${day.labelShort}: ${macros.kcal} kcal, ${macros.protein}g P, ${macros.fat}g F, ${macros.carbs}g C`,
  );
  weekTotal.kcal += macros.kcal;
  weekTotal.protein += macros.protein;
  weekTotal.fat += macros.fat;
  weekTotal.carbs += macros.carbs;
}

const avg = {
  kcal: Math.round(weekTotal.kcal / 7),
  protein: Math.round(weekTotal.protein / 7),
  fat: Math.round(weekTotal.fat / 7),
  carbs: Math.round(weekTotal.carbs / 7),
};

console.log();
console.log("=== Weekly totals ===");
console.log(`  Kcal: ${weekTotal.kcal} (avg ${avg.kcal})`);
console.log(`  Protein: ${weekTotal.protein}g (avg ${avg.protein}g)`);
console.log(`  Fat: ${weekTotal.fat}g (avg ${avg.fat}g)`);
console.log(`  Carbs: ${weekTotal.carbs}g (avg ${avg.carbs}g)`);
console.log();
console.log("=== Protein gap per day ===");
for (const day of SUMMER_SET_PLAN) {
  const macros = calculateDayMacrosRaw(day.meals, "vitalii");
  const gap = profile.macros.protein - macros.protein;
  console.log(
    `  ${day.labelShort}: ${macros.protein}g (gap: ${gap > 0 ? "-" : "+"}${Math.abs(gap)}g to target ${profile.macros.protein}g)`,
  );
}
