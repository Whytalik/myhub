"use server";

import * as habitService from "../services/habit-service";
import { invalidateHabitCache } from "@/lib/revalidate";
import { getRequiredUserId } from "@/lib/action-utils";
import type { UpsertHabitInput } from "../types";

export async function upsertHabitAction(data: UpsertHabitInput) {
  const userId = await getRequiredUserId();
  const habit = await habitService.upsertHabit(userId, data);
  invalidateHabitCache(userId);
  return { success: true, data: habit };
}

export async function deleteHabitAction(id: string) {
  const userId = await getRequiredUserId();
  await habitService.deleteHabit(userId, id);
  invalidateHabitCache(userId);
  return { success: true };
}

export async function toggleHabitCompletionAction(habitId: string, date: Date) {
  const userId = await getRequiredUserId();
  await habitService.toggleHabitCompletion(userId, habitId, date);
  invalidateHabitCache(userId);
  return { success: true };
}

export async function toggleHabitArchivedAction(id: string) {
  const userId = await getRequiredUserId();
  await habitService.toggleHabitArchived(userId, id);
  invalidateHabitCache(userId);
  return { success: true };
}
