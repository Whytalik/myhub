"use server";

import { auth } from "@/auth";
import { recoveryService } from "../services/recovery-service";
import { invalidateRecoveryCache, invalidateUserCache } from "@/lib/revalidate";
import { SystemStatus } from "@/app/generated/prisma";

export async function triggerSOSAction() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) {
    console.error("SOS trigger attempt without valid session/userId");
    throw new Error("Unauthorized");
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.error(`SOS trigger failed: User ${userId} not found in database`);
      return { success: false, error: "User profile not found. Please log in again." };
    }

    await recoveryService.activateCrisisMode(userId);
    invalidateRecoveryCache(userId);
    invalidateUserCache(userId);
    return { success: true };
  } catch (error) {
    console.error(`SOS trigger failed for user ${userId}:`, error);
    return { success: false, error: "Failed to activate Crisis Mode" };
  }
}

export async function exitCrisisModeAction() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    console.error("Exit Crisis Mode attempt without valid session/userId");
    throw new Error("Unauthorized");
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!userExists) {
      console.error(`Exit Crisis Mode failed: User ${userId} not found in database`);
      return { success: false, error: "User profile not found. Please log in again." };
    }

    await recoveryService.deactivateCrisisMode(userId);
    invalidateRecoveryCache(userId);
    invalidateUserCache(userId);
    return { success: true };
  } catch (error) {
    console.error(`Manual exit failed for user ${userId}:`, error);
    return { success: false, error: "Failed to exit Crisis Mode" };
  }
}

export async function runDailySystemCheckAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const newStatus = await recoveryService.runDailyCheck(session.user.id);
    invalidateRecoveryCache(session.user.id);
    return { success: true, status: newStatus };
  } catch (error) {
    console.error("System check failed:", error);
    return { success: false, error: "Failed to run system check" };
  }
}

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

    await recoveryService.evaluateDailyRecovery(userId, today);
    await recoveryService.processRecoveryTransition(userId);

    invalidateRecoveryCache(userId, today);
    return { success: true };
  } catch (error) {
    console.error("Routine update failed:", error);
    return { success: false, error: "Failed to update recovery routine" };
  }
}

export async function updateSystemStatusAction(status: SystemStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.user.update({
      where: { id: session.user.id },
      data: { systemStatus: status },
    });
    
    invalidateRecoveryCache(session.user.id);
    invalidateUserCache(session.user.id);
    return { success: true };
  } catch (error) {
    console.error("Status update failed:", error);
    return { success: false, error: "Failed to update system status" };
  }
}
