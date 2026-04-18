"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as habitService from "../services/habit-service";
import type { UpsertHabitInput } from "../types";

async function getPersonId() {
  const session = await auth();
  const personId = (session?.user as any)?.personId;
  if (!personId) throw new Error("Unauthorized: No personId found in session");
  return personId;
}

export async function upsertHabitAction(data: UpsertHabitInput) {
  const personId = await getPersonId();
  const habit = await habitService.upsertHabit(personId, data);
  revalidatePath("/life/habits");
  return { success: true, data: habit };
}

export async function deleteHabitAction(id: string) {
  const personId = await getPersonId();
  await habitService.deleteHabit(personId, id);
  revalidatePath("/life/habits");
  return { success: true };
}

export async function toggleHabitCompletionAction(habitId: string, date: Date) {
  const personId = await getPersonId();
  await habitService.toggleHabitCompletion(personId, habitId, date);
  revalidatePath("/life/habits");
  return { success: true };
}

export async function toggleHabitArchivedAction(id: string) {
  const personId = await getPersonId();
  await habitService.toggleHabitArchived(personId, id);
  revalidatePath("/life/habits");
  return { success: true };
}
