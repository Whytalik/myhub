import { prisma } from "@/lib/db/prisma";
import type { SphereRole } from "@/app/generated/prisma";

export const sphereRoleRepository = {
  findByYear(userId: string, year: number) {
    return prisma.sphereYearRole.findMany({ where: { userId, year } });
  },

  upsert(userId: string, sphereId: string, year: number, role: SphereRole, plank: string | null) {
    return prisma.sphereYearRole.upsert({
      where: { userId_sphereId_year: { userId, sphereId, year } },
      create: { userId, sphereId, year, role, plank },
      update: { role, plank },
    });
  },

  findSphereForUser(sphereId: string, userId: string) {
    return prisma.lifeSphere.findFirst({ where: { id: sphereId, userId }, select: { id: true } });
  },
};
