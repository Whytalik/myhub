"use server";

import * as sprintService from "../services/sprint-service";
import { invalidateSprintCache, invalidateCompassCache } from "@/lib/revalidate";
import { withAction, getRequiredUserId, ActionResult } from "@/lib/action-utils";
import type {
  UpsertSprintInput,
  UpsertObjectiveInput,
  UpsertKeyResultInput,
  UpsertTacticInput,
  UpsertProjectInput,
} from "../types";

// --- Query actions (throwing pattern — used in server pages or simple reads) ---

export async function getActiveSprintAction() {
  const userId = await getRequiredUserId();
  return sprintService.getActiveSprint(userId);
}

export async function getAlignmentDataAction() {
  const userId = await getRequiredUserId();
  return sprintService.getAlignmentData(userId);
}

export async function getAnnualCompassAction(year: number) {
  const userId = await getRequiredUserId();
  return sprintService.getAnnualCompass(userId, year);
}

export async function getSprintReviewAction(sprintId: string, weekNumber: number) {
  await getRequiredUserId();
  return sprintService.getSprintReview(sprintId, weekNumber);
}

// --- Mutation actions (withAction — safe error handling for client components) ---

export async function upsertSprintAction(input: UpsertSprintInput): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertSprint>>>> {
  return withAction(async (userId) => {
    const sprint = await sprintService.upsertSprint(userId, input);
    invalidateSprintCache(userId);
    return sprint;
  });
}

export async function upsertObjectiveAction(input: UpsertObjectiveInput): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertObjective>>>> {
  return withAction(async (userId) => {
    const objective = await sprintService.upsertObjective(userId, input);
    invalidateSprintCache(userId);
    return objective;
  });
}

export async function deleteObjectiveAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sprintService.deleteObjective(userId, id);
    invalidateSprintCache(userId);
  });
}

export async function upsertKeyResultAction(input: UpsertKeyResultInput): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertKeyResult>>>> {
  return withAction(async (userId) => {
    const kr = await sprintService.upsertKeyResult(userId, input);
    invalidateSprintCache(userId);
    return kr;
  });
}

export async function updateKRValueAction(id: string, value: number): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sprintService.updateKRValue(id, value);
    invalidateSprintCache(userId);
  });
}

export async function upsertTacticAction(input: UpsertTacticInput): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertTactic>>>> {
  return withAction(async (userId) => {
    const tactic = await sprintService.upsertTactic(userId, input);
    invalidateSprintCache(userId);
    return tactic;
  });
}

export async function toggleTacticCompletionAction(tacticId: string, weekNumber: number, completed: boolean): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sprintService.toggleTacticCompletion(tacticId, weekNumber, completed);
    invalidateSprintCache(userId);
  });
}

export async function upsertProjectAction(input: UpsertProjectInput): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertProject>>>> {
  return withAction(async (userId) => {
    const project = await sprintService.upsertProject(userId, input);
    invalidateSprintCache(userId);
    return project;
  });
}

export async function deleteProjectAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await sprintService.deleteProject(userId, id);
    invalidateSprintCache(userId);
  });
}

export async function upsertVisionAction(title: string, content: string): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertVision>>>> {
  return withAction(async (userId) => {
    const vision = await sprintService.upsertVision(userId, title, content);
    invalidateSprintCache(userId);
    return vision;
  });
}

export async function upsertSprintReviewAction(input: {
  id?: string;
  sprintId: string;
  weekNumber: number;
  score?: number | null;
  wins?: string | null;
  challenges?: string | null;
  adjustments?: string | null;
}): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertSprintReview>>>> {
  return withAction(async (userId) => {
    const review = await sprintService.upsertSprintReview(userId, input);
    invalidateSprintCache(userId);
    return review;
  });
}

export async function upsertAnnualCompassAction(input: {
  id?: string;
  year: number;
  theme?: string | null;
  wigs?: string | null;
  focusAreas?: string | null;
}): Promise<ActionResult<Awaited<ReturnType<typeof sprintService.upsertAnnualCompass>>>> {
  return withAction(async (userId) => {
    const compass = await sprintService.upsertAnnualCompass(userId, input);
    invalidateCompassCache(userId);
    return compass;
  });
}
