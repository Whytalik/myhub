"use server";

import * as languageService from "../services/language-service";
import { ActionResult } from "@/lib/action-utils";
import { LogImmersionInput, AddVocabularyInput } from "../types";
import { auth } from "@/auth";
import { invalidateLanguageCache } from "@/lib/revalidate";

async function getRequiredUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function addLanguageAction(languageId: string): Promise<ActionResult<unknown>> {
  try {
    const userId = await getRequiredUserId();
    const userLang = await languageService.addLanguage(userId, languageId);
    invalidateLanguageCache(userId);
    return { success: true, data: userLang };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to add language" };
  }
}

export async function logImmersionAction(input: LogImmersionInput): Promise<ActionResult<unknown>> {
  try {
    const userId = await getRequiredUserId();
    const log = await languageService.logImmersion(
      userId,
      input.userLanguageId,
      input.sphere,
      input.duration,
      input.note
    );
    invalidateLanguageCache(userId);
    return { success: true, data: log };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to log immersion" };
  }
}

export async function addVocabularyAction(input: AddVocabularyInput): Promise<ActionResult<unknown>> {
  try {
    const userId = await getRequiredUserId();
    const item = await languageService.addVocabularyItem(
      userId,
      input.userLanguageId,
      input.word,
      input.translation,
      input.context
    );
    invalidateLanguageCache(userId);
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
    const userId = await getRequiredUserId();
    const updated = await languageService.reviewVocabularyItem(userId, id, quality);
    invalidateLanguageCache(userId);
    return { success: true, data: updated };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to review word" };
  }
}

export async function getLanguageStatsAction(userLanguageId: string): Promise<ActionResult<unknown>> {
  try {
    const userId = await getRequiredUserId();
    const stats = await languageService.getLanguageStats(userId, userLanguageId);
    return { success: true, data: stats };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
