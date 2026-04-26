import { prisma } from "@/lib/prisma";
import type { UpsertDailyEntryInput } from "../types";

function todayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getTodayEntry(userId: string) {
  return prisma.dailyEntry.findUnique({
    where: { userId_date: { userId, date: todayDate() } },
  });
}

export async function getEntryByDate(userId: string, date: Date) {
  return prisma.dailyEntry.findUnique({
    where: { userId_date: { userId, date } },
  });
}

export async function upsertEntry(userId: string, input: UpsertDailyEntryInput) {
  const date = new Date(input.date);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { date: _date, ...data } = input;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = { ...data, userId };

  return prisma.dailyEntry.upsert({
    where: { userId_date: { userId, date } },
    create: { date, ...payload },
    update: payload,
  });
}

export async function deleteEntry(userId: string, id: string) {
  return prisma.dailyEntry.delete({
    where: { id },
  });
}

export async function getAllEntries(userId: string) {
  return prisma.dailyEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      energy: true,
      mood: true,
      weight: true,
      sleepHours: true,
      sleepQuality: true,
      nutrition: true,
      morningRoutine: true,
      eveningRoutine: true,
      winToday: true,
    },
  });
}
