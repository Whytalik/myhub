import { Dish, DishIngredient, FoodProduct, CookingMethod, NutritionPerson } from "@/app/generated/prisma"

export interface DishNutritionResult {
  totalCookedWeight: number
  total: {
    kcal: number
    protein: number
    fat: number
    carbs: number
    fiber: number
  }
  per100g: {
    kcal: number
    protein: number
    fat: number
    carbs: number
    fiber: number
  }
  perServing: {
    kcal: number
    protein: number
    fat: number
    carbs: number
    fiber: number
  }
  totalCost: number
}

export interface FitScoreResult {
  fitScore: number
  warnings: string[]
}

export function calculateDishNutrition(
  dish: Dish & {
    ingredients: (DishIngredient & {
      product: FoodProduct
      cookingMethod: CookingMethod | null
    })[]
  }
): DishNutritionResult {
  let totalKcal = 0
  let totalProtein = 0
  let totalFat = 0
  let totalCarbs = 0
  let totalFiber = 0
  let totalCookedWeight = 0
  let totalCost = 0

  for (const ing of dish.ingredients) {
    const rawWeight = ing.rawWeight
    const coeff = ing.cookingMethod?.coefficient ?? 1.0

    const p = ing.product
    const kcalPer100 = p.caloriesPer100 ?? 0
    const proteinPer100 = p.proteinPer100 ?? 0
    const fatPer100 = p.fatPer100 ?? 0
    const carbsPer100 = p.carbsPer100 ?? 0
    const fiberPer100 = p.fiberPer100 ?? 0
    const price = p.price ?? 0

    totalKcal += (rawWeight * kcalPer100) / 100
    totalProtein += (rawWeight * proteinPer100) / 100
    totalFat += (rawWeight * fatPer100) / 100
    totalCarbs += (rawWeight * carbsPer100) / 100
    totalFiber += (rawWeight * fiberPer100) / 100

    totalCookedWeight += rawWeight * coeff
    totalCost += (rawWeight / 100) * price
  }

  const divisor = totalCookedWeight > 0 ? totalCookedWeight / 100 : 1
  const servs = dish.servings > 0 ? dish.servings : 1

  return {
    totalCookedWeight,
    total: {
      kcal: totalKcal,
      protein: totalProtein,
      fat: totalFat,
      carbs: totalCarbs,
      fiber: totalFiber,
    },
    per100g: {
      kcal: totalKcal / divisor,
      protein: totalProtein / divisor,
      fat: totalFat / divisor,
      carbs: totalCarbs / divisor,
      fiber: totalFiber / divisor,
    },
    perServing: {
      kcal: totalKcal / servs,
      protein: totalProtein / servs,
      fat: totalFat / servs,
      carbs: totalCarbs / servs,
      fiber: totalFiber / servs,
    },
    totalCost,
  }
}

export function calculateFitScore(
  dishPer100g: { kcal: number; protein: number; fat: number; carbs: number; fiber: number },
  portionWeight: number,
  person: Pick<NutritionPerson, "targetKcal" | "proteinPct" | "fatPct" | "carbsPct" | "fiberGrams">,
): FitScoreResult {
  const targetKcal = person.targetKcal ?? 2000

  const dailyProteinTarget = (targetKcal * (person.proteinPct ?? 30) / 100) / 4
  const dailyFatTarget = (targetKcal * (person.fatPct ?? 25) / 100) / 9
  const dailyCarbsTarget = (targetKcal * (person.carbsPct ?? 45) / 100) / 4

  const actualProtein = (dishPer100g.protein * portionWeight) / 100
  const actualFat = (dishPer100g.fat * portionWeight) / 100
  const actualCarbs = (dishPer100g.carbs * portionWeight) / 100

  const deviations: number[] = []

  if (dailyProteinTarget > 0) {
    deviations.push(Math.min(Math.abs(actualProtein - dailyProteinTarget) / dailyProteinTarget, 1))
  }
  if (dailyFatTarget > 0) {
    deviations.push(Math.min(Math.abs(actualFat - dailyFatTarget) / dailyFatTarget, 1))
  }
  if (dailyCarbsTarget > 0) {
    deviations.push(Math.min(Math.abs(actualCarbs - dailyCarbsTarget) / dailyCarbsTarget, 1))
  }

  const avgDeviation = deviations.length > 0 ? deviations.reduce((a, b) => a + b, 0) / deviations.length : 0
  const fitScore = Math.max(0, Math.min(1, 1 - avgDeviation))

  return { fitScore, warnings: [] }
}

