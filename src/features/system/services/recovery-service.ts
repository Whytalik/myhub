import { prisma } from "@/lib/prisma";
import { getCachedSystemStatus, getCachedRecentEntries, getCachedDailyEntry } from "@/lib/cache";
import { SystemStatus } from "@/app/generated/prisma";
import { sphereSyncService } from "./sphere-sync-service";

export const recoveryService = {
  /**
   * Immediately activates the most critical crisis phase (Survival).
   */
  async activateCrisisMode(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { systemStatus: SystemStatus.CRISIS_SURVIVAL },
    });
  },

  /**
   * Manually resets the system to normal operating mode.
   */
  async deactivateCrisisMode(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { systemStatus: SystemStatus.STABLE },
    });
  },

  /**
   * Calculates and saves the recovery score for a specific day.
   * Score is based on the percentage of checked items in recoveryRoutine.
   */
  async evaluateDailyRecovery(userId: string, date: Date) {
    const entry = await getCachedDailyEntry(userId, date);

    if (!entry || !entry.recoveryRoutine) return 0;

    const routine = entry.recoveryRoutine as Record<string, boolean>;
    const items = Object.values(routine);
    if (items.length === 0) return 0;

    const completed = items.filter(Boolean).length;
    const score = (completed / items.length) * 100;

    await prisma.dailyEntry.update({
      where: { id: entry.id },
      data: { recoveryScore: score },
    });

    return score;
  },

  /**
   * Core logic for the "Recovery Ladder".
   * Checks recent performance and transitions the user between phases.
   */
  async processRecoveryTransition(userId: string) {
    const user = await getCachedSystemStatus(userId);

    if (!user || user.systemStatus === SystemStatus.STABLE) return null;

    const recentEntries = await getCachedRecentEntries(userId, 3);

    if (recentEntries.length === 0) return user.systemStatus;

    const todayScore = recentEntries[0].recoveryScore ?? 0;
    const scores = recentEntries.map(e => e.recoveryScore ?? 0);

    let newStatus: SystemStatus = user.systemStatus;

    switch (user.systemStatus) {
      case SystemStatus.CRISIS_SURVIVAL:
        // Phase 0 -> 1: 2 perfect days in a row
        if (scores.length >= 2 && scores[0] === 100 && scores[1] === 100) {
          newStatus = SystemStatus.CRISIS_STABILIZATION;
        }
        break;

      case SystemStatus.CRISIS_STABILIZATION:
        // Phase 1 -> 0: Fail today
        if (todayScore < 80) {
          newStatus = SystemStatus.CRISIS_SURVIVAL;
        } 
        // Phase 1 -> 2: 3 stable days in a row
        else if (scores.length >= 3 && scores.every(s => s >= 80)) {
          newStatus = SystemStatus.CRISIS_RE_ENTRY;
        }
        break;

      case SystemStatus.CRISIS_RE_ENTRY:
        // Phase 2 -> 1: Fail today
        if (todayScore < 80) {
          newStatus = SystemStatus.CRISIS_STABILIZATION;
        }
        // Phase 2 -> Stable: 3 stable days in a row
        else if (scores.length >= 3 && scores.every(s => s >= 80)) {
          newStatus = SystemStatus.STABLE;
        }
        break;
      default:
        break;
    }

    if (newStatus !== user.systemStatus) {
      await prisma.user.update({
        where: { id: userId },
        data: { systemStatus: newStatus },
      });
    }

    return newStatus;
  },

  /**
   * Consolidates the daily system evaluation.
   * Can be safely called from Server Components during render.
   */
  async runDailyCheck(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Evaluate yesterday's score
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    await this.evaluateDailyRecovery(userId, yesterday);

    // 2. Evaluate today's score
    await this.evaluateDailyRecovery(userId, today);

    // 3. Process transitions
    const newStatus = await this.processRecoveryTransition(userId);

    // 4. Sync spheres
    await sphereSyncService.syncUserSpheres(userId).catch(err => {
      console.error("Failed to sync spheres:", err);
    });

    return newStatus;
  },
};
