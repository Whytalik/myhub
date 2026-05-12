import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { createWeekPlan, addDishToSlot } from "../src/features/nutrition/actions/planning";

/**
 * Script to generate a complete Week Plan with automated portions
 * based on the Visual Plan for Vitalii and GF.
 */
async function main() {
  // 1. Setup Auth Simulation (get the actual userId from the seed email)
  const user = await prisma.user.findFirst({ where: { email: "hanmaster05@gmail.com" } });
  if (!user) throw new Error("User not found");
  
  // Note: We need to mock getRequiredUserId in the actions or use direct prisma calls.
  // Since we are in a script, we'll use direct prisma calls inspired by the actions 
  // to ensure correct logic execution.
  
  const userId = user.id;
  const personIds = ["vitalii-profile", "gf-profile"];
  
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
              // Vitalii Slots
              { personId: "vitalii-profile", name: "Сніданок", order: 1, targetKcal: 1700 * 0.25, targetFiberGrams: 30 * 0.25 },
              { personId: "vitalii-profile", name: "Обід", order: 2, targetKcal: 1700 * 0.40, targetFiberGrams: 30 * 0.45 },
              // GF Slots
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

  const bagelDishId = "bagel-visual-plan";
  const kebabDishId = "kebab-visual-plan";

  console.log("Populating slots with dishes (auto-calculating portions)...");

  for (const day of weekPlan.dayPlans) {
    for (const slot of day.mealSlots) {
      const dishId = slot.name === "Сніданок" ? bagelDishId : kebabDishId;
      
      // Fetch dish with ingredients for calculation
      const dish = await prisma.dish.findUnique({
        where: { id: dishId },
        include: { ingredients: { include: { product: true, cookingMethod: true } } }
      });
      
      if (!dish) continue;

      // Logic from planning.ts action (mirrored)
      const totalKcal = dish.ingredients.reduce((acc, ing) => {
        const factor = ing.rawWeight / 100;
        return acc + (ing.product.caloriesPer100 || 0) * factor;
      }, 0);
      
      const kcalPerServing = totalKcal / (dish.servings || 1);
      const servings = slot.targetKcal / kcalPerServing;
      const totalWeight = dish.ingredients.reduce((acc, ing) => acc + ing.rawWeight, 0);
      const portionWeight = servings * (totalWeight / (dish.servings || 1));

      await prisma.dishEntry.create({
        data: {
          mealSlotId: slot.id,
          dishId: dish.id,
          portionWeight,
          servings,
          isShared: true
        }
      });
    }
  }

  console.log(`Generated Week Plan: ${weekPlan.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
