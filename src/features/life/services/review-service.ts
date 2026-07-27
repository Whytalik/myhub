import { getCachedHabitsForReview } from "@/lib/cache/cache";
import { getAllEntries } from "./journal-service";
import { getAllTasks } from "./task-service";
import * as sprintService from "./sprint-service";
import { prisma } from "@/lib/db/prisma";
import type { ReviewEntryData, HabitData, TaskData } from "../types";
import type { DailyVector } from "../types";

interface SprintReviewData {
  id: string;
  sprintId: string;
  weekNumber: number;
  date: Date;
  score: number | null;
  wins: string | null;
  challenges: string | null;
  adjustments: string | null;
  kaizenVector: DailyVector | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewData {
  entries: ReviewEntryData[];
  habits: HabitData[];
  tasks: TaskData[];
  activeSprint: {
    id: string;
    number: number;
    year: number;
    startDate: Date;
    endDate: Date;
    status: string;
  } | null;
  sprintReviews: SprintReviewData[];
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
    sprintReviews: sprintReviews as unknown as SprintReviewData[],
  };
}
