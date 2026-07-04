import { prisma } from "@/lib/db/prisma";

export const scheduleRepository = {
  findByDayOfWeek(userId: string, dayOfWeek: number) {
    return prisma.weekTemplate.findUnique({
      where: { userId_dayOfWeek: { userId, dayOfWeek } },
    });
  },

  findAll(userId: string) {
    return prisma.weekTemplate.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  upsert(userId: string, dayOfWeek: number, dayType: string) {
    return prisma.weekTemplate.upsert({
      where: { userId_dayOfWeek: { userId, dayOfWeek } },
      create: { userId, dayOfWeek, dayType },
      update: { dayType },
    });
  },
};
