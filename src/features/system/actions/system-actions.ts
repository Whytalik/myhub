"use server";

import { auth } from "@/auth";
import { systemService } from "../services/system-service";
import { revalidatePath } from "next/cache";

export async function exportSystemAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const data = await systemService.getFullExport(session.user.id);
    return { success: true, data };
  } catch (error) {
    console.error("Export failed:", error);
    return { success: false, error: "Failed to export system state" };
  }
}

export async function resetSystemAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await systemService.resetSystem(session.user.id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Reset failed:", error);
    return { success: false, error: "Failed to reset system" };
  }
}

export async function importSystemAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await systemService.importData(session.user.id, data);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Import failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to import data" };
  }
}
