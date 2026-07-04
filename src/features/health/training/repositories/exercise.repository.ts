import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

export const exerciseRepository = {
  findAll(userId: string) {
    return prisma.exercise.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
  },

  findById(id: string) {
    return prisma.exercise.findUnique({ where: { id } });
  },

  create(data: Prisma.ExerciseUncheckedCreateInput) {
    return prisma.exercise.create({ data });
  },

  update(id: string, userId: string, data: Prisma.ExerciseUncheckedUpdateInput) {
    return prisma.exercise.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.exercise.delete({ where: { id, userId } });
  },
};
