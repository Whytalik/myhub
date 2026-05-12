"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { calculateDishNutrition } from "@/lib/nutrition/calculations"
import { Dish, DishIngredient, FoodProduct, CookingMethod } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

import type { DishType } from "../constants/dish-types"

interface CreateDishData {
  name: string
  description?: string
  servings?: number
  type?: DishType
  ingredients: {
    productId: string
    cookingMethodId?: string
    rawWeight: number
  }[]
}

type UpdateDishData = Partial<CreateDishData>

interface DishNutritionSummary {
  id: string
  name: string
  description: string | null
  servings: number
  type: DishType
  totalCookedWeight: number
  per100g: {
    kcal: number
    protein: number
    fat: number
    carbs: number
    fiber: number
  }
  totalCost: number
  ingredientCount: number
}

export async function createDish(data: CreateDishData): Promise<ActionResult<Dish>> {
  try {
    const userId = await getRequiredUserId()
    const dish = await prisma.dish.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        servings: data.servings ?? 1,
        type: data.type ?? "MAIN",
        ingredients: {
          create: data.ingredients.map((ing) => ({
            productId: ing.productId,
            cookingMethodId: ing.cookingMethodId,
            rawWeight: ing.rawWeight,
          })),
        },
      },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: dish }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create dish" }
  }
}

export async function updateDish(id: string, data: UpdateDishData): Promise<ActionResult<Dish>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.dish.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Dish not found" }
    if (existing.userId !== userId) return { success: false, error: "Unauthorized" }

    const { ingredients, ...dishData } = data

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        ...dishData,
        ...(ingredients
          ? {
              ingredients: {
                deleteMany: {},
                create: ingredients.map((ing) => ({
                  productId: ing.productId,
                  cookingMethodId: ing.cookingMethodId,
                  rawWeight: ing.rawWeight,
                })),
              },
            }
          : {}),
      },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: dish }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update dish" }
  }
}

export async function deleteDish(id: string): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.dish.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Dish not found" }
    if (existing.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.dish.delete({ where: { id } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete dish" }
  }
}

export async function getDishes(): Promise<ActionResult<DishNutritionSummary[]>> {
  try {
    const userId = await getRequiredUserId()
    const dishes = await prisma.dish.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const summaries: DishNutritionSummary[] = dishes.map((dish) => {
      const nutrition = calculateDishNutrition(dish)
      return {
        id: dish.id,
        name: dish.name,
        description: dish.description,
        servings: dish.servings,
        type: dish.type as DishType,
        totalCookedWeight: nutrition.totalCookedWeight,
        per100g: nutrition.per100g,
        totalCost: nutrition.totalCost,
        ingredientCount: dish.ingredients.length,
      }
    })

    return { success: true, data: summaries }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get dishes" }
  }
}

export async function getDishById(id: string): Promise<ActionResult<(Dish & { ingredients: (DishIngredient & { product: FoodProduct; cookingMethod: CookingMethod | null })[] }) | null>> {
  try {
    const userId = await getRequiredUserId()
    const dish = await prisma.dish.findUnique({
      where: { id, userId },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
    })
    return { success: true, data: dish }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get dish" }
  }
}

export async function getDishesForPicker(): Promise<ActionResult<{
  id: string
  name: string
  type: DishType
  per100g: {
    kcal: number
    protein: number
    fat: number
    carbs: number
    fiber: number
  }
}[]>> {
  try {
    const userId = await getRequiredUserId()
    const dishes = await prisma.dish.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const result = dishes.map((dish) => {
      const nutrition = calculateDishNutrition({
        ...dish,
        ingredients: dish.ingredients.map(ing => ({
          ...ing,
          cookingMethod: null,
        })),
      })
      return {
        id: dish.id,
        name: dish.name,
        type: dish.type as DishType,
        per100g: nutrition.per100g,
      }
    })

    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get dishes" }
  }
}

export async function getCookingMethods(): Promise<ActionResult<CookingMethod[]>> {
  try {
    await getRequiredUserId()
    const methods = await prisma.cookingMethod.findMany({ orderBy: { name: "asc" } })
    return { success: true, data: methods }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get cooking methods" }
  }
}
