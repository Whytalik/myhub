import { prisma } from "@/lib/prisma";
import { getCachedDailyEntry, getCachedAllEntries } from "@/lib/cache";
import type { UpsertDailyEntryInput } from "../types";
import { Prisma } from "@/app/generated/prisma";

function todayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getTodayEntry(userId: string) {
  return getCachedDailyEntry(userId, todayDate().toISOString());
}

export async function getEntryByDate(userId: string, date: Date) {
  return getCachedDailyEntry(userId, date.toISOString());
}

export async function upsertEntry(userId: string, input: UpsertDailyEntryInput) {
  const date = new Date(input.date);
  const { date: _date, emotions, morningRoutine, eveningRoutine, ...data } = input;

  // We explicitly map the fields to satisfy Prisma's types without 'any' or 'unknown'
  const basePayload = {
    ...data,
    userId,
    emotions: emotions ?? Prisma.DbNull,
    morningRoutine: (morningRoutine as unknown as Prisma.InputJsonValue) ?? Prisma.DbNull,
    eveningRoutine: (eveningRoutine as unknown as Prisma.InputJsonValue) ?? Prisma.DbNull,
  };

  return prisma.dailyEntry.upsert({
    where: { userId_date: { userId, date } },
    create: { ...basePayload, date } as Prisma.DailyEntryUncheckedCreateInput,
    update: basePayload as Prisma.DailyEntryUncheckedUpdateInput,
  });
}

export async function deleteEntry(userId: string, id: string) {
  return prisma.dailyEntry.delete({
    where: { id },
  });
}

export async function getAllEntries(userId: string) {
  return getCachedAllEntries(userId);
}
