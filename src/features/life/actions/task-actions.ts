"use server";

import * as taskService from "../services/task-service";
import { invalidateTaskCache } from "@/lib/revalidate";
import { getRequiredUserId } from "@/lib/action-utils";
import type { UpsertTaskInput, UpsertSphereInput, TaskStatus, TaskPriority, TaskData } from "../types";

export async function upsertTaskAction(input: UpsertTaskInput) {
  const userId = await getRequiredUserId();
  const task = await taskService.upsertTask(userId, input);
  invalidateTaskCache(userId);
  return task;
}

export async function deleteTaskAction(id: string) {
  const userId = await getRequiredUserId();
  await taskService.deleteTask(userId, id);
  invalidateTaskCache(userId);
}

export async function updateTaskStatusAction(id: string, status: TaskStatus) {
  const userId = await getRequiredUserId();
  await taskService.updateTaskStatus(userId, id, status);
  invalidateTaskCache(userId);
}

export async function updateTaskPriorityAction(id: string, priority: TaskPriority) {
  const userId = await getRequiredUserId();
  await taskService.updateTaskPriority(userId, id, priority);
  invalidateTaskCache(userId);
}

export async function updateTaskDateAction(id: string, plannedDate: string) {
  const userId = await getRequiredUserId();
  const task = await taskService.upsertTask(userId, { id, plannedDate });
  invalidateTaskCache(userId);
  return task;
}

export async function upsertSphereAction(input: UpsertSphereInput) {
  const userId = await getRequiredUserId();
  const sphere = await taskService.upsertSphere(userId, input);
  invalidateTaskCache(userId);
  return sphere;
}

export async function deleteSphereAction(id: string) {
  const userId = await getRequiredUserId();
  await taskService.deleteSphere(userId, id);
  invalidateTaskCache(userId);
}

export async function getAllSpheresAction() {
  const userId = await getRequiredUserId();
  return taskService.getAllSpheres(userId);
}

export async function instantDuplicateTaskAction(task: TaskData) {
  const userId = await getRequiredUserId();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, children: _children, ...rest } = task;
  const newTask = await taskService.upsertTask(userId, {
    ...rest,
    title: `${task.title} (Copy)`,
    plannedDate: task.plannedDate ? new Date(task.plannedDate).toISOString() : null,
    plannedEndDate: task.plannedEndDate ? new Date(task.plannedEndDate).toISOString() : null,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
  });
  invalidateTaskCache(userId);
  return newTask;
}

export async function instantAddSubtaskAction(parentId: string, sphereId: string | null) {
  const userId = await getRequiredUserId();
  const newTask = await taskService.upsertTask(userId, {
    title: "New Subtask",
    parentId,
    sphereId,
    status: "TODO",
    priority: "MEDIUM",
  });
  invalidateTaskCache(userId);
  return newTask;
}

export async function updateTaskRangeAction(id: string, plannedDate: string | null, plannedEndDate: string | null) {
  const userId = await getRequiredUserId();
  const task = await taskService.upsertTask(userId, { id, plannedDate, plannedEndDate });
  invalidateTaskCache(userId);
  return task;
}

export async function updateTaskTimeRangeAction(id: string, plannedDate: string | null, plannedEndDate: string | null) {
  const userId = await getRequiredUserId();
  const task = await taskService.upsertTask(userId, {
    id,
    plannedDate,
    plannedEndDate,
    hasPlannedTime: true,
    hasPlannedEndTime: true,
  });
  invalidateTaskCache(userId);
  return task;
}
