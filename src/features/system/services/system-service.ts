import { prisma } from "@/lib/prisma";

export const systemService = {
  async getFullExport(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) throw new Error("User not found");

    const nutritionPerson = await prisma.nutritionPerson.findFirst({
      where: { userId },
    });

    return {
      version: "2.0",
      timestamp: new Date().toISOString(),
      user,
      nutritionPerson,
    };
  },

  async resetSystem(userId: string) {
    await prisma.$transaction([
      prisma.dishIngredient.deleteMany({ where: { dish: { userId } } }),
      prisma.productEntry.deleteMany({ where: { mealSlot: { dayPlan: { userId } } } }),
      prisma.dishEntry.deleteMany({ where: { mealSlot: { dayPlan: { userId } } } }),
      prisma.mealSlotInstance.deleteMany({ where: { dayPlan: { userId } } }),
      prisma.shoppingListItem.deleteMany({ where: { shoppingList: { userId } } }),
      prisma.dayPlan.deleteMany({ where: { userId } }),
      prisma.weekPlan.deleteMany({ where: { userId } }),
      prisma.shoppingList.deleteMany({ where: { userId } }),
      prisma.dish.deleteMany({ where: { userId } }),
      prisma.task.deleteMany({ where: { userId } }),
      prisma.habitCompletion.deleteMany({ where: { habit: { userId } } }),
      prisma.habit.deleteMany({ where: { userId } }),
      prisma.dailyEntry.deleteMany({ where: { userId } }),
      prisma.lifeSphere.deleteMany({ where: { userId } }),
      prisma.libraryItem.deleteMany({ where: { userId } }),
      prisma.wishlistItem.deleteMany({ where: { userId } }),
      prisma.vocabularyItem.deleteMany({ where: { userLanguage: { userId } } }),
      prisma.immersionLog.deleteMany({ where: { userLanguage: { userId } } }),
      prisma.languageResource.deleteMany({ where: { userLanguage: { userId } } }),
      prisma.languageSphereProgress.deleteMany({ where: { userLanguage: { userId } } }),
      prisma.userLanguage.deleteMany({ where: { userId } }),
    ]);
  },

  async importData(userId: string) {
    await this.resetSystem(userId);
  },
};