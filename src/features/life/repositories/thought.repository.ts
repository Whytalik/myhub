import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const thoughtRepository = {
  create(data: Prisma.ThoughtUncheckedCreateInput) {
    return prisma.thought.create({ data, include: { sphere: true } });
  },

  update(id: string, userId: string, data: Prisma.ThoughtUncheckedUpdateInput) {
    return prisma.thought.update({ where: { id, userId }, data, include: { sphere: true } });
  },

  delete(id: string, userId: string) {
    return prisma.thought.delete({ where: { id, userId } });
  },

  countInStatus(statusId: string, userId: string) {
    return prisma.thought.count({ where: { statusId, userId } });
  },

  // Moves `movedId` into `targetStatusId`, then reassigns dense `order` indices
  // (0..n-1) to every id in `orderedIdsInTargetColumn` — covers both a
  // cross-column move and a same-column reorder in one transaction.
  moveAndReorder(
    userId: string,
    movedId: string,
    targetStatusId: string,
    orderedIdsInTargetColumn: string[],
  ) {
    return prisma.$transaction([
      prisma.thought.update({
        where: { id: movedId, userId },
        data: { statusId: targetStatusId },
      }),
      ...orderedIdsInTargetColumn.map((id, index) =>
        prisma.thought.update({ where: { id, userId }, data: { order: index } }),
      ),
    ]);
  },
};
