import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma, LanguageSphere } from "@/app/generated/prisma";

// ─── Tag Constants ────────────────────────────────────────────────────────────

export const cacheTags = {
  user: (userId: string) => `user:${userId}`,
  spheres: (userId: string) => `spheres:${userId}`,
  tasks: (userId: string) => `tasks:${userId}`,
  habits: (userId: string) => `habits:${userId}`,
  sprint: (userId: string) => `sprint:${userId}`,
  dailyEntry: (userId: string, dateStr: string) => `daily-entry:${userId}:${dateStr}`,
  dailyEntries: (userId: string) => `daily-entries:${userId}`,
  vision: (userId: string) => `vision:${userId}`,
  alignment: (userId: string) => `alignment:${userId}`,
  profile: (userId: string) => `profile:${userId}`,
  systemStatus: (userId: string) => `system-status:${userId}`,
  dishes: () => `dishes`,
  dishesList: () => `dishes-list`,
  weekPlans: () => `week-plans`,
  dayPlans: () => `day-plans`,
  shoppingLists: () => `shopping-lists`,
  products: () => `products`,
  persons: () => `persons`,
  wishlist: (userId: string) => `wishlist:${userId}`,
  languages: (userId: string) => `languages:${userId}`,
  library: (userId: string) => `library:${userId}`,
};

// ─── User / Profile ───────────────────────────────────────────────────────────

export const getCachedUserProfile = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, emailVerified: true, image: true, systemStatus: true, privateTaskPasswordHash: true, createdAt: true, updatedAt: true },
    });
  },
  [],
  { tags: ["user-profile"] },
);

export const getCachedSystemStatus = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { systemStatus: true },
    });
  },
  [],
  { tags: ["system-status"] },
);

export const getCachedPrivateTaskPasswordHash = unstable_cache(
  async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { privateTaskPasswordHash: true },
    });
  },
  [],
  { tags: ["private-task-password"] },
);

// ─── Life Spheres ─────────────────────────────────────────────────────────────

export const getCachedSpheres = unstable_cache(
  async (userId: string) => {
    return prisma.lifeSphere.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: { _count: { select: { tasks: true } } },
    });
  },
  [],
  { tags: ["spheres"] },
);

// ─── Tasks ────────────────────────────────────────────────────────────────────

const TASK_INCLUDE = {
  sphere: true,
  project: { select: { id: true, title: true } },
  parent: { select: { id: true, title: true, icon: true } },
  children: {
    include: {
      sphere: true,
      project: { select: { id: true, title: true } },
      parent: { select: { id: true, title: true, icon: true } },
      children: {
        include: {
          sphere: true,
          project: { select: { id: true, title: true } },
          parent: { select: { id: true, title: true, icon: true } },
        },
      },
    },
  },
} as const satisfies Prisma.TaskInclude;

export const getCachedAllTasks = unstable_cache(
  async (userId: string) => {
    return prisma.task.findMany({
      where: { userId },
      include: TASK_INCLUDE,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
  },
  [],
  { tags: ["tasks"] },
);

export const getCachedCalendarTasks = unstable_cache(
  async (userId: string) => {
    return prisma.task.findMany({
      where: { userId, plannedDate: { not: null } },
      include: TASK_INCLUDE,
    });
  },
  [],
  { tags: ["tasks-calendar"] },
);

export const getCachedTasksByDate = unstable_cache(
  async (userId: string, dateISO: string) => {
    const start = new Date(dateISO);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateISO);
    end.setHours(23, 59, 59, 999);

    return prisma.task.findMany({
      where: {
        userId,
        OR: [
          { plannedDate: { gte: start, lte: end }, plannedEndDate: null },
          { plannedEndDate: { not: null, gte: start }, plannedDate: { lte: end } },
        ],
      },
      include: TASK_INCLUDE,
    });
  },
  [],
  { tags: ["tasks-by-date"] },
);

// ─── Habits ───────────────────────────────────────────────────────────────────

export const getCachedActiveHabits = unstable_cache(
  async (userId: string) => {
    return prisma.habit.findMany({
      where: { userId },
      orderBy: { order: "asc" },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
      },
    });
  },
  [],
  { tags: ["habits"] },
);

// ─── Sprints / Planning ──────────────────────────────────────────────────────

export const getCachedActiveSprint = unstable_cache(
  async (userId: string) => {
    return prisma.sprint.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        objectives: {
          include: {
            sphere: true,
            keyResults: {
              include: {
                tactics: { include: { completions: true } },
              },
            },
            projects: { include: { tasks: true } },
          },
        },
      },
    });
  },
  [],
  { tags: ["active-sprint"] },
);

export const getCachedAllSprints = unstable_cache(
  async (userId: string) => {
    return prisma.sprint.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { number: "desc" }],
      include: {
        objectives: {
          include: {
            sphere: true,
            keyResults: {
              include: {
                tactics: { include: { completions: true } },
              },
            },
            projects: { include: { tasks: true } },
          },
        },
      },
    });
  },
  [],
  { tags: ["all-sprints"] },
);

export const getCachedVision = unstable_cache(
  async (userId: string) => {
    return prisma.vision.findFirst({ where: { userId } });
  },
  [],
  { tags: ["vision"] },
);

export const getCachedAlignmentData = unstable_cache(
  async (userId: string) => {
    const [vision, spheres, activeSprint] = await Promise.all([
      prisma.vision.findFirst({ where: { userId } }),
      prisma.lifeSphere.findMany({
        where: { userId },
        orderBy: { order: "asc" },
        include: { _count: { select: { tasks: true } } },
      }),
      prisma.sprint.findFirst({
        where: { userId, status: "ACTIVE" },
        include: {
          objectives: {
            include: {
              sphere: true,
              keyResults: true,
              projects: { include: { tasks: true } },
            },
          },
        },
      }),
    ]);

    return { vision, spheres, activeSprint };
  },
  [],
  { tags: ["alignment"] },
);

// ─── Journal / Daily Entries ──────────────────────────────────────────────────

export const getCachedDailyEntry = unstable_cache(
  async (userId: string, dateISO: string) => {
    return prisma.dailyEntry.findUnique({
      where: { userId_date: { userId, date: new Date(dateISO) } },
    });
  },
  [],
  { tags: ["daily-entry"] },
);

export const getCachedAllEntries = unstable_cache(
  async (userId: string) => {
    return prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        energy: true,
        mood: true,
        weight: true,
        sleepHours: true,
        sleepQuality: true,
        nutrition: true,
        morningRoutine: true,
        eveningRoutine: true,
        winToday: true,
        recoveryRoutine: true,
        recoveryScore: true,
      },
    });
  },
  [],
  { tags: ["daily-entries"] },
);

export const getCachedRecentEntries = unstable_cache(
  async (userId: string, take: number) => {
    return prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take,
    });
  },
  [],
  { tags: ["recent-entries"] },
);

export const getCachedEntriesForStats = unstable_cache(
  async (userId: string) => {
    return prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
      select: { date: true, energy: true },
    });
  },
  [],
  { tags: ["entries-for-stats"] },
);

// ─── Annual Compass ───────────────────────────────────────────────────────────

export const getCachedAnnualCompass = unstable_cache(
  async (userId: string, year: number) => {
    return prisma.annualCompass.findUnique({
      where: { userId_year: { userId, year } },
    });
  },
  [],
  { tags: ["annual-compass"] },
);

// ─── Nutrition Domain ───────────────────────────────────────────────────────────

export const getCachedDishes = unstable_cache(
  async (userId: string) => {
    return prisma.dish.findMany({
      where: { userId },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
  },
  [],
  { tags: ["dishes"] },
);

export const getCachedDishById = unstable_cache(
  async (id: string) => {
    return prisma.dish.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            product: true,
            cookingMethod: true,
          },
        },
      },
    });
  },
  [],
  { tags: ["dishes"] },
);

export const getCachedDishList = unstable_cache(
  async (userId: string) => {
    return prisma.dish.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        servings: true,
        _count: { select: { ingredients: true } },
      },
      orderBy: { name: "asc" },
    });
  },
  [],
  { tags: ["dishes-list"] },
);

export const getCachedWeekPlans = unstable_cache(
  async (userId: string) => {
    return prisma.weekPlan.findMany({
      where: { userId },
      include: {
        dayPlans: {
          include: {
            mealSlots: {
              include: {
                person: true,
                dishEntries: {
                  include: {
                    dish: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  },
  [],
  { tags: ["week-plans"] },
);

export const getCachedDayPlans = unstable_cache(
  async (userId: string) => {
    return prisma.dayPlan.findMany({
      where: { userId },
      include: {
        mealSlots: {
          include: {
            person: true,
            dishEntries: {
              include: {
                dish: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
      orderBy: { dayOfWeek: "asc" },
    });
  },
  [],
  { tags: ["day-plans"] },
);

export const getCachedShoppingCarts = unstable_cache(
  async (userId: string) => {
    return prisma.shoppingCart.findMany({
      where: { weekPlan: { userId } },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        weekPlan: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  },
  [],
  { tags: ["shopping-lists"] },
);

export const getCachedProducts = unstable_cache(
  async (userId: string) => {
    return prisma.foodProduct.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },
  [],
  { tags: ["products"] },
);

export const getCachedPersons = unstable_cache(
  async (userId: string) => {
    return prisma.nutritionPerson.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },
  [],
  { tags: ["persons"] },
);

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const getCachedWishlistItems = unstable_cache(
  async (userId: string) => {
    return prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });
  },
  [],
  { tags: ["wishlist"] },
);

// ─── Languages ────────────────────────────────────────────────────────────────

export const getCachedUserLanguages = unstable_cache(
  async (userId: string) => {
    return prisma.userLanguage.findMany({
      where: { userId },
      include: { language: true },
    });
  },
  [],
  { tags: ["languages"] },
);

export const getCachedAllLanguageStats = unstable_cache(
  async (userId: string) => {
    const progress = await prisma.languageSphereProgress.findMany({
      where: {
        userLanguage: { userId },
      },
    });

    const grouped = new Map<string, typeof progress>();
    for (const p of progress) {
      if (!grouped.has(p.userLanguageId)) {
        grouped.set(p.userLanguageId, []);
      }
      grouped.get(p.userLanguageId)!.push(p);
    }

    const result: Record<string, { sphere: LanguageSphere; mastery: number }[]> = {};
    const allSpheres = Object.values(LanguageSphere);

    for (const [ulId, items] of grouped) {
      result[ulId] = allSpheres.map((sphere) => {
        const found = items.find((i) => i.sphere === sphere);
        return { sphere, mastery: found?.mastery || 0 };
      });
    }

    return result;
  },
  [],
  { tags: ["languages"] },
);

// ─── Library ──────────────────────────────────────────────────────────────────

export const getCachedLibraryCounts = unstable_cache(
  async (userId: string) => {
    const counts = await prisma.libraryItem.groupBy({
      by: ["type"],
      where: { userId },
      _count: { type: true },
    });

    const result: Record<string, number> = { BOOK: 0, ARTICLE: 0, VIDEO: 0, COURSE: 0 };
    for (const c of counts) {
      result[c.type] = c._count.type;
    }
    return result;
  },
  [],
  { tags: ["library"] },
);

export const getCachedCurrentlyReading = unstable_cache(
  async (userId: string) => {
    return prisma.libraryItem.findMany({
      where: { userId, status: "READING" },
      take: 3,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, author: true, type: true },
    });
  },
  [],
  { tags: ["library"] },
);
