import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const habitChainRepository = {
  findAll(userId: string) {
    return prisma.habitChain.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
  },

  findById(id: string) {
    return prisma.habitChain.findUnique({ where: { id } });
  },

  create(data: Prisma.HabitChainUncheckedCreateInput) {
    return prisma.habitChain.create({ data });
  },

  update(id: string, userId: string, data: Prisma.HabitChainUncheckedUpdateInput) {
    return prisma.habitChain.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.habitChain.delete({ where: { id, userId } });
  },
};
