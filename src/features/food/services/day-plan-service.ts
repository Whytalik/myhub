import { prisma } from "@/lib/prisma";
import { CreateDayPlanInput } from "../types";
import { PlanAdherence } from "@/app/generated/prisma";

export async function getDayPlans(userId: string, startDate?: Date, endDate?: Date) {
  return await prisma.dayPlan.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      entries: {
        include: {
          dish: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });
}

export async function createDayPlan(userId: string, data: CreateDayPlanInput) {
  const { entries, ...planData } = data;
  return await prisma.dayPlan.create({
    data: {
      ...planData,
      userId,
      entries: {
        create: entries.map((entry) => ({
          dishId: entry.dishId,
          mealSlot: entry.mealSlot,
          servings: entry.servings,
          priority: entry.priority,
        })),
      },
    },
    include: {
      entries: true,
    },
  });
}

export async function deleteDayPlan(userId: string, id: string) {
  return await prisma.dayPlan.delete({
    where: { id, userId },
  });
}

export async function updateDayPlanAdherence(userId: string, id: string, adherence: PlanAdherence) {
  return await prisma.dayPlan.update({
    where: { id, userId },
    data: { adherence },
  });
}
