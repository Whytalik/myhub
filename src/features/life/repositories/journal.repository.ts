import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

export const journalRepository = {
  findByDate(userId: string, date: Date) {
    return prisma.dailyEntry.findUnique({
      where: { userId_date: { userId, date } },
    });
  },

  findAll(userId: string) {
    return prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        energy: true,
        mood: true,
        weight: true,
        sleepHours: true,
        sleepQuality: true,
        nutrition: true,
        morningRoutine: true,
        eveningRoutine: true,
        winToday: true,
        recoveryRoutine: true,
        recoveryScore: true,
      },
    });
  },

  findRecent(userId: string, take: number) {
    return prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take,
    });
  },

  upsert(
    userId: string,
    date: Date,
    create: Prisma.DailyEntryUncheckedCreateInput,
    update: Prisma.DailyEntryUncheckedUpdateInput,
  ) {
    return prisma.dailyEntry.upsert({
      where: { userId_date: { userId, date } },
      create,
      update,
    });
  },

  setStarted(userId: string, date: Date) {
    return prisma.dailyEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, startedAt: new Date() },
      update: { startedAt: new Date() },
    });
  },

  setCompleted(userId: string, date: Date) {
    return prisma.dailyEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, startedAt: new Date(), completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  },

  delete(id: string) {
    return prisma.dailyEntry.delete({ where: { id } });
  },
};
