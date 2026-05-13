"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { calculateDishNutrition } from "@/lib/nutrition/calculations"
import { CartItem, CartItemStatus, FoodProduct } from "@/app/generated/prisma"
import { invalidateFoodCache } from "@/lib/revalidate"

export async function generateShoppingCart(
  weekPlanId: string
): Promise<ActionResult<{ cartId: string; itemCount: number }>> {
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
        cart: true,
      },
    })

    if (!weekPlan) return { success: false, error: "Week plan not found" }

    const productRequirements = new Map<string, { totalRaw: number; personIds: Set<string> }>()

    for (const day of weekPlan.dayPlans) {
      for (const slot of day.mealSlots) {
        for (const entry of slot.dishEntries) {
          const dish = entry.dish
          const nutrition = calculateDishNutrition(dish)

          if (nutrition.totalCookedWeight === 0) continue

          const ratio = entry.portionWeight / nutrition.totalCookedWeight
          const selectedAlts = (entry.selectedAlternatives as Record<string, string>) || {}

          for (let i = 0; i < dish.ingredients.length; i++) {
            const ing = dish.ingredients[i]
            const requiredRaw = ratio * ing.rawWeight
            
            // Use selected alternative productId if it exists for this ingredient index
            const productId = selectedAlts[String(i)] || ing.productId
            
            const existing = productRequirements.get(productId) ?? {
              totalRaw: 0,
              personIds: new Set<string>(),
            }
            existing.totalRaw += requiredRaw
            existing.personIds.add(slot.personId)
            productRequirements.set(productId, existing)
          }
        }
      }
    }

    let cart = weekPlan.cart
    if (!cart) {
      cart = await prisma.shoppingCart.create({
        data: { weekPlanId },
      })
    }

    const existingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    })

    const existingMap = new Map(existingItems.map((item) => [item.productId, item]))

    const productIds = Array.from(productRequirements.keys())
    const products = await prisma.foodProduct.findMany({
      where: { id: { in: productIds } },
    })
    const productMap = new Map(products.map((p) => [p.id, p]))

    const upserts: Promise<CartItem>[] = []

    for (const [productId, req] of productRequirements) {
      const product = productMap.get(productId)
      if (!product) continue

      const existing = existingMap.get(productId)
      if (existing?.manualOverride) continue

      const packageSize = product.standardPackageAmount || 100
      const packagesCount = Math.ceil(req.totalRaw / packageSize)
      const totalCost = packagesCount * (product.price ?? 0)

      upserts.push(
        prisma.cartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId } },
          create: {
            cartId: cart.id,
            productId,
            requiredRawGrams: req.totalRaw,
            packagesCount,
            totalCost,
            status: CartItemStatus.TO_BUY,
          },
          update: {
            requiredRawGrams: req.totalRaw,
            packagesCount,
            totalCost,
          },
        })
      )
    }

    await Promise.all(upserts)

    const toRemove = existingItems.filter(
      (item) => !productRequirements.has(item.productId) && !item.manualOverride
    )
    if (toRemove.length > 0) {
      await prisma.cartItem.deleteMany({
        where: { id: { in: toRemove.map((i) => i.id) } },
      })
    }

    invalidateFoodCache(userId)
    return { success: true, data: { cartId: cart.id, itemCount: productRequirements.size } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to generate shopping cart" }
  }
}

export async function updateCartItemStatus(
  cartItemId: string,
  status: CartItemStatus,
  availableGrams?: number
): Promise<ActionResult<CartItem>> {
  try {
    const userId = await getRequiredUserId()

    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          include: {
            weekPlan: true,
          },
        },
      },
    })

    if (!item) return { success: false, error: "Cart item not found" }
    if (item.cart.weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        status,
        ...(availableGrams !== undefined ? { availableGrams } : {}),
      },
      include: { product: true },
    })
    return { success: true, data: updated }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update cart item" }
  }
}

export async function updateCartItemQuantity(
  cartItemId: string,
  packagesCount: number,
  manualRawGrams?: number
): Promise<ActionResult<CartItem>> {
  try {
    const userId = await getRequiredUserId()

    const existing = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        product: true,
        cart: {
          include: {
            weekPlan: true,
          },
        },
      },
    })
    if (!existing) return { success: false, error: "Item not found" }
    if (existing.cart.weekPlan.userId !== userId) return { success: false, error: "Unauthorized" }

    const totalCost = packagesCount * (existing.product.price ?? 0)

    const item = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        packagesCount,
        totalCost,
        manualOverride: true,
        ...(manualRawGrams !== undefined ? { requiredRawGrams: manualRawGrams } : {}),
      },
      include: { product: true },
    })
    return { success: true, data: item }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update quantity" }
  }
}

export async function getShoppingCart(
  weekPlanId: string
): Promise<ActionResult<{
  cartId: string
  itemsByCategory: Record<string, (CartItem & { product: FoodProduct })[]>
  totalCost: number
  personCosts: Record<string, { name: string; cost: number }>
  varietyWarnings: { dishName: string; count: number; days: number[] }[]
}>> {
  try {
    const userId = await getRequiredUserId()

    const cart = await prisma.shoppingCart.findUnique({
      where: { weekPlanId, weekPlan: { userId } },
      include: {
        items: {
          include: { product: true },
          orderBy: { product: { name: "asc" } },
        },
        weekPlan: {
          include: {
            dayPlans: {
              include: {
                mealSlots: {
                  include: {
                    person: true,
                    dishEntries: {
                      include: { dish: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!cart) return { success: false, error: "Cart not found" }

    const itemsByCategory: Record<string, (CartItem & { product: FoodProduct })[]> = {}
    let totalCost = 0

    for (const item of cart.items) {
      const cat = item.product.category || "Other"
      if (!itemsByCategory[cat]) itemsByCategory[cat] = []
      itemsByCategory[cat].push(item as CartItem & { product: FoodProduct })

      if (item.status === CartItemStatus.TO_BUY) {
        totalCost += item.totalCost ?? 0
      }
    }

    const varietyWarnings: { dishName: string; count: number; days: number[] }[] = []
    const personCosts: Record<string, { name: string; cost: number }> = {}

    if (cart.weekPlan) {
      const personTotals: Record<string, number> = {}
      for (const day of cart.weekPlan.dayPlans) {
        for (const slot of day.mealSlots) {
          if (!personCosts[slot.personId]) {
            personCosts[slot.personId] = { name: slot.person.name || "Unknown", cost: 0 }
            personTotals[slot.personId] = 0
          }
        }
      }

      for (const item of cart.items) {
        if (item.status === CartItemStatus.TO_BUY && item.totalCost) {
          const costPerPerson = item.totalCost / Object.keys(personTotals).length
          for (const pid of Object.keys(personTotals)) {
            personTotals[pid] += costPerPerson
          }
        }
      }

      for (const pid of Object.keys(personCosts)) {
        personCosts[pid].cost = personTotals[pid] || 0
      }

      const dishCounts = new Map<string, { name: string; count: number; days: Set<number> }>()
      for (const day of cart.weekPlan.dayPlans) {
        for (const slot of day.mealSlots) {
          for (const entry of slot.dishEntries) {
            const dc = dishCounts.get(entry.dishId) ?? {
              name: entry.dish.name,
              count: 0,
              days: new Set<number>(),
            }
            dc.count++
            dc.days.add(day.dayOfWeek)
            dishCounts.set(entry.dishId, dc)
          }
        }
      }
      for (const [, v] of dishCounts) {
        if (v.count >= 3) {
          varietyWarnings.push({
            dishName: v.name,
            count: v.count,
            days: Array.from(v.days),
          })
        }
      }
    }

    return {
      success: true,
      data: {
        cartId: cart.id,
        itemsByCategory,
        totalCost,
        personCosts,
        varietyWarnings,
      },
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to get shopping cart" }
  }
}
