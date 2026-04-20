"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as taskService from "../services/task-service";
import type { UpsertTaskInput, UpsertSphereInput, TaskStatus, TaskPriority } from "../types";

const PATH = "/life/tasks";

async function getPersonId() {
  const session = await auth();
  const personId = session?.user?.personId;
  if (!personId) throw new Error("Unauthorized: No personId found in session");
  return personId;
}

export async function upsertTaskAction(input: UpsertTaskInput) {
  const personId = await getPersonId();
  const task = await taskService.upsertTask(personId, input);
  revalidatePath(PATH);
  return task;
}

export async function deleteTaskAction(id: string) {
  const personId = await getPersonId();
  await taskService.deleteTask(personId, id);
  revalidatePath(PATH);
}

export async function updateTaskStatusAction(id: string, status: TaskStatus) {
  const personId = await getPersonId();
  await taskService.updateTaskStatus(personId, id, status);
  revalidatePath(PATH);
}

export async function updateTaskPriorityAction(id: string, priority: TaskPriority) {
  const personId = await getPersonId();
  await taskService.updateTaskPriority(personId, id, priority);
  revalidatePath(PATH);
}

export async function updateTaskDateAction(id: string, plannedDate: string) {
  const personId = await getPersonId();
  const task = await taskService.upsertTask(personId, { id, plannedDate });
  revalidatePath(PATH);
  return task;
}

export async function upsertSphereAction(input: UpsertSphereInput) {
  const personId = await getPersonId();
  const sphere = await taskService.upsertSphere(personId, input);
  revalidatePath(PATH);
  return sphere;
}

export async function deleteSphereAction(id: string) {
  const personId = await getPersonId();
  await taskService.deleteSphere(personId, id);
  revalidatePath(PATH);
}

export async function getTaskStatsAction() {
  const personId = await getPersonId();
  return taskService.getTaskStats(personId);
}
