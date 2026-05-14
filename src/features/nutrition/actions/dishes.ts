"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { calculateDishNutrition } from "@/lib/nutrition/calculations"
import { Dish, DishIngredient, FoodProduct, CookingMethod } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

import type { DishType } from "../constants/dish-types"
import { z } from "zod"
import dishesData from "../data/dishes.json"

interface JsonIngredient {
  productName: string;
  rawWeight: number;
  cookingMethod: string;
}

interface JsonDish {
  name: string;
  type: string;
  servings: number;
  description: string;
  ingredients: JsonIngredient[];
}

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

    const dishJsonMap = new Map(
      (dishesData as unknown as JsonDish[]).map(d => [d.name, d])
    )

    const summaries: DishNutritionSummary[] = dishes.map((dish) => {
      const dishJson = dishJsonMap.get(dish.name)
      const weights = dishJson
        ? dishJson.ingredients.map((ing, idx) => ({ ingredientIndex: idx, rawWeight: ing.rawWeight }))
        : dish.ingredients.map((_, idx) => ({ ingredientIndex: idx, rawWeight: 0 }))

      const nutrition = calculateDishNutrition(dish, weights)
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
  templateTotalWeight: number
  ingredients: {
    id: string
    productId: string
    productName: string
    rawWeight: number
    alternatives: string[]
  }[]
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

    const dishJsonMap = new Map(
      (dishesData as unknown as JsonDish[]).map(d => [d.name, d])
    )

    const result = dishes.map((dish) => {
      const dishJson = dishJsonMap.get(dish.name)
      const weights = dishJson
        ? dishJson.ingredients.map((ing, idx) => ({
            ingredientIndex: idx,
            rawWeight: ing.rawWeight,
          }))
        : dish.ingredients.map((_, idx) => ({ ingredientIndex: idx, rawWeight: 0 }))

      const totalWeight = weights.reduce((sum, w) => sum + w.rawWeight, 0)

      const nutrition = calculateDishNutrition(
        {
          ...dish,
          ingredients: dish.ingredients.map(ing => ({
            ...ing,
            cookingMethod: null,
          })),
        },
        weights
      )

      return {
        id: dish.id,
        name: dish.name,
        type: dish.type as DishType,
        templateTotalWeight: totalWeight,
        ingredients: dish.ingredients.map((ing, idx) => ({
          id: ing.id,
          productId: ing.productId,
          productName: ing.product.name,
          rawWeight: weights[idx]?.rawWeight ?? 0,
          alternatives: ing.alternatives,
        })),
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

const dishIngredientSchema = z.object({
  productName: z.string().min(1),
  alternatives: z.array(z.string()).optional().default([]),
  rawWeight: z.number().positive(),
  cookingMethod: z.string().optional().default("RAW"),
})

const dishSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["MAIN", "SALAD", "SOUP", "SIDE", "SNACK", "SAUCE", "MARINADE", "BASE"]).default("MAIN"),
  servings: z.number().int().min(1).default(1),
  description: z.string().optional(),
  ingredients: z.array(dishIngredientSchema).min(1),
})

interface ImportDishesResult {
  imported: number
  updated: number
  errors: string[]
}

export async function importDishesFromJson(json: string): Promise<ActionResult<ImportDishesResult>> {
  try {
    const userId = await getRequiredUserId()
    let parsed: unknown[]
    try {
      parsed = JSON.parse(json)
    } catch {
      return { success: false, error: "Invalid JSON format" }
    }
    if (!Array.isArray(parsed)) {
      return { success: false, error: "JSON must be an array of dishes" }
    }

    const result: ImportDishesResult = { imported: 0, updated: 0, errors: [] }

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i]
      const validation = dishSchema.safeParse(item)
      if (!validation.success) {
        const name = (item as Record<string, unknown>)?.name ?? `dish ${i + 1}`
        result.errors.push(`${name}: ${validation.error.issues.map((e) => e.message).join(", ")}`)
        continue
      }

      const data = validation.data

      const existing = await prisma.dish.findFirst({
        where: {
          userId,
          name: { equals: data.name, mode: "insensitive" },
        },
        include: {
          ingredients: true,
        },
      })

      const ingredientsData = []
      for (const ing of data.ingredients) {
        const product = await prisma.foodProduct.findFirst({
          where: {
            userId,
            name: { equals: ing.productName, mode: "insensitive" },
          },
        })
        if (!product) {
          result.errors.push(`${data.name}: Product "${ing.productName}" not found`)
          continue
        }

        let cookingMethodId: string | undefined
        if (ing.cookingMethod && ing.cookingMethod !== "RAW") {
          let method = await prisma.cookingMethod.findFirst({
            where: { name: { equals: ing.cookingMethod, mode: "insensitive" } },
          })
          if (!method) {
            method = await prisma.cookingMethod.create({
              data: { name: ing.cookingMethod, coefficient: 1.0 },
            })
          }
          cookingMethodId = method.id
        }

        ingredientsData.push({
          productId: product.id,
          cookingMethodId,
          rawWeight: ing.rawWeight,
          alternatives: ing.alternatives,
        })
      }

      if (ingredientsData.length === 0) {
        result.errors.push(`${data.name}: No valid ingredients`)
        continue
      }

      if (existing) {
        await prisma.dish.update({
          where: { id: existing.id },
          data: {
            ...(data.description !== existing.description ? { description: data.description } : {}),
            ...(data.servings !== existing.servings ? { servings: data.servings } : {}),
            ...(data.type !== existing.type ? { type: data.type } : {}),
            ingredients: {
              deleteMany: {},
              create: ingredientsData,
            },
          },
        })
        result.updated++
      } else {
        await prisma.dish.create({
          data: {
            userId,
            name: data.name,
            description: data.description,
            servings: data.servings,
            type: data.type,
            ingredients: {
              create: ingredientsData,
            },
          },
        })
        result.imported++
      }
    }

    if (result.imported > 0 || result.updated > 0) {
      invalidateFoodCache(userId)
    }
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to import dishes" }
  }
}

export async function exportDishes(): Promise<ActionResult<string>> {
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

    const dishJsonMap = new Map(
      (dishesData as unknown as JsonDish[]).map(d => [d.name, d])
    )

    const json = dishes.map(d => {
      const dishJson = dishJsonMap.get(d.name)
      return {
        name: d.name,
        type: d.type,
        servings: d.servings,
        description: d.description || undefined,
        ingredients: d.ingredients.map((ing, idx) => ({
          productName: ing.product.name,
          alternatives: ing.alternatives.length > 0 ? ing.alternatives : undefined,
          rawWeight: dishJson?.ingredients[idx]?.rawWeight ?? 0,
          cookingMethod: ing.cookingMethod?.name ?? "RAW",
        })),
      }
    })

    return { success: true, data: JSON.stringify(json, null, 2) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to export dishes" }
  }
}

export async function deleteAllUserDishes(): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    
    // Delete all dish entries first to avoid constraint violations
    // They are linked to meal slots which are linked to day plans
    await prisma.dishEntry.deleteMany({
      where: { dish: { userId } }
    })

    await prisma.dish.deleteMany({ where: { userId } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete all dishes" }
  }
}
