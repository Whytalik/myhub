"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { PriceSource } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

export async function updatePriceManually(productId: string, price: number): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.foodProduct.findUnique({ where: { id: productId } })
    if (!existing) return { success: false, error: "Product not found" }
    if (existing.userId && existing.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.foodProduct.update({
      where: { id: productId },
      data: {
        price,
        priceSource: PriceSource.MANUAL,
        priceUpdatedAt: new Date(),
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[Price Update Error]:", error)
    return { success: false, error: "Failed to update price manually" }
  }
}

export async function fetchPriceSilpo(productName: string): Promise<ActionResult<{ name: string; price: number }>> {
  try {
    await getRequiredUserId()

    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      data: {
        name: productName,
        price: 0
      }
    }
  } catch (error) {
    console.error("[Silpo Fetch Error]:", error)
    return { success: false, error: "Failed to connect to Silpo API" }
  }
}

export async function importFetchedPrice(productId: string, price: number): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    const existing = await prisma.foodProduct.findUnique({ where: { id: productId } })
    if (!existing) return { success: false, error: "Product not found" }
    if (existing.userId && existing.userId !== userId) return { success: false, error: "Unauthorized" }

    await prisma.foodProduct.update({
      where: { id: productId },
      data: {
        price,
        priceSource: PriceSource.FETCHED,
        priceUpdatedAt: new Date(),
      },
    })
    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("[Price Import Error]:", error)
    return { success: false, error: "Failed to import fetched price" }
  }
}

export async function refreshAllPrices(): Promise<ActionResult<{ updatedCount: number }>> {
  try {
    const userId = await getRequiredUserId()
    const products = await prisma.foodProduct.findMany({
      where: { userId, priceSource: PriceSource.FETCHED },
      select: { id: true, name: true }
    })

    let updatedCount = 0
    for (const product of products) {
      const result = await fetchPriceSilpo(product.name)
      if (result.success && result.data && result.data.price > 0) {
        await prisma.foodProduct.update({
          where: { id: product.id },
          data: {
            price: result.data.price,
            priceUpdatedAt: new Date(),
          }
        })
        updatedCount++
      }
    }

    invalidateFoodCache(userId)
    return { success: true, data: { updatedCount } }
  } catch (error) {
    console.error("[Refresh Prices Error]:", error)
    return { success: false, error: "Failed to refresh prices" }
  }
}
