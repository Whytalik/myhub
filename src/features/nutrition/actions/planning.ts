"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { calculateDishNutrition } from "@/lib/nutrition/calculations"
import { DishEntry, ProductEntry } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

const DEFAULT_MEAL_SLOTS = [
  { name: "Передтрен", timeWindow: "07:00", order: 0, kcalPct: 0.05, fiberPct: 0 },
  { name: "Сніданок", timeWindow: "08:30", order: 1, kcalPct: 0.25, fiberPct: 0.25 },
  { name: "Обід", timeWindow: "13:00", order: 2, kcalPct: 0.40, fiberPct: 0.45 },
  { name: "Вечеря", timeWindow: "19:00", order: 3, kcalPct: 0.30, fiberPct: 0.30 },
]

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]

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
    return { success: true, data: { weekPlanId: weekPlan.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create week plan" }
  }
}

export async function getWeekPlan(weekPlanId: string): Promise<ActionResult<{
  id: string
  name: string | null
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
    dayOfWeek: number
    activity: string | null
    slots: {
      id: string
      personId: string
      personName: string | null
      name: string
      timeWindow: string | null
      order: number
      targetKcal: number
      targetFiberGrams: number
      actualKcal: number
      actualProtein: number
      actualFat: number
      actualCarbs: number
      actualFiber: number
      entries: {
        id: string
        dishId: string
        dishName: string
        portionWeight: number
        servings: number
        isShared: boolean
        fitScore: number | null
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
          const nutrition = calculateDishNutrition(entry.dish)
          const totalWeight = entry.portionWeight * entry.servings
          const portionKcal = (nutrition.per100g.kcal * totalWeight) / 100
          const portionProtein = (nutrition.per100g.protein * totalWeight) / 100
          const portionFat = (nutrition.per100g.fat * totalWeight) / 100
          const portionCarbs = (nutrition.per100g.carbs * totalWeight) / 100
          const portionFiber = (nutrition.per100g.fiber * totalWeight) / 100

          actualKcal += portionKcal
          actualProtein += portionProtein
          actualFat += portionFat
          actualCarbs += portionCarbs
          actualFiber += portionFiber

          return {
            id: entry.id,
            dishId: entry.dishId,
            dishName: entry.dish.name,
            portionWeight: entry.portionWeight,
            servings: entry.servings,
            isShared: entry.isShared,
            fitScore: entry.fitScore,
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
        dayOfWeek: day.dayOfWeek,
        activity: day.activity,
        slots,
      }
    })

    return {
      success: true,
      data: {
        id: weekPlan.id,
        name: weekPlan.name,
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
  isShared: boolean,
  servings?: number,
  manualWeight?: number
): Promise<ActionResult<{ dishEntry: DishEntry }>> {
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

    const nutrition = calculateDishNutrition(dish)
    
    // Auto-calculate servings if not provided
    const dishServings = servings ?? (slot.targetKcal / (nutrition.perServing.kcal || 1))
    const portionWeight = manualWeight ?? (dishServings * (nutrition.totalCookedWeight / (dish.servings || 1)))

    const dishEntry = await prisma.dishEntry.create({
      data: {
        mealSlotId: slotId,
        dishId,
        portionWeight,
        servings: dishServings,
        isShared,
        manualWeight: !!manualWeight,
        fitScore: null,
      },
    })

    if (isShared) {
      const otherPerson = await prisma.nutritionPerson.findFirst({
        where: {
          id: { not: slot.personId },
          userId: slot.person.userId ?? undefined,
        },
      })

      if (otherPerson) {
        const otherSlot = await prisma.mealSlotInstance.findFirst({
          where: {
            dayPlanId: slot.dayPlanId,
            personId: otherPerson.id,
            name: slot.name,
          },
        })

        if (otherSlot) {
          await prisma.dishEntry.create({
            data: {
              mealSlotId: otherSlot.id,
              dishId,
              portionWeight,
              servings: dishServings,
              isShared: true,
              manualWeight: !!manualWeight,
              fitScore: null,
            },
          })
        }
      }
    }

    invalidateFoodCache(userId)
    return { success: true, data: { dishEntry } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add dish to slot" }
  }
}

export async function updatePortionWeight(
  dishEntryId: string,
  weight: number,
  servings?: number
): Promise<ActionResult<DishEntry>> {
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
      },
    })

    if (!entry) return { success: false, error: "Dish entry not found" }

    if (entry.mealSlot.dayPlan.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: entry.mealSlot.dayPlan.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    const updated = await prisma.dishEntry.update({
      where: { id: dishEntryId },
      data: {
        portionWeight: weight,
        ...(servings !== undefined ? { servings } : {}),
        manualWeight: true,
      },
    })

    invalidateFoodCache(userId)
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update portion weight" }
  }
}

export async function updateDishServings(
  dishEntryId: string,
  servings: number
): Promise<ActionResult<DishEntry>> {
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

    const updated = await prisma.dishEntry.update({
      where: { id: dishEntryId },
      data: { servings },
    })

    invalidateFoodCache(userId)
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update servings" }
  }
}

export async function removeDishFromSlot(dishEntryId: string): Promise<ActionResult<void>> {
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

    await prisma.dishEntry.delete({ where: { id: dishEntryId } })
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
          const nutrition = calculateDishNutrition(entry.dish)
          const totalWeight = entry.portionWeight * entry.servings
          p.totalKcal += (nutrition.per100g.kcal * totalWeight) / 100
          p.totalProtein += (nutrition.per100g.protein * totalWeight) / 100
          p.totalFat += (nutrition.per100g.fat * totalWeight) / 100
          p.totalCarbs += (nutrition.per100g.carbs * totalWeight) / 100
          p.totalFiber += (nutrition.per100g.fiber * totalWeight) / 100

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

export async function updateProductEntryWeight(
  productEntryId: string,
  portionWeight: number
): Promise<ActionResult<ProductEntry>> {
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

    const updated = await prisma.productEntry.update({
      where: { id: productEntryId },
      data: { portionWeight },
    })

    invalidateFoodCache(userId)
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update product entry weight" }
  }
}

export async function updateDayActivity(
  dayPlanId: string,
  activity: string | null
): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()

    const day = await prisma.dayPlan.findUnique({
      where: { id: dayPlanId },
      include: { weekPlan: true },
    })
    if (!day) return { success: false, error: "Day not found" }

    if (day.weekPlanId) {
      const weekPlan = await prisma.weekPlan.findUnique({ where: { id: day.weekPlanId } })
      if (weekPlan && weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }
    }

    await prisma.dayPlan.update({
      where: { id: dayPlanId },
      data: { activity },
    })

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update activity" }
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

interface ImportWeekPlanResult {
  imported: boolean
  weekPlanId: string
  errors: string[]
}

export async function importWeekPlanFromJson(json: string): Promise<ActionResult<ImportWeekPlanResult>> {
  try {
    const userId = await getRequiredUserId()
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      return { success: false, error: "Invalid JSON format" }
    }

    const data = parsed as Record<string, unknown>
    if (!data.name || !Array.isArray(data.days)) {
      return { success: false, error: "JSON must have 'name' and 'days' fields" }
    }

    const persons = await prisma.nutritionPerson.findMany({ where: { userId } })
    if (persons.length === 0) return { success: false, error: "No persons found. Create profiles first." }

    const result: ImportWeekPlanResult = { imported: false, weekPlanId: "", errors: [] }

    const weekPlan = await prisma.weekPlan.create({
      data: {
        name: String(data.name),
        userId,
        dayPlans: {
          create: (data.days as Record<string, unknown>[]).map((day) => ({
            userId,
            dayOfWeek: Number(day.dayOfWeek) ?? 0,
            activity: (day.activity as string) || null,
            mealSlots: {
              create: persons.flatMap((person) => {
                const targetKcal = person.targetKcal ?? 2000
                const fiberGrams = person.fiberGrams ?? 30
                const slots = (day.mealSlots as Record<string, unknown>[]) || []
                return slots.map((slot) => ({
                  personId: person.id,
                  name: String(slot.name),
                  timeWindow: (slot.timeWindow as string) || null,
                  order: Number(slot.order) ?? 0,
                  targetKcal: targetKcal * ((Number(slot.kcalPct) ?? 0.25)),
                  targetFiberGrams: fiberGrams * ((Number(slot.fiberPct) ?? 0.25)),
                }))
              }),
            },
          })),
        },
      },
    })

    result.imported = true
    result.weekPlanId = weekPlan.id
    invalidateFoodCache(userId)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to import week plan" }
  }
}

export async function exportWeekPlan(weekPlanId: string): Promise<ActionResult<string>> {
  try {
    const userId = await getRequiredUserId()
    const weekPlan = await prisma.weekPlan.findUnique({
      where: { id: weekPlanId, userId },
      include: {
        dayPlans: {
          orderBy: { dayOfWeek: "asc" },
          include: {
            mealSlots: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    })

    if (!weekPlan) return { success: false, error: "Week plan not found" }

    const firstDaySlots = weekPlan.dayPlans[0]?.mealSlots || []

    const json = {
      name: weekPlan.name,
      days: weekPlan.dayPlans.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        activity: day.activity,
        mealSlots: firstDaySlots.map((slot) => ({
          name: slot.name,
          timeWindow: slot.timeWindow,
          order: slot.order,
          kcalPct: slot.targetKcal / (firstDaySlots.reduce((sum, s) => sum + s.targetKcal, 0) || 1),
          fiberPct: slot.targetFiberGrams / (firstDaySlots.reduce((sum, s) => sum + s.targetFiberGrams, 0) || 1),
        })),
      })),
    }

    return { success: true, data: JSON.stringify(json, null, 2) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to export week plan" }
  }
}
