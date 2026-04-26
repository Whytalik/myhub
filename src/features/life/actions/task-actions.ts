"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as taskService from "../services/task-service";
import type { UpsertTaskInput, UpsertSphereInput, TaskStatus, TaskPriority } from "../types";

const PATH = "/life/tasks";

async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized: No userId found in session");
  return userId;
}

export async function upsertTaskAction(input: UpsertTaskInput) {
  const userId = await getUserId();
  const task = await taskService.upsertTask(userId, input);
  revalidatePath(PATH);
  return task;
}

export async function deleteTaskAction(id: string) {
  const userId = await getUserId();
  await taskService.deleteTask(userId, id);
  revalidatePath(PATH);
}

export async function updateTaskStatusAction(id: string, status: TaskStatus) {
  const userId = await getUserId();
  await taskService.updateTaskStatus(userId, id, status);
  revalidatePath(PATH);
}

export async function updateTaskPriorityAction(id: string, priority: TaskPriority) {
  const userId = await getUserId();
  await taskService.updateTaskPriority(userId, id, priority);
  revalidatePath(PATH);
}

export async function updateTaskDateAction(id: string, plannedDate: string) {
  const userId = await getUserId();
  const task = await taskService.upsertTask(userId, { id, plannedDate });
  revalidatePath(PATH);
  return task;
}

export async function upsertSphereAction(input: UpsertSphereInput) {
  const userId = await getUserId();
  const sphere = await taskService.upsertSphere(userId, input);
  revalidatePath(PATH);
  return sphere;
}

export async function deleteSphereAction(id: string) {
  const userId = await getUserId();
  await taskService.deleteSphere(userId, id);
  revalidatePath(PATH);
}

export async function getAllSpheresAction() {
  const userId = await getUserId();
  return taskService.getAllSpheres(userId);
}
