import { getCachedUserProfile } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function getUserProfile(userId: string) {
  return getCachedUserProfile(userId);
}

export async function updateUserProfile(userId: string, data: { name?: string }) {
  return await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });
}