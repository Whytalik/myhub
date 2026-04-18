import { prisma } from "@/lib/prisma";
import { CreateWeekPlanInput } from "../types";

export async function getWeekPlans(personId: string) {
  return await prisma.weekPlan.findMany({
    where: { personId },
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

export async function createWeekPlan(personId: string, data: CreateWeekPlanInput) {
  return await prisma.weekPlan.create({
    data: {
      ...data,
      personId,
    },
  });
}

export async function deleteWeekPlan(personId: string, id: string) {
  return await prisma.weekPlan.delete({
    where: { id, personId },
  });
}
