import { getCachedAllTasks, getCachedCalendarTasks, getCachedTasksByDate, getCachedSpheres } from "@/lib/cache";
import { taskRepository, type TaskRow } from "../repositories/task.repository";
import { sphereRepository } from "../repositories/sphere.repository";
import type { TaskData, LifeSphereData, TaskStatus, TaskPriority, UpsertTaskInput, UpsertSphereInput } from "../types";

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapSphere(
  sphere: { id: string; name: string; color: string; icon: string; order: number; isActive: boolean; createdAt: Date; updatedAt: Date } | null,
): LifeSphereData | null {
  if (!sphere) return null;
  return { ...sphere, taskCount: 0 };
}

function mapTask(task: TaskRow): TaskData {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    icon: task.icon,
    status: task.status as TaskStatus,
    priority: task.priority,
    isPrivate: task.isPrivate ?? false,
    isBlocked: task.isBlocked ?? false,
    isFrog: task.isFrog ?? false,
    plannedDate: task.plannedDate,
    hasPlannedTime: task.hasPlannedTime,
    plannedEndDate: task.plannedEndDate,
    hasPlannedEndTime: task.hasPlannedEndTime,
    dueDate: task.dueDate,
    hasDueTime: task.hasDueTime,
    depth: task.depth,
    order: task.order,
    parentId: task.parentId,
    parentTitle: task.parent?.title,
    parentIcon: task.parent?.icon,
    sphereId: task.sphereId,
    sphere: mapSphere(task.sphere),
    projectId: task.projectId,
    project: task.project,
    children: (task.children as unknown as TaskRow[] ?? []).map(mapTask),
    completedAt: task.completedAt,
    carriedFromDate: task.carriedFromDate,
    carryOverReason: task.carryOverReason,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

const PRIORITY_ORDER: Record<TaskPriority, number> = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
const STATUS_SORT_ORDER: Record<TaskStatus, number> = { IN_PROGRESS: 0, TODO: 1, BACKLOG: 2, DONE: 3, CANCELLED: 4 };

function sortTasks(tasks: TaskData[]): TaskData[] {
  return [...tasks].sort((a, b) => {
    if (a.isFrog !== b.isFrog) return a.isFrog ? -1 : 1;
    const sA = STATUS_SORT_ORDER[a.status] ?? 99;
    const sB = STATUS_SORT_ORDER[b.status] ?? 99;
    if (sA !== sB) return sA - sB;
    const pA = PRIORITY_ORDER[a.priority] ?? 0;
    const pB = PRIORITY_ORDER[b.priority] ?? 0;
    if (pA !== pB) return pB - pA;
    const timeA = a.plannedDate ? new Date(a.plannedDate).getTime() : Infinity;
    const timeB = b.plannedDate ? new Date(b.plannedDate).getTime() : Infinity;
    if (timeA !== timeB) return timeA - timeB;
    if (a.order !== b.order) return a.order - b.order;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// ─── Tasks: reads ─────────────────────────────────────────────────────────────

export async function getAllTasks(userId: string): Promise<TaskData[]> {
  const tasks = await getCachedAllTasks(userId);
  return sortTasks(tasks.map(mapTask));
}

export async function getCalendarTasks(userId: string): Promise<TaskData[]> {
  const tasks = await getCachedCalendarTasks(userId);
  return sortTasks(tasks.map(mapTask));
}

export async function getTasksByDate(userId: string, date: Date): Promise<TaskData[]> {
  const tasks = await getCachedTasksByDate(userId, date.toISOString());
  const dateStr = date.toISOString().slice(0, 10);
  const mapped = sortTasks(tasks.map(mapTask));
  return mapped.filter((task) => {
    if (task.children.length === 0) return true;
    const allSubtasksDone = task.children.every((c) => c.status === "DONE" || c.status === "CANCELLED");
    const isDueToday = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) === dateStr : false;
    return allSubtasksDone || isDueToday;
  });
}

// ─── Tasks: writes ────────────────────────────────────────────────────────────

async function resolveDepth(parentId: string | null | undefined): Promise<number> {
  if (!parentId) return 0;
  const parent = await taskRepository.findParentDepth(parentId);
  const depth = parent.depth + 1;
  if (depth > 2) throw new Error("Max nesting depth is 2");
  return depth;
}

export async function upsertTask(userId: string, input: UpsertTaskInput): Promise<TaskData> {
  const {
    id, title, description, icon, status, priority, isPrivate, isBlocked,
    plannedDate, hasPlannedTime, plannedEndDate, hasPlannedEndTime,
    dueDate, hasDueTime, parentId, sphereId, projectId, carriedFromDate, carryOverReason,
  } = input;

  const parsedPlannedDate    = plannedDate     !== undefined ? (plannedDate     ? new Date(plannedDate)     : null) : undefined;
  const parsedPlannedEndDate = plannedEndDate  !== undefined ? (plannedEndDate  ? new Date(plannedEndDate)  : null) : undefined;
  const parsedDueDate        = dueDate         !== undefined ? (dueDate         ? new Date(dueDate)         : null) : undefined;
  const parsedCarriedFrom    = carriedFromDate !== undefined ? (carriedFromDate ? new Date(carriedFromDate) : null) : undefined;

  const completedAt = status === "DONE" ? new Date() : status ? null : undefined;

  if (id) {
    const saved = await taskRepository.update(id, userId, {
      title: title ?? undefined,
      description: description !== undefined ? description ?? null : undefined,
      icon: icon !== undefined ? icon ?? null : undefined,
      status: status ?? undefined,
      priority: priority ?? undefined,
      isPrivate: isPrivate ?? undefined,
      isBlocked: isBlocked ?? undefined,
      plannedDate: parsedPlannedDate !== undefined ? parsedPlannedDate : undefined,
      hasPlannedTime: hasPlannedTime ?? undefined,
      plannedEndDate: parsedPlannedEndDate !== undefined ? parsedPlannedEndDate : undefined,
      hasPlannedEndTime: hasPlannedEndTime ?? undefined,
      dueDate: parsedDueDate !== undefined ? parsedDueDate : undefined,
      hasDueTime: hasDueTime ?? undefined,
      completedAt,
      carriedFromDate: parsedCarriedFrom !== undefined ? parsedCarriedFrom : undefined,
      carryOverReason: carryOverReason !== undefined ? carryOverReason ?? null : undefined,
      parentId:  parentId  !== undefined ? (parentId  ?? null) : undefined,
      sphereId:  sphereId  !== undefined ? (sphereId  ?? null) : undefined,
      projectId: projectId !== undefined ? (projectId ?? null) : undefined,
    });
    return mapTask(saved);
  }

  if (!title) throw new Error("Title is required for new tasks");
  const depth = await resolveDepth(parentId);

  const saved = await taskRepository.create({
    userId,
    title,
    description: description ?? null,
    icon: icon ?? null,
    status: status ?? "TODO",
    priority: priority ?? "MEDIUM",
    isPrivate: isPrivate ?? false,
    isBlocked: isBlocked ?? false,
    plannedDate: (parsedPlannedDate as Date | null) ?? null,
    hasPlannedTime: hasPlannedTime ?? false,
    plannedEndDate: (parsedPlannedEndDate as Date | null) ?? null,
    hasPlannedEndTime: hasPlannedEndTime ?? false,
    dueDate: (parsedDueDate as Date | null) ?? null,
    hasDueTime: hasDueTime ?? false,
    depth,
    completedAt: status === "DONE" ? new Date() : null,
    carriedFromDate: (parsedCarriedFrom as Date | null) ?? null,
    carryOverReason: carryOverReason ?? null,
    parentId: parentId ?? null,
    sphereId: sphereId ?? null,
    projectId: projectId ?? null,
  });
  return mapTask(saved);
}

export async function autoCarryOverYesterdayTasks(userId: string, todayStr: string): Promise<number> {
  const today = new Date(todayStr);
  today.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(today);
  yesterdayStart.setDate(today.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const result = await taskRepository.updateMany(
    { userId, plannedDate: { gte: yesterdayStart, lte: yesterdayEnd }, plannedEndDate: null, status: { notIn: ["DONE", "CANCELLED"] } },
    { plannedDate: today, carriedFromDate: yesterdayStart },
  );
  return result.count;
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  await taskRepository.delete(id, userId);
}

export async function updateTaskStatus(userId: string, id: string, status: TaskStatus): Promise<void> {
  const completedAt = status === "DONE" ? new Date() : null;
  await taskRepository.updateById(id, { status, completedAt });
  if (status === "DONE") await autoCompleteParentIfAllChildrenDone(id);
}

async function autoCompleteParentIfAllChildrenDone(childId: string): Promise<void> {
  const child = await taskRepository.findParentId(childId);
  if (!child?.parentId) return;

  const siblings = await taskRepository.findSiblings(child.parentId);
  if (!siblings.every((s) => s.status === "DONE" || s.status === "CANCELLED")) return;

  await taskRepository.updateById(child.parentId, { status: "DONE", completedAt: new Date() });

  const parent = await taskRepository.findParentId(child.parentId);
  if (parent?.parentId) await autoCompleteParentIfAllChildrenDone(child.parentId);
}

export async function updateTaskPriority(userId: string, id: string, priority: TaskPriority): Promise<void> {
  await taskRepository.updateById(id, { priority });
}

export async function setTaskAsFrog(userId: string, id: string): Promise<void> {
  const task = await taskRepository.findById(id);
  if (!task) throw new Error("Task not found");
  if (task.isFrog) {
    await taskRepository.clearFrog(userId);
  } else {
    await taskRepository.setFrogExclusive(userId, id);
  }
}

// ─── Spheres ──────────────────────────────────────────────────────────────────

export async function getAllSpheres(userId: string): Promise<LifeSphereData[]> {
  const spheres = await getCachedSpheres(userId);
  return spheres.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    icon: s.icon,
    order: s.order,
    isActive: s.isActive,
    taskCount: s._count.tasks,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

export async function upsertSphere(userId: string, input: UpsertSphereInput): Promise<LifeSphereData> {
  const { id, name, color, icon, order = 0 } = input;
  const sphere = await sphereRepository.upsert(id, userId, { name, color, icon, order });
  return {
    id: sphere.id,
    name: sphere.name,
    color: sphere.color,
    icon: sphere.icon,
    order: sphere.order,
    isActive: sphere.isActive,
    taskCount: sphere._count.tasks,
    createdAt: sphere.createdAt,
    updatedAt: sphere.updatedAt,
  };
}

export async function toggleSphereActive(userId: string, id: string, isActive: boolean): Promise<void> {
  await sphereRepository.update(id, userId, { isActive });
}

export async function deleteSphere(userId: string, id: string): Promise<void> {
  await sphereRepository.delete(id, userId);
}
