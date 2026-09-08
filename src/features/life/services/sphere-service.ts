import { getCachedSpheres } from "@/lib/cache/cache";
import { sphereRepository } from "../repositories/sphere.repository";
import { DEFAULT_SPHERES } from "../constants";
import { prisma } from "@/lib/db/prisma";
import type { LifeSphereData, UpsertSphereInput } from "../types";

export async function getAllSpheres(userId: string): Promise<LifeSphereData[]> {
  const userSpheres = await prisma.lifeSphere.findMany({ where: { userId } });
  const userSphereNamesLower = new Set(userSpheres.map((s) => s.name.toLowerCase()));

  const missingDefaults = DEFAULT_SPHERES.filter(
    (ds) => !userSphereNamesLower.has(ds.name.toLowerCase()),
  );

  if (missingDefaults.length > 0) {
    await sphereRepository.createMany(
      missingDefaults.map((s, idx) => ({
        ...s,
        userId,
        order: userSpheres.length + idx,
      })),
    );

    const dbSpheres = await prisma.lifeSphere.findMany({
      where: { userId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { order: "asc" },
    });

    try {
      const { invalidateTaskCache } = await import("@/lib/cache/revalidate");
      invalidateTaskCache(userId);
    } catch (error) {
      console.error("Failed to invalidate spheres cache:", error);
    }

    return dbSpheres.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      icon: s.icon,
      order: s.order,
      isActive: s.isActive,
      taskCount: s._count.tasks,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  const spheres = await getCachedSpheres(userId);
  return spheres.map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    icon: s.icon,
    order: s.order,
    isActive: s.isActive,
    taskCount: s._count.tasks,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));
}

export async function upsertSphere(
  userId: string,
  input: UpsertSphereInput,
): Promise<LifeSphereData> {
  const { id, name, color, icon, order = 0 } = input;
  const sphere = await sphereRepository.upsert(id, userId, { name, color, icon, order });
  return {
    id: sphere.id,
    name: sphere.name,
    color: sphere.color,
    icon: sphere.icon,
    order: sphere.order,
    isActive: sphere.isActive,
    taskCount: sphere._count.tasks,
    createdAt: sphere.createdAt,
    updatedAt: sphere.updatedAt,
  };
}

export async function toggleSphereActive(
  userId: string,
  id: string,
  isActive: boolean,
): Promise<void> {
  await sphereRepository.update(id, userId, { isActive });
}

export async function deleteSphere(userId: string, id: string): Promise<void> {
  await sphereRepository.delete(id, userId);
}
