"use server";

import { auth } from "@/auth";
import * as aiService from "../services/ai-service";
import type { AIActionPayload } from "@/lib/ai/ai-types";
import type { AIProvider } from "@/lib/ai/ai-client";

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized: No userId found in session");
  return userId;
}

export async function aiChatAction(
  message: string,
  domain: "operations" | "health" = "operations",
  provider?: AIProvider,
): Promise<{ 
  reply: string; 
  actions: AIActionPayload[]; 
  chatId: string; 
  suggestionIds: string[]; 
  metadata: { responseTime: number; usage: { inputTokens: number; outputTokens: number } };
  taskData?: Record<string, unknown>[];
}> {
  const userId = await getUserId();
  const result = await aiService.sendChatMessage(userId, message, domain, provider);
  
  return result;
}


export async function aiGetSuggestionsAction(provider?: AIProvider): Promise<string[]> {
  const userId = await getUserId();
  const actions = await aiService.generateSuggestions(userId, provider);
  if (actions.length === 0) return [];
  return aiService.saveSuggestions(userId, actions);
}

export async function aiExecuteSuggestionAction(suggestionId: string) {
  const userId = await getUserId();
  return aiService.executeSuggestion(suggestionId, userId);
}

export async function aiGetTasksAction(taskIds: string[]) {
  const userId = await getUserId();
  return aiService.getTasksByIds(userId, taskIds);
}

export async function aiExecuteMultipleSuggestionsAction(suggestionIds: string[]) {
  const userId = await getUserId();
  const sharedContext: Record<string, string> = {};
  const results = [];
  
  for (const id of suggestionIds) {
    const result = await aiService.executeSuggestion(id, userId, sharedContext);
    results.push(result);
  }
  
  return results;
}

export async function aiRejectSuggestionAction(suggestionId: string) {
  const userId = await getUserId();
  return aiService.rejectSuggestion(suggestionId, userId);
}

export async function aiGetPendingSuggestionsAction() {
  const userId = await getUserId();
  return aiService.getPendingSuggestions(userId);
}

export async function aiGetUsageAction(days = 7) {
  const userId = await getUserId();
  return aiService.getUsageStats(userId, days);
}

export async function aiClearChatAction() {
  const userId = await getUserId();
  return aiService.clearChatHistory(userId);
}
