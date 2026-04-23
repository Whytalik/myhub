import { prisma } from "@/lib/prisma";
import type { UpsertHabitInput, HabitStats } from "../types";
import { getStartOfDay, calculateStreak } from "../logic/habit-utils";

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

export async function getHabitStats(userId: string): Promise<HabitStats[]> {
  const habits = await prisma.habit.findMany({
    where: { userId, archived: false },
    include: {
      completions: {
        orderBy: { date: "desc" },
      },
    },
  });

  const today = getStartOfDay();

  return habits.map((habit) => {
    const streak = calculateStreak(habit.completions);
    const completionDates = new Set(habit.completions.map(c => new Date(c.date).setHours(0, 0, 0, 0)));

    // Last 7 days
    const last7Days: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      last7Days.push(completionDates.has(d.setHours(0, 0, 0, 0)));
    }

    // Completion rate last 30 days
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 86400000);
    const recentCompletions = habit.completions.filter(c => new Date(c.date) >= thirtyDaysAgo).length;
    const completionRate = Math.round((recentCompletions / 30) * 100);

    return {
      id: habit.id,
      name: habit.name,
      streak,
      totalCompletions: habit.completions.length,
      completionRate,
      last7Days,
    };
  });
}
