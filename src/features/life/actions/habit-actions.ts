"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as habitService from "../services/habit-service";
import type { UpsertHabitInput } from "../types";

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized: No userId found in session");
  return userId;
}

export async function upsertHabitAction(data: UpsertHabitInput) {
  const userId = await getUserId();
  const habit = await habitService.upsertHabit(userId, data);
  revalidatePath("/life/habits");
  return { success: true, data: habit };
}

export async function deleteHabitAction(id: string) {
  const userId = await getUserId();
  await habitService.deleteHabit(userId, id);
  revalidatePath("/life/habits");
  return { success: true };
}

export async function toggleHabitCompletionAction(habitId: string, date: Date) {
  const userId = await getUserId();
  await habitService.toggleHabitCompletion(userId, habitId, date);
  revalidatePath("/life/habits");
  return { success: true };
}

export async function toggleHabitArchivedAction(id: string) {
  const userId = await getUserId();
  await habitService.toggleHabitArchived(userId, id);
  revalidatePath("/life/habits");
  return { success: true };
}
