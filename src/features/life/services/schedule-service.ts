import { prisma } from "@/lib/prisma";
import type { UpsertDayScheduleInput } from "../types";

function toDateOnly(dateStr: string): Date {
  return new Date(dateStr);
}

export async function getScheduleByDate(userId: string, date: Date) {
  return prisma.daySchedule.findUnique({
    where: { userId_date: { userId, date } },
  });
}

export async function getSchedulesForWeek(userId: string, weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return prisma.daySchedule.findMany({
    where: {
      userId,
      date: { gte: weekStart, lte: weekEnd },
    },
    orderBy: { date: "asc" },
  });
}

export async function upsertSchedule(userId: string, input: UpsertDayScheduleInput) {
  const date = toDateOnly(input.date);
  return prisma.daySchedule.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, dayType: input.dayType },
    update: { dayType: input.dayType },
  });
}
