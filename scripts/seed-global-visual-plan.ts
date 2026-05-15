import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";
import { WEEKLY_SCHEDULE } from "../src/features/nutrition/constants/meal-variants";
import { FoodProduct, CookingMethod, DishType, Unit } from "../src/app/generated/prisma";

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

async function main() {
  console.log("Starting exhaustive global visual plan seed...");

  // 1. Load Data
  const productsPath = path.join(process.cwd(), "src/features/nutrition/data/products.json");
  const dishesPath = path.join(process.cwd(), "src/features/nutrition/data/dishes.json");

  const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));
  const dishesData = JSON.parse(fs.readFileSync(dishesPath, "utf-8"));

  // 2. Fetch Cooking Methods for mapping
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

  // 3. Seed Global Products (First Pass)
  console.log(`Seeding ${productsData.length} global products...`);
  const globalProducts: Record<string, FoodProduct> = {};

  for (const p of productsData as JsonProduct[]) {
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



  // 5. Create Global Products for MARINADES/SAUCES from dishes.json
  console.log("Creating global products for composite sauces/marinades...");
  for (const d of dishesData as JsonDish[]) {
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

  // 6. Seed Dishes & Plans for all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users. Seeding data...`);

  const dayNamesMap: Record<string, number> = { "Пн": 0, "Вт": 1, "Ср": 2, "Чт": 3, "Пт": 4, "Сб": 5, "Нд": 6 };

  for (const user of users) {
    // Seed Dishes
    for (const d of dishesData as JsonDish[]) {
      const dishId = `${d.name.replace(/\s+/g, '-').toLowerCase()}-${user.id}`;
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
          userId: user.id,
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

    // Seed Persons
    const vitaliiId = "vitalii-profile";
    const olesyaId = "gf-profile";
    await prisma.nutritionPerson.upsert({
      where: { id: vitaliiId },
      update: { targetKcal: 1700 },
      create: { id: vitaliiId, userId: user.id, name: "Віталій", targetKcal: 1700 }
    });
    await prisma.nutritionPerson.upsert({
      where: { id: olesyaId },
      update: { targetKcal: 2300 },
      create: { id: olesyaId, userId: user.id, name: "Олеся", targetKcal: 2300 }
    });

    // Seed Week Plan
    const planName = "Visual Plan Week (1:1)";
    await prisma.weekPlan.deleteMany({ where: { userId: user.id, name: planName } });
    const weekPlan = await prisma.weekPlan.create({
      data: {
        name: planName,
        userId: user.id,
        dayPlans: {
          create: WEEKLY_SCHEDULE.map((ws) => ({
            userId: user.id,
            dayOfWeek: dayNamesMap[ws.day] ?? 0,
            activity: ws.activity === "gym" ? "Тренажерний зал" : "Кардіо / Біг",
            mealSlots: {
              create: [
                { personId: vitaliiId, name: "Передтрен", order: 1, targetKcal: 200, targetFiberGrams: 0 },
                { personId: vitaliiId, name: "Сніданок", order: 2, targetKcal: 500, targetFiberGrams: 8 },
                { personId: vitaliiId, name: "Обід", order: 3, targetKcal: 600, targetFiberGrams: 12 },
                { personId: vitaliiId, name: "Вечеря", order: 4, targetKcal: 400, targetFiberGrams: 10 },
                { personId: olesyaId, name: "Передтрен", order: 1, targetKcal: 300, targetFiberGrams: 0 },
                { personId: olesyaId, name: "Сніданок", order: 2, targetKcal: 700, targetFiberGrams: 8 },
                { personId: olesyaId, name: "Обід", order: 3, targetKcal: 800, targetFiberGrams: 12 },
                { personId: olesyaId, name: "Вечеря", order: 4, targetKcal: 500, targetFiberGrams: 10 },
              ]
            }
          }))
        }
      },
      include: { dayPlans: { include: { mealSlots: true } } }
    });

    // Fill Slots
    const allDishes = await prisma.dish.findMany({
      where: { userId: user.id },
      include: { ingredients: { include: { product: true } } }
    });
    const findDish = (name: string) => allDishes.find(d => d.name === name);
    const findDishJson = (name: string) => (dishesData as { name: string; ingredients: { productName: string; rawWeight: number }[] }[]).find(d => d.name === name);
    const productMap = new Map(
      (await prisma.foodProduct.findMany()).map(p => [p.name, p])
    );

    for (const day of weekPlan.dayPlans) {
      const dayName = Object.keys(dayNamesMap).find(key => dayNamesMap[key] === day.dayOfWeek);
      const ws = WEEKLY_SCHEDULE.find(s => s.day === (dayName ?? ""));
      if (!ws) continue;
      for (const slot of day.mealSlots) {
        let dishName = ws.defaults[slot.name as keyof typeof ws.defaults];
        if (dayName === "Пт" && slot.name === "Вечеря") dishName = "Кебаб Класичний";
        if (!dishName) continue;
        const dish = findDish(dishName);
        const dishJson = findDishJson(dishName);
        if (dish && dishJson) {
          const totalKcal = dishJson.ingredients.reduce((acc, ing) => {
            const prod = productMap.get(ing.productName);
            return acc + (prod ? (ing.rawWeight * prod.caloriesPer100) / 100 : 0);
          }, 0);
          const scale = slot.targetKcal > 0 && totalKcal > 0 ? slot.targetKcal / (totalKcal / (dish.servings || 1)) : 1;

          const dishEntry = await prisma.dishEntry.create({
            data: { mealSlotId: slot.id, dishId: dish.id }
          });

          await prisma.dishEntryIngredient.createMany({
            data: dishJson.ingredients.map((ing, idx) => ({
              dishEntryId: dishEntry.id,
              ingredientIndex: idx,
              weight: ing.rawWeight * scale,
              inputState: "RAW",
            }))
          });
        }
      }
    }
  }

  console.log("Exhaustive visual plan seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
