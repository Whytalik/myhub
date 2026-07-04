import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const habitRepository = {
  findAll(userId: string, completionsSince: Date) {
    return prisma.habit.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: { completions: { where: { date: { gte: completionsSince } } } },
    });
  },

  findById(id: string) {
    return prisma.habit.findUnique({ where: { id } });
  },

  create(data: Prisma.HabitUncheckedCreateInput) {
    return prisma.habit.create({ data });
  },

  update(id: string, userId: string, data: Prisma.HabitUncheckedUpdateInput) {
    return prisma.habit.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.habit.delete({ where: { id, userId } });
  },

  findCompletion(habitId: string, date: Date) {
    return prisma.habitCompletion.findUnique({
      where: { habitId_date: { habitId, date } },
    });
  },

  createCompletion(habitId: string, date: Date) {
    return prisma.habitCompletion.create({ data: { habitId, date } });
  },

  deleteCompletion(id: string) {
    return prisma.habitCompletion.delete({ where: { id } });
  },

  findManyByIds(ids: string[], userId: string) {
    return prisma.habit.findMany({ where: { id: { in: ids }, userId } });
  },

  reorderInChain(userId: string, orderedHabitIds: string[]) {
    return prisma.$transaction(
      orderedHabitIds.map((id, index) =>
        prisma.habit.update({ where: { id, userId }, data: { order: index } }),
      ),
    );
  },
};
