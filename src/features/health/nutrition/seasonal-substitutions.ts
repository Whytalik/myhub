import { PRODUCTS } from "./products";
import type { DayPlan, Meal, MacroItem } from "./types";

export type Season = "summer" | "autumn" | "winter" | "spring";

export interface ReplacementOption {
  targetFoodKey: string;
  targetNameUk: string;
  ingredientTextPattern: string;
  scalingMethod: "equal_weight" | "match_kcal";
}

export interface ProductSubstitutionRule {
  sourceFoodKey: string;
  season: Season;
  /** Місяці активності (0 = Січень, 8 = Вересень, 9 = Жовтень, 10 = Листопад) */
  activeMonths: number[];
  replacements: ReplacementOption[];
}

export const SEASONAL_SUBSTITUTIONS: ProductSubstitutionRule[] = [
  // Сливи → Яблука запечені / Груші восени
  {
    sourceFoodKey: "plum",
    season: "autumn",
    activeMonths: [8, 9, 10], // Вересень, Жовтень, Листопад
    replacements: [
      {
        targetFoodKey: "apple",
        targetNameUk: "Яблука печені з корицею",
        ingredientTextPattern: "Яблука печені з корицею (як десерт)",
        scalingMethod: "match_kcal",
      },
    ],
  },
  // Персики → Груші / Яблука восени
  {
    sourceFoodKey: "peach",
    season: "autumn",
    activeMonths: [8, 9, 10],
    replacements: [
      {
        targetFoodKey: "pear",
        targetNameUk: "Груші свіжі",
        ingredientTextPattern: "Груші (як десерт)",
        scalingMethod: "match_kcal",
      },
    ],
  },
  // Абрикоси → Груші восени
  {
    sourceFoodKey: "apricot",
    season: "autumn",
    activeMonths: [8, 9, 10],
    replacements: [
      {
        targetFoodKey: "pear",
        targetNameUk: "Груші свіжі",
        ingredientTextPattern: "Груші (як десерт)",
        scalingMethod: "match_kcal",
      },
    ],
  },
  // Ягоди восени/взимку → Яблука/Апельсини
  {
    sourceFoodKey: "berries",
    season: "autumn",
    activeMonths: [8, 9, 10],
    replacements: [
      {
        targetFoodKey: "apple",
        targetNameUk: "Яблука",
        ingredientTextPattern: "Яблука (як десерт)",
        scalingMethod: "match_kcal",
      },
    ],
  },
];

export function getCurrentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function findSubstitutionRule(
  foodKey: string,
  season: Season,
  activeMonth: number = new Date().getMonth(),
): ProductSubstitutionRule | undefined {
  return SEASONAL_SUBSTITUTIONS.find(
    (rule) =>
      rule.sourceFoodKey === foodKey &&
      (rule.season === season || rule.activeMonths.includes(activeMonth)),
  );
}

export function calculateScaledGrams(
  sourceFoodKey: string,
  targetFoodKey: string,
  sourceGrams: number,
  scalingMethod: "equal_weight" | "match_kcal" = "match_kcal",
): number {
  if (sourceGrams <= 0) return 0;
  if (scalingMethod === "equal_weight") return sourceGrams;

  const sourceProduct = PRODUCTS[sourceFoodKey];
  const targetProduct = PRODUCTS[targetFoodKey];

  if (!sourceProduct?.macros || !targetProduct?.macros || targetProduct.macros.kcal <= 0) {
    return sourceGrams;
  }

  const sourceTotalKcal = (sourceGrams / 100) * sourceProduct.macros.kcal;
  const targetGrams = (sourceTotalKcal / targetProduct.macros.kcal) * 100;

  // Округлюємо до найближчого цілого грама
  return Math.round(targetGrams);
}

export function transformPlanForSeason(
  basePlan: DayPlan[],
  season: Season,
  activeMonth: number = new Date().getMonth(),
): DayPlan[] {
  return basePlan.map((day) => {
    const transformMeal = (meal: Meal): Meal => {
      let updatedIngredients = [...meal.ingredients];

      const updatedMacroItems = meal.macroItems?.map((item): MacroItem => {
        const rule = findSubstitutionRule(item.food, season, activeMonth);
        if (!rule || rule.replacements.length === 0) return item;

        const replacement = rule.replacements[0];
        const newVitaliiGrams = calculateScaledGrams(
          item.food,
          replacement.targetFoodKey,
          item.vitalii,
          replacement.scalingMethod,
        );
        const newOlesiaGrams = calculateScaledGrams(
          item.food,
          replacement.targetFoodKey,
          item.olesia,
          replacement.scalingMethod,
        );

        // Текстова заміна в інгредієнтах
        updatedIngredients = updatedIngredients.map((ingredientText) => {
          if (
            ingredientText.toLowerCase().includes("сливи") ||
            ingredientText.toLowerCase().includes("персики") ||
            ingredientText.toLowerCase().includes("абрикоси")
          ) {
            return `${replacement.ingredientTextPattern} — порційно за макросами (${replacement.targetNameUk})`;
          }
          return ingredientText;
        });

        return {
          ...item,
          food: replacement.targetFoodKey,
          vitalii: newVitaliiGrams,
          olesia: newOlesiaGrams,
          component: item.component
            ? `${item.component} [${replacement.targetNameUk}]`
            : replacement.targetNameUk,
        };
      });

      return {
        ...meal,
        ingredients: updatedIngredients,
        macroItems: updatedMacroItems,
      };
    };

    const newMeals = day.meals.map(transformMeal);
    const newDay2Meals = day.day2Meals ? day.day2Meals.map(transformMeal) : undefined;

    return {
      ...day,
      meals: newMeals,
      day2Meals: newDay2Meals,
    };
  });
}
