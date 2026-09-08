import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const directionRepository = {
  findAll(userId: string) {
    return prisma.direction.findMany({
      where: { userId },
      include: { sphere: true },
      orderBy: { createdAt: "asc" },
    });
  },

  upsert(
    sphereId: string,
    userId: string,
    data: { statement: string; actions?: Prisma.InputJsonValue },
  ) {
    return prisma.direction.upsert({
      where: { sphereId },
      create: { sphereId, userId, ...data },
      update: data,
      include: { sphere: true },
    });
  },

  deleteBySphereId(sphereId: string, userId: string) {
    return prisma.direction.deleteMany({
      where: { sphereId, userId },
    });
  },
};
