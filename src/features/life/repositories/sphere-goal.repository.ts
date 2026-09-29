import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

const GOAL_INCLUDE = {
  habit: { select: { id: true, name: true } },
} satisfies Prisma.SphereGoalInclude;

export type SphereGoalRow = Prisma.SphereGoalGetPayload<{ include: typeof GOAL_INCLUDE }>;

export const sphereGoalRepository = {
  findByYear(userId: string, year: number) {
    return prisma.sphereGoal.findMany({
      where: { userId, year },
      include: GOAL_INCLUDE,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  },

  findById(id: string, userId: string) {
    return prisma.sphereGoal.findFirst({ where: { id, userId }, include: GOAL_INCLUDE });
  },

  countInSphere(userId: string, sphereId: string, year: number) {
    return prisma.sphereGoal.count({ where: { userId, sphereId, year } });
  },

  create(data: Prisma.SphereGoalUncheckedCreateInput) {
    return prisma.sphereGoal.create({ data, include: GOAL_INCLUDE });
  },

  update(id: string, userId: string, data: Prisma.SphereGoalUncheckedUpdateInput) {
    return prisma.sphereGoal.update({ where: { id, userId }, data, include: GOAL_INCLUDE });
  },

  delete(id: string, userId: string) {
    return prisma.sphereGoal.deleteMany({ where: { id, userId } });
  },

  // Days with a completion per habit inside [from, to).
  async countHabitCompletions(habitIds: string[], from: Date, to: Date) {
    if (habitIds.length === 0) return new Map<string, number>();
    const rows = await prisma.habitCompletion.groupBy({
      by: ["habitId"],
      where: { habitId: { in: habitIds }, date: { gte: from, lt: to } },
      _count: { _all: true },
    });
    return new Map(rows.map((row) => [row.habitId, row._count._all]));
  },

  findHabitForUser(habitId: string, userId: string) {
    return prisma.habit.findFirst({ where: { id: habitId, userId }, select: { id: true } });
  },

  findSphereForUser(sphereId: string, userId: string) {
    return prisma.lifeSphere.findFirst({ where: { id: sphereId, userId }, select: { id: true } });
  },
};
