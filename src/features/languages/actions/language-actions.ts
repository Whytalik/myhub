"use server";

import { revalidatePath } from "next/cache";
import * as languageService from "../services/language-service";
import { ActionResult } from "@/lib/action-utils";
import { LogImmersionInput, AddVocabularyInput } from "../types";
import { auth } from "@/auth";

async function getRequiredPersonId(): Promise<string> {
  const session = await auth();
  const personId = (session?.user as { personId?: string })?.personId;
  if (!personId) throw new Error("Unauthorized");
  return personId;
}

export async function addLanguageAction(personId: string, languageId: string): Promise<ActionResult<unknown>> {
  try {
    const sessionPersonId = await getRequiredPersonId();
    if (sessionPersonId !== personId) throw new Error("Unauthorized");
    const userLang = await languageService.addLanguage(personId, languageId);
    revalidatePath("/languages");
    return { success: true, data: userLang };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add language" };
  }
}

export async function logImmersionAction(input: LogImmersionInput): Promise<ActionResult<unknown>> {
  try {
    const personId = await getRequiredPersonId();
    const log = await languageService.logImmersion(
      personId,
      input.userLanguageId,
      input.sphere,
      input.duration,
      input.note
    );
    revalidatePath(`/languages/${input.userLanguageId}`);
    return { success: true, data: log };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to log immersion" };
  }
}

export async function addVocabularyAction(input: AddVocabularyInput): Promise<ActionResult<unknown>> {
  try {
    const personId = await getRequiredPersonId();
    const item = await languageService.addVocabularyItem(
      personId,
      input.userLanguageId,
      input.word,
      input.translation,
      input.context
    );
    revalidatePath(`/languages/${input.userLanguageId}/vocabulary`);
    return { success: true, data: item };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add word" };
  }
}

export async function reviewVocabularyAction(
  id: string,
  userLanguageId: string,
  quality: number
): Promise<ActionResult<unknown>> {
  try {
    const personId = await getRequiredPersonId();
    const updated = await languageService.reviewVocabularyItem(personId, id, quality);
    revalidatePath(`/languages/${userLanguageId}/vocabulary`);
    return { success: true, data: updated };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to review word" };
  }
}

export async function getLanguageStatsAction(userLanguageId: string): Promise<ActionResult<unknown>> {
  try {
    const personId = await getRequiredPersonId();
    const stats = await languageService.getLanguageStats(personId, userLanguageId);
    return { success: true, data: stats };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
