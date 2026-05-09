import { prisma } from "@/lib/prisma";
import { getCachedActiveHabits } from "@/lib/cache";
import type { UpsertHabitInput } from "../types";
import { getStartOfDay } from "../logic/habit-utils";

export async function getActiveHabits(userId: string) {
  return getCachedActiveHabits(userId);
}

export async function upsertHabit(userId: string, input: UpsertHabitInput) {
  const { id, ...data } = input;
  if (id) {
    return prisma.habit.update({
      where: { id, userId },
      data,
    });
  }
  return prisma.habit.create({
    data: {
      ...data,
      anchor: data.anchor ?? "",
      action: data.action ?? "",
      userId,
      order: data.order ?? 0,
    },
  });
}

export async function toggleHabitArchived(userId: string, id: string) {
  const habit = await prisma.habit.findUnique({ where: { id } });
  if (!habit || habit.userId !== userId) throw new Error("Habit not found or unauthorized");
  return prisma.habit.update({
    where: { id, userId },
    data: { archived: !habit.archived },
  });
}

export async function deleteHabit(userId: string, id: string) {
  return prisma.habit.delete({
    where: { id, userId },
  });
}

export async function toggleHabitCompletion(userId: string, habitId: string, date: Date) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId }
  });
  if (!habit || habit.userId !== userId) throw new Error("Habit not found or unauthorized");

  const startOfDay = getStartOfDay(date);
  
  const existing = await prisma.habitCompletion.findUnique({
    where: {
      habitId_date: {
        habitId,
        date: startOfDay,
      },
    },
  });

  if (existing) {
    return prisma.habitCompletion.delete({
      where: { id: existing.id },
    });
  }

  return prisma.habitCompletion.create({
    data: {
      habitId,
      date: startOfDay,
    },
  });
}
