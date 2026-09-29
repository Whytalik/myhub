"use server";

import * as playbookService from "../services/goal-playbook-service";
import { invalidateSphereGoalCache, invalidateTaskCache } from "@/lib/cache/revalidate";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import type { SavePlaybookInput, UpsertGoalPhaseInput } from "../types";

export async function savePlaybookAction(
  goalId: string,
  input: SavePlaybookInput,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await playbookService.savePlaybook(userId, goalId, input);
    invalidateSphereGoalCache(userId);
  });
}

export async function upsertGoalPhaseAction(
  goalId: string,
  input: UpsertGoalPhaseInput,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await playbookService.upsertPhase(userId, goalId, input);
    invalidateSphereGoalCache(userId);
  });
}

export async function deleteGoalPhaseAction(phaseId: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await playbookService.deletePhase(userId, phaseId);
    invalidateSphereGoalCache(userId);
  });
}

export async function toggleGoalPhaseDoneAction(phaseId: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await playbookService.togglePhaseDone(userId, phaseId);
    invalidateSphereGoalCache(userId);
  });
}

export async function linkProjectToGoalAction(
  goalId: string,
  projectId: string,
  isLinked: boolean,
): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await playbookService.linkProject(userId, goalId, projectId, isLinked);
    invalidateSphereGoalCache(userId);
    invalidateTaskCache(userId);
  });
}

export async function createPedalTaskAction(
  goalId: string,
): Promise<ActionResult<{ isFrog: boolean }>> {
  return withAction(async (userId) => {
    const result = await playbookService.createPedalTask(userId, goalId);
    invalidateSphereGoalCache(userId);
    invalidateTaskCache(userId);
    return result;
  });
}
