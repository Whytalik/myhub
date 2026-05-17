"use server";

import * as taskService from "../services/task-service";
import { invalidateTaskCache } from "@/lib/revalidate";
import { withAction, ActionResult } from "@/lib/action-utils";
import type { UpsertTaskInput, UpsertSphereInput, TaskStatus, TaskPriority, TaskData } from "../types";

export async function upsertTaskAction(input: UpsertTaskInput): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertTask>>>> {
  return withAction(async (userId) => {
    const task = await taskService.upsertTask(userId, input);
    invalidateTaskCache(userId);
    return task;
  });
}

export async function deleteTaskAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await taskService.deleteTask(userId, id);
    invalidateTaskCache(userId);
  });
}

export async function updateTaskStatusAction(id: string, status: TaskStatus): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await taskService.updateTaskStatus(userId, id, status);
    invalidateTaskCache(userId);
  });
}

export async function updateTaskPriorityAction(id: string, priority: TaskPriority): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await taskService.updateTaskPriority(userId, id, priority);
    invalidateTaskCache(userId);
  });
}

export async function updateTaskDateAction(id: string, plannedDate: string): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertTask>>>> {
  return withAction(async (userId) => {
    const task = await taskService.upsertTask(userId, { id, plannedDate });
    invalidateTaskCache(userId);
    return task;
  });
}

export async function upsertSphereAction(input: UpsertSphereInput): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertSphere>>>> {
  return withAction(async (userId) => {
    const sphere = await taskService.upsertSphere(userId, input);
    invalidateTaskCache(userId);
    return sphere;
  });
}

export async function deleteSphereAction(id: string): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await taskService.deleteSphere(userId, id);
    invalidateTaskCache(userId);
  });
}

export async function toggleSphereActiveAction(id: string, isActive: boolean): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await taskService.toggleSphereActive(userId, id, isActive);
    invalidateTaskCache(userId);
  });
}

export async function getAllSpheresAction(): Promise<ActionResult<Awaited<ReturnType<typeof taskService.getAllSpheres>>>> {
  return withAction(async (userId) => taskService.getAllSpheres(userId));
}

export async function instantDuplicateTaskAction(task: TaskData): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertTask>>>> {
  return withAction(async (userId) => {
    const { id: _id, children: _children, carriedFromDate: _cfd, carryOverReason: _cor, ...rest } = task;
    const newTask = await taskService.upsertTask(userId, {
      ...rest,
      title: `${task.title} (Copy)`,
      plannedDate: task.plannedDate ? new Date(task.plannedDate).toISOString() : null,
      plannedEndDate: task.plannedEndDate ? new Date(task.plannedEndDate).toISOString() : null,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
    });
    invalidateTaskCache(userId);
    return newTask;
  });
}

export async function instantAddSubtaskAction(parentId: string, sphereId: string | null): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertTask>>>> {
  return withAction(async (userId) => {
    const newTask = await taskService.upsertTask(userId, {
      title: "New Subtask",
      parentId,
      sphereId,
      status: "TODO",
      priority: "MEDIUM",
    });
    invalidateTaskCache(userId);
    return newTask;
  });
}

export async function updateTaskRangeAction(id: string, plannedDate: string | null, plannedEndDate: string | null): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertTask>>>> {
  return withAction(async (userId) => {
    const task = await taskService.upsertTask(userId, { id, plannedDate, plannedEndDate });
    invalidateTaskCache(userId);
    return task;
  });
}

export async function updateTaskTimeRangeAction(id: string, plannedDate: string | null, plannedEndDate: string | null): Promise<ActionResult<Awaited<ReturnType<typeof taskService.upsertTask>>>> {
  return withAction(async (userId) => {
    const task = await taskService.upsertTask(userId, {
      id,
      plannedDate,
      plannedEndDate,
      hasPlannedTime: true,
      hasPlannedEndTime: true,
    });
    invalidateTaskCache(userId);
    return task;
  });
}

export async function carryOverTaskAction(
  taskId: string,
  reason: string | null,
  newDateISO: string,
): Promise<ActionResult<TaskData>> {
  return withAction(async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const task = await taskService.upsertTask(userId, {
      id: taskId,
      plannedDate: newDateISO,
      carriedFromDate: today.toISOString(),
      carryOverReason: reason,
    });
    invalidateTaskCache(userId);
    return task;
  });
}
