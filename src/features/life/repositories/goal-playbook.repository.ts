import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

const PLAYBOOK_INCLUDE = {
  phases: { orderBy: [{ startMonth: "asc" }, { order: "asc" }] },
} satisfies Prisma.GoalPlaybookInclude;

export type GoalPlaybookRow = Prisma.GoalPlaybookGetPayload<{ include: typeof PLAYBOOK_INCLUDE }>;

// Atoms of a project: tasks with no sub-tasks and a resistance value (groups have none).
const LEAF_TASK_SELECT = {
  id: true,
  title: true,
  status: true,
  plannedDate: true,
  hasPlannedTime: true,
  plannedEndDate: true,
  projectId: true,
  project: { select: { title: true } },
} satisfies Prisma.TaskSelect;

export const goalPlaybookRepository = {
  findByGoal(goalId: string) {
    return prisma.goalPlaybook.findUnique({ where: { goalId }, include: PLAYBOOK_INCLUDE });
  },

  create(userId: string, goalId: string) {
    return prisma.goalPlaybook.create({ data: { userId, goalId }, include: PLAYBOOK_INCLUDE });
  },

  update(id: string, data: Prisma.GoalPlaybookUncheckedUpdateInput) {
    return prisma.goalPlaybook.update({ where: { id }, data, include: PLAYBOOK_INCLUDE });
  },

  countPhases(playbookId: string) {
    return prisma.goalPhase.count({ where: { playbookId } });
  },

  createPhase(data: Prisma.GoalPhaseUncheckedCreateInput) {
    return prisma.goalPhase.create({ data });
  },

  findPhase(id: string, userId: string) {
    return prisma.goalPhase.findFirst({ where: { id, playbook: { userId } } });
  },

  updatePhase(id: string, data: Prisma.GoalPhaseUncheckedUpdateInput) {
    return prisma.goalPhase.update({ where: { id }, data });
  },

  deletePhase(id: string) {
    return prisma.goalPhase.delete({ where: { id } });
  },

  countStartedPlaybooks(userId: string) {
    return prisma.goalPlaybook.count({
      where: {
        userId,
        OR: [{ path: { not: null } }, { keyChange: { not: null } }, { phases: { some: {} } }],
      },
    });
  },

  // Objectives of the running sprint that serve a yearly goal.
  countLinkedObjectives(userId: string) {
    return prisma.objective.count({
      where: { goalId: { not: null }, sprint: { userId, status: "ACTIVE" } },
    });
  },

  findGoalSphere(goalId: string) {
    return prisma.sphereGoal.findUnique({ where: { id: goalId }, select: { sphereId: true } });
  },

  findSphere(sphereId: string) {
    return prisma.lifeSphere.findUnique({
      where: { id: sphereId },
      select: { name: true, color: true, icon: true },
    });
  },

  findGoalForUser(goalId: string, userId: string) {
    return prisma.sphereGoal.findFirst({ where: { id: goalId, userId }, select: { id: true } });
  },

  findProjectsForUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      select: { id: true, title: true, status: true, goalId: true },
      orderBy: { createdAt: "desc" },
    });
  },

  findProjectForUser(projectId: string, userId: string) {
    return prisma.project.findFirst({ where: { id: projectId, userId }, select: { id: true } });
  },

  setProjectGoal(projectId: string, goalId: string | null) {
    return prisma.project.update({ where: { id: projectId }, data: { goalId } });
  },

  // Open leaf tasks of the goal's projects that are unscheduled or fall in the range.
  findOpenLeafTasks(goalId: string, from: Date, to: Date) {
    return prisma.task.findMany({
      where: {
        project: { goalId },
        children: { none: {} },
        resistance: { not: null },
        status: { in: ["TODO", "IN_PROGRESS", "BACKLOG"] },
        OR: [{ plannedDate: null }, { plannedDate: { gte: from, lte: to } }],
      },
      select: LEAF_TASK_SELECT,
      orderBy: [{ plannedDate: "asc" }, { order: "asc" }],
    });
  },

  // Leaf tasks planned inside the range, any status (for month progress).
  findLeafTasksInRange(goalId: string, from: Date, to: Date) {
    return prisma.task.findMany({
      where: {
        project: { goalId },
        children: { none: {} },
        resistance: { not: null },
        plannedDate: { gte: from, lte: to },
      },
      select: { status: true },
    });
  },

  findTask(taskId: string, userId: string) {
    return prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { id: true, title: true, status: true },
    });
  },
};
