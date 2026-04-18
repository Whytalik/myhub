import { prisma } from "@/lib/prisma";
import { aggregateShoppingList } from "../logic/shopping-list";

export async function getShoppingLists(personId: string) {
  return await prisma.shoppingList.findMany({
    where: { personId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createShoppingListFromWeekPlan(personId: string, weekPlanId: string) {
  const weekPlan = await prisma.weekPlan.findFirst({
    where: { id: weekPlanId, personId },
    include: {
      dayPlans: {
        include: {
          entries: {
            include: {
              dish: {
                include: {
                  ingredients: {
                    include: {
                      product: true,
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

  if (!weekPlan) throw new Error("Week plan not found");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aggregatedItems = aggregateShoppingList(weekPlan as any);

  return await prisma.shoppingList.create({
    data: {
      personId,
      weekPlanId: weekPlan.id,
      name: `Shopping for ${weekPlan.name || "week"}`,
      items: {
        create: aggregatedItems.map(item => ({
          productId: item.productId,
          amount: item.amount,
          unit: item.unit,
          checked: false,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

export async function updateShoppingListItemStatus(personId: string, id: string, checked: boolean) {
  return await prisma.shoppingListItem.update({
    where: { 
      id,
      shoppingList: { personId }
    },
    data: { checked },
  });
}

export async function deleteShoppingList(personId: string, id: string) {
  return await prisma.shoppingList.delete({
    where: { id, personId },
  });
}
