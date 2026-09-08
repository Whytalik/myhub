import { prisma } from "@/lib/db/prisma";

export const missionRepository = {
  find(userId: string) {
    return prisma.mission.findUnique({ where: { userId } });
  },

  save(userId: string, content: string) {
    return prisma.mission.upsert({
      where: { userId },
      update: { content },
      create: { userId, content },
    });
  },
};