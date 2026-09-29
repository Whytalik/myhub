import { prisma } from "@/lib/db/prisma";
import { addDays, addWeeks, endOfDay, endOfWeek, max, startOfDay, startOfWeek } from "date-fns";
import type {
  PendingSprintClosure,
  ProjectClosureAction,
  SprintClosureInput,
  TaskStatus,
} from "@/features/life/types";
import { Prisma } from "@/app/generated/prisma";

const sprintObjectivesInclude = {
  objectives: {
    include: {
      sphere: true,
      projects: {
        include: {
          tasks: {
            include: {
              sphere: true,
              children: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  },
} as const;

const SPRINT_LENGTH_WEEKS = 12;

type DatabaseClient = Prisma.TransactionClient | typeof prisma;

async function createSprint(userId: string, startDate: Date, database: DatabaseClient = prisma) {
  const start = startOfWeek(startDate, { weekStartsOn: 1 });
  const firstWeekEnd = endOfWeek(start, { weekStartsOn: 1 });
  const sprintEnd = addWeeks(firstWeekEnd, SPRINT_LENGTH_WEEKS - 1);

  // Sprint numbers restart every calendar year.
  const latestSprint = await database.sprint.findFirst({
    where: { userId, year: start.getFullYear() },
    orderBy: { number: "desc" },
  });

  return database.sprint.create({
    data: {
      userId,
      number: latestSprint ? latestSprint.number + 1 : 1,
      year: start.getFullYear(),
      startDate: start,
      endDate: sprintEnd,
      status: "ACTIVE",
    },
    include: { ...sprintObjectivesInclude },
  });
}

// Closes a sprint whose endDate has passed and starts the next one. Its
// leftovers are resolved later via closeSprint (see getPendingSprintClosure).
async function rollOverExpiredSprint(userId: string, expiredSprint: { id: string; endDate: Date }) {
  const rolledOver = await prisma.$transaction(async (transaction) => {
    // Only one concurrent request can flip ACTIVE -> COMPLETED; the loser
    // waits on the row lock and then sees count === 0.
    const closed = await transaction.sprint.updateMany({
      where: { id: expiredSprint.id, userId, status: "ACTIVE" },
      data: { status: "COMPLETED" },
    });
    if (closed.count === 0) return null;

    const dayAfterExpiry = addDays(new Date(expiredSprint.endDate), 1);
    const nextStart = max([startOfWeek(new Date(), { weekStartsOn: 1 }), dayAfterExpiry]);
    return createSprint(userId, nextStart, transaction);
  });

  if (rolledOver) return rolledOver;

  return prisma.sprint.findFirstOrThrow({
    where: { userId, status: "ACTIVE" },
    include: { ...sprintObjectivesInclude },
  });
}

async function getOrCreateActiveSprint(userId: string) {
  const activeSprint = await prisma.sprint.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { ...sprintObjectivesInclude },
  });

  if (!activeSprint) return createSprint(userId, new Date());
  if (new Date(activeSprint.endDate) < new Date()) {
    return rollOverExpiredSprint(userId, activeSprint);
  }
  return activeSprint;
}

export async function getSprintDashboard(userId: string) {
  const sprint = await getOrCreateActiveSprint(userId);

  // 2. Get backlog projects (owned by user but objectiveId is null)
  const backlogProjects = await prisma.project.findMany({
    where: { userId, objectiveId: null },
    include: {
      tasks: {
        include: {
          sphere: true,
          children: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Get tasks (atoms) for the operational Kanban columns
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const sprintStart = startOfWeek(new Date(sprint.startDate), { weekStartsOn: 1 });
  const sprintEnd = endOfWeek(new Date(sprint.endDate), { weekStartsOn: 1 });

  const allTasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        // Tasks planned for this sprint or past active tasks
        {
          plannedDate: {
            lte: sprintEnd,
          },
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
        // Unplanned/undated tasks that belong to active projects in the current sprint
        {
          plannedDate: null,
          status: { in: ["TODO", "IN_PROGRESS"] },
          project: {
            objective: {
              sprintId: sprint.id,
            },
          },
        },
        // Completed tasks (done during this sprint)
        {
          status: "DONE",
          completedAt: {
            gte: sprintStart,
            lte: sprintEnd,
          },
        },
      ],
    },
    include: {
      sphere: true,
      children: true,
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  // Group tasks into columns
  const todayTasks = allTasks.filter(
    (t) =>
      t.status !== "DONE" &&
      t.status !== "CANCELLED" &&
      t.plannedDate &&
      t.plannedDate >= dayStart &&
      t.plannedDate <= dayEnd,
  );

  const weeklyTasks = allTasks.filter(
    (t) =>
      t.status !== "DONE" &&
      t.status !== "CANCELLED" &&
      // Tasks with no planned date but belong to active projects
      (!t.plannedDate ||
        // Planned for this week (excluding today)
        (t.plannedDate >= weekStart &&
          t.plannedDate <= weekEnd &&
          (t.plannedDate < dayStart || t.plannedDate > dayEnd)) ||
        // Or planned in the past (overdue/carry-over tasks)
        t.plannedDate < weekStart),
  );

  const doneTasks = allTasks.filter((t) => t.status === "DONE" || t.status === "CANCELLED");

  // 4. Get standalone atoms (tasks without projectId, not children)
  const standaloneAtoms = await prisma.task.findMany({
    where: {
      userId,
      projectId: null,
      parentId: null,
      status: { in: ["TODO", "IN_PROGRESS", "BACKLOG"] },
    },
    include: {
      sphere: true,
      children: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // 5. Get sprint reviews to calculate scorecard
  const sprintReviews = await prisma.sprintReview.findMany({
    where: { sprintId: sprint.id },
    orderBy: { weekNumber: "asc" },
  });

  return {
    sprint,
    backlogProjects,
    columns: {
      weekly: weeklyTasks,
      today: todayTasks,
      done: doneTasks,
    },
    allTasks,
    standaloneAtoms,
    sprintReviews,
  };
}

export async function getSprintExecutionCenter(userId: string) {
  const sprint = await getOrCreateActiveSprint(userId);

  const sprintStart = startOfWeek(new Date(sprint.startDate), { weekStartsOn: 1 });
  const sprintEnd = endOfWeek(new Date(sprint.endDate), { weekStartsOn: 1 });

  const allTasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        {
          plannedDate: {
            lte: sprintEnd,
          },
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
        {
          plannedDate: null,
          status: { in: ["TODO", "IN_PROGRESS"] },
          project: {
            objective: {
              sprintId: sprint.id,
            },
          },
        },
        {
          status: "DONE",
          completedAt: {
            gte: sprintStart,
            lte: sprintEnd,
          },
        },
      ],
    },
    include: {
      sphere: true,
      children: true,
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const sprintReviews = await prisma.sprintReview.findMany({
    where: { sprintId: sprint.id },
    orderBy: { weekNumber: "asc" },
  });

  return {
    sprint,
    allTasks,
    sprintReviews,
  };
}

export async function getStandaloneBacklogTasks(userId: string) {
  return prisma.task.findMany({
    where: {
      userId,
      projectId: null,
      parentId: null,
      status: { in: ["TODO", "IN_PROGRESS", "BACKLOG"] },
    },
    include: {
      sphere: true,
      children: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectDetail(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      tasks: {
        include: { sphere: true, children: true },
        orderBy: { createdAt: "asc" },
      },
      objective: {
        include: { sphere: true, sprint: true },
      },
    },
  });
}

export async function createProject(
  userId: string,
  title: string,
  description?: string,
  objectiveId?: string | null,
) {
  return prisma.project.create({
    data: {
      userId,
      title,
      description: description || null,
      status: "TODO",
      objectiveId: objectiveId || null,
    },
  });
}

export async function deleteProject(userId: string, projectId: string) {
  // Ensure ownership
  await prisma.project.delete({
    where: { id: projectId, userId },
  });
}

export async function updateProjectStatus(userId: string, projectId: string, status: TaskStatus) {
  return prisma.project.update({
    where: { id: projectId, userId },
    data: { status },
  });
}

export async function assignProjectToObjective(
  userId: string,
  projectId: string,
  objectiveId: string | null,
) {
  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found or unauthorized");

  return prisma.project.update({
    where: { id: projectId },
    data: { objectiveId },
  });
}

export async function createSprintObjective(
  userId: string,
  sprintId: string,
  title: string,
  sphereId: string,
  description?: string,
) {
  // Verify sprint ownership
  const sprint = await prisma.sprint.findFirst({
    where: { id: sprintId, userId },
  });
  if (!sprint) throw new Error("Sprint not found or unauthorized");

  return prisma.objective.create({
    data: {
      sprintId,
      sphereId,
      title,
      description: description || null,
      status: "IN_PROGRESS",
    },
  });
}

export async function getSprintReviewForWeek(userId: string, date: Date) {
  const sprint = await prisma.sprint.findFirst({
    where: {
      userId,
      startDate: { lte: date },
    },
    orderBy: { startDate: "desc" },
  });

  if (!sprint) return null;

  const weekNumber =
    Math.floor((date.getTime() - sprint.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const review = await prisma.sprintReview.findFirst({
    where: {
      sprintId: sprint.id,
      weekNumber,
    },
  });

  return {
    sprint,
    weekNumber,
    review,
  };
}

export async function saveSprintReview(
  userId: string,
  sprintId: string,
  weekNumber: number,
  date: Date,
  data: {
    score?: number;
    wins?: string;
    challenges?: string;
    adjustments?: string;
    kaizenVector?: Prisma.InputJsonValue;
  },
) {
  const sprint = await prisma.sprint.findFirst({
    where: { id: sprintId, userId },
  });
  if (!sprint) throw new Error("Sprint not found or unauthorized");

  const existingReview = await prisma.sprintReview.findFirst({
    where: { sprintId, weekNumber },
  });

  if (existingReview) {
    return prisma.sprintReview.update({
      where: { id: existingReview.id },
      data: {
        score: data.score !== undefined ? data.score : existingReview.score,
        wins: data.wins !== undefined ? data.wins : existingReview.wins,
        challenges: data.challenges !== undefined ? data.challenges : existingReview.challenges,
        adjustments: data.adjustments !== undefined ? data.adjustments : existingReview.adjustments,
        kaizenVector:
          data.kaizenVector !== undefined
            ? data.kaizenVector
            : (existingReview.kaizenVector ?? Prisma.JsonNull),
      },
    });
  } else {
    return prisma.sprintReview.create({
      data: {
        sprintId,
        weekNumber,
        date,
        score: data.score || null,
        wins: data.wins || null,
        challenges: data.challenges || null,
        adjustments: data.adjustments || null,
        kaizenVector: data.kaizenVector ?? Prisma.JsonNull,
      },
    });
  }
}

export async function updateProject(
  userId: string,
  projectId: string,
  title: string,
  description: string | null,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) throw new Error("Project not found or unauthorized");

  return prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      description,
    },
  });
}

export async function updateSprintObjective(
  userId: string,
  objectiveId: string,
  title: string,
  sphereId: string,
  description: string | null,
) {
  const objective = await prisma.objective.findFirst({
    where: {
      id: objectiveId,
      sprint: { userId },
    },
  });
  if (!objective) throw new Error("Objective not found or unauthorized");

  return prisma.objective.update({
    where: { id: objectiveId },
    data: {
      title,
      sphereId,
      description,
    },
  });
}

export async function getCurrentSprintProjects(userId: string) {
  const sprint = await prisma.sprint.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      objectives: {
        include: {
          projects: {
            include: {
              tasks: {
                where: { parentId: null },
                include: {
                  children: true,
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!sprint) return [];

  const projects = sprint.objectives.flatMap((obj) => obj.projects || []);
  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    groups: p.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      childCount: t.children.length,
    })),
  }));
}

export async function updateSprintDates(
  userId: string,
  sprintId: string,
  startDate: Date,
  endDate: Date,
) {
  const sprint = await prisma.sprint.findFirst({
    where: { id: sprintId, userId },
  });
  if (!sprint) throw new Error("Sprint not found");

  return prisma.sprint.update({
    where: { id: sprintId },
    data: { startDate, endDate },
  });
}

const FINISHED_PROJECT_STATUSES: TaskStatus[] = ["DONE", "CANCELLED"];

export async function getPendingSprintClosure(
  userId: string,
): Promise<PendingSprintClosure | null> {
  // Make sure an expired sprint has been rolled over before looking for leftovers.
  await getOrCreateActiveSprint(userId);

  const sprint = await prisma.sprint.findFirst({
    where: { userId, status: "COMPLETED", objectives: { some: { status: "IN_PROGRESS" } } },
    orderBy: { startDate: "desc" },
    include: {
      reviews: { select: { score: true } },
      objectives: {
        include: {
          sphere: true,
          projects: { include: { tasks: { select: { status: true } } } },
        },
      },
    },
  });
  if (!sprint) return null;

  const allProjects = sprint.objectives.flatMap((objective) => objective.projects);
  const allTasks = allProjects.flatMap((project) => project.tasks);
  const scoredReviews = sprint.reviews.filter((review) => review.score !== null);
  const totalScore = scoredReviews.reduce((sum, review) => sum + (review.score ?? 0), 0);

  return {
    sprint: {
      id: sprint.id,
      number: sprint.number,
      year: sprint.year,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
    },
    summary: {
      objectivesTotal: sprint.objectives.length,
      projectsDone: allProjects.filter((project) => project.status === "DONE").length,
      projectsTotal: allProjects.length,
      tasksDone: allTasks.filter((task) => task.status === "DONE").length,
      tasksTotal: allTasks.length,
      averageScore: scoredReviews.length > 0 ? totalScore / scoredReviews.length : null,
      reviewCount: scoredReviews.length,
    },
    objectives: sprint.objectives
      .filter((objective) => objective.status === "IN_PROGRESS")
      .map((objective) => ({
        id: objective.id,
        title: objective.title,
        description: objective.description,
        sphere: {
          id: objective.sphere.id,
          name: objective.sphere.name,
          color: objective.sphere.color,
          icon: objective.sphere.icon,
        },
        unfinishedProjects: objective.projects
          .filter((project) => !FINISHED_PROJECT_STATUSES.includes(project.status))
          .map((project) => ({
            id: project.id,
            title: project.title,
            openTaskCount: project.tasks.filter(
              (task) => task.status === "TODO" || task.status === "IN_PROGRESS",
            ).length,
          })),
      })),
  };
}

export async function closeSprint(userId: string, input: SprintClosureInput) {
  const sprint = await prisma.sprint.findFirst({
    where: { id: input.sprintId, userId, status: "COMPLETED" },
    include: {
      objectives: {
        where: { status: "IN_PROGRESS" },
        include: { projects: { select: { id: true, status: true } } },
      },
    },
  });
  if (!sprint) throw new Error("Sprint not found or not closed");

  // Every open objective and every unfinished project needs an explicit decision.
  const decisionsByObjective = new Map(input.objectives.map((entry) => [entry.objectiveId, entry]));
  for (const objective of sprint.objectives) {
    const decision = decisionsByObjective.get(objective.id);
    if (!decision) throw new Error(`Missing decision for objective "${objective.title}"`);

    const decidedProjectIds = new Set(decision.projects.map((entry) => entry.projectId));
    const unfinished = objective.projects.filter(
      (project) => !FINISHED_PROJECT_STATUSES.includes(project.status),
    );
    if (unfinished.some((project) => !decidedProjectIds.has(project.id))) {
      throw new Error(`Missing project decision in objective "${objective.title}"`);
    }
  }

  const activeSprint = await getOrCreateActiveSprint(userId);
  const today = startOfDay(new Date());

  await prisma.$transaction(async (transaction) => {
    for (const objective of sprint.objectives) {
      const decision = decisionsByObjective.get(objective.id)!;
      const unfinishedIds = new Set(
        objective.projects
          .filter((project) => !FINISHED_PROJECT_STATUSES.includes(project.status))
          .map((project) => project.id),
      );
      const decisions = decision.projects.filter((entry) => unfinishedIds.has(entry.projectId));
      const idsFor = (action: ProjectClosureAction) =>
        decisions.filter((entry) => entry.action === action).map((entry) => entry.projectId);

      await transaction.objective.update({
        where: { id: objective.id },
        data: { status: decision.outcome },
      });

      const carriedIds = idsFor("CARRY");
      if (carriedIds.length > 0) {
        const carriedObjective = await transaction.objective.create({
          data: {
            sprintId: activeSprint.id,
            sphereId: objective.sphereId,
            title: objective.title,
            description: objective.description,
            status: "IN_PROGRESS",
          },
        });
        await transaction.project.updateMany({
          where: { id: { in: carriedIds }, userId },
          data: { objectiveId: carriedObjective.id },
        });
      }

      const backlogIds = idsFor("BACKLOG");
      if (backlogIds.length > 0) {
        await transaction.project.updateMany({
          where: { id: { in: backlogIds }, userId },
          data: { objectiveId: null },
        });
        // Drop stale dates so returned work doesn't show up as overdue.
        await transaction.task.updateMany({
          where: {
            userId,
            projectId: { in: backlogIds },
            status: { in: ["TODO", "IN_PROGRESS"] },
            plannedDate: { lt: today },
          },
          data: { plannedDate: null },
        });
      }

      for (const status of ["DONE", "CANCELLED"] as const) {
        const ids = idsFor(status);
        if (ids.length > 0) {
          await transaction.project.updateMany({
            where: { id: { in: ids }, userId },
            data: { status },
          });
        }
      }
    }

    const afterAction = {
      whatWorked: input.afterAction.whatWorked?.trim() || null,
      challenges: input.afterAction.challenges?.trim() || null,
      adjustments: input.afterAction.adjustments?.trim() || null,
    };
    await transaction.sprintAfterAction.upsert({
      where: { sprintId: sprint.id },
      create: { sprintId: sprint.id, date: today, ...afterAction },
      update: { date: today, ...afterAction },
    });
  });
}
