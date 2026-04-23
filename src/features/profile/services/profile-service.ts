import { prisma } from "@/lib/prisma";

export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    }
  });
}

export async function updateUserProfile(userId: string, data: { name?: string }) {
  return await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });
}