import { prisma } from "@/lib/prisma";
import { CreateWeekPlanInput } from "../types";

export async function getWeekPlans(userId: string) {
  return await prisma.weekPlan.findMany({
    where: { userId },
    include: {
      dayPlans: {
        include: {
          entries: {
            include: {
              dish: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

export async function createWeekPlan(userId: string, data: CreateWeekPlanInput) {
  return await prisma.weekPlan.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function deleteWeekPlan(userId: string, id: string) {
  return await prisma.weekPlan.delete({
    where: { id, userId },
  });
}
