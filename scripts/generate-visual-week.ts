import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import dishesData from "../src/features/nutrition/data/dishes.json";

async function main() {
  const user = await prisma.user.findFirst({ where: { email: "hanmaster05@gmail.com" } });
  if (!user) throw new Error("User not found");
  
  const userId = user.id;
  
  console.log("Creating Week Plan...");
  
  const weekPlan = await prisma.weekPlan.create({
    data: {
      name: "Visual Plan Week",
      userId,
      dayPlans: {
        create: Array.from({ length: 7 }, (_, dayIndex) => ({
          userId,
          dayOfWeek: dayIndex,
          mealSlots: {
            create: [
              { personId: "vitalii-profile", name: "Сніданок", order: 1, targetKcal: 1700 * 0.25, targetFiberGrams: 30 * 0.25 },
              { personId: "vitalii-profile", name: "Обід", order: 2, targetKcal: 1700 * 0.40, targetFiberGrams: 30 * 0.45 },
              { personId: "gf-profile", name: "Сніданок", order: 1, targetKcal: 2300 * 0.25, targetFiberGrams: 30 * 0.25 },
              { personId: "gf-profile", name: "Обід", order: 2, targetKcal: 2300 * 0.40, targetFiberGrams: 30 * 0.45 },
            ]
          }
        }))
      }
    },
    include: {
      dayPlans: {
        include: {
          mealSlots: true
        }
      }
    }
  });

  const productMap = new Map(
    (await prisma.foodProduct.findMany()).map(p => [p.name, p])
  );

  const dishJsonMap = new Map(
    (dishesData as { name: string; ingredients: { productName: string; rawWeight: number }[] }[]).map(d => [d.name, d])
  );

  const allDishes = await prisma.dish.findMany({
    where: { userId },
    include: { ingredients: { include: { product: true } } }
  });

  console.log("Populating slots with dishes (auto-calculating portions)...");

  for (const day of weekPlan.dayPlans) {
    for (const slot of day.mealSlots) {
      const dish = allDishes.find(d => slot.name === "Сніданок" ? d.name === "Сирні Бейгли" : d.name === "Кебаб Домашній");
      if (!dish) continue;

      const dishJson = dishJsonMap.get(dish.name);
      if (!dishJson) continue;

      const totalKcal = dishJson.ingredients.reduce((acc, ing) => {
        const prod = productMap.get(ing.productName);
        return acc + (prod ? (ing.rawWeight * prod.caloriesPer100) / 100 : 0);
      }, 0);
      
      const scale = slot.targetKcal / (totalKcal / (dish.servings || 1));

      const dishEntry = await prisma.dishEntry.create({
        data: {
          mealSlotId: slot.id,
          dishId: dish.id,
        }
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

  console.log(`Generated Week Plan: ${weekPlan.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
