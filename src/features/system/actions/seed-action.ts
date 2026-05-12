"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { invalidateFoodCache } from "@/lib/revalidate"

export async function seedVisualPlanAction(): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    
    console.log("Starting Visual Plan Seeding via Server Action...");

    // 1. PRODUCTS
    const productsData = [
      { name: "Сир кисломолочний 0-2%", kcal: 80, p: 16, f: 0.5, c: 3, fiber: 0, unit: "г", pkg: 250, cat: "Dairy" },
      { name: "Борошно пшеничне", kcal: 340, p: 10, f: 1, c: 70, fiber: 3, unit: "г", pkg: 1000, cat: "Grocery" },
      { name: "Лаваш", kcal: 240, p: 8, f: 1, c: 48, fiber: 2, unit: "г", pkg: 200, cat: "Bakery" },
      { name: "Куряче філе", kcal: 110, p: 23, f: 2, c: 0, fiber: 0, unit: "г", pkg: 500, cat: "Meat" },
      { name: "Йогурт густий (Грецький)", kcal: 60, p: 4, f: 3, c: 5, fiber: 0, unit: "г", pkg: 300, cat: "Dairy" },
      { name: "Помідори чері", kcal: 18, p: 0.9, f: 0.2, c: 4, fiber: 1.2, unit: "г", pkg: 250, cat: "Vegetables" },
      { name: "Пекінська капуста", kcal: 16, p: 1.2, f: 0.2, c: 3.2, fiber: 1.2, unit: "г", pkg: 500, cat: "Vegetables" },
      { name: "Шоколад 80-85%", kcal: 580, p: 8, f: 45, c: 20, fiber: 10, unit: "г", pkg: 100, cat: "Snacks" },
      { name: "Горіхи (Мигдаль/Арахіс)", kcal: 600, p: 25, f: 50, c: 15, fiber: 9, unit: "г", pkg: 150, cat: "Snacks" },
      { name: "Арахісова паста", kcal: 600, p: 25, f: 50, c: 15, fiber: 6, unit: "г", pkg: 300, cat: "Snacks" },
      { name: "Банан", kcal: 89, p: 1.1, f: 0.3, c: 22.8, fiber: 2.6, unit: "г", pkg: 1000, cat: "Fruits" },
    ];

    const globalProducts: Record<string, string> = {};

    for (const p of productsData) {
      const productId = `global-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
      const product = await prisma.foodProduct.upsert({
        where: { id: productId },
        update: {
          caloriesPer100: p.kcal,
          proteinPer100: p.p,
          fatPer100: p.f,
          carbsPer100: p.c,
          fiberPer100: p.fiber,
          standardPackageAmount: p.pkg,
        },
        create: {
          id: productId,
          userId: null,
          name: p.name,
          caloriesPer100: p.kcal,
          proteinPer100: p.p,
          fatPer100: p.f,
          carbsPer100: p.c,
          fiberPer100: p.fiber,
          unit: p.unit,
          standardPackageAmount: p.pkg,
          category: p.cat,
        }
      });
      globalProducts[p.name] = product.id;
    }

    // 2. DISHES
    const dishes = [
      {
        id: `bagel-${userId}`,
        name: "Сирні Бейгли",
        servings: 4,
        type: "MAIN",
        ingredients: [
          { productId: globalProducts["Сир кисломолочний 0-2%"], weight: 250 },
          { productId: globalProducts["Борошно пшеничне"], weight: 250 },
        ]
      },
      {
        id: `kebab-${userId}`,
        name: "Кебаб Домашній",
        servings: 1,
        type: "MAIN",
        ingredients: [
          { productId: globalProducts["Лаваш"], weight: 100 },
          { productId: globalProducts["Куряче філе"], weight: 150 },
          { productId: globalProducts["Йогурт густий (Грецький)"], weight: 50 },
          { productId: globalProducts["Помідори чері"], weight: 50 },
          { productId: globalProducts["Пекінська капуста"], weight: 50 },
        ]
      }
    ];

    for (const dish of dishes) {
      await prisma.dish.upsert({
        where: { id: dish.id },
        update: {},
        create: {
          id: dish.id,
          userId,
          name: dish.name,
          servings: dish.servings,
          type: dish.type as any,
          ingredients: {
            create: dish.ingredients.map(ing => ({
              productId: ing.productId,
              rawWeight: ing.weight
            }))
          }
        }
      });
    }

    // 3. PROFILES
    await prisma.nutritionPerson.upsert({
      where: { id: "vitalii-profile" },
      update: { targetKcal: 1700, userId },
      create: {
        id: "vitalii-profile", userId, name: "Vitalii", targetKcal: 1700,
        proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE"
      }
    });

    await prisma.nutritionPerson.upsert({
      where: { id: "gf-profile" },
      update: { targetKcal: 2300, userId },
      create: {
        id: "gf-profile", userId, name: "GF", targetKcal: 2300,
        proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN"
      }
    });

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Seed Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Seed failed" }
  }
}
