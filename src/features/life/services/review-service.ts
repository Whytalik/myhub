import { getCachedHabitsForReview } from "@/lib/cache";
import { getAllEntries } from "./journal-service";
import { getAllTasks } from "./task-service";
import type { ReviewEntryData, HabitData, TaskData } from "../types";

export interface ReviewData {
  entries: ReviewEntryData[];
  habits: HabitData[];
  tasks: TaskData[];
}

/** Read-only: fans out to existing cached reads, no new writes/actions. */
export async function getReviewData(userId: string): Promise<ReviewData> {
  const [entries, habits, tasks] = await Promise.all([
    getAllEntries(userId),
    getCachedHabitsForReview(userId),
    getAllTasks(userId),
  ]);

  return {
    entries: entries as unknown as ReviewEntryData[],
    habits: habits as unknown as HabitData[],
    tasks,
  };
}
