import { prisma } from "@/lib/db/prisma";

export const scheduleRepository = {
  findByDayOfWeek(userId: string, dayOfWeek: number) {
    return prisma.weekTemplate.findUnique({
      where: { userId_dayOfWeek: { userId, dayOfWeek } },
      include: { trainingDay: true },
    });
  },

  findAll(userId: string) {
    return prisma.weekTemplate.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
      include: { trainingDay: true },
    });
  },

  upsert(userId: string, dayOfWeek: number, trainingDayId: string | null) {
    return prisma.weekTemplate.upsert({
      where: { userId_dayOfWeek: { userId, dayOfWeek } },
      create: { userId, dayOfWeek, trainingDayId },
      update: { trainingDayId },
      include: { trainingDay: true },
    });
  },
};
