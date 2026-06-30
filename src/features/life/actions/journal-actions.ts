"use server";

import * as journalService from "../services/journal-service";
import { invalidateJournalCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import { journalRepository } from "../repositories/journal.repository";
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
    await journalRepository.setStarted(userId, date);
    invalidateJournalCache(userId, date);
  });
}

export async function setDayCompletedAction(dateStr: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    const date = new Date(dateStr);
    await journalRepository.setCompleted(userId, date);
    invalidateJournalCache(userId, date);
  });
}
