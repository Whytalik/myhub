import { prisma } from "@/lib/db/prisma";

export const yearFocusRepository = {
  findByYear(userId: string, year: number) {
    return prisma.yearFocus.findUnique({ where: { userId_year: { userId, year } } });
  },

  upsert(
    userId: string,
    year: number,
    data: {
      sphereId: string;
      identity: string | null;
      leverGoalId: string | null;
      leverReason: string | null;
      allowImperfect: string | null;
    },
  ) {
    return prisma.yearFocus.upsert({
      where: { userId_year: { userId, year } },
      create: { userId, year, ...data },
      update: data,
    });
  },

  // Completed habit days (dates are stored as UTC midnight) plus finished atoms.
  async countVotes(userId: string, sphereId: string, from: Date, to: Date) {
    const utcDay = (date: Date) =>
      new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const [habitDays, atoms] = await Promise.all([
      prisma.habitCompletion.count({
        where: { habit: { userId, sphereId }, date: { gte: utcDay(from), lt: utcDay(to) } },
      }),
      prisma.task.count({
        where: {
          userId,
          sphereId,
          status: "DONE",
          children: { none: {} },
          resistance: { not: null },
          completedAt: { gte: from, lt: to },
        },
      }),
    ]);
    return habitDays + atoms;
  },

  findTaskSphere(taskId: string, userId: string) {
    return prisma.task.findFirst({ where: { id: taskId, userId }, select: { sphereId: true } });
  },

  findHabitSphere(habitId: string, userId: string) {
    return prisma.habit.findFirst({ where: { id: habitId, userId }, select: { sphereId: true } });
  },

  findMinimalThreshold(sphereId: string, userId: string) {
    return prisma.habit.findFirst({
      where: { userId, sphereId, archived: false, minimalThreshold: { not: null } },
      select: { minimalThreshold: true },
    });
  },

  deleteByYear(userId: string, year: number) {
    return prisma.yearFocus.deleteMany({ where: { userId, year } });
  },

  findSphereForUser(sphereId: string, userId: string) {
    return prisma.lifeSphere.findFirst({ where: { id: sphereId, userId }, select: { id: true } });
  },

  findGoalForUser(goalId: string, userId: string) {
    return prisma.sphereGoal.findFirst({
      where: { id: goalId, userId },
      select: { id: true, sphereId: true, year: true },
    });
  },
};
