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
