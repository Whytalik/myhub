import { prisma } from "@/lib/prisma";
import { DEFAULT_SPHERES } from "@/features/life/constants";

export const sphereSyncService = {
  /**
   * Ensures the user has all the default spheres.
   * Only adds spheres that are missing by name.
   */
  async syncUserSpheres(userId: string) {
    const existingSpheres = await prisma.lifeSphere.findMany({
      where: { userId },
      select: { name: true }
    });

    const existingNames = new Set(existingSpheres.map(s => s.name));

    const missingSpheres = DEFAULT_SPHERES.filter(s => !existingNames.has(s.name));

    if (missingSpheres.length === 0) return;

    await prisma.$transaction(
      missingSpheres.map(sphere => 
        prisma.lifeSphere.create({
          data: {
            userId,
            name: sphere.name,
            color: sphere.color,
            icon: sphere.icon,
            order: sphere.order,
          }
        })
      )
    );
    
    console.log(`Synced ${missingSpheres.length} spheres for user ${userId}`);
  }
};
