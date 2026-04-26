import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import type {
  TaskData,
  LifeSphereData,
  TaskStatus,
  TaskPriority,
  UpsertTaskInput,
  UpsertSphereInput,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TASK_INCLUDE = {
  sphere: true,
  project: { select: { id: true, title: true } },
  parent: { select: { id: true, title: true, icon: true } },
  children: {
    include: {
      sphere: true,
      project: { select: { id: true, title: true } },
      parent: { select: { id: true, title: true, icon: true } },
      children: {
        include: {
          sphere: true,
          project: { select: { id: true, title: true } },
          parent: { select: { id: true, title: true, icon: true } },
        },
      },
    },
  },
} as const satisfies Prisma.TaskInclude;

function mapSphere(
  sphere: { id: string; name: string; color: string; icon: string; order: number; createdAt: Date; updatedAt: Date } | null,
): LifeSphereData | null {
  if (!sphere) return null;
  return { ...sphere, taskCount: 0 };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTask(task: any): TaskData {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    icon: task.icon,
    status: task.status as TaskStatus,
    priority: task.priority,
    isPrivate: task.isPrivate ?? false,
    plannedDate: task.plannedDate,
    hasPlannedTime: task.hasPlannedTime,
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
    children: (task.children ?? []).map(mapTask),
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

async function resolveDepth(userId: string, parentId: string | null | undefined): Promise<number> {
  if (!parentId) return 0;
  const parent = await prisma.task.findUniqueOrThrow({
    where: { id: parentId },
    select: { depth: true },
  });

  const depth = parent.depth + 1;
  if (depth > 2) throw new Error("Max nesting depth is 2 (Task → Subtask → Sub-subtask)");
  return depth;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 3,
  HIGH:   2,
  MEDIUM: 1,
  LOW:    0,
};

const STATUS_SORT_ORDER: Record<TaskStatus, number> = {
  IN_PROGRESS: 0,
  TODO:        1,
  BACKLOG:     2,
  DONE:        3,
  CANCELLED:   4,
};

function sortTasks(tasks: TaskData[]): TaskData[] {
  return [...tasks].sort((a, b) => {
    // 1. Sort by Status (based on STATUS_SORT_ORDER)
    const sA = STATUS_SORT_ORDER[a.status] ?? 99;
    const sB = STATUS_SORT_ORDER[b.status] ?? 99;
    if (sA !== sB) return sA - sB;

    // 2. Sort by Priority (desc)
    const pA = PRIORITY_ORDER[a.priority] ?? 0;
    const pB = PRIORITY_ORDER[b.priority] ?? 0;
    if (pA !== pB) return pB - pA;

    // 3. Sort by plannedDate (asc)
    const timeA = a.plannedDate ? new Date(a.plannedDate).getTime() : Infinity;
    const timeB = b.plannedDate ? new Date(b.plannedDate).getTime() : Infinity;
    if (timeA !== timeB) return timeA - timeB;

    // 4. Fallback to manually set order (asc)
    if (a.order !== b.order) return a.order - b.order;

    // 5. Fallback to creation date (asc)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getAllTasks(userId: string): Promise<TaskData[]> {
  const tasks = await prisma.task.findMany({
    where: { userId },
    include: TASK_INCLUDE,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return sortTasks(tasks.map(mapTask));
}

export async function getCalendarTasks(userId: string): Promise<TaskData[]> {
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      plannedDate: { not: null },
    },
    include: TASK_INCLUDE,
  });
  return sortTasks(tasks.map(mapTask));
}

export async function getTasksByDate(userId: string, date: Date): Promise<TaskData[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      plannedDate: {
        gte: start,
        lte: end,
      },
    },
    include: TASK_INCLUDE,
  });

  return sortTasks(tasks.map(mapTask));
}

export async function upsertTask(userId: string, input: UpsertTaskInput): Promise<TaskData> {
  const {
    id,
    title,
    description,
    icon,
    status,
    priority,
    isPrivate,
    plannedDate,
    hasPlannedTime = false,
    dueDate,
    hasDueTime = false,
    parentId,
    sphereId,
    projectId,
  } = input;

  const parsedPlannedDate = plannedDate !== undefined ? (plannedDate ? new Date(plannedDate) : null) : undefined;
  const parsedDueDate = dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined;

  // Auto-set completedAt
  let completedAt: Date | null | undefined = undefined;
  if (status === 'DONE') {
    completedAt = new Date();
  } else if (status) {
    completedAt = null;
  }

  if (id) {
    // Perform Update
    const saved = await prisma.task.update({
      where: { id },
      data: {
        title:       title ?? undefined,
        description: description !== undefined ? (description ?? null) : undefined,
        icon:        icon !== undefined ? (icon ?? null) : undefined,
        status:      status ?? undefined,
        priority:    priority ?? undefined,
        isPrivate:  isPrivate ?? undefined,
        plannedDate: parsedPlannedDate ?? undefined,
        hasPlannedTime: hasPlannedTime ?? undefined,
        dueDate:     parsedDueDate,
        hasDueTime:  hasDueTime ?? undefined,
        completedAt,
        parent: parentId !== undefined ? (parentId ? { connect: { id: parentId } } : { disconnect: true }) : undefined,
        sphere: sphereId !== undefined ? (sphereId ? { connect: { id: sphereId } } : { disconnect: true }) : undefined,
        project: projectId !== undefined ? (projectId ? { connect: { id: projectId } } : { disconnect: true }) : undefined,
      },
      include: TASK_INCLUDE,
    });
    return mapTask(saved);
  } else {
    // Perform Create
    if (!title) throw new Error("Title is required for new tasks");
    
    const depth = await resolveDepth(userId, parentId);

    const saved = await prisma.task.create({
      data: {
        userId,
        title,
        description: description ?? null,
        icon:        icon ?? null,
        status:      status ?? "TODO",
        priority:    priority ?? "MEDIUM",
        isPrivate:  isPrivate ?? false,
        plannedDate: (parsedPlannedDate as Date | null) ?? null,
        hasPlannedTime,
        dueDate: (parsedDueDate as Date | null) ?? null,
        hasDueTime,
        depth,
        completedAt: status === 'DONE' ? new Date() : null,
        parentId: parentId ?? null,
        sphereId: sphereId ?? null,
        projectId: projectId ?? null,
      },
      include: TASK_INCLUDE,
    });
    return mapTask(saved);
  }
}

export async function deleteTask(userId: string, id: string): Promise<void> {
  await prisma.task.delete({ where: { id } });
}

export async function updateTaskStatus(userId: string, id: string, status: TaskStatus): Promise<void> {
  const completedAt = status === 'DONE' ? new Date() : null;
  await prisma.task.update({ where: { id }, data: { status, completedAt } });
}

export async function updateTaskPriority(userId: string, id: string, priority: TaskPriority): Promise<void> {
  await prisma.task.update({ where: { id }, data: { priority } });
}

// ─── Spheres ──────────────────────────────────────────────────────────────────

export async function getAllSpheres(userId: string): Promise<LifeSphereData[]> {
  const spheres = await prisma.lifeSphere.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
  return spheres.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    icon: s.icon,
    order: s.order,
    taskCount: s._count.tasks,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

export async function upsertSphere(userId: string, input: UpsertSphereInput): Promise<LifeSphereData> {
  const { id, name, color, icon, order = 0 } = input;
  const sphere = await prisma.lifeSphere.upsert({
    where: { id: id ?? "" },
    create: { userId, name, color, icon, order },
    update: { name, color, icon, order },
    include: { _count: { select: { tasks: true } } },
  });
  return {
    id: sphere.id,
    name: sphere.name,
    color: sphere.color,
    icon: sphere.icon,
    order: sphere.order,
    taskCount: sphere._count.tasks,
    createdAt: sphere.createdAt,
    updatedAt: sphere.updatedAt,
  };
}

export async function deleteSphere(userId: string, id: string): Promise<void> {
  await prisma.lifeSphere.delete({ where: { id } });
}
