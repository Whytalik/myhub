"use server";

import * as trainingSessionService from "../services/training-session-service";
import { invalidateTrainingSessionCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
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

export async function deleteSessionAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await trainingSessionService.deleteSession(userId, id);
    invalidateTrainingSessionCache(userId);
  });
}
