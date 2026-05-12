import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { aggregateShoppingList } from "../src/features/nutrition/logic/shopping-list";

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

  // @ts-ignore - Simplified include for script
  const shoppingList = aggregateShoppingList(weekPlan);

  console.log(`\n--- Shopping List for: ${weekPlan.name} ---`);
  console.log(`Total Products: ${shoppingList.length}\n`);
  
  shoppingList.forEach(item => {
    console.log(`- ${item.name}: ${item.requiredRawGrams.toFixed(0)}g (${item.packagesCount} packs)`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
