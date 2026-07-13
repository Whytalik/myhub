import { prisma } from "@/lib/db/prisma";

export const missionRepository = {
  findLatest(userId: string) {
    return prisma.missionVersion.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findAll(userId: string) {
    return prisma.missionVersion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  create(userId: string, content: string) {
    return prisma.missionVersion.create({ data: { userId, content } });
  },
};
