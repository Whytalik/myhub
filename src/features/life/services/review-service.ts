import { getCachedHabitsForReview } from "@/lib/cache/cache";
import { getAllEntries } from "./journal-service";
import { getAllTasks } from "./task-service";
import { prisma } from "@/lib/db/prisma";
import type { ReviewEntryData, HabitData, TaskData } from "../types";

export interface ReviewData {
  entries: ReviewEntryData[];
  habits: HabitData[];
  tasks: TaskData[];
  activeSprint: any | null;
}

export async function getReviewData(userId: string): Promise<ReviewData> {
  const [entries, habits, tasks, activeSprint] = await Promise.all([
    getAllEntries(userId),
    getCachedHabitsForReview(userId),
    getAllTasks(userId),
    prisma.sprint.findFirst({ where: { userId, status: "ACTIVE" } }),
  ]);

  return {
    entries: entries as unknown as ReviewEntryData[],
    habits: habits as unknown as HabitData[],
    tasks,
    activeSprint,
  };
}
