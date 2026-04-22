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

async function getPersonId() {
  const session = await auth();
  const personId = session?.user?.personId;
  if (!personId) throw new Error("Unauthorized: No personId found in session");
  return personId;
}

export async function getActiveSprintAction() {
  const personId = await getPersonId();
  return sprintService.getActiveSprint(personId);
}

export async function upsertSprintAction(input: UpsertSprintInput) {
  const personId = await getPersonId();
  const sprint = await sprintService.upsertSprint(personId, input);
  revalidatePath(PATH);
  return sprint;
}

export async function upsertObjectiveAction(input: UpsertObjectiveInput) {
  const personId = await getPersonId();
  const objective = await sprintService.upsertObjective(personId, input);
  revalidatePath(PATH);
  return objective;
}

export async function deleteObjectiveAction(id: string) {
  const personId = await getPersonId();
  await sprintService.deleteObjective(personId, id);
  revalidatePath(PATH);
}

export async function upsertKeyResultAction(input: UpsertKeyResultInput) {
  const personId = await getPersonId();
  const kr = await sprintService.upsertKeyResult(personId, input);
  revalidatePath(PATH);
  return kr;
}

export async function updateKRValueAction(id: string, value: number) {
  await sprintService.updateKRValue(id, value);
  revalidatePath(PATH);
}

export async function upsertTacticAction(input: UpsertTacticInput) {
  const personId = await getPersonId();
  const tactic = await sprintService.upsertTactic(personId, input);
  revalidatePath(PATH);
  return tactic;
}

export async function toggleTacticCompletionAction(tacticId: string, weekNumber: number, completed: boolean) {
  await sprintService.toggleTacticCompletion(tacticId, weekNumber, completed);
  revalidatePath(PATH);
}
