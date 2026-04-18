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
      profile: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });
}

export async function updateUserProfile(userId: string, data: { name?: string }) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { name: data.name },
    });

    if (data.name) {
      await tx.profile.updateMany({
        where: { userId },
        data: { name: `${data.name}'s Profile` },
      });
    }

    return user;
  });
}
