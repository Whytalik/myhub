import { getCachedActiveHabits } from "@/lib/cache";
import { habitRepository } from "../repositories/habit.repository";
import type { UpsertHabitInput } from "../types";
import { getStartOfDay } from "../logic/habit-utils";

export async function getActiveHabits(userId: string) {
  return getCachedActiveHabits(userId);
}

export async function upsertHabit(userId: string, input: UpsertHabitInput) {
  const { id, ...data } = input;
  if (id) {
    return habitRepository.update(id, userId, data);
  }
  return habitRepository.create({
    ...data,
    anchor: data.anchor ?? "",
    action: data.action ?? "",
    userId,
    order: data.order ?? 0,
  });
}

export async function toggleHabitArchived(userId: string, id: string) {
  const habit = await habitRepository.findById(id);
  if (!habit || habit.userId !== userId) throw new Error("Habit not found or unauthorized");
  return habitRepository.update(id, userId, { archived: !habit.archived });
}

export async function deleteHabit(userId: string, id: string) {
  return habitRepository.delete(id, userId);
}

export async function toggleHabitCompletion(userId: string, habitId: string, date: Date) {
  const habit = await habitRepository.findById(habitId);
  if (!habit || habit.userId !== userId) throw new Error("Habit not found or unauthorized");

  const startOfDay = getStartOfDay(date);
  const existing = await habitRepository.findCompletion(habitId, startOfDay);

  if (existing) {
    return habitRepository.deleteCompletion(existing.id);
  }
  return habitRepository.createCompletion(habitId, startOfDay);
}
