"use server";

import { revalidatePath } from "next/cache";
import * as dishService from "../services/dish-service";
import { CreateDishInput, UpdateDishInput } from "../types";
import { auth } from "@/auth";

export async function createDishAction(data: CreateDishInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const dish = await dishService.createDish(userId, data);
  revalidatePath("/food");
  return dish;
}

export async function updateDishAction(data: UpdateDishInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const dish = await dishService.updateDish(userId, data);
  revalidatePath("/food");
  return dish;
}

export async function deleteDishAction(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await dishService.deleteDish(userId, id);
  revalidatePath("/food");
}
