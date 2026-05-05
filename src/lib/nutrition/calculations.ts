import { Dish, DishIngredient, FoodProduct, CookingMethod, MealTemplateSlot, NutritionPerson } from "@/app/generated/prisma"

export interface DishNutritionResult {
  totalCookedWeight: number
  per100g: {
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

  return {
    totalCookedWeight,
    per100g: {
      kcal: totalKcal / divisor,
      protein: totalProtein / divisor,
      fat: totalFat / divisor,
      carbs: totalCarbs / divisor,
      fiber: totalFiber / divisor,
    },
    totalCost,
  }
}

export function calculateFitScore(
  dishPer100g: { kcal: number; protein: number; fat: number; carbs: number; fiber: number },
  portionWeight: number,
  person: Pick<NutritionPerson, "targetKcal" | "proteinPct" | "fatPct" | "carbsPct" | "fiberGrams">,
  slot: Pick<MealTemplateSlot, "percentage" | "minProteinGrams" | "maxPctOfDaily">
): FitScoreResult {
  const targetKcal = (person.targetKcal ?? 2000) * (slot.percentage / 100)

  const slotProteinTarget = (targetKcal * (person.proteinPct ?? 30) / 100) / 4
  const slotFatTarget = (targetKcal * (person.fatPct ?? 25) / 100) / 9
  const slotCarbsTarget = (targetKcal * (person.carbsPct ?? 45) / 100) / 4

  const actualProtein = (dishPer100g.protein * portionWeight) / 100
  const actualFat = (dishPer100g.fat * portionWeight) / 100
  const actualCarbs = (dishPer100g.carbs * portionWeight) / 100

  const deviations: number[] = []

  if (slotProteinTarget > 0) {
    deviations.push(Math.min(Math.abs(actualProtein - slotProteinTarget) / slotProteinTarget, 1))
  }
  if (slotFatTarget > 0) {
    deviations.push(Math.min(Math.abs(actualFat - slotFatTarget) / slotFatTarget, 1))
  }
  if (slotCarbsTarget > 0) {
    deviations.push(Math.min(Math.abs(actualCarbs - slotCarbsTarget) / slotCarbsTarget, 1))
  }

  const avgDeviation = deviations.length > 0 ? deviations.reduce((a, b) => a + b, 0) / deviations.length : 0
  const fitScore = Math.max(0, Math.min(1, 1 - avgDeviation))

  const warnings: string[] = []

  if (slot.minProteinGrams != null && actualProtein < slot.minProteinGrams) {
    warnings.push(`Недостатньо білка: ${actualProtein.toFixed(1)}г з ${slot.minProteinGrams}г`)
  }

  if (slot.maxPctOfDaily != null) {
    const maxKcal = (person.targetKcal ?? 2000) * slot.maxPctOfDaily
    const actualKcal = (dishPer100g.kcal * portionWeight) / 100
    if (actualKcal > maxKcal) {
      warnings.push(`Перевищення вечірнього ліміту: ${actualKcal.toFixed(0)} ккал з ${maxKcal.toFixed(0)} ккал`)
    }
  }

  return { fitScore, warnings }
}

