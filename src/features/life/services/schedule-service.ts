import { prisma } from "@/lib/prisma";
import type { UpsertDayScheduleInput } from "../types";

// JS getDay(): 0=Sun, 1=Mon..6=Sat → convert to Mon=0..Sun=6
function toDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export async function getScheduleByDate(userId: string, date: Date) {
  const dayOfWeek = toDayOfWeek(date);
  return prisma.weekTemplate.findUnique({
    where: { userId_dayOfWeek: { userId, dayOfWeek } },
  });
}

export async function getAllTemplates(userId: string) {
  return prisma.weekTemplate.findMany({
    where: { userId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function upsertSchedule(userId: string, input: UpsertDayScheduleInput) {
  return prisma.weekTemplate.upsert({
    where: { userId_dayOfWeek: { userId, dayOfWeek: input.dayOfWeek } },
    create: { userId, dayOfWeek: input.dayOfWeek, dayType: input.dayType },
    update: { dayType: input.dayType },
  });
}
