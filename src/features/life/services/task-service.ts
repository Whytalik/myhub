import { prisma } from "@/lib/prisma";
import type {
  TaskData,
  LifeSphereData,
  TaskStatus,
  TaskPriority,
  UpsertTaskInput,
  UpsertSphereInput,
  TaskStats,
  SphereTaskStat,
  DayTaskStat,
  ProjectProgressStat,
} from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TASK_INCLUDE = {
  sphere: true,
  parent: { select: { id: true, title: true, icon: true } },
  children: {
    include: {
      sphere: true,
      parent: { select: { id: true, title: true, icon: true } },
      children: {
        include: {
          sphere: true,
          parent: { select: { id: true, title: true, icon: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }] as [
          { order: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }] as [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  },
};

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
    children: (task.children ?? []).map(mapTask),
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

async function resolveDepth(personId: string, parentId: string | null | undefined): Promise<number> {
  if (!parentId) return 0;
  const parent = await prisma.task.findUniqueOrThrow({
    where: { id: parentId, personId },
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

export async function getAllTasks(personId: string): Promise<TaskData[]> {
  const tasks = await prisma.task.findMany({
    where: { personId },
    include: TASK_INCLUDE,
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return sortTasks(tasks.map(mapTask));
}

export async function getCalendarTasks(personId: string): Promise<TaskData[]> {
  const tasks = await prisma.task.findMany({
    where: {
      personId,
      plannedDate: { not: null },
    },
    include: TASK_INCLUDE,
  });
  return sortTasks(tasks.map(mapTask));
}

export async function getTasksByDate(personId: string, date: Date): Promise<TaskData[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tasks = await prisma.task.findMany({
    where: {
      personId,
      plannedDate: {
        gte: start,
        lte: end,
      },
    },
    include: TASK_INCLUDE,
  });

  return sortTasks(tasks.map(mapTask));
}

export async function upsertTask(personId: string, input: UpsertTaskInput): Promise<TaskData> {
  const {
    id,
    title,
    description,
    icon,
    status,
    priority,
    plannedDate,
    hasPlannedTime = false,
    dueDate,
    hasDueTime = false,
    parentId,
    sphereId,
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
      where: { id, personId },
      data: {
        title:       title ?? undefined,
        description: description !== undefined ? (description ?? null) : undefined,
        icon:        icon !== undefined ? (icon ?? null) : undefined,
        status:      status ?? undefined,
        priority:    priority ?? undefined,
        plannedDate: parsedPlannedDate ?? undefined,
        hasPlannedTime: hasPlannedTime ?? undefined,
        dueDate:     parsedDueDate,
        hasDueTime:  hasDueTime ?? undefined,
        completedAt,
        parent: parentId !== undefined ? (parentId ? { connect: { id: parentId } } : { disconnect: true }) : undefined,
        sphere: sphereId !== undefined ? (sphereId ? { connect: { id: sphereId } } : { disconnect: true }) : undefined,
      },
      include: TASK_INCLUDE,
    });
    return mapTask(saved);
  } else {
    // Perform Create
    if (!title) throw new Error("Title is required for new tasks");
    
    const depth = await resolveDepth(personId, parentId);

    const saved = await prisma.task.create({
      data: {
        personId,
        title,
        description: description ?? null,
        icon:        icon ?? null,
        status:      status ?? "TODO",
        priority:    priority ?? "MEDIUM",
        plannedDate: (parsedPlannedDate as Date | null) ?? null,
        hasPlannedTime,
        dueDate: (parsedDueDate as Date | null) ?? null,
        hasDueTime,
        depth,
        completedAt: status === 'DONE' ? new Date() : null,
        parentId: parentId ?? null,
        sphereId: sphereId ?? null,
      },
      include: TASK_INCLUDE,
    });
    return mapTask(saved);
  }
}

export async function deleteTask(personId: string, id: string): Promise<void> {
  await prisma.task.delete({ where: { id, personId } });
}

export async function updateTaskStatus(personId: string, id: string, status: TaskStatus): Promise<void> {
  const completedAt = status === 'DONE' ? new Date() : null;
  await prisma.task.update({ where: { id, personId }, data: { status, completedAt } });
}

export async function updateTaskPriority(personId: string, id: string, priority: TaskPriority): Promise<void> {
  await prisma.task.update({ where: { id, personId }, data: { priority } });
}

// ─── Spheres ──────────────────────────────────────────────────────────────────

export async function getAllSpheres(personId: string): Promise<LifeSphereData[]> {
  const spheres = await prisma.lifeSphere.findMany({
    where: { personId },
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

export async function upsertSphere(personId: string, input: UpsertSphereInput): Promise<LifeSphereData> {
  const { id, name, color, icon, order = 0 } = input;
  const sphere = await prisma.lifeSphere.upsert({
    where: { id: id ?? "", personId },
    create: { personId, name, color, icon, order },
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

export async function deleteSphere(personId: string, id: string): Promise<void> {
  await prisma.lifeSphere.delete({ where: { id, personId } });
}

export async function getTaskStats(personId: string): Promise<TaskStats> {
  const allTasks = await prisma.task.findMany({
    where: { personId },
    include: {
      sphere: true,
      children: { select: { status: true } },
    },
  });

  const total = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'DONE');
  const totalCompleted = completedTasks.length;
  const completionRate = total > 0 ? (totalCompleted / total) * 100 : 0;

  const now = new Date();
  const overdueTasks = allTasks.filter(t => 
    t.status !== 'DONE' && 
    t.status !== 'CANCELLED' && 
    t.dueDate && new Date(t.dueDate) < now
  ).length;

  const completedOnTime = completedTasks.filter(t => 
    !t.dueDate || (t.completedAt && new Date(t.completedAt) <= new Date(t.dueDate))
  ).length;
  const onTimeRate = totalCompleted > 0 ? (completedOnTime / totalCompleted) * 100 : 0;

  // Sphere Distribution
  const sphereStatsMap: Record<string, SphereTaskStat> = {};
  allTasks.forEach(t => {
    if (!t.sphere) return;
    if (!sphereStatsMap[t.sphereId!]) {
      sphereStatsMap[t.sphereId!] = {
        id: t.sphere.id,
        name: t.sphere.name,
        color: t.sphere.color,
        count: 0,
        completed: 0
      };
    }
    sphereStatsMap[t.sphereId!].count++;
    if (t.status === 'DONE') sphereStatsMap[t.sphereId!].completed++;
  });
  const sphereDistribution = Object.values(sphereStatsMap);
  const mostActiveSphere = sphereDistribution.length > 0 
    ? [...sphereDistribution].sort((a,b) => b.count - a.count)[0].name 
    : null;

  // Active High Priority
  const activeHighPriorityTasks = allTasks.filter(t => 
    (t.priority === 'URGENT' || t.priority === 'HIGH') && 
    t.status !== 'DONE' && t.status !== 'CANCELLED'
  ).length;

  // Avg Lead Time (creation to completion) in hours
  const leadTimes = completedTasks
    .filter(t => t.completedAt)
    .map(t => (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60));
  const avgLeadTimeHours = leadTimes.length > 0 
    ? leadTimes.reduce((a,b) => a+b, 0) / leadTimes.length 
    : null;

  // Last 7 Days Velocity
  const last7Days: DayTaskStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const created = allTasks.filter(t => t.createdAt.toISOString().split('T')[0] === dateStr).length;
    const completed = allTasks.filter(t => t.completedAt?.toISOString().split('T')[0] === dateStr).length;
    
    last7Days.push({ date: dateStr, created, completed });
  }

  // Top Projects (Main Tasks with most subtasks)
  const topProjects: ProjectProgressStat[] = allTasks
    .filter(t => t.depth === 0 && t.children.length > 0)
    .map(t => {
      const totalSub = t.children.length;
      const doneSub = t.children.filter((c: any) => c.status === 'DONE').length;
      return {
        id: t.id,
        title: t.title,
        totalSubtasks: totalSub,
        completedSubtasks: doneSub,
        progress: (doneSub / totalSub) * 100
      };
    })
    .sort((a,b) => b.totalSubtasks - a.totalSubtasks)
    .slice(0, 5);

  return {
    totalTasks: total,
    completedTasks: totalCompleted,
    completionRate,
    overdueTasks,
    onTimeRate,
    mostActiveSphere,
    activeHighPriorityTasks,
    avgLeadTimeHours,
    sphereDistribution,
    last7Days,
    topProjects
  };
}
