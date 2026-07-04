import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const DAY_INCLUDE = {
  exercises: {
    orderBy: { order: "asc" },
    include: { exercise: true },
  },
} as const satisfies Prisma.TrainingDayInclude;

export type DayRow = Prisma.TrainingDayGetPayload<{ include: typeof DAY_INCLUDE }>;

export const trainingDayRepository = {
  findById(id: string) {
    return prisma.trainingDay.findUnique({ where: { id }, include: DAY_INCLUDE });
  },

  create(data: Prisma.TrainingDayUncheckedCreateInput) {
    return prisma.trainingDay.create({ data, include: DAY_INCLUDE });
  },

  update(id: string, userId: string, data: Prisma.TrainingDayUncheckedUpdateInput) {
    return prisma.trainingDay.update({ where: { id, userId }, data, include: DAY_INCLUDE });
  },

  delete(id: string, userId: string) {
    return prisma.trainingDay.delete({ where: { id, userId } });
  },

  countInPlan(planId: string) {
    return prisma.trainingDay.count({ where: { planId } });
  },
};
