import { getCachedDailyEntry, getCachedAllEntries } from "@/lib/cache/cache";
import { journalRepository } from "../repositories/journal.repository";
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

  const basePayload = {
    ...data,
    userId,
    emotions: emotions ?? Prisma.DbNull,
    morningRoutine: (morningRoutine as unknown as Prisma.InputJsonValue) ?? Prisma.DbNull,
    eveningRoutine: (eveningRoutine as unknown as Prisma.InputJsonValue) ?? Prisma.DbNull,
  };

  return journalRepository.upsert(
    userId,
    date,
    { ...basePayload, date } as Prisma.DailyEntryUncheckedCreateInput,
    basePayload as Prisma.DailyEntryUncheckedUpdateInput,
  );
}

export async function deleteEntry(userId: string, id: string) {
  return journalRepository.delete(id);
}

export async function getAllEntries(userId: string) {
  return getCachedAllEntries(userId);
}
