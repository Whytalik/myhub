import { FOOD_NUTRITION } from "./food-nutrition";
import type { DayPlan, MacroItem } from "./types";

export interface DayMacros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

const ZERO: DayMacros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

function addItem(totals: DayMacros, item: MacroItem, person: "vitalii" | "olesia"): DayMacros {
  const grams = person === "vitalii" ? item.vitalii : item.olesia;
  if (grams <= 0) return totals;
  const macros = FOOD_NUTRITION[item.food];
  if (!macros) return totals;
  const factor = grams / 100;
  return {
    kcal: totals.kcal + macros.kcal * factor,
    protein: totals.protein + macros.protein * factor,
    fat: totals.fat + macros.fat * factor,
    carbs: totals.carbs + macros.carbs * factor,
  };
}

export function calculateDayMacros(day: DayPlan, person: "vitalii" | "olesia"): DayMacros {
  const raw = day.meals
    .flatMap((meal) => meal.macroItems ?? [])
    .reduce((totals, item) => addItem(totals, item, person), ZERO);

  return {
    kcal: Math.round(raw.kcal),
    protein: Math.round(raw.protein),
    fat: Math.round(raw.fat),
    carbs: Math.round(raw.carbs),
  };
}
