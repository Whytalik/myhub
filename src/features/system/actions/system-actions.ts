"use server";

import { systemService } from "../services/system-service";
import { revalidatePath } from "next/cache";
import { ActionResult, withAction } from "@/lib/action-utils";

export async function exportSystemAction(): Promise<ActionResult<unknown>> {
  return withAction(async (userId) => {
    return systemService.getFullExport(userId);
  });
}

export async function resetSystemAction(): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await systemService.resetSystem(userId);
    revalidatePath("/");
  });
}

export async function importSystemAction(): Promise<ActionResult<void>> {
  return withAction(async (userId) => {
    await systemService.importData(userId);
    revalidatePath("/");
  });
}
