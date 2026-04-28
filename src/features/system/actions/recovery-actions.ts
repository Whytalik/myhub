"use server";

import { auth } from "@/auth";
import { recoveryService } from "../services/recovery-service";
import { revalidatePath } from "next/cache";
import { SystemStatus } from "@/app/generated/prisma";

/**
 * Activates Crisis Mode immediately.
 */
export async function triggerSOSAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await recoveryService.activateCrisisMode(session.user.id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("SOS trigger failed:", error);
    return { success: false, error: "Failed to activate Crisis Mode" };
  }
}

/**
 * Manually exits Crisis Mode.
 */
export async function exitCrisisModeAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await recoveryService.deactivateCrisisMode(session.user.id);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Manual exit failed:", error);
    return { success: false, error: "Failed to exit Crisis Mode" };
  }
}

/**
 * Runs the daily system evaluation. 
 * Usually called on the first load of the day or after a routine update.
 */
export async function runDailySystemCheckAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Evaluate yesterday's score first
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    await recoveryService.evaluateDailyRecovery(userId, yesterday);

    // 2. Evaluate today's score (up to now)
    await recoveryService.evaluateDailyRecovery(userId, today);

    // 3. Process transitions
    const newStatus = await recoveryService.processRecoveryTransition(userId);
    
    revalidatePath("/");
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("System check failed:", error);
    return { success: false, error: "Failed to run system check" };
  }
}

/**
 * Updates the recovery routine for the current day.
 */
export async function updateRecoveryRoutineAction(routine: Record<string, boolean>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { prisma } = await import("@/lib/prisma");
    
    await prisma.dailyEntry.upsert({
      where: { userId_date: { userId, date: today } },
      update: { recoveryRoutine: routine },
      create: { 
        userId, 
        date: today,
        recoveryRoutine: routine
      },
    });

    // Re-evaluate score immediately
    await recoveryService.evaluateDailyRecovery(userId, today);
    
    // Check if we should move up/down
    await recoveryService.processRecoveryTransition(userId);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Routine update failed:", error);
    return { success: false, error: "Failed to update recovery routine" };
  }
}

/**
 * Manually sets the system status (phase).
 */
export async function updateSystemStatusAction(status: SystemStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { id: session.user.id },
      data: { systemStatus: status },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Status update failed:", error);
    return { success: false, error: "Failed to update system status" };
  }
}
