"use server";

import { revalidatePath } from "next/cache";
import * as shoppingListService from "../services/shopping-list-service";
import { auth } from "@/auth";

export async function createShoppingListAction(weekPlanId: string) {
  const session = await auth();
  const personId = (session?.user as any)?.personId;
  if (!personId) throw new Error("Unauthorized");

  const list = await shoppingListService.createShoppingListFromWeekPlan(personId, weekPlanId);
  revalidatePath("/food/shopping");
  return list;
}

export async function toggleShoppingListItemAction(id: string, checked: boolean) {
  const session = await auth();
  const personId = (session?.user as any)?.personId;
  if (!personId) throw new Error("Unauthorized");

  await shoppingListService.updateShoppingListItemStatus(personId, id, checked);
  revalidatePath("/food/shopping");
}

export async function deleteShoppingListAction(id: string) {
  const session = await auth();
  const personId = (session?.user as any)?.personId;
  if (!personId) throw new Error("Unauthorized");

  await shoppingListService.deleteShoppingList(personId, id);
  revalidatePath("/food/shopping");
}
