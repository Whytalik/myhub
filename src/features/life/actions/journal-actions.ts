"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as journalService from "../services/journal-service";
import type { UpsertDailyEntryInput } from "../types";

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized: No userId found in session");
  return userId;
}

export async function upsertEntryAction(data: UpsertDailyEntryInput) {
  const userId = await getUserId();
  const entry = await journalService.upsertEntry(userId, data);
  revalidatePath("/life/journal");
  return entry;
}

export async function deleteEntryAction(id: string) {
  const userId = await getUserId();
  await journalService.deleteEntry(userId, id);
  revalidatePath("/life/journal");
}
