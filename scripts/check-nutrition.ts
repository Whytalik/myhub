import { WEEK_PLAN, PROFILES } from "../src/features/health/nutrition/data";
import { calculateDayMacros } from "../src/features/health/nutrition/nutrition-calc";

for (const day of WEEK_PLAN) {
  const v = calculateDayMacros(day, "vitalii");
  const o = calculateDayMacros(day, "olesia");
  console.log(`${day.labelUk}:`);
  console.log(
    `  Віталій: ${v.kcal} kcal | Б${v.protein} Ж${v.fat} В${v.carbs}  (target ${PROFILES[0].kcal})`,
  );
  console.log(
    `  Олеся:   ${o.kcal} kcal | Б${o.protein} Ж${o.fat} В${o.carbs}  (target ${PROFILES[1].kcal})`,
  );
}
