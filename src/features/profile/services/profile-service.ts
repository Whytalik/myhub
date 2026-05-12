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

export async function getDomainStats(userId: string) {
  const [
    tasks,
    habits,
    spheres,
    milestones,
    nutritionPersons,
    products,
    dishes,
    weekPlans,
    userLanguages,
    vocabularyItems,
    libraryItems,
    wishlistItems,
    visions,
    sprints,
    dailyEntries,
    pushSubscriptions,
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.habit.count({ where: { userId, archived: false } }),
    prisma.lifeSphere.count({ where: { userId } }),
    prisma.milestone.count({ where: { userId } }),
    prisma.nutritionPerson.count({ where: { userId } }),
    prisma.foodProduct.count({ where: { userId } }),
    prisma.dish.count({ where: { userId } }),
    prisma.weekPlan.count({ where: { userId } }),
    prisma.userLanguage.count({ where: { userId } }),
    prisma.vocabularyItem.count({ where: { userLanguage: { userId } } }),
    prisma.libraryItem.count({ where: { userId } }),
    prisma.wishlistItem.count({ where: { userId } }),
    prisma.vision.count({ where: { userId } }),
    prisma.sprint.count({ where: { userId } }),
    prisma.dailyEntry.count({ where: { userId } }),
    prisma.pushSubscription.count({ where: { userId } }),
  ]);

  return {
    operations: { tasks, habits, spheres, milestones },
    health: { nutritionPersons, products, dishes, weekPlans },
    mind: { languages: userLanguages, vocabulary: vocabularyItems, library: libraryItems },
    wealth: { wishlist: wishlistItems },
    planning: { visions, sprints },
    system: { dailyEntries, pushSubscriptions },
  };
}