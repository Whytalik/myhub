"use server";

import * as journalService from "../services/journal-service";
import { invalidateJournalCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import { prisma } from "@/lib/prisma";
import type { UpsertDailyEntryInput } from "../types";

export async function upsertEntryAction(data: UpsertDailyEntryInput): Promise<ActionResult<Awaited<ReturnType<typeof journalService.upsertEntry>>>> {
  return withAction(async (userId) => {
    const entry = await journalService.upsertEntry(userId, data);
    invalidateJournalCache(userId, new Date(data.date));
    return entry;
  });
}

export async function deleteEntryAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await journalService.deleteEntry(userId, id);
    invalidateJournalCache(userId);
  });
}

export async function setDayStartedAction(dateStr: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    const date = new Date(dateStr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.dailyEntry.upsert as any)({
      where: { userId_date: { userId, date } },
      create: { userId, date, startedAt: new Date() },
      update: { startedAt: new Date() },
    });
    invalidateJournalCache(userId, date);
  });
}

export async function setDayCompletedAction(dateStr: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    const date = new Date(dateStr);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.dailyEntry.upsert as any)({
      where: { userId_date: { userId, date } },
      create: { userId, date, startedAt: new Date(), completedAt: new Date() },
      update: { completedAt: new Date() },
    });
    invalidateJournalCache(userId, date);
  });
}
