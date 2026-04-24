import { prisma } from "@/lib/prisma";

export const systemService = {
  async getFullExport(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        nutritionPerson: true,
        dishes: { include: { ingredients: true } },
        weekPlans: { include: { dayPlans: { include: { entries: true } } } },
        shoppingLists: { include: { items: true } },
        tasks: true,
        dailyEntries: true,
        habits: { include: { completions: true } },
        lifeSpheres: true,
        libraryItems: true,
        wishlistItems: true,
        userLanguages: {
          include: {
            sphereProgress: true,
            vocabularyItems: true,
            immersionLogs: true,
            resources: true,
          }
        }
      }
    });

    if (!user) throw new Error("User not found");

    return {
      version: "2.0",
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      nutritionPerson: user.nutritionPerson,
    };
  },

  async resetSystem(userId: string) {
    await prisma.$transaction([
      prisma.dishIngredient.deleteMany({ where: { dish: { userId } } }),
      prisma.dayPlanEntry.deleteMany({ where: { dayPlan: { userId } } }),
      prisma.dayTemplateEntry.deleteMany({ where: { template: { userId } } }),
      prisma.shoppingListItem.deleteMany({ where: { shoppingList: { userId } } }),
      prisma.dayPlan.deleteMany({ where: { userId } }),
      prisma.dayTemplate.deleteMany({ where: { userId } }),
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

  async importData(userId: string, _data: unknown) {
    await this.resetSystem(userId);
  },
};