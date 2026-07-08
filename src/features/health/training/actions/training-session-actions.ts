"use server";

import * as trainingSessionService from "../services/training-session-service";
import { invalidateTrainingSessionCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { StartSessionInput, UpdateSetLogInput, CompleteSessionInput } from "../types";

export async function startSessionAction(
  data: StartSessionInput,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingSessionService.startSession>>>> {
  return withAction(async (userId) => {
    const session = await trainingSessionService.startSession(userId, data);
    invalidateTrainingSessionCache(userId);
    return session;
  });
}

export async function updateSetLogAction(
  data: UpdateSetLogInput,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingSessionService.updateSetLog>>>> {
  return withAction(async (userId) => {
    const setLog = await trainingSessionService.updateSetLog(userId, data);
    invalidateTrainingSessionCache(userId);
    return setLog;
  });
}

export async function completeSessionAction(
  data: CompleteSessionInput,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingSessionService.completeSession>>>> {
  return withAction(async (userId) => {
    const session = await trainingSessionService.completeSession(userId, data);
    invalidateTrainingSessionCache(userId);
    return session;
  });
}

export async function updateSessionNotesAction(
  id: string,
  notes: string | null,
): Promise<ActionResult<Awaited<ReturnType<typeof trainingSessionService.updateSessionNotes>>>> {
  return withAction(async (userId) => {
    const session = await trainingSessionService.updateSessionNotes(userId, id, notes);
    invalidateTrainingSessionCache(userId);
    return session;
  });
}

export async function deleteSessionAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await trainingSessionService.deleteSession(userId, id);
    invalidateTrainingSessionCache(userId);
  });
}

export async function getWeeklyReportAction(): Promise<ActionResult<string>> {
  return withAction(async (userId) => {
    return trainingSessionService.getWeeklyReport(userId);
  });
}
