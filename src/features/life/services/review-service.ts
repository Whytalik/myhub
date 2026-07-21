import { getCachedHabitsForReview } from "@/lib/cache/cache";
import { getAllEntries } from "./journal-service";
import { getAllTasks } from "./task-service";
import * as sprintService from "./sprint-service";
import { prisma } from "@/lib/db/prisma";
import type { ReviewEntryData, HabitData, TaskData } from "../types";

export interface ReviewData {
  entries: ReviewEntryData[];
  habits: HabitData[];
  tasks: TaskData[];
  activeSprint: any | null;
  sprintReviews: any[];
}

export async function getReviewData(userId: string): Promise<ReviewData> {
  const [entries, habits, tasks, dashboard, sprintReviews] = await Promise.all([
    getAllEntries(userId),
    getCachedHabitsForReview(userId),
    getAllTasks(userId),
    sprintService.getSprintDashboard(userId),
    prisma.sprintReview.findMany({
      where: {
        sprint: { userId },
      },
    }),
  ]);

  return {
    entries: entries as unknown as ReviewEntryData[],
    habits: habits as unknown as HabitData[],
    tasks,
    activeSprint: dashboard.sprint,
    sprintReviews,
  };
}
