import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const setLogRepository = {
  findById(id: string) {
    return prisma.setLog.findUnique({ where: { id } });
  },

  update(id: string, userId: string, data: Prisma.SetLogUncheckedUpdateInput) {
    return prisma.setLog.update({ where: { id, userId }, data });
  },
};
