import { prisma } from "@/lib/prisma";
import { SystemStatus } from "@/app/generated/prisma";

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
    const entry = await prisma.dailyEntry.findUnique({
      where: { userId_date: { userId, date } },
    });

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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { systemStatus: true },
    });

    if (!user || user.systemStatus === SystemStatus.STABLE) return null;

    // Fetch the 3 most recent entries to evaluate streaks
    const recentEntries = await prisma.dailyEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 3,
    });

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
};
