"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { FoodProduct, PriceSource, NutritionSource, ProductStatus } from "@/app/generated/prisma"
import type { Store } from "../constants/stores"
import { invalidateFoodCache } from "@/lib/revalidate"
import { createProductSchema } from "../schemas"

interface CreateProductData {
  name: string
  caloriesPer100: number
  proteinPer100: number
  fatPer100: number
  carbsPer100: number
  fiberPer100: number
  unit: string
  standardPackageAmount: number
  price?: number
  category: string
  stores?: Store[]
  nutritionSource?: NutritionSource
}

type UpdateProductData = Partial<CreateProductData>

interface OpenFoodFactsResult {
  code: string
  name: string
  brand?: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  imageUrl?: string
  category?: string
}

interface UnifiedSearchResult {
  local: FoodProduct[]
  external: OpenFoodFactsResult[]
}

function mapOFFResults(products: Record<string, unknown>[]): OpenFoodFactsResult[] {
  return products
    .filter(p => p.product_name && p.nutriments)
    .map(p => {
      const n = p.nutriments as Record<string, number> | undefined
      return {
        code: String(p.code || ""),
        name: String(p.product_name || "").trim(),
        brand: p.brands ? String(p.brands).split(",")[0].trim() : undefined,
        calories: n?.["energy-kcal_100g"] || 0,
        protein: n?.proteins_100g || 0,
        fat: n?.fat_100g || 0,
        carbs: n?.carbohydrates_100g || 0,
        fiber: n?.fiber_100g || 0,
        imageUrl: p.image_url ? String(p.image_url) : undefined,
        category: p.categories ? String(p.categories).split(",")[0].trim() : undefined,
      }
    })
    .filter(p => p.name.length > 0)
}

export async function createProduct(data: CreateProductData): Promise<ActionResult<FoodProduct>> {
  try {
    const userId = await getRequiredUserId()
    const product = await prisma.foodProduct.create({
      data: {
        userId,
        name: data.name,
        caloriesPer100: data.caloriesPer100,
        proteinPer100: data.proteinPer100,
        fatPer100: data.fatPer100,
        carbsPer100: data.carbsPer100,
        fiberPer100: data.fiberPer100,
        unit: data.unit,
        standardPackageAmount: data.standardPackageAmount,
        price: data.price ?? 0,
        category: data.category,
        stores: data.stores ?? [],
        nutritionSource: data.nutritionSource ?? NutritionSource.MANUAL,
        priceSource: PriceSource.MANUAL,
        priceUpdatedAt: data.price ? new Date() : null,
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create product" }
  }
}

export async function updateProduct(id: string, data: UpdateProductData): Promise<ActionResult<FoodProduct>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.foodProduct.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Product not found" }
    if (existing.userId && existing.userId !== userId) return { success: false, error: "Unauthorized" }

    const updateData: Record<string, unknown> = { ...data }
    if (data.price !== undefined) {
      updateData.priceUpdatedAt = new Date()
    }

    const product = await prisma.foodProduct.update({
      where: { id },
      data: updateData,
    })
    invalidateFoodCache(userId)
    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update product" }
  }
}

export async function deleteProduct(id: string): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.foodProduct.findUnique({ where: { id } })
    if (!existing) return { success: false, error: "Product not found" }
    if (existing.userId && existing.userId !== userId) return { success: false, error: "Unauthorized" }

    const inUse = await prisma.dishIngredient.count({ where: { productId: id } })
    if (inUse > 0) {
      return { success: false, error: "Product is used in dishes and cannot be deleted" }
    }
    await prisma.foodProduct.delete({ where: { id } })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete product" }
  }
}

export async function getProducts(): Promise<ActionResult<FoodProduct[]>> {
  try {
    const userId = await getRequiredUserId()
    const products = await prisma.foodProduct.findMany({
      where: {
        OR: [
          { userId },
          { userId: null }
        ]
      },
      orderBy: { name: "asc" },
    })
    return { success: true, data: products }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get products" }
  }
}

export async function unifiedSearchProducts(query: string): Promise<ActionResult<UnifiedSearchResult>> {
  try {
    const userId = await getRequiredUserId()
    const q = query.trim()
    if (q.length < 2) return { success: true, data: { local: [], external: [] } }

    const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=code,product_name,brands,nutriments,image_url,categories`

    const [localResult, offResult] = await Promise.allSettled([
      prisma.foodProduct.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
          name: { contains: q, mode: "insensitive" },
          status: ProductStatus.ACTIVE,
        },
        orderBy: { name: "asc" },
        take: 20,
      }),
      fetch(offUrl, { next: { revalidate: 3600 } })
        .then(r => r.json())
        .then(json => mapOFFResults(json.products ?? [])),
    ])

    return {
      success: true,
      data: {
        local: localResult.status === "fulfilled" ? localResult.value : [],
        external: offResult.status === "fulfilled" ? offResult.value : [],
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to search" }
  }
}

interface ImportResult {
  imported: number
  updated: number
  errors: string[]
  products: FoodProduct[]
}

export async function importProductsFromJson(json: string): Promise<ActionResult<ImportResult>> {
  try {
    const userId = await getRequiredUserId()
    let parsed: unknown[]
    try {
      parsed = JSON.parse(json)
    } catch {
      return { success: false, error: "Invalid JSON format" }
    }
    if (!Array.isArray(parsed)) {
      return { success: false, error: "JSON must be an array of products" }
    }

    const result: ImportResult = { imported: 0, updated: 0, errors: [], products: [] }

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i]
      const validation = createProductSchema.safeParse(item)
      if (!validation.success) {
        const name = (item as Record<string, unknown>)?.name ?? `item ${i + 1}`
        result.errors.push(`${name}: ${validation.error.issues.map((e) => e.message).join(", ")}`)
        continue
      }

      const data = validation.data
      const existing = await prisma.foodProduct.findFirst({
        where: {
          userId,
          name: { equals: data.name, mode: "insensitive" },
        },
      })

      if (existing) {
        const updateData: Record<string, unknown> = {}
        if (data.caloriesPer100 !== existing.caloriesPer100) updateData.caloriesPer100 = data.caloriesPer100
        if (data.proteinPer100 !== existing.proteinPer100) updateData.proteinPer100 = data.proteinPer100
        if (data.fatPer100 !== existing.fatPer100) updateData.fatPer100 = data.fatPer100
        if (data.carbsPer100 !== existing.carbsPer100) updateData.carbsPer100 = data.carbsPer100
        if (data.fiberPer100 !== existing.fiberPer100) updateData.fiberPer100 = data.fiberPer100
        if (data.unit !== existing.unit) updateData.unit = data.unit
        if (data.standardPackageAmount !== existing.standardPackageAmount) updateData.standardPackageAmount = data.standardPackageAmount
        if (data.category !== existing.category) updateData.category = data.category
        if (data.price !== undefined && data.price !== existing.price) {
          updateData.price = data.price
          updateData.priceUpdatedAt = new Date()
        }
        if (data.stores && JSON.stringify(data.stores) !== JSON.stringify(existing.stores ?? [])) {
          updateData.stores = data.stores
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.foodProduct.update({
            where: { id: existing.id },
            data: updateData,
          })
          result.updated++
        }
      } else {
        await prisma.foodProduct.create({
          data: {
            userId,
            name: data.name,
            caloriesPer100: data.caloriesPer100,
            proteinPer100: data.proteinPer100,
            fatPer100: data.fatPer100,
            carbsPer100: data.carbsPer100,
            fiberPer100: data.fiberPer100,
            unit: data.unit,
            standardPackageAmount: data.standardPackageAmount,
            price: data.price ?? 0,
            category: data.category,
            stores: data.stores ?? [],
            nutritionSource: NutritionSource.MANUAL,
            priceSource: PriceSource.MANUAL,
            priceUpdatedAt: data.price ? new Date() : null,
          },
        })
        result.imported++
      }
    }

    if (result.imported > 0 || result.updated > 0) {
      invalidateFoodCache(userId)
    }
    const allProducts = await prisma.foodProduct.findMany({
      where: { OR: [{ userId }, { userId: null }] },
      orderBy: { name: "asc" },
    })
    result.products = allProducts
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to import products" }
  }
}

export async function exportProducts(): Promise<ActionResult<string>> {
  try {
    const userId = await getRequiredUserId()
    const products = await prisma.foodProduct.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
        status: ProductStatus.ACTIVE,
      },
      orderBy: { name: "asc" },
    })

    const json = products.map(p => ({
      name: p.name,
      caloriesPer100: p.caloriesPer100,
      proteinPer100: p.proteinPer100,
      fatPer100: p.fatPer100,
      carbsPer100: p.carbsPer100,
      fiberPer100: p.fiberPer100,
      unit: p.unit,
      standardPackageAmount: p.standardPackageAmount,
      category: p.category,
      price: p.price ?? undefined,
      stores: (p as FoodProduct & { stores?: Store[] }).stores ?? [],
    }))

    return { success: true, data: JSON.stringify(json, null, 2) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to export products" }
  }
}

export async function importFromOpenFoodFacts(code: string): Promise<ActionResult<FoodProduct>> {
  try {
    const userId = await getRequiredUserId()
    const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return { success: false, error: "Product not found on OpenFoodFacts" }

    const data = await res.json()
    const p = data.product
    if (!p || !p.product_name) return { success: false, error: "Product data not available" }

    const n = p.nutriments || {}
    const product = await prisma.foodProduct.create({
      data: {
        userId,
        name: p.product_name.trim(),
        caloriesPer100: n["energy-kcal_100g"] || 0,
        proteinPer100: n.proteins_100g || 0,
        fatPer100: n.fat_100g || 0,
        carbsPer100: n.carbohydrates_100g || 0,
        fiberPer100: n.fiber_100g || 0,
        unit: "GRAM",
        standardPackageAmount: 100,
        category: p.categories ? String(p.categories).split(",")[0].trim().toUpperCase().replace(/[^A-Z_]/g, "_").slice(0, 50) || "OTHER" : "OTHER",
        nutritionSource: NutritionSource.OPENFOODFACTS,
        priceSource: PriceSource.MANUAL,
        price: 0,
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: product }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to import product" }
  }
}
