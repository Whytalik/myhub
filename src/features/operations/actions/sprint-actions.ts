"use server";

import * as sprintService from "../services/sprint-service";
import { invalidateSprintCache, invalidateCompassCache } from "@/lib/revalidate";
import { getRequiredUserId } from "@/lib/action-utils";
import type {
  UpsertSprintInput,
  UpsertObjectiveInput,
  UpsertKeyResultInput,
  UpsertTacticInput,
  UpsertProjectInput,
} from "../types";

export async function getActiveSprintAction() {
  const userId = await getRequiredUserId();
  return sprintService.getActiveSprint(userId);
}

export async function upsertSprintAction(input: UpsertSprintInput) {
  const userId = await getRequiredUserId();
  const sprint = await sprintService.upsertSprint(userId, input);
  invalidateSprintCache(userId);
  return sprint;
}

export async function upsertObjectiveAction(input: UpsertObjectiveInput) {
  const userId = await getRequiredUserId();
  const objective = await sprintService.upsertObjective(userId, input);
  invalidateSprintCache(userId);
  return objective;
}

export async function deleteObjectiveAction(id: string) {
  const userId = await getRequiredUserId();
  await sprintService.deleteObjective(userId, id);
  invalidateSprintCache(userId);
}

export async function upsertKeyResultAction(input: UpsertKeyResultInput) {
  const userId = await getRequiredUserId();
  const kr = await sprintService.upsertKeyResult(userId, input);
  invalidateSprintCache(userId);
  return kr;
}

export async function updateKRValueAction(id: string, value: number) {
  const userId = await getRequiredUserId();
  await sprintService.updateKRValue(id, value);
  invalidateSprintCache(userId);
}

export async function upsertTacticAction(input: UpsertTacticInput) {
  const userId = await getRequiredUserId();
  const tactic = await sprintService.upsertTactic(userId, input);
  invalidateSprintCache(userId);
  return tactic;
}

export async function toggleTacticCompletionAction(tacticId: string, weekNumber: number, completed: boolean) {
  const userId = await getRequiredUserId();
  await sprintService.toggleTacticCompletion(tacticId, weekNumber, completed);
  invalidateSprintCache(userId);
}

export async function upsertProjectAction(input: UpsertProjectInput) {
  const userId = await getRequiredUserId();
  const project = await sprintService.upsertProject(userId, input);
  invalidateSprintCache(userId);
  return project;
}

export async function deleteProjectAction(id: string) {
  const userId = await getRequiredUserId();
  await sprintService.deleteProject(userId, id);
  invalidateSprintCache(userId);
}

export async function getAlignmentDataAction() {
  const userId = await getRequiredUserId();
  return sprintService.getAlignmentData(userId);
}

export async function upsertVisionAction(title: string, content: string) {
  const userId = await getRequiredUserId();
  const vision = await sprintService.upsertVision(userId, title, content);
  invalidateSprintCache(userId);
  return vision;
}

export async function upsertSprintReviewAction(input: {
  id?: string;
  sprintId: string;
  weekNumber: number;
  score?: number | null;
  wins?: string | null;
  challenges?: string | null;
  adjustments?: string | null;
}) {
  const userId = await getRequiredUserId();
  const review = await sprintService.upsertSprintReview(userId, input);
  invalidateSprintCache(userId);
  return review;
}

export async function getSprintReviewAction(sprintId: string, weekNumber: number) {
  return sprintService.getSprintReview(sprintId, weekNumber);
}

export async function upsertAnnualCompassAction(input: {
  id?: string;
  year: number;
  theme?: string | null;
  wigs?: string | null;
  focusAreas?: string | null;
}) {
  const userId = await getRequiredUserId();
  const compass = await sprintService.upsertAnnualCompass(userId, input);
  invalidateCompassCache(userId);
  return compass;
}

export async function getAnnualCompassAction(year: number) {
  const userId = await getRequiredUserId();
  return sprintService.getAnnualCompass(userId, year);
}
