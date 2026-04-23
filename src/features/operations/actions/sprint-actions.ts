"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as sprintService from "../services/sprint-service";
import type { 
  UpsertSprintInput, 
  UpsertObjectiveInput, 
  UpsertKeyResultInput, 
  UpsertTacticInput 
} from "../types";

const PATH = "/planning/sprints";

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
