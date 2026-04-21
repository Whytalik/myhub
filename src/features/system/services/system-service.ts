import { prisma } from "@/lib/prisma";

export const systemService = {
  async getFullExport(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            persons: {
              include: {
                dishes: { include: { ingredients: true } },
                dayTemplates: { include: { entries: true } },
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
            }
          }
        }
      }
    });

    if (!user) throw new Error("User not found");

    return {
      version: "1.0",
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: user.profile,
    };
  },

  async resetSystem(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { persons: true } } }
    });

    if (!user || !user.profile) return;

    const personIds = user.profile.persons.map(p => p.id);

    await prisma.$transaction([
      prisma.dishIngredient.deleteMany({ where: { dish: { personId: { in: personIds } } } }),
      prisma.dayPlanEntry.deleteMany({ where: { dayPlan: { personId: { in: personIds } } } }),
      prisma.dayTemplateEntry.deleteMany({ where: { template: { personId: { in: personIds } } } }),
      prisma.shoppingListItem.deleteMany({ where: { shoppingList: { personId: { in: personIds } } } }),
      prisma.dayPlan.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.dayTemplate.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.weekPlan.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.shoppingList.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.dish.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.task.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.habitCompletion.deleteMany({ where: { habit: { personId: { in: personIds } } } }),
      prisma.habit.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.dailyEntry.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.lifeSphere.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.libraryItem.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.wishlistItem.deleteMany({ where: { personId: { in: personIds } } }),
      prisma.vocabularyItem.deleteMany({ where: { userLanguage: { personId: { in: personIds } } } }),
      prisma.immersionLog.deleteMany({ where: { userLanguage: { personId: { in: personIds } } } }),
      prisma.languageResource.deleteMany({ where: { userLanguage: { personId: { in: personIds } } } }),
      prisma.languageSphereProgress.deleteMany({ where: { userLanguage: { personId: { in: personIds } } } }),
      prisma.userLanguage.deleteMany({ where: { personId: { in: personIds } } }),
    ]);
  },

  async importData(userId: string, backup: any) {
    if (backup.version !== "1.0") throw new Error("Unsupported backup version");

    // 1. Reset everything for this user first
    await this.resetSystem(userId);

    const profileData = backup.profile;
    if (!profileData) throw new Error("No profile data in backup");

    // 2. Recreate Profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        name: profileData.name || "Default Profile",
      },
      update: {
        name: profileData.name || "Default Profile",
      }
    });

    for (const personData of profileData.persons) {
      // 3. Recreate Person
      const person = await prisma.nutritionPerson.create({
        data: {
          profileId: profile.id,
          name: personData.name,
          targetCalories: personData.targetCalories,
          targetProtein: personData.targetProtein,
          targetFat: personData.targetFat,
          targetCarbs: personData.targetCarbs,
          targetFiber: personData.targetFiber,
        }
      });

      const personId = person.id;

      // 4. Life Spheres (Map old ID -> new ID)
      const sphereMap: Record<string, string> = {};
      for (const s of personData.lifeSpheres || []) {
        const newSphere = await prisma.lifeSphere.create({
          data: {
            personId,
            name: s.name,
            color: s.color,
            icon: s.icon,
            order: s.order,
          }
        });
        sphereMap[s.id] = newSphere.id;
      }

      // 5. Tasks (Recursive Restore)
      const taskMap: Record<string, string> = {};
      // Sort tasks by depth to ensure parents are created before children
      const sortedTasks = [...(personData.tasks || [])].sort((a, b) => a.depth - b.depth);
      
      for (const t of sortedTasks) {
        const newTask = await prisma.task.create({
          data: {
            personId,
            title: t.title,
            description: t.description,
            icon: t.icon,
            status: t.status,
            priority: t.priority,
            plannedDate: t.plannedDate,
            hasPlannedTime: t.hasPlannedTime,
            dueDate: t.dueDate,
            hasDueTime: t.hasDueTime,
            depth: t.depth,
            order: t.order,
            completedAt: t.completedAt,
            sphereId: t.sphereId ? sphereMap[t.sphereId] : null,
            parentId: t.parentId ? taskMap[t.parentId] : null,
          }
        });
        taskMap[t.id] = newTask.id;
      }

      // 6. Habits & Completions
      for (const h of personData.habits || []) {
        await prisma.habit.create({
          data: {
            personId,
            name: h.name,
            anchor: h.anchor,
            action: h.action,
            celebration: h.celebration,
            order: h.order,
            archived: h.archived,
            completions: {
              create: (h.completions || []).map((c: any) => ({
                date: c.date,
                createdAt: c.createdAt
              }))
            }
          }
        });
      }

      // 7. Daily Entries
      for (const e of personData.dailyEntries || []) {
        await prisma.dailyEntry.create({
          data: {
            personId,
            date: e.date,
            sleepBedtime: e.sleepBedtime,
            sleepWakeup: e.sleepWakeup,
            sleepHours: e.sleepHours,
            sleepQuality: e.sleepQuality,
            sleepNote: e.sleepNote,
            energy: e.energy,
            mood: e.mood,
            emotions: e.emotions,
            weight: e.weight,
            energyNote: e.energyNote,
            morningSunlight: e.morningSunlight,
            eveningEnergy: e.eveningEnergy,
            nutrition: e.nutrition,
            nutritionNote: e.nutritionNote,
            morningRoutine: e.morningRoutine,
            eveningRoutine: e.eveningRoutine,
            routineNote: e.routineNote,
            winToday: e.winToday,
            improveTomorrow: e.improveTomorrow,
            gratitude: e.gratitude,
            brainDump: e.brainDump,
          }
        });
      }

      // 8. Nutrition: Dishes & Ingredients
      const dishMap: Record<string, string> = {};
      for (const d of personData.dishes || []) {
        const newDish = await prisma.dish.create({
          data: {
            personId,
            name: d.name,
            description: d.description,
            priority: d.priority,
            yield: d.yield,
            ingredients: {
              create: (d.ingredients || []).map((ing: any) => ({
                productId: ing.productId, // Product IDs must match current global DB
                amount: ing.amount,
                unit: ing.unit,
              }))
            }
          }
        });
        dishMap[d.id] = newDish.id;
      }

      // 9. Week Plans & Day Plans
      for (const wp of personData.weekPlans || []) {
        await prisma.weekPlan.create({
          data: {
            personId,
            name: wp.name,
            startDate: wp.startDate,
            dayPlans: {
              create: (wp.dayPlans || []).map((dp: any) => ({
                personId,
                date: dp.date,
                adherence: dp.adherence,
                entries: {
                  create: (dp.entries || []).map((entry: any) => ({
                    dishId: dishMap[entry.dishId],
                    mealSlot: entry.mealSlot,
                    servings: entry.servings,
                    priority: entry.priority,
                  }))
                }
              }))
            }
          }
        });
      }

      // 10. Languages
      for (const ul of personData.userLanguages || []) {
        await prisma.userLanguage.create({
          data: {
            personId,
            languageId: ul.languageId,
            level: ul.level,
            totalXp: ul.totalXp,
            sphereProgress: {
              create: (ul.sphereProgress || []).map((sp: any) => ({
                sphere: sp.sphere,
                mastery: sp.mastery
              }))
            },
            vocabularyItems: {
              create: (ul.vocabularyItems || []).map((vi: any) => ({
                word: vi.word,
                translation: vi.translation,
                context: vi.context,
                notes: vi.notes,
                nextReview: vi.nextReview,
                interval: vi.interval,
                easeFactor: vi.easeFactor,
                repetition: vi.repetition,
              }))
            },
            immersionLogs: {
              create: (ul.immersionLogs || []).map((log: any) => ({
                sphere: log.sphere,
                duration: log.duration,
                note: log.note,
                date: log.date,
              }))
            }
          }
        });
      }

      // 11. Wishlist & Library
      for (const item of personData.wishlistItems || []) {
        await prisma.wishlistItem.create({
          data: {
            personId,
            name: item.name,
            description: item.description,
            url: item.url,
            imageUrl: item.imageUrl,
            price: item.price,
            currency: item.currency,
            priority: item.priority,
            status: item.status,
            category: item.category,
            tags: item.tags,
            necessity: item.necessity,
            store: item.store,
          }
        });
      }

      for (const item of personData.libraryItems || []) {
        await prisma.libraryItem.create({
          data: {
            personId,
            title: item.title,
            author: item.author,
            url: item.url,
            type: item.type,
            status: item.status,
            rating: item.rating,
            notes: item.notes,
          }
        });
      }
    }
  }
};
