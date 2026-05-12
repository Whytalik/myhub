"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { calculateDishNutrition, calculateFitScore } from "@/lib/nutrition/calculations"
import { DishEntry, Goal, ProductEntry } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

export async function createWeekPlan(
  startDate: Date,
  personIds: string[]
): Promise<ActionResult<{ weekPlanId: string }>> {
  try {
    const userId = await getRequiredUserId()

    const persons = await prisma.nutritionPerson.findMany({
      where: { id: { in: personIds }, userId },
    })

    if (persons.length === 0) return { success: false, error: "No valid persons found" }
    if (persons.length !== personIds.length) return { success: false, error: "Some persons do not belong to you" }

    const templateSlots = await prisma.mealTemplateSlot.findMany({
      orderBy: { order: "asc" },
    })

    const weekPlan = await prisma.weekPlan.create({
      data: {
        startDate,
        userId,
        dayPlans: {
          create: Array.from({ length: 7 }, (_, dayIndex) => {
            const date = new Date(startDate)
            date.setDate(date.getDate() + dayIndex)
            return {
              date,
              userId,
              mealSlots: {
                create: persons.flatMap((person) => {
                  const goal = person.goal as Goal
                  const slotsForGoal = templateSlots.filter((ts) => ts.goal === goal)
                  return slotsForGoal.map((slotTemplate) => ({
                    personId: person.id,
                    templateSlotId: slotTemplate.id,
                    targetKcal: ((person.targetKcal ?? 2000) * slotTemplate.percentage) / 100,
                    targetFiberGrams: ((person.fiberGrams ?? 30) * slotTemplate.fiberPct),
                  }))
                }),
              },
            }
          }),
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
  startDate: Date
  persons: {
    id: string
    name: string | null
    goal: Goal
    targetKcal: number
    proteinPct: number
    fatPct: number
    carbsPct: number
    fiberGrams: number
  }[]
  days: {
    date: Date
    slots: {
      id: string
      personId: string
      personName: string | null
      templateSlotName: string
      templateSlotOrder: number
      targetKcal: number
      targetFiberGrams: number
      actualKcal: number
      actualProtein: number
      actualFat: number
      actualCarbs: number
      actualFiber: number
      violations: string[]
      entries: {
        id: string
        dishId: string
        dishName: string
        portionWeight: number
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
          orderBy: { date: "asc" },
          include: {
            mealSlots: {
              include: {
                person: true,
                templateSlot: true,
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
              orderBy: { templateSlot: { order: "asc" } },
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
        const violations: string[] = []

        const entries = slot.dishEntries.map((entry) => {
          const nutrition = calculateDishNutrition(entry.dish)
          const portionKcal = (nutrition.per100g.kcal * entry.portionWeight) / 100
          const portionProtein = (nutrition.per100g.protein * entry.portionWeight) / 100
          const portionFat = (nutrition.per100g.fat * entry.portionWeight) / 100
          const portionCarbs = (nutrition.per100g.carbs * entry.portionWeight) / 100
          const portionFiber = (nutrition.per100g.fiber * entry.portionWeight) / 100

          actualKcal += portionKcal
          actualProtein += portionProtein
          actualFat += portionFat
          actualCarbs += portionCarbs
          actualFiber += portionFiber

          if (entry.fitScore != null) {
            try {
              const fitResult = calculateFitScore(
                nutrition.per100g,
                entry.portionWeight,
                slot.person,
                slot.templateSlot
              )
              violations.push(...fitResult.warnings)
            } catch {
              // skip fit score calc if template slot data is incomplete
            }
          }

          return {
            id: entry.id,
            dishId: entry.dishId,
            dishName: entry.dish.name,
            portionWeight: entry.portionWeight,
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
          templateSlotName: slot.templateSlot.name,
          templateSlotOrder: slot.templateSlot.order,
          targetKcal: slot.targetKcal,
          targetFiberGrams: slot.targetFiberGrams,
          actualKcal,
          actualProtein,
          actualFat,
          actualCarbs,
          actualFiber,
          violations,
          entries,
          productEntries,
        }
      })

      return {
        date: day.date,
        slots,
      }
    })

    return {
      success: true,
      data: {
        id: weekPlan.id,
        startDate: weekPlan.startDate,
        persons: Array.from(personMap.values()),
        days,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get week plan" }
  }
}

export async function getLatestWeekPlan(): Promise<ActionResult<{ id: string; startDate: Date } | null>> {
  try {
    const userId = await getRequiredUserId()
    const plan = await prisma.weekPlan.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
      select: { id: true, startDate: true },
    })

    if (!plan) return { success: true, data: null }

    return { success: true, data: { id: plan.id, startDate: plan.startDate } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get latest week plan" }
  }
}

export async function addDishToSlot(
  slotId: string,
  dishId: string,
  isShared: boolean,
  manualWeight?: number
): Promise<ActionResult<{ dishEntry: DishEntry; warnings: string[] }>> {
  try {
    const userId = await getRequiredUserId()

    const slot = await prisma.mealSlotInstance.findUnique({
      where: { id: slotId },
      include: {
        person: true,
        templateSlot: true,
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
    const portionWeight =
      manualWeight ?? (slot.targetKcal * 100) / (nutrition.per100g.kcal || 1)

    const fitResult = calculateFitScore(
      nutrition.per100g,
      portionWeight,
      slot.person,
      slot.templateSlot
    )

    const dishEntry = await prisma.dishEntry.create({
      data: {
        mealSlotId: slotId,
        dishId,
        portionWeight,
        isShared,
        manualWeight: !!manualWeight,
        fitScore: fitResult.fitScore,
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
            templateSlot: { name: slot.templateSlot.name },
          },
          include: { templateSlot: true, person: true },
        })

        if (otherSlot) {
          const otherFitResult = calculateFitScore(
            nutrition.per100g,
            portionWeight,
            otherPerson,
            otherSlot.templateSlot
          )

          await prisma.dishEntry.create({
            data: {
              mealSlotId: otherSlot.id,
              dishId,
              portionWeight,
              isShared: true,
              manualWeight: !!manualWeight,
              fitScore: otherFitResult.fitScore,
            },
          })
        }
      }
    }

    invalidateFoodCache(userId)
    return { success: true, data: { dishEntry, warnings: fitResult.warnings } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add dish to slot" }
  }
}

export async function updatePortionWeight(
  dishEntryId: string,
  weight: number
): Promise<ActionResult<DishEntry>> {
  try {
    const userId = await getRequiredUserId()

    const entry = await prisma.dishEntry.findUnique({
      where: { id: dishEntryId },
      include: {
        mealSlot: {
          include: {
            person: true,
            templateSlot: true,
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

    const nutrition = calculateDishNutrition(entry.dish)
    const fitResult = calculateFitScore(
      nutrition.per100g,
      weight,
      entry.mealSlot.person,
      entry.mealSlot.templateSlot
    )

    const updated = await prisma.dishEntry.update({
      where: { id: dishEntryId },
      data: {
        portionWeight: weight,
        manualWeight: true,
        fitScore: fitResult.fitScore,
      },
      include: {
        mealSlot: {
          include: {
            person: true,
            templateSlot: true,
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

    invalidateFoodCache(userId)
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update portion weight" }
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
    repeatedDishes: { dishName: string; count: number; days: string[] }[]
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
      dishCounts: Map<string, { count: number; name: string; days: Set<string> }>
      targetKcal: number
      targetProtein: number
      targetFat: number
      targetCarbs: number
      targetFiber: number
    }>()

    for (const day of weekPlan.dayPlans) {
      const dateStr = day.date.toISOString().split("T")[0]
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
          p.totalKcal += (nutrition.per100g.kcal * entry.portionWeight) / 100
          p.totalProtein += (nutrition.per100g.protein * entry.portionWeight) / 100
          p.totalFat += (nutrition.per100g.fat * entry.portionWeight) / 100
          p.totalCarbs += (nutrition.per100g.carbs * entry.portionWeight) / 100
          p.totalFiber += (nutrition.per100g.fiber * entry.portionWeight) / 100

          const dc = p.dishCounts.get(entry.dishId) ?? { count: 0, name: entry.dish.name, days: new Set<string>() }
          dc.count++
          dc.days.add(dateStr)
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

export async function getWeekPlans(): Promise<ActionResult<{ id: string; startDate: Date; name: string | null }[]>> {
  try {
    const userId = await getRequiredUserId()
    const plans = await prisma.weekPlan.findMany({
      where: { userId },
      select: { id: true, startDate: true, name: true },
      orderBy: { startDate: "desc" },
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
