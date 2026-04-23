"use server";

import { revalidatePath } from "next/cache";
import * as shoppingListService from "../services/shopping-list-service";
import { auth } from "@/auth";

export async function createShoppingListAction(weekPlanId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const list = await shoppingListService.createShoppingListFromWeekPlan(userId, weekPlanId);
  revalidatePath("/food/shopping");
  return list;
}

export async function toggleShoppingListItemAction(id: string, checked: boolean) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await shoppingListService.updateShoppingListItemStatus(userId, id, checked);
  revalidatePath("/food/shopping");
}

export async function deleteShoppingListAction(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await shoppingListService.deleteShoppingList(userId, id);
  revalidatePath("/food/shopping");
}
