import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { aggregateShoppingList, FullWeekPlan } from "../src/features/nutrition/logic/shopping-list";
import { FoodProduct } from "../src/app/generated/prisma";

async function main() {
  const weekPlanId = process.argv[2];
  if (!weekPlanId) {
    console.error("Please provide a WeekPlan ID as an argument.");
    process.exit(1);
  }

  const weekPlan = await prisma.weekPlan.findUnique({
    where: { id: weekPlanId },
    include: {
      dayPlans: {
        include: {
          mealSlots: {
            include: {
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
                  ingredients: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!weekPlan) {
    console.error("WeekPlan not found.");
    process.exit(1);
  }

  const products = await prisma.foodProduct.findMany();
  const productMap = new Map<string, FoodProduct>(products.map(p => [p.id, p]));

  const shoppingList = aggregateShoppingList(weekPlan as unknown as FullWeekPlan, productMap);

  console.log(`\n--- Shopping List for: ${weekPlan.name} ---`);
  console.log(`Total Products: ${shoppingList.length}\n`);
  
  shoppingList.forEach(item => {
    console.log(`- ${item.name}: ${item.requiredRawGrams.toFixed(0)}g (${item.packagesCount} packs)`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
