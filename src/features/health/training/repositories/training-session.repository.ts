import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const SESSION_INCLUDE = {
  setLogs: { orderBy: { order: "asc" } },
} as const satisfies Prisma.TrainingSessionInclude;

export type SessionRow = Prisma.TrainingSessionGetPayload<{ include: typeof SESSION_INCLUDE }>;

export const trainingSessionRepository = {
  findRecent(userId: string, take = 20) {
    return prisma.trainingSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take,
      include: { _count: { select: { setLogs: true } } },
    });
  },

  findById(id: string) {
    return prisma.trainingSession.findUnique({ where: { id }, include: SESSION_INCLUDE });
  },

  findInRange(userId: string, from: Date, to: Date) {
    return prisma.trainingSession.findMany({
      where: { userId, date: { gte: from, lte: to } },
      orderBy: { date: "asc" },
      include: SESSION_INCLUDE,
    });
  },

  createWithLogs(
    sessionData: Prisma.TrainingSessionUncheckedCreateInput,
    setLogsData: Omit<Prisma.SetLogUncheckedCreateInput, "sessionId">[],
  ) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.trainingSession.create({ data: sessionData });
      if (setLogsData.length > 0) {
        await tx.setLog.createMany({
          data: setLogsData.map((log) => ({ ...log, sessionId: session.id })),
        });
      }
      return tx.trainingSession.findUniqueOrThrow({
        where: { id: session.id },
        include: SESSION_INCLUDE,
      });
    });
  },

  update(id: string, userId: string, data: Prisma.TrainingSessionUncheckedUpdateInput) {
    return prisma.trainingSession.update({ where: { id, userId }, data, include: SESSION_INCLUDE });
  },

  delete(id: string, userId: string) {
    return prisma.trainingSession.delete({ where: { id, userId } });
  },
};
