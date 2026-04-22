import { prisma } from "@/lib/prisma";
import { ROUTINE_ITEMS, type RoutineMap } from "@/lib/routine-items";
import type { UpsertDailyEntryInput, DailyStats, RecentEntry } from "../types";

function todayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function getTodayEntry(personId: string) {
  return prisma.dailyEntry.findUnique({
    where: { personId_date: { personId, date: todayDate() } },
  });
}

export async function getEntryByDate(personId: string, date: Date) {
  return prisma.dailyEntry.findUnique({
    where: { personId_date: { personId, date } },
  });
}

export async function upsertEntry(personId: string, input: UpsertDailyEntryInput) {
  const date = new Date(input.date);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { date: _date, ...data } = input;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = { ...data, personId };

  return prisma.dailyEntry.upsert({
    where: { personId_date: { personId, date } },
    create: { date, ...payload },
    update: payload,
  });
}

export async function deleteEntry(personId: string, id: string) {
  return prisma.dailyEntry.delete({
    where: { id },
  });
}

export async function getAllEntries(personId: string) {
  return prisma.dailyEntry.findMany({
    where: { personId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      energy: true,
      mood: true,
      weight: true,
      sleepHours: true,
      sleepQuality: true,
      nutrition: true,
      morningRoutine: true,
      eveningRoutine: true,
      winToday: true,
    },
  });
}

export async function getDailyStats(personId: string): Promise<DailyStats> {
  const entries = await prisma.dailyEntry.findMany({
    where: { personId },
    orderBy: { date: "desc" },
    take: 30,
    select: {
      date: true,
      energy: true,
      mood: true,
      sleepHours: true,
      morningRoutine: true,
      eveningRoutine: true,
    },
  });

  // Streak: consecutive days ending today
  const today = todayDate().getTime();
  let streak = 0;
  for (let i = 0; i < entries.length; i++) {
    const entryDay = entries[i].date.getTime();
    const expected = today - i * 86400000;
    if (entryDay === expected) {
      streak++;
    } else {
      break;
    }
  }

  const withSleep = entries.filter((e) => e.sleepHours !== null);
  const withEnergy = entries.filter((e) => e.energy !== null);
  const withMood = entries.filter((e) => e.mood !== null);

  const avgSleep =
    withSleep.length > 0
      ? withSleep.reduce((s, e) => s + e.sleepHours!, 0) / withSleep.length
      : null;

  const avgEnergy =
    withEnergy.length > 0
      ? withEnergy.reduce((s, e) => s + e.energy!, 0) / withEnergy.length
      : null;

  const avgMood =
    withMood.length > 0
      ? withMood.reduce((s, e) => s + e.mood!, 0) / withMood.length
      : null;

  const recentEntries: RecentEntry[] = entries.slice(0, 7).map((e) => {
    let routineScore: number | null = null;
    const morning = e.morningRoutine as RoutineMap | null;
    const evening = e.eveningRoutine as RoutineMap | null;
    
    if (morning || evening) {
      const total = ROUTINE_ITEMS.length;
      const done = ROUTINE_ITEMS.filter((item) => 
        (morning && morning[item.id]) || (evening && evening[item.id])
      ).length;
      routineScore = total > 0 ? Math.round((done / total) * 100) : null;
    }
    return {
      date: e.date,
      energy: e.energy,
      sleepHours: e.sleepHours,
      routineScore,
    };
  });

  return { streak, avgSleep, avgEnergy, avgMood, recentEntries };
}
