import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const TASK_INCLUDE = {
  sphere: true,
  project: { select: { id: true, title: true } },
  parent: { select: { id: true, title: true, icon: true } },
  children: {
    include: {
      sphere: true,
      project: { select: { id: true, title: true } },
      parent: { select: { id: true, title: true, icon: true } },
      children: {
        include: {
          sphere: true,
          project: { select: { id: true, title: true } },
          parent: { select: { id: true, title: true, icon: true } },
        },
      },
    },
  },
} as const satisfies Prisma.TaskInclude;

export type TaskRow = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

export const taskRepository = {
  findAll(userId: string) {
    return prisma.task.findMany({
      where: { userId },
      include: TASK_INCLUDE,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  },

  findWithPlannedDate(userId: string) {
    return prisma.task.findMany({
      where: { userId, plannedDate: { not: null } },
      include: TASK_INCLUDE,
    });
  },

  findByDateRange(userId: string, start: Date, end: Date) {
    return prisma.task.findMany({
      where: {
        userId,
        OR: [
          { plannedDate: { gte: start, lte: end }, plannedEndDate: null },
          { plannedEndDate: { not: null, gte: start }, plannedDate: { lte: end } },
        ],
      },
      include: TASK_INCLUDE,
    });
  },

  findById(id: string) {
    return prisma.task.findUnique({ where: { id }, include: TASK_INCLUDE });
  },

  findByIdSelect<T extends Prisma.TaskSelect>(id: string, select: T) {
    return prisma.task.findUnique({ where: { id }, select });
  },

  findParentDepth(parentId: string) {
    return prisma.task.findUniqueOrThrow({
      where: { id: parentId },
      select: { depth: true },
    });
  },

  findSiblings(parentId: string) {
    return prisma.task.findMany({
      where: { parentId },
      select: { id: true, status: true },
    });
  },

  findParentId(childId: string) {
    return prisma.task.findUnique({
      where: { id: childId },
      select: { parentId: true },
    });
  },

  create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({ data, include: TASK_INCLUDE });
  },

  update(id: string, userId: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({ where: { id, userId }, data, include: TASK_INCLUDE });
  },

  updateById(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({ where: { id }, data });
  },

  updateMany(where: Prisma.TaskWhereInput, data: Prisma.TaskUncheckedUpdateManyInput) {
    return prisma.task.updateMany({ where, data });
  },

  async delete(id: string, userId: string) {
    try {
      return await prisma.task.delete({ where: { id, userId } });
    } catch (error: any) {
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  },

  setFrogExclusive(userId: string, id: string) {
    return prisma.$transaction([
      prisma.task.updateMany({ where: { userId, isFrog: true }, data: { isFrog: false } }),
      prisma.task.update({ where: { id }, data: { isFrog: true } }),
    ]);
  },

  clearFrog(userId: string) {
    return prisma.task.updateMany({ where: { userId, isFrog: true }, data: { isFrog: false } });
  },
};
