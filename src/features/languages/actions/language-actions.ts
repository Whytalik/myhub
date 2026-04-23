"use server";

import { revalidatePath } from "next/cache";
import { LanguageService } from "../services/language-service";
import { ActionResult, LogImmersionInput, AddVocabularyInput } from "../types";
import { auth } from "@/auth";

export async function addLanguageAction(personId: string, languageId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    const currentPersonId = (session?.user as { personId?: string })?.personId;
    if (!currentPersonId || currentPersonId !== personId) throw new Error("Unauthorized");

    const userLang = await LanguageService.addLanguage(personId, languageId);
    revalidatePath("/languages");
    return { success: true, data: userLang };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add language";
    console.error("Error adding language:", message);
    return { success: false, error: message };
  }
}

export async function logImmersionAction(input: LogImmersionInput): Promise<ActionResult> {
  try {
    const session = await auth();
    const personId = (session?.user as { personId?: string })?.personId;
    if (!personId) throw new Error("Unauthorized");

    const log = await LanguageService.logImmersion(
      personId,
      input.userLanguageId,
      input.sphere,
      input.duration,
      input.note
    );
    revalidatePath(`/languages/${input.userLanguageId}`);
    return { success: true, data: log };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to log immersion";
    console.error("Error logging immersion:", message);
    return { success: false, error: message };
  }
}

export async function addVocabularyAction(input: AddVocabularyInput): Promise<ActionResult> {
  try {
    const session = await auth();
    const personId = (session?.user as { personId?: string })?.personId;
    if (!personId) throw new Error("Unauthorized");

    const item = await LanguageService.addVocabularyItem(
      personId,
      input.userLanguageId,
      input.word,
      input.translation,
      input.context
    );
    revalidatePath(`/languages/${input.userLanguageId}/vocabulary`);
    return { success: true, data: item };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add word";
    console.error("Error adding vocabulary:", message);
    return { success: false, error: message };
  }
}

export async function reviewVocabularyAction(id: string, userLanguageId: string, quality: number): Promise<ActionResult> {
  try {
    const session = await auth();
    const personId = (session?.user as { personId?: string })?.personId;
    if (!personId) throw new Error("Unauthorized");

    const updated = await LanguageService.reviewVocabularyItem(personId, id, quality);
    revalidatePath(`/languages/${userLanguageId}/vocabulary`);
    return { success: true, data: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to review word";
    console.error("Error reviewing vocabulary:", message);
    return { success: false, error: message };
  }
}

export async function getLanguageStatsAction(userLanguageId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    const personId = (session?.user as { personId?: string })?.personId;
    if (!personId) throw new Error("Unauthorized");

    const stats = await LanguageService.getLanguageStats(personId, userLanguageId);
    return { success: true, data: stats };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
