import { prisma } from "@/lib/prisma";
import type { UpsertHabitInput } from "../types";
import { getStartOfDay } from "../logic/habit-utils";

export async function getActiveHabits(userId: string) {
  return prisma.habit.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: {
      completions: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
    },
  });
}

export async function upsertHabit(userId: string, input: UpsertHabitInput) {
  const { id, ...data } = input;
  if (id) {
    return prisma.habit.update({
      where: { id },
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
  if (!habit) throw new Error("Habit not found");
  return prisma.habit.update({
    where: { id },
    data: { archived: !habit.archived },
  });
}

export async function deleteHabit(userId: string, id: string) {
  return prisma.habit.delete({
    where: { id },
  });
}

export async function toggleHabitCompletion(userId: string, habitId: string, date: Date) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId }
  });
  if (!habit) throw new Error("Habit not found or unauthorized");

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
