"use server";

import { revalidatePath } from "next/cache";
import * as dayPlanService from "../services/day-plan-service";
import { CreateDayPlanInput } from "../types";
import { PlanAdherence } from "@/app/generated/prisma";
import { auth } from "@/auth";

export async function createDayPlanAction(data: CreateDayPlanInput) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const plan = await dayPlanService.createDayPlan(userId, data);
  revalidatePath("/food");
  return plan;
}

export async function deleteDayPlanAction(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await dayPlanService.deleteDayPlan(userId, id);
  revalidatePath("/food");
}

export async function updateDayPlanAdherenceAction(id: string, adherence: PlanAdherence) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  await dayPlanService.updateDayPlanAdherence(userId, id, adherence);
  revalidatePath("/food");
}
