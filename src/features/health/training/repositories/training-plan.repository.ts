import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const PLAN_INCLUDE = {
  days: {
    orderBy: { order: "asc" },
    include: {
      exercises: {
        orderBy: { order: "asc" },
        include: { exercise: true },
      },
    },
  },
} as const satisfies Prisma.TrainingPlanInclude;

export type PlanRow = Prisma.TrainingPlanGetPayload<{ include: typeof PLAN_INCLUDE }>;

export const trainingPlanRepository = {
  findAll(userId: string) {
    return prisma.trainingPlan.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: PLAN_INCLUDE,
    });
  },

  findById(id: string) {
    return prisma.trainingPlan.findUnique({ where: { id }, include: PLAN_INCLUDE });
  },

  create(data: Prisma.TrainingPlanUncheckedCreateInput) {
    return prisma.trainingPlan.create({ data, include: PLAN_INCLUDE });
  },

  update(id: string, userId: string, data: Prisma.TrainingPlanUncheckedUpdateInput) {
    return prisma.trainingPlan.update({ where: { id, userId }, data, include: PLAN_INCLUDE });
  },

  delete(id: string, userId: string) {
    return prisma.trainingPlan.delete({ where: { id, userId } });
  },
};
