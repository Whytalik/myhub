import { getChatModel, getLanguageModel, getSuggestionsModel, callAI, type AIProvider } from "@/lib/ai/ai-client";
import { getSystemPrompt, SUGGESTIONS_PROMPT } from "@/lib/ai/ai-prompts";
import type { AIActionPayload, AIMessage } from "@/lib/ai/ai-types";
import { prisma } from "@/lib/prisma";
import { getActiveSprint } from "@/features/operations/services/sprint-service";
import { getAllTasks, getAllSpheres } from "@/features/life/services/task-service";
import { getActiveHabits } from "@/features/life/services/habit-service";
import { getTodayEntry } from "@/features/life/services/journal-service";
import { generateText, type ModelMessage } from "ai";
import { createAiTools } from "@/lib/ai/ai-tools";

const MAX_HISTORY_MESSAGES = 10;

async function trackUsage(userId: string, usage: { inputTokens: number; outputTokens: number }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Перевіряємо, чи існує користувач, щоб уникнути помилки Foreign Key (наприклад, після скидання бази)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    console.warn(`[AI] Спроба записати статистику для неіснуючого користувача: ${userId}`);
    return;
  }

  const existing = await prisma.aIUsage.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (existing) {
    await prisma.aIUsage.update({
      where: { userId_date: { userId, date: today } },
      data: {
        inputTokens: { increment: usage.inputTokens },
        outputTokens: { increment: usage.outputTokens },
        totalTokens: { increment: usage.inputTokens + usage.outputTokens },
        requestCount: { increment: 1 },
      },
    });
  } else {
    await prisma.aIUsage.create({
      data: {
        userId,
        date: today,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.inputTokens + usage.outputTokens,
        requestCount: 1,
      },
    });
  }
}

export async function sendChatMessage(
  userId: string,
  message: string,
  domain: "operations" | "health" = "operations",
  provider?: AIProvider,
): Promise<{ 
  reply: string; 
  actions: AIActionPayload[]; 
  chatId: string; 
  suggestionIds: string[];
  taskData: Record<string, unknown>[];
  metadata: { responseTime: number; usage: { inputTokens: number; outputTokens: number } } 
}> {
  const startTime = Date.now();
  const existingChat = await prisma.aIChat.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const messages: AIMessage[] = existingChat
    ? ((existingChat.messages as unknown) as AIMessage[])
    : [];

  messages.push({
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  });

  const config = getChatModel();
  if (provider) {
    config.provider = provider;
    if (provider === "google") config.model = "gemini-1.5-flash";
    if (provider === "openrouter") config.model = "google/gemma-3-4b-it:free";
    if (provider === "groq") config.model = "llama-3.3-70b-versatile";
  }

  const model = getLanguageModel(config);
  const systemPrompt = getSystemPrompt(domain);
  const today = new Date().toISOString().split("T")[0];
  
  const coreMessages: ModelMessage[] = [
    { role: "system", content: `${systemPrompt}\n\nToday's date: ${today}. You can call tools to perform actions or get data.` }
  ];

  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  for (const m of recentMessages) {
    coreMessages.push({
      role: m.role === "model" ? "assistant" : "user",
      content: m.content,
    });
  }

  const result = await generateText({
    model,
    messages: coreMessages,
    tools: createAiTools(userId, domain),
    maxOutputTokens: config.maxOutputTokens,
    temperature: config.temperature,
  });

  const endTime = Date.now();
  const usage = result.usage ? {
    inputTokens: result.usage.inputTokens ?? 0,
    outputTokens: result.usage.outputTokens ?? 0,
  } : { inputTokens: 0, outputTokens: 0 };

  await trackUsage(userId, usage);

  const suggestionIds: string[] = [];
  const taskData: Record<string, unknown>[] = [];
  
  const actions: AIActionPayload[] = result.toolResults.map(tr => {
    const res = tr.output as Record<string, unknown>;
    if (res?.suggestionId) suggestionIds.push(res.suggestionId as string);
    if (res?.taskId) taskData.push(res);

    return {
      domain,
      action: tr.toolName,
      payload: tr.input as Record<string, unknown>,
      reason: (res?.message as string) || "Виконано через інструмент",
    };
  });


  messages.push({
    role: "model",
    content: result.text,
    timestamp: new Date().toISOString(),
  });

  if (messages.length > 50) {
    messages.splice(0, messages.length - 40);
  }

  let chatId: string;
  if (existingChat) {
    await prisma.aIChat.update({
      where: { id: existingChat.id },
      data: { messages: messages as unknown as object },
    });
    chatId = existingChat.id;
  } else {
    const newChat = await prisma.aIChat.create({
      data: { userId, messages: messages as unknown as object },
    });
    chatId = newChat.id;
  }

  return { 
    reply: result.text, 
    actions, 
    chatId,
    suggestionIds,
    taskData,
    metadata: {
      responseTime: endTime - startTime,
      usage
    }
  };
}



export async function generateSuggestions(
  userId: string,
  provider?: AIProvider,
): Promise<AIActionPayload[]> {
  const [sprint, tasks, spheres, habits, todayEntry] = await Promise.all([
    getActiveSprint(userId),
    getAllTasks(userId),
    getAllSpheres(userId),
    getActiveHabits(userId),
    getTodayEntry(userId),
  ]);

  const activeTasks = tasks
    .filter((t) => t.status !== "DONE" && t.status !== "CANCELLED")
    .map(t => ({ title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate }));

  const context = JSON.stringify({
    sprint: sprint
      ? {
          objectives: sprint.objectives.map((o) => ({
            title: o.title,
            krs: o.keyResults.map((kr) => ({ title: kr.title, progress: kr.progress })),
          })),
        }
      : null,
    recentTasks: activeTasks.slice(0, 15),
    spheres: spheres.map((s) => s.name),
    habits: habits.map((h) => ({ name: h.name, anchor: h.anchor })),
    today: todayEntry ? { 
      energy: todayEntry.energy, 
      mood: todayEntry.mood, 
      sleep: todayEntry.sleepHours,
      winToday: todayEntry.winToday,
      brainDump: todayEntry.brainDump 
    } : null,
  });

  const config = getSuggestionsModel();
  if (provider) {
    config.provider = provider;
    if (provider === "google") config.model = "gemini-1.5-flash";
    if (provider === "openrouter") config.model = "google/gemma-3-4b-it:free";
    if (provider === "groq") config.model = "llama-3.1-8b-instant";
  }

  const apiMessages = [
    { role: "user", content: `${SUGGESTIONS_PROMPT}\n\nContext: ${context}` },
  ];

  const { text: responseText, usage } = await callAI(config, apiMessages);

  if (usage) {
    await trackUsage(userId, {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });
  }

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.actions || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveSuggestions(
  userId: string,
  actions: AIActionPayload[],
): Promise<string[]> {
  if (actions.length === 0) return [];

  const created = await prisma.aISuggestion.createManyAndReturn({
    data: actions.map((a) => ({
      userId,
      domain: a.domain === "operations" ? "OPERATIONS" : "HEALTH",
      action: a.action,
      payload: a.payload as object,
      reason: a.reason,
    })),
  });

  return created.map((s) => s.id);
}

function normalizeDate(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;

  const str = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return str;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  const timeMatch = str.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const today = new Date();
    today.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
    return today.toISOString();
  }

  return null;
}

function normalizeTaskPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result = { ...payload };

  if (result.plannedDate) {
    result.plannedDate = normalizeDate(result.plannedDate);
  }
  if (result.dueDate) {
    result.dueDate = normalizeDate(result.dueDate);
  }
  if (result.plannedEndDate) {
    result.plannedEndDate = normalizeDate(result.plannedEndDate);
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  if (result.priority && !validPriorities.includes(String(result.priority))) {
    result.priority = "MEDIUM";
  }

  const validStatuses = ["BACKLOG", "TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
  if (result.status && !validStatuses.includes(String(result.status))) {
    result.status = "TODO";
  }

  return result;
}

function normalizeSprintPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result = { ...payload };

  if (result.startDate) {
    const d = normalizeDate(result.startDate);
    if (d) result.startDate = d;
  }
  if (result.endDate) {
    const d = normalizeDate(result.endDate);
    if (d) result.endDate = d;
  }

  return result;
}

function normalizeDailyPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const result = { ...payload };

  if (result.date) {
    const d = normalizeDate(result.date);
    result.date = d || new Date().toISOString().split("T")[0];
  } else {
    result.date = new Date().toISOString().split("T")[0];
  }

  return result;
}

export async function getTasksByIds(userId: string, ids: string[]) {
  return prisma.task.findMany({
    where: { userId, id: { in: ids } },
    include: {
      sphere: true,
      children: true,
    },
  });
}

export async function executeSuggestion(suggestionId: string, userId: string, sharedContext?: Record<string, string>) {
  const suggestion = await prisma.aISuggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion || suggestion.userId !== userId) {
    throw new Error("Suggestion not found");
  }

  const rawPayload = suggestion.payload as Record<string, unknown>;

  switch (suggestion.action) {
    case "createTask": {
      const p = normalizeTaskPayload(rawPayload);
      
      // Resolve parentId from temp mapping if needed
      let finalParentId = (p.parentId as string) ?? null;
      if (finalParentId && sharedContext && sharedContext[finalParentId]) {
        finalParentId = sharedContext[finalParentId];
      }

      const { upsertTask } = await import("@/features/life/services/task-service");
      const result = await upsertTask(userId, {
        title: (p.title as string) || "AI Task",
        description: (p.description as string) ?? null,
        priority: (p.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT") ?? "MEDIUM",
        status: (p.status as "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE") ?? "TODO",
        sphereId: (p.sphereId as string) ?? null,
        plannedDate: (p.plannedDate as string) ?? null,
        dueDate: (p.dueDate as string) ?? null,
        parentId: finalParentId,
      });

      // Map temp ID to real DB ID for subsequent actions in the same batch
      if (sharedContext) {
        if (p.title) sharedContext[p.title as string] = result.id;
        if (rawPayload.tempId) sharedContext[rawPayload.tempId as string] = result.id;
      }

      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "updateTask": {
      const p = normalizeTaskPayload(rawPayload);
      const { upsertTask } = await import("@/features/life/services/task-service");
      const result = await upsertTask(userId, {
        id: p.id as string,
        title: p.title as string,
        description: p.description as string,
        priority: p.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
        status: p.status as "BACKLOG" | "TODO" | "IN_PROGRESS" | "DONE",
        sphereId: p.sphereId as string,
        plannedDate: p.plannedDate as string,
        dueDate: p.dueDate as string,
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "deleteTask": {
      const { deleteTask } = await import("@/features/life/services/task-service");
      const result = await deleteTask(userId, rawPayload.id as string);
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "createHabit": {
      const { upsertHabit } = await import("@/features/life/services/habit-service");
      const result = await upsertHabit(userId, {
        name: (rawPayload.name as string) || "AI Habit",
        anchor: (rawPayload.anchor as string) || "",
        action: (rawPayload.action as string) || "",
        celebration: (rawPayload.celebration as string) ?? null,
        reminderTime: (rawPayload.reminderTime as string) ?? null,
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "updateHabit": {
      const { upsertHabit } = await import("@/features/life/services/habit-service");
      const result = await upsertHabit(userId, {
        id: rawPayload.id as string,
        name: rawPayload.name as string,
        anchor: rawPayload.anchor as string,
        action: rawPayload.action as string,
        celebration: rawPayload.celebration as string,
        reminderTime: rawPayload.reminderTime as string,
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "deleteHabit": {
      const { deleteHabit } = await import("@/features/life/services/habit-service");
      const result = await deleteHabit(userId, rawPayload.id as string);
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "createSprint": {
      const p = normalizeSprintPayload(rawPayload);
      const { upsertSprint } = await import("@/features/operations/services/sprint-service");
      const result = await upsertSprint(userId, {
        number: p.number as number,
        year: p.year as number,
        startDate: new Date(p.startDate as string),
        endDate: new Date(p.endDate as string),
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "createObjective": {
      const { upsertObjective } = await import("@/features/operations/services/sprint-service");
      const result = await upsertObjective(userId, {
        sprintId: rawPayload.sprintId as string,
        sphereId: rawPayload.sphereId as string,
        title: (rawPayload.title as string) || "AI Objective",
        description: (rawPayload.description as string) ?? null,
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "createDailyEntry": {
      const p = normalizeDailyPayload(rawPayload);
      const { upsertEntry } = await import("@/features/life/services/journal-service");
      const result = await upsertEntry(userId, {
        date: p.date as string,
        sleepHours: rawPayload.sleepHours as number | undefined,
        sleepQuality: rawPayload.sleepQuality as number | undefined,
        energy: rawPayload.energy as number | undefined,
        mood: rawPayload.mood as number | undefined,
        weight: rawPayload.weight as number | undefined,
        nutrition: rawPayload.nutrition as number | undefined,
        winToday: (rawPayload.winToday as string) ?? undefined,
        gratitude: (rawPayload.gratitude as string) ?? undefined,
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "updateDailyEntry": {
      const p = normalizeDailyPayload(rawPayload);
      const { upsertEntry } = await import("@/features/life/services/journal-service");
      const result = await upsertEntry(userId, {
        date: p.date as string,
        sleepHours: rawPayload.sleepHours as number | undefined,
        energy: rawPayload.energy as number | undefined,
        mood: rawPayload.mood as number | undefined,
        weight: rawPayload.weight as number | undefined,
        nutrition: rawPayload.nutrition as number | undefined,
      });
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    case "deleteDailyEntry": {
      const { deleteEntry } = await import("@/features/life/services/journal-service");
      const result = await deleteEntry(userId, rawPayload.id as string);
      await prisma.aISuggestion.update({
        where: { id: suggestionId },
        data: { status: "ACCEPTED" },
      });
      return result;
    }

    default:
      throw new Error(`Unknown action: ${suggestion.action}`);
  }
}

export async function rejectSuggestion(suggestionId: string, userId: string) {
  const suggestion = await prisma.aISuggestion.findUnique({
    where: { id: suggestionId },
  });

  if (!suggestion || suggestion.userId !== userId) {
    throw new Error("Suggestion not found");
  }

  return prisma.aISuggestion.update({
    where: { id: suggestionId },
    data: { status: "REJECTED" },
  });
}

export async function getPendingSuggestions(userId: string) {
  return prisma.aISuggestion.findMany({
    where: { userId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUsageStats(userId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const usage = await prisma.aIUsage.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
  const totalRequests = usage.reduce((sum, u) => sum + u.requestCount, 0);

  return { days: usage, totalTokens, totalRequests, avgTokensPerRequest: totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0 };
}

export async function clearChatHistory(userId: string) {
  const chats = await prisma.aIChat.findMany({ where: { userId } });
  await prisma.aIChat.deleteMany({ where: { userId } });
  return chats.length;
}
