"use server"

import { prisma } from "@/lib/prisma"
import { ActionResult, getRequiredUserId } from "@/lib/action-utils"
import { invalidateFoodCache } from "@/lib/revalidate"
import productsData from "../../nutrition/data/products.json"
import dishesData from "../../nutrition/data/dishes.json"
import { WEEKLY_SCHEDULE } from "../../nutrition/constants/meal-variants"
import { FoodProduct, CookingMethod, DishType, Unit } from "@/app/generated/prisma"

interface JsonProduct {
  name: string
  caloriesPer100: number
  proteinPer100: number
  fatPer100: number
  carbsPer100: number
  fiberPer100: number
  unit: string
  standardPackageAmount: number
  category: string
  price?: number
}

interface JsonDish {
  name: string
  type: string
  servings: number
  description?: string
  ingredients: {
    productName: string
    rawWeight: number
    cookingMethod: string
    alternatives?: string[]
  }[]
}

export async function seedVisualPlanAction(): Promise<ActionResult<void>> {
  try {
    const userId = await getRequiredUserId()
    
    console.log("Starting exhaustive Visual Plan Seeding...");

    // 1. GLOBAL PRODUCTS (UserId: null)
    const globalProducts: Record<string, FoodProduct> = {};

    for (const p of productsData as unknown as JsonProduct[]) {
      const productId = `global-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
      const product = await prisma.foodProduct.upsert({
        where: { id: productId },
        update: {
          caloriesPer100: p.caloriesPer100,
          proteinPer100: p.proteinPer100,
          fatPer100: p.fatPer100,
          carbsPer100: p.carbsPer100,
          fiberPer100: p.fiberPer100,
          unit: p.unit as Unit,
          standardPackageAmount: p.standardPackageAmount,
          category: p.category,
          price: p.price || 0,
        },
        create: {
          id: productId,
          userId: null,
          name: p.name,
          caloriesPer100: p.caloriesPer100,
          proteinPer100: p.proteinPer100,
          fatPer100: p.fatPer100,
          carbsPer100: p.carbsPer100,
          fiberPer100: p.fiberPer100,
          unit: p.unit as Unit,
          standardPackageAmount: p.standardPackageAmount,
          category: p.category,
          price: p.price || 0,
        }
      });
      globalProducts[p.name] = product;
    }

    // 2. Handle specific product name mismatches
    if (globalProducts["Ткемалі готовий"]) {
      globalProducts["Ткемалі"] = globalProducts["Ткемалі готовий"];
    }

    // 3. Create Global Products for MARINADES/SAUCES/DRESSINGS from dishes.json
    for (const d of dishesData as unknown as JsonDish[]) {
      if (["MARINADE", "SAUCE", "DRESSING"].includes(d.type)) {
        let totalKcal = 0, totalP = 0, totalF = 0, totalC = 0, totalFiber = 0, totalWeight = 0;
        
        for (const ing of d.ingredients) {
          const prod = globalProducts[ing.productName];
          if (prod) {
            totalWeight += ing.rawWeight;
            totalKcal += (ing.rawWeight * prod.caloriesPer100) / 100;
            totalP += (ing.rawWeight * prod.proteinPer100) / 100;
            totalF += (ing.rawWeight * prod.fatPer100) / 100;
            totalC += (ing.rawWeight * prod.carbsPer100) / 100;
            totalFiber += (ing.rawWeight * prod.fiberPer100) / 100;
          }
        }

        if (totalWeight > 0) {
          const productId = `global-${d.name.replace(/\s+/g, '-').toLowerCase()}`;
          const product = await prisma.foodProduct.upsert({
            where: { id: productId },
            update: {
              caloriesPer100: (totalKcal / totalWeight) * 100,
              proteinPer100: (totalP / totalWeight) * 100,
              fatPer100: (totalF / totalWeight) * 100,
              carbsPer100: (totalC / totalWeight) * 100,
              fiberPer100: (totalFiber / totalWeight) * 100,
            },
            create: {
              id: productId,
              userId: null,
              name: d.name,
              caloriesPer100: (totalKcal / totalWeight) * 100,
              proteinPer100: (totalP / totalWeight) * 100,
              fatPer100: (totalF / totalWeight) * 100,
              carbsPer100: (totalC / totalWeight) * 100,
              fiberPer100: (totalFiber / totalWeight) * 100,
              unit: Unit.GRAM,
              standardPackageAmount: 100,
              category: "SAUCES"
            }
          });
          globalProducts[d.name] = product;
        }
      }
    }

    // 4. COOKING METHODS MAPPING
    const cookingMethods: CookingMethod[] = await prisma.cookingMethod.findMany();
    const getMethodId = (methodName: string, category: string) => {
      if (methodName === "RAW") return cookingMethods.find(m => m.name === "Сире")?.id;
      if (methodName === "BAKED") return cookingMethods.find(m => m.name === "Запікання")?.id;
      if (methodName === "FRIED") return cookingMethods.find(m => m.name === "Смаження без олії")?.id;
      if (methodName === "BOILED") {
        if (category === "GRAINS" || category === "BAKERY") {
          return cookingMethods.find(m => m.name === "Варіння крупи/макарони")?.id;
        }
        return cookingMethods.find(m => m.name === "Варіння м'ясо/риба")?.id;
      }
      return null;
    };

    // 5. DISHES FOR USER
    for (const d of dishesData as unknown as JsonDish[]) {
      const dishId = `${d.name.replace(/\s+/g, '-').toLowerCase()}-${userId}`;
      await prisma.dishIngredient.deleteMany({ where: { dishId } });

      await prisma.dish.upsert({
        where: { id: dishId },
        update: {
          name: d.name,
          description: d.description,
          servings: d.servings,
          type: d.type as DishType,
          ingredients: {
            create: d.ingredients.map((ing) => {
              const product = globalProducts[ing.productName];
              if (!product) return null;
              return {
                productId: product.id,
                rawWeight: ing.rawWeight,
                cookingMethodId: getMethodId(ing.cookingMethod, product.category),
                alternatives: ing.alternatives || []
              };
            }).filter((i): i is NonNullable<typeof i> => i !== null)
          }
        },
        create: {
          id: dishId,
          userId,
          name: d.name,
          description: d.description,
          servings: d.servings,
          type: d.type as DishType,
          ingredients: {
            create: d.ingredients.map((ing) => {
              const product = globalProducts[ing.productName];
              if (!product) return null;
              return {
                productId: product.id,
                rawWeight: ing.rawWeight,
                cookingMethodId: getMethodId(ing.cookingMethod, product.category),
                alternatives: ing.alternatives || []
              };
            }).filter((i): i is NonNullable<typeof i> => i !== null)
          }
        }
      });
    }

    // 6. NUTRITION PERSONS
    const vitaliiId = "vitalii-profile";
    const gfId = "gf-profile";

    await prisma.nutritionPerson.upsert({
      where: { id: vitaliiId },
      update: { targetKcal: 1700, proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE" },
      create: {
        id: vitaliiId, userId, name: "Віталій", targetKcal: 1700,
        proteinPct: 45, fatPct: 30, carbsPct: 25, goal: "LOSE"
      }
    });

    await prisma.nutritionPerson.upsert({
      where: { id: gfId },
      update: { targetKcal: 2300, proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN" },
      create: {
        id: gfId, userId, name: "Олеся", targetKcal: 2300,
        proteinPct: 15, fatPct: 25, carbsPct: 60, goal: "GAIN"
      }
    });

    // 7. WEEK PLAN (Based on WEEKLY_SCHEDULE)
    const planName = "Visual Plan Week (1:1)";
    const oldPlans = await prisma.weekPlan.findMany({ where: { userId, name: planName } });
    for (const plan of oldPlans) {
      await prisma.weekPlan.delete({ where: { id: plan.id } });
    }

    const dayNamesMap: Record<string, number> = { "Пн": 0, "Вт": 1, "Ср": 2, "Чт": 3, "Пт": 4, "Сб": 5, "Нд": 6 };

    const weekPlan = await prisma.weekPlan.create({
      data: {
        name: planName,
        userId,
        dayPlans: {
          create: WEEKLY_SCHEDULE.map((ws) => ({
            userId,
            dayOfWeek: dayNamesMap[ws.day] ?? 0,
            activity: ws.activity === "gym" ? "Тренажерний зал" : "Кардіо / Біг",
            mealSlots: {
              create: [
                // Vitalii Slots
                { personId: vitaliiId, name: "Передтрен", order: 1, targetKcal: 100, targetFiberGrams: 0 },
                { personId: vitaliiId, name: "Сніданок", order: 2, targetKcal: 500, targetFiberGrams: 8 },
                { personId: vitaliiId, name: "Обід", order: 3, targetKcal: 600, targetFiberGrams: 12 },
                { personId: vitaliiId, name: "Вечеря", order: 4, targetKcal: 400, targetFiberGrams: 10 },
                // Olesya Slots
                { personId: gfId, name: "Передтрен", order: 1, targetKcal: 150, targetFiberGrams: 0 },
                { personId: gfId, name: "Сніданок", order: 2, targetKcal: 700, targetFiberGrams: 8 },
                { personId: gfId, name: "Обід", order: 3, targetKcal: 800, targetFiberGrams: 12 },
                { personId: gfId, name: "Вечеря", order: 4, targetKcal: 500, targetFiberGrams: 10 },
              ]
            }
          }))
        }
      },
      include: { dayPlans: { include: { mealSlots: true } } }
    });

    // 8. FILL SLOTS (AUTO-PORTION)
    const allDishes = await prisma.dish.findMany({
      where: { userId },
      include: { ingredients: { include: { product: true } } }
    });

    const findDish = (name: string) => allDishes.find(d => d.name === name);

    for (const day of weekPlan.dayPlans) {
      const dayName = Object.keys(dayNamesMap).find(key => dayNamesMap[key] === day.dayOfWeek);
      const ws = WEEKLY_SCHEDULE.find(s => s.day === (dayName ?? ""));
      if (!ws) continue;

      for (const slot of day.mealSlots) {
        let dishName = ws.defaults[slot.name as keyof typeof ws.defaults];
        
        // Special case: Friday Dinner is Fast Food
        if (dayName === "Пт" && slot.name === "Вечеря") {
          dishName = "Кебаб Класичний";
        }

        if (!dishName) continue;

        const dish = findDish(dishName);
        if (dish) {
          const totalWeight = dish.ingredients.reduce((acc, ing) => acc + ing.rawWeight, 0);
          const portionWeight = totalWeight / (dish.servings || 1);

          await prisma.dishEntry.create({
            data: {
              mealSlotId: slot.id,
              dishId: dish.id,
              portionWeight,
              servings: 1,
              isShared: true
            }
          });
        }
      }
    }

    invalidateFoodCache(userId)
    return { success: true, data: undefined }
  } catch (error) {
    console.error("Seed Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Seed failed" }
  }
}
