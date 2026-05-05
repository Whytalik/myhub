"use server";

import * as journalService from "../services/journal-service";
import { invalidateJournalCache } from "@/lib/revalidate";
import { getRequiredUserId } from "@/lib/action-utils";
import type { UpsertDailyEntryInput } from "../types";

export async function upsertEntryAction(data: UpsertDailyEntryInput) {
  const userId = await getRequiredUserId();
  const entry = await journalService.upsertEntry(userId, data);
  invalidateJournalCache(userId, new Date(data.date));
  return entry;
}

export async function deleteEntryAction(id: string) {
  const userId = await getRequiredUserId();
  await journalService.deleteEntry(userId, id);
  invalidateJournalCache(userId);
}
