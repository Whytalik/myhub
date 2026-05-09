import { prisma } from "@/lib/prisma";
import { getCachedDailyEntry, getCachedAllEntries } from "@/lib/cache";
import type { UpsertDailyEntryInput } from "../types";

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
  return getCachedAllEntries(userId);
}
