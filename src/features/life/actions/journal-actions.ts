"use server";

// Force recompile to pick up generated Prisma client changes
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as journalService from "../services/journal-service";
import type { UpsertDailyEntryInput } from "../types";

async function getPersonId() {
  const session = await auth();
  const personId = (session?.user as any)?.personId;
  if (!personId) throw new Error("Unauthorized: No personId found in session");
  return personId;
}

export async function upsertEntryAction(data: UpsertDailyEntryInput) {
  const personId = await getPersonId();
  const entry = await journalService.upsertEntry(personId, data);
  revalidatePath("/life/journal");
  return entry;
}

export async function deleteEntryAction(id: string) {
  const personId = await getPersonId();
  await journalService.deleteEntry(personId, id);
  revalidatePath("/life/journal");
}
