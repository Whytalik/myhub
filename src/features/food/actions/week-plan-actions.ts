"use server";

import { revalidatePath } from "next/cache";
import * as weekPlanService from "../services/week-plan-service";
import { CreateWeekPlanInput } from "../types";
import { auth } from "@/auth";

export async function createWeekPlanAction(data: CreateWeekPlanInput) {
  const session = await auth();
  const personId = session?.user?.personId;
  if (!personId) throw new Error("Unauthorized");

  const plan = await weekPlanService.createWeekPlan(personId, data);
  revalidatePath("/food");
  return plan;
}

export async function deleteWeekPlanAction(id: string) {
  const session = await auth();
  const personId = session?.user?.personId;
  if (!personId) throw new Error("Unauthorized");

  await weekPlanService.deleteWeekPlan(personId, id);
  revalidatePath("/food");
}
