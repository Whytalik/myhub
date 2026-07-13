import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/app/generated/prisma";

export const sphereRepository = {
  findAll(userId: string) {
    return prisma.lifeSphere.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: { _count: { select: { tasks: true } } },
    });
  },

  count(userId: string) {
    return prisma.lifeSphere.count({ where: { userId } });
  },

  createMany(data: Prisma.LifeSphereCreateManyInput[]) {
    return prisma.lifeSphere.createMany({ data });
  },

  upsert(
    id: string | undefined,
    userId: string,
    data: { name: string; color: string; icon: string; order?: number },
  ) {
    return prisma.lifeSphere.upsert({
      where: { id: id ?? "" },
      create: { userId, ...data, order: data.order ?? 0 },
      update: data,
      include: { _count: { select: { tasks: true } } },
    });
  },

  update(id: string, userId: string, data: { isActive?: boolean }) {
    return prisma.lifeSphere.update({ where: { id, userId }, data });
  },

  delete(id: string, userId: string) {
    return prisma.lifeSphere.delete({ where: { id, userId } });
  },
};
