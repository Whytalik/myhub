import { prisma } from "@/lib/db/prisma";
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";

export async function getSprintDashboard(userId: string) {
  // 1. Get or create active sprint
  let sprint = await prisma.sprint.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      objectives: {
        include: {
          sphere: true,
          projects: {
            include: {
              tasks: {
                orderBy: { createdAt: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!sprint) {
    // If no active sprint, find or create one
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    // Add 11 weeks for a 12-week sprint
    const sprintEnd = new Date(end);
    sprintEnd.setDate(sprintEnd.getDate() + 11 * 7);

    // Let's see what is the highest sprint number for this year
    const latestSprint = await prisma.sprint.findFirst({
      where: { userId, year: now.getFullYear() },
      orderBy: { number: "desc" },
    });
    const nextNumber = latestSprint ? latestSprint.number + 1 : 1;

    sprint = await prisma.sprint.create({
      data: {
        userId,
        number: nextNumber,
        year: now.getFullYear(),
        startDate: start,
        endDate: sprintEnd,
        status: "ACTIVE",
      },
      include: {
        objectives: {
          include: {
            sphere: true,
            projects: {
              include: {
                tasks: {
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
      },
    });
  }

  // 2. Get backlog projects (owned by user but objectiveId is null)
  const backlogProjects = await prisma.project.findMany({
    where: { userId, objectiveId: null },
    include: {
      tasks: {
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

  const allTasks = await prisma.task.findMany({
    where: {
      userId,
      OR: [
        // Tasks planned for this week
        {
          plannedDate: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        // Completed tasks (done this week)
        {
          status: "DONE",
          completedAt: {
            gte: weekStart,
            lte: weekEnd,
          },
        },
        // Or completed recently (last 7 days fallback)
        {
          status: "DONE",
          completedAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
    include: {
      sphere: true,
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
      t.plannedDate <= dayEnd
  );

  const weeklyTasks = allTasks.filter(
    (t) =>
      t.status !== "DONE" &&
      t.status !== "CANCELLED" &&
      t.plannedDate &&
      t.plannedDate >= weekStart &&
      t.plannedDate <= weekEnd &&
      (t.plannedDate < dayStart || t.plannedDate > dayEnd)
  );

  const doneTasks = allTasks.filter((t) => t.status === "DONE" || t.status === "CANCELLED");

  return {
    sprint,
    backlogProjects,
    columns: {
      weekly: weeklyTasks,
      today: todayTasks,
      done: doneTasks,
    },
  };
}

export async function createProject(
  userId: string,
  title: string,
  description?: string,
  objectiveId?: string | null
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

export async function updateProjectStatus(
  userId: string,
  projectId: string,
  status: any
) {
  return prisma.project.update({
    where: { id: projectId, userId },
    data: { status },
  });
}

export async function assignProjectToObjective(
  userId: string,
  projectId: string,
  objectiveId: string | null
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
  description?: string
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

  const weekNumber = Math.floor((date.getTime() - sprint.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

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
  }
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
      },
    });
  }
}
