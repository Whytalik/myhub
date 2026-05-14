"use server"

import { prisma } from "@/lib/prisma"
import { Prisma, ProductEntry, IngredientInputState } from "@/app/generated/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { calculateEntryNutrition, toRawWeight, EntryWeightInput } from "@/lib/nutrition/calculations"
import { invalidateFoodCache } from "@/lib/revalidate"
import { revalidatePath } from "next/cache"

const DEFAULT_MEAL_SLOTS = [
  { name: "Передтрен", timeWindow: "07:00", order: 0, kcalPct: 0.05, fiberPct: 0 },
  { name: "Сніданок", timeWindow: "08:30", order: 1, kcalPct: 0.25, fiberPct: 0.25 },
  { name: "Обід", timeWindow: "13:00", order: 2, kcalPct: 0.40, fiberPct: 0.45 },
  { name: "Вечеря", timeWindow: "19:00", order: 3, kcalPct: 0.30, fiberPct: 0.30 },
]

export async function createWeekPlan(
  name: string,
  personIds: string[]
): Promise<ActionResult<{ weekPlanId: string }>> {
  try {
    const userId = await getRequiredUserId()

    const persons = await prisma.nutritionPerson.findMany({
      where: { id: { in: personIds }, userId },
    })

    if (persons.length === 0) return { success: false, error: "No valid persons found" }
    if (persons.length !== personIds.length) return { success: false, error: "Some persons do not belong to you" }

    const weekPlan = await prisma.weekPlan.create({
      data: {
        name,
        userId,
        dayPlans: {
          create: Array.from({ length: 7 }, (_, dayIndex) => ({
            userId,
            dayOfWeek: dayIndex,
            mealSlots: {
              create: persons.flatMap((person) => {
                const targetKcal = person.targetKcal ?? 2000
                const fiberGrams = person.fiberGrams ?? 30
                return DEFAULT_MEAL_SLOTS.map((slot) => ({
                  personId: person.id,
                  name: slot.name,
                  timeWindow: slot.timeWindow,
                  order: slot.order,
                  targetKcal: targetKcal * slot.kcalPct,
                  targetFiberGrams: fiberGrams * slot.fiberPct,
                }))
              }),
            },
          })),
        },
      },
    })

    invalidateFoodCache(userId)
    revalidatePath("/nutrition/plans")
    return { success: true, data: { weekPlanId: weekPlan.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create week plan" }
  }
}

export async function getWeekPlan(weekPlanId: string): Promise<ActionResult<{
  id: string
  name: string | null
  notes: string
  persons: {
    id: string
    name: string | null
    goal: string
    targetKcal: number
    proteinPct: number
    fatPct: number
    carbsPct: number
    fiberGrams: number
  }[]
  days: {
    dayPlanId: string
    dayOfWeek: number
    activity: string | null
    prepNote: { id: string; content: string; steps: string[] } | null
    slots: {
      id: string
      personId: string
      personName: string | null
      name: string
      timeWindow: string | null
      order: number
      targetKcal: number
      targetFiberGrams: number
      locked: boolean
      actualKcal: number
      actualProtein: number
      actualFat: number
      actualCarbs: number
      actualFiber: number
      entries: {
        id: string
        dishId: string
        dishName: string
        dishType: string
        dishServings: number
        nutrition: {
          kcal: number
          protein: number
          fat: number
          carbs: number
          fiber: number
        }
        ingredients: {
          id: string
          productId: string
          productName: string
          cookingMethodName: string | null
          coefficient: number
          alternatives: string[]
          ingredientIndex: number
          weight: number
          inputState: string
          rawWeight: number
          cookedWeight: number
          unit: string | null
        }[]
        selectedAlternatives: Record<string, string | null>
      }[]
      productEntries: {
        id: string
        productId: string
        productName: string
        portionWeight: number
        kcal: number
        protein: number
        fat: number
        carbs: number
        fiber: number
      }[]
    }[]
  }[]
} | null>> {
  try {
    const userId = await getRequiredUserId()
    const weekPlan = await prisma.weekPlan.findUnique({
      where: { id: weekPlanId, userId },
      include: {
        dayPlans: {
          orderBy: { dayOfWeek: "asc" },
          include: {
            prepNote: true,
            mealSlots: {
              include: {
                person: true,
                dishEntries: {
                  include: {
                    dish: {
                      include: {
                        ingredients: {
                          include: {
                            product: true,
                            cookingMethod: true,
                          },
                        },
                      },
                    },
                    ingredients: {
                      orderBy: { ingredientIndex: "asc" },
                    },
                  },
                  orderBy: { createdAt: "asc" },
                },
                productEntries: {
                  include: { product: true },
                  orderBy: { createdAt: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!weekPlan) return { success: true, data: null }

    const persons = await prisma.nutritionPerson.findMany({
      where: { userId },
    })

    const personMap = new Map(persons.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        goal: p.goal,
        targetKcal: p.targetKcal ?? 2000,
        proteinPct: p.proteinPct ?? 30,
        fatPct: p.fatPct ?? 25,
        carbsPct: p.carbsPct ?? 45,
        fiberGrams: p.fiberGrams ?? 30,
      },
    ]))

    const days = weekPlan.dayPlans.map((day) => {
      const slots = day.mealSlots.map((slot) => {
        let actualKcal = 0
        let actualProtein = 0
        let actualFat = 0
        let actualCarbs = 0
        let actualFiber = 0

        const entries = slot.dishEntries.map((entry) => {
          const weights: EntryWeightInput[] = entry.ingredients.map((ing) => ({
            ingredientIndex: ing.ingredientIndex,
            weight: ing.weight,
            inputState: ing.inputState,
          }))

          const nutrition = calculateEntryNutrition(entry.dish, weights)

          actualKcal += nutrition.total.kcal
          actualProtein += nutrition.total.protein
          actualFat += nutrition.total.fat
          actualCarbs += nutrition.total.carbs
          actualFiber += nutrition.total.fiber

          const selectedAlts = (entry.selectedAlternatives as Record<string, string | null>) || {}

          const ingredients = entry.dish.ingredients.map((ing, idx) => {
            const entryIng = entry.ingredients.find((ei) => ei.ingredientIndex === idx)
            const coeff = ing.cookingMethod?.coefficient ?? 1.0
            const weight = entryIng?.weight ?? 0
            const inputState = entryIng?.inputState ?? IngredientInputState.RAW
            const rawWeight = toRawWeight(weight, inputState, coeff)
            const cookedWeight = weight * coeff
            const currentProductId = selectedAlts[String(idx)] || ing.productId
            const isAlternative = currentProductId !== ing.productId
            const altName = isAlternative ? (ing.alternatives[0] ?? ing.product.name) : ing.product.name

            return {
              id: ing.id,
              productId: ing.productId,
              productName: isAlternative ? altName : ing.product.name,
              cookingMethodName: ing.cookingMethod?.name ?? null,
              coefficient: coeff,
              alternatives: ing.alternatives,
              ingredientIndex: idx,
              weight,
              inputState,
              rawWeight,
              cookedWeight,
              unit: entryIng?.unit ?? null,
            }
          })

          return {
            id: entry.id,
            dishId: entry.dishId,
            dishName: entry.dish.name,
            dishType: entry.dish.type,
            dishServings: entry.dish.servings,
            nutrition: nutrition.total,
            ingredients,
            selectedAlternatives: selectedAlts,
          }
        })

        const productEntries = slot.productEntries.map((pe) => {
          const factor = pe.portionWeight / 100
          const kcal = pe.product.caloriesPer100 * factor
          const protein = pe.product.proteinPer100 * factor
          const fat = pe.product.fatPer100 * factor
          const carbs = pe.product.carbsPer100 * factor
          const fiber = pe.product.fiberPer100 * factor

          actualKcal += kcal
          actualProtein += protein
          actualFat += fat
          actualCarbs += carbs
          actualFiber += fiber

          return {
            id: pe.id,
            productId: pe.productId,
            productName: pe.product.name,
            portionWeight: pe.portionWeight,
            kcal,
            protein,
            fat,
            carbs,
            fiber,
          }
        })

        return {
          id: slot.id,
          personId: slot.personId,
          personName: slot.person.name,
          name: slot.name,
          timeWindow: slot.timeWindow,
          order: slot.order,
          targetKcal: slot.targetKcal,
          targetFiberGrams: slot.targetFiberGrams,
          locked: slot.locked,
          actualKcal,
          actualProtein,
          actualFat,
          actualCarbs,
          actualFiber,
          entries,
          productEntries,
        }
      })

      return {
        dayPlanId: day.id,
        dayOfWeek: day.dayOfWeek,
        activity: day.activity,
        prepNote: day.prepNote ? { id: day.prepNote.id, content: day.prepNote.content, steps: day.prepNote.steps } : null,
        slots,
      }
    })

    return {
      success: true,
      data: {
        id: weekPlan.id,
        name: weekPlan.name,
        notes: weekPlan.notes,
        persons: Array.from(personMap.values()),
        days,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get week plan" }
  }
}

export async function getLatestWeekPlan(): Promise<ActionResult<{ id: string; name: string | null } | null>> {
  try {
    const userId = await getRequiredUserId()
    const plan = await prisma.weekPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    })

    if (!plan) return { success: true, data: null }

    return { success: true, data: { id: plan.id, name: plan.name } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get latest week plan" }
  }
}

export async function addDishToSlot(
  slotId: string,
  dishId: string,
  ingredientWeights: { ingredientIndex: number; weight: number; inputState?: IngredientInputState; unit?: string }[]
): Promise<ActionResult<{ dishEntryId: string }>> {
  try {
    const userId = await getRequiredUserId()

    const slot = await prisma.mealSlotInstance.findUnique({
      where: { id: slotId },
      include: {
        person: true,
        dayPlan: true,
      },
    })

    if (!slot) return { success: false, error: "Meal slot not found" }

    const dish = await prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
    })

    if (!dish) return { success: false, error: "Dish not found" }
    if (dish.userId !== userId) return { success: false, error: "Unauthorized" }

    if (slot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: slot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    const dishEntry = await prisma.dishEntry.create({
      data: {
        mealSlotId: slotId,
        dishId,
        ingredients: {
          create: ingredientWeights.map((w) => ({
            ingredientIndex: w.ingredientIndex,
            weight: w.weight,
            inputState: w.inputState ?? IngredientInputState.RAW,
            unit: w.unit ?? null,
          })),
        },
      },
    })

    invalidateFoodCache(userId)
    return { success: true, data: { dishEntryId: dishEntry.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add dish to slot" }
  }
}

export async function updateDishEntryIngredient(
  dishEntryId: string,
  ingredientIndex: number,
  weight: number,
  inputState?: IngredientInputState,
  unit?: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const entry = await prisma.dishEntry.findUnique({
      where: { id: dishEntryId },
      include: {
        mealSlot: {
          include: {
            dayPlan: true,
          },
        },
      },
    })

    if (!entry) return { success: false, error: "Dish entry not found" }

    if (entry.mealSlot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: entry.mealSlot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    await prisma.dishEntryIngredient.upsert({
      where: {
        dishEntryId_ingredientIndex: {
          dishEntryId,
          ingredientIndex,
        },
      },
      create: {
        dishEntryId,
        ingredientIndex,
        weight,
        inputState: inputState ?? IngredientInputState.RAW,
        unit: unit ?? null,
      },
      update: {
        weight,
        inputState: inputState ?? undefined,
        unit: unit ?? null,
      },
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update ingredient weight" }
  }
}

export async function updateDishEntryAlternative(
  dishEntryId: string,
  ingredientIndex: number,
  alternativeProductId: string | null
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const entry = await prisma.dishEntry.findUnique({
      where: { id: dishEntryId },
      include: {
        mealSlot: {
          include: {
            dayPlan: {
              include: {
                weekPlan: true
              }
            }
          }
        }
      }
    })

    if (!entry) return { success: false, error: "Dish entry not found" }
    if (entry.mealSlot.dayPlan.weekPlan?.userId !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    const selectedAlts = (entry.selectedAlternatives as Record<string, string | null>) || {}
    if (alternativeProductId) {
      selectedAlts[String(ingredientIndex)] = alternativeProductId
    } else {
      delete selectedAlts[String(ingredientIndex)]
    }

    await prisma.dishEntry.update({
      where: { id: dishEntryId },
      data: { selectedAlternatives: selectedAlts }
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update alternative" }
  }
}

export async function removeDishFromSlot(entryId: string): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const entry = await prisma.dishEntry.findUnique({
      where: { id: entryId },
      include: {
        mealSlot: {
          include: {
            dayPlan: true,
          },
        },
      },
    })

    if (!entry) return { success: false, error: "Dish entry not found" }

    if (entry.mealSlot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: entry.mealSlot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    await prisma.dishEntry.delete({ where: { id: entryId } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove dish" }
  }
}

export async function getWeekSummary(
  weekPlanId: string
): Promise<ActionResult<{
  persons: {
    personId: string
    personName: string | null
    avgKcalPerDay: number
    avgProtein: number
    avgFat: number
    avgCarbs: number
    avgFiber: number
    targetKcal: number
    targetProtein: number
    targetFat: number
    targetCarbs: number
    targetFiber: number
    repeatedDishes: { dishName: string; count: number; days: number[] }[]
  }[]
}>> {
  try {
    const userId = await getRequiredUserId()
    const weekPlan = await prisma.weekPlan.findUnique({
      where: { id: weekPlanId, userId },
      include: {
        dayPlans: {
          include: {
            mealSlots: {
              include: {
                person: true,
                dishEntries: {
                  include: {
                    dish: {
                      include: {
                        ingredients: {
                          include: {
                            product: true,
                            cookingMethod: true,
                          },
                        },
                      },
                    },
                    ingredients: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!weekPlan) return { success: false, error: "Week plan not found" }

    const personMap = new Map<string, {
      name: string | null
      totalKcal: number
      totalProtein: number
      totalFat: number
      totalCarbs: number
      totalFiber: number
      dayCount: number
      dishCounts: Map<string, { count: number; name: string; days: Set<number> }>
      targetKcal: number
      targetProtein: number
      targetFat: number
      targetCarbs: number
      targetFiber: number
    }>()

    for (const day of weekPlan.dayPlans) {
      let dayHasEntries = false
      for (const slot of day.mealSlots) {
        const pid = slot.personId
        if (!personMap.has(pid)) {
          personMap.set(pid, {
            name: slot.person.name,
            totalKcal: 0,
            totalProtein: 0,
            totalFat: 0,
            totalCarbs: 0,
            totalFiber: 0,
            dayCount: 0,
            dishCounts: new Map(),
            targetKcal: slot.person.targetKcal ?? 2000,
            targetProtein: ((slot.person.targetKcal ?? 2000) * (slot.person.proteinPct ?? 30) / 100) / 4,
            targetFat: ((slot.person.targetKcal ?? 2000) * (slot.person.fatPct ?? 25) / 100) / 9,
            targetCarbs: ((slot.person.targetKcal ?? 2000) * (slot.person.carbsPct ?? 45) / 100) / 4,
            targetFiber: slot.person.fiberGrams ?? 30,
          })
        }
        const p = personMap.get(pid)!

        for (const entry of slot.dishEntries) {
          dayHasEntries = true
          const weights: EntryWeightInput[] = entry.ingredients.map((ing) => ({
            ingredientIndex: ing.ingredientIndex,
            weight: ing.weight,
            inputState: ing.inputState,
          }))
          const nutrition = calculateEntryNutrition(entry.dish, weights)
          p.totalKcal += nutrition.total.kcal
          p.totalProtein += nutrition.total.protein
          p.totalFat += nutrition.total.fat
          p.totalCarbs += nutrition.total.carbs
          p.totalFiber += nutrition.total.fiber

          const dc = p.dishCounts.get(entry.dishId) ?? { count: 0, name: entry.dish.name, days: new Set<number>() }
          dc.count++
          dc.days.add(day.dayOfWeek)
          p.dishCounts.set(entry.dishId, dc)
        }
      }
      if (dayHasEntries) {
        for (const [, p] of personMap) {
          p.dayCount++
        }
      }
    }

    const persons = Array.from(personMap.entries()).map(([id, p]) => {
      const days = p.dayCount || 1
      const repeatedDishes = Array.from(p.dishCounts.entries())
        .filter(([, v]) => v.count >= 3)
        .map(([, v]) => ({
          dishName: v.name,
          count: v.count,
          days: Array.from(v.days),
        }))

      return {
        personId: id,
        personName: p.name,
        avgKcalPerDay: p.totalKcal / days,
        avgProtein: p.totalProtein / days,
        avgFat: p.totalFat / days,
        avgCarbs: p.totalCarbs / days,
        avgFiber: p.totalFiber / days,
        targetKcal: p.targetKcal,
        targetProtein: p.targetProtein,
        targetFat: p.targetFat,
        targetCarbs: p.targetCarbs,
        targetFiber: p.targetFiber,
        repeatedDishes,
      }
    })

    return { success: true, data: { persons } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get week summary" }
  }
}

export async function getWeekPlans(): Promise<ActionResult<{ id: string; name: string | null; createdAt: Date }[]>> {
  try {
    const userId = await getRequiredUserId()
    const plans = await prisma.weekPlan.findMany({
      where: { userId },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    })
    return { success: true, data: plans }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get week plans" }
  }
}

export async function addProductToSlot(
  slotId: string,
  productId: string,
  portionWeight: number
): Promise<ActionResult<ProductEntry>> {
  try {
    const userId = await getRequiredUserId()

    const slot = await prisma.mealSlotInstance.findUnique({
      where: { id: slotId },
      include: { dayPlan: true },
    })
    if (!slot) return { success: false, error: "Meal slot not found" }

    if (slot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: slot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    const product = await prisma.foodProduct.findUnique({ where: { id: productId } })
    if (!product) return { success: false, error: "Product not found" }

    const entry = await prisma.productEntry.create({
      data: { mealSlotId: slotId, productId, portionWeight },
    })

    invalidateFoodCache(userId)
    return { success: true, data: entry }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add product to slot" }
  }
}

export async function updateProductEntryWeight(
  productEntryId: string,
  portionWeight: number
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const entry = await prisma.productEntry.findUnique({
      where: { id: productEntryId },
      include: { mealSlot: { include: { dayPlan: true } } },
    })
    if (!entry) return { success: false, error: "Product entry not found" }

    if (entry.mealSlot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: entry.mealSlot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    await prisma.productEntry.update({
      where: { id: productEntryId },
      data: { portionWeight },
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update product weight" }
  }
}

export async function removeProductFromSlot(productEntryId: string): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const entry = await prisma.productEntry.findUnique({
      where: { id: productEntryId },
      include: { mealSlot: { include: { dayPlan: true } } },
    })
    if (!entry) return { success: false, error: "Product entry not found" }

    if (entry.mealSlot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: entry.mealSlot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    await prisma.productEntry.delete({ where: { id: productEntryId } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to remove product entry" }
  }
}

export async function toggleSlotLock(slotId: string): Promise<ActionResult<{ locked: boolean }>> {
  try {
    const userId = await getRequiredUserId()
    const slot = await prisma.mealSlotInstance.findUnique({
      where: { id: slotId },
      include: { dayPlan: { include: { weekPlan: true } } },
    })
    if (!slot) return { success: false, error: "Slot not found" }
    if (slot.dayPlan.weekPlan?.userId !== userId) return { success: false, error: "Unauthorized" }

    const updated = await prisma.mealSlotInstance.update({
      where: { id: slotId },
      data: { locked: !slot.locked },
    })
    invalidateFoodCache(userId)
    return { success: true, data: { locked: updated.locked } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to toggle lock" }
  }
}

export async function deleteWeekPlan(weekPlanId: string): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const plan = await prisma.weekPlan.findUnique({ where: { id: weekPlanId } })
    if (!plan) return { success: false, error: "Week plan not found" }
    if (plan.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.weekPlan.delete({ where: { id: weekPlanId } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete week plan" }
  }
}

export async function updateWeekPlanName(
  weekPlanId: string,
  name: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const plan = await prisma.weekPlan.findUnique({ where: { id: weekPlanId } })
    if (!plan) return { success: false, error: "Week plan not found" }
    if (plan.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.weekPlan.update({
      where: { id: weekPlanId },
      data: { name },
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update week plan name" }
  }
}

export async function duplicateWeekPlan(weekPlanId: string): Promise<ActionResult<{ weekPlanId: string }>> {
  try {
    const userId = await getRequiredUserId()
    const plan = await prisma.weekPlan.findUnique({
      where: { id: weekPlanId, userId },
      include: {
        dayPlans: {
          orderBy: { dayOfWeek: "asc" },
          include: {
            prepNote: true,
            mealSlots: {
              orderBy: { order: "asc" },
              include: {
                dishEntries: {
                  include: {
                    ingredients: true,
                  },
                },
                productEntries: true,
              },
            },
          },
        },
      },
    })
    if (!plan) return { success: false, error: "Week plan not found" }

    const daysToCopy = plan.dayPlans
    const newPlan = await prisma.$transaction(async (tx) => {
      const created = await tx.weekPlan.create({
        data: {
          name: `${plan.name || "Week Plan"} (copy)`,
          userId,
        },
      })

      for (const day of daysToCopy) {
        const dayPlan = await tx.dayPlan.create({
          data: {
            userId,
            weekPlanId: created.id,
            dayOfWeek: day.dayOfWeek,
            activity: day.activity,
          },
        })

        if (day.prepNote) {
          await tx.dayPrepNote.create({
            data: {
              dayPlanId: dayPlan.id,
              content: day.prepNote.content,
              steps: day.prepNote.steps,
            },
          })
        }

        for (const slot of day.mealSlots) {
          const mealSlot = await tx.mealSlotInstance.create({
            data: {
              dayPlanId: dayPlan.id,
              personId: slot.personId,
              name: slot.name,
              timeWindow: slot.timeWindow,
              order: slot.order,
              targetKcal: slot.targetKcal,
              targetFiberGrams: slot.targetFiberGrams,
              locked: false,
            },
          })

          for (const entry of slot.dishEntries) {
            const dishEntry = await tx.dishEntry.create({
              data: {
                mealSlotId: mealSlot.id,
                dishId: entry.dishId,
                selectedAlternatives: (entry.selectedAlternatives as Prisma.InputJsonValue) ?? undefined,
              },
            })

            if (entry.ingredients.length > 0) {
              await tx.dishEntryIngredient.createMany({
                data: entry.ingredients.map((ing) => ({
                  dishEntryId: dishEntry.id,
                  ingredientIndex: ing.ingredientIndex,
                  weight: ing.weight,
                  inputState: ing.inputState,
                  unit: ing.unit,
                })),
              })
            }
          }

          for (const pe of slot.productEntries) {
            await tx.productEntry.create({
              data: {
                mealSlotId: mealSlot.id,
                productId: pe.productId,
                portionWeight: pe.portionWeight,
              },
            })
          }
        }
      }

      return created
    })

    invalidateFoodCache(userId)
    return { success: true, data: { weekPlanId: newPlan.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to duplicate week plan" }
  }
}

export async function updateDayPrepNote(
  dayPlanId: string,
  content: string,
  steps: string[]
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const dayPlan = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
      include: { weekPlan: true },
    })
    if (!dayPlan) return { success: false, error: "Day plan not found" }
    if (dayPlan.weekPlan?.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.dayPrepNote.upsert({
      where: { dayPlanId },
      create: { dayPlanId, content, steps },
      update: { content, steps },
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update prep note" }
  }
}

export async function updateWeekPlanNotes(
  weekPlanId: string,
  notes: string
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const plan = await prisma.weekPlan.findUnique({ where: { id: weekPlanId } })
    if (!plan) return { success: false, error: "Week plan not found" }
    if (plan.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.weekPlan.update({
      where: { id: weekPlanId },
      data: { notes },
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update week plan notes" }
  }
}
