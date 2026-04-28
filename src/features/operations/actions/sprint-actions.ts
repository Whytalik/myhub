"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as sprintService from "../services/sprint-service";
import type { 
  UpsertSprintInput, 
  UpsertObjectiveInput, 
  UpsertKeyResultInput, 
  UpsertTacticInput,
  UpsertProjectInput 
} from "../types";

const PATH = "/planning/sprints";
const VISION_PATH = "/planning/vision";
const REVIEW_PATH = "/planning/reviews";
const COMPASS_PATH = "/planning/compass";

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized: No userId found in session");
  return userId;
}

export async function getActiveSprintAction() {
  const userId = await getUserId();
  return sprintService.getActiveSprint(userId);
}

export async function upsertSprintAction(input: UpsertSprintInput) {
  const userId = await getUserId();
  const sprint = await sprintService.upsertSprint(userId, input);
  revalidatePath(PATH);
  return sprint;
}

export async function upsertObjectiveAction(input: UpsertObjectiveInput) {
  const userId = await getUserId();
  const objective = await sprintService.upsertObjective(userId, input);
  revalidatePath(PATH);
  return objective;
}

export async function deleteObjectiveAction(id: string) {
  const userId = await getUserId();
  await sprintService.deleteObjective(userId, id);
  revalidatePath(PATH);
}

export async function upsertKeyResultAction(input: UpsertKeyResultInput) {
  const userId = await getUserId();
  const kr = await sprintService.upsertKeyResult(userId, input);
  revalidatePath(PATH);
  return kr;
}

export async function updateKRValueAction(id: string, value: number) {
  await sprintService.updateKRValue(id, value);
  revalidatePath(PATH);
}

export async function upsertTacticAction(input: UpsertTacticInput) {
  const userId = await getUserId();
  const tactic = await sprintService.upsertTactic(userId, input);
  revalidatePath(PATH);
  return tactic;
}

export async function toggleTacticCompletionAction(tacticId: string, weekNumber: number, completed: boolean) {
  await sprintService.toggleTacticCompletion(tacticId, weekNumber, completed);
  revalidatePath(PATH);
}

export async function upsertProjectAction(input: UpsertProjectInput) {
  const userId = await getUserId();
  const project = await sprintService.upsertProject(userId, input);
  revalidatePath(PATH);
  return project;
}

export async function deleteProjectAction(id: string) {
  const userId = await getUserId();
  await sprintService.deleteProject(userId, id);
  revalidatePath(PATH);
}

export async function getAlignmentDataAction() {
  const userId = await getUserId();
  return sprintService.getAlignmentData(userId);
}

export async function upsertVisionAction(title: string, content: string) {
  const userId = await getUserId();
  const vision = await sprintService.upsertVision(userId, title, content);
  revalidatePath(VISION_PATH);
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
  const userId = await getUserId();
  const review = await sprintService.upsertSprintReview(userId, input);
  revalidatePath(REVIEW_PATH);
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
  const userId = await getUserId();
  const compass = await sprintService.upsertAnnualCompass(userId, input);
  revalidatePath(COMPASS_PATH);
  return compass;
}

export async function getAnnualCompassAction(year: number) {
  const userId = await getUserId();
  return sprintService.getAnnualCompass(userId, year);
}
