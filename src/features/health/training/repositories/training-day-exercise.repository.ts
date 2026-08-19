import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const trainingDayExerciseRepository = {
  findById(id: string) {
    return prisma.trainingDayExercise.findUnique({ where: { id } });
  },

  findByDayId(dayId: string) {
    return prisma.trainingDayExercise.findMany({
      where: { dayId },
      include: { exercise: true },
    });
  },

  create(data: Prisma.TrainingDayExerciseUncheckedCreateInput) {
    return prisma.trainingDayExercise.create({ data });
  },

  update(id: string, userId: string, data: Prisma.TrainingDayExerciseUncheckedUpdateInput) {
    return prisma.trainingDayExercise.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.trainingDayExercise.delete({ where: { id, userId } });
  },

  countInDay(dayId: string) {
    return prisma.trainingDayExercise.count({ where: { dayId } });
  },
};
