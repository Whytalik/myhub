import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const THOUGHT_STATUS_INCLUDE = {
  thoughts: { orderBy: { order: "asc" }, include: { sphere: true } },
} as const satisfies Prisma.ThoughtStatusInclude;

export type ThoughtStatusRow = Prisma.ThoughtStatusGetPayload<{
  include: typeof THOUGHT_STATUS_INCLUDE;
}>;

export const thoughtStatusRepository = {
  findAll(userId: string) {
    return prisma.thoughtStatus.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: THOUGHT_STATUS_INCLUDE,
    });
  },

  count(userId: string) {
    return prisma.thoughtStatus.count({ where: { userId } });
  },

  create(data: Prisma.ThoughtStatusUncheckedCreateInput) {
    return prisma.thoughtStatus.create({ data });
  },

  createMany(data: Prisma.ThoughtStatusCreateManyInput[]) {
    return prisma.thoughtStatus.createMany({ data });
  },

  update(id: string, userId: string, data: Prisma.ThoughtStatusUncheckedUpdateInput) {
    return prisma.thoughtStatus.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.thoughtStatus.delete({ where: { id, userId } });
  },

  findManyByIds(ids: string[], userId: string) {
    return prisma.thoughtStatus.findMany({ where: { id: { in: ids }, userId } });
  },

  reorder(userId: string, orderedStatusIds: string[]) {
    return prisma.$transaction(
      orderedStatusIds.map((id, index) =>
        prisma.thoughtStatus.update({ where: { id, userId }, data: { order: index } }),
      ),
    );
  },
};
