import { unstable_cache } from "next/cache";
import { taskRepository } from "@/features/life/repositories/task.repository";
import { sphereRepository } from "@/features/life/repositories/sphere.repository";
import { habitRepository } from "@/features/life/repositories/habit.repository";
import { habitChainRepository } from "@/features/life/repositories/habit-chain.repository";
import { journalRepository } from "@/features/life/repositories/journal.repository";
import { exerciseRepository } from "@/features/health/training/repositories/exercise.repository";
import { trainingPlanRepository } from "@/features/health/training/repositories/training-plan.repository";
import { trainingSessionRepository } from "@/features/health/training/repositories/training-session.repository";

// ─── Tag Constants ────────────────────────────────────────────────────────────

export const cacheTags = {
  spheres: (userId: string) => `spheres:${userId}`,
  tasks: (userId: string) => `tasks:${userId}`,
  habits: (userId: string) => `habits:${userId}`,
  habitChains: (userId: string) => `habit-chains:${userId}`,
  dailyEntry: (userId: string, dateStr: string) => `daily-entry:${userId}:${dateStr}`,
  dailyEntries: (userId: string) => `daily-entries:${userId}`,
  exercises: (userId: string) => `exercises:${userId}`,
  trainingPlans: (userId: string) => `training-plans:${userId}`,
  trainingSessions: (userId: string) => `training-sessions:${userId}`,
};

// ─── Life Spheres ─────────────────────────────────────────────────────────────

export const getCachedSpheres = unstable_cache(
  (userId: string) => sphereRepository.findAll(userId),
  [],
  { tags: ["spheres"] },
);

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const getCachedAllTasks = unstable_cache(
  (userId: string) => taskRepository.findAll(userId),
  [],
  { tags: ["tasks"] },
);

export const getCachedCalendarTasks = unstable_cache(
  (userId: string) => taskRepository.findWithPlannedDate(userId),
  [],
  { tags: ["tasks-calendar"] },
);

export const getCachedTasksByDate = unstable_cache(
  (userId: string, dateISO: string) => {
    const start = new Date(dateISO);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateISO);
    end.setHours(23, 59, 59, 999);
    return taskRepository.findByDateRange(userId, start, end);
  },
  [],
  { tags: ["tasks-by-date"] },
);

// ─── Habits ───────────────────────────────────────────────────────────────────

export const getCachedActiveHabits = unstable_cache(
  (userId: string) => {
    const since = new Date(new Date().setDate(new Date().getDate() - 30));
    return habitRepository.findAll(userId, since);
  },
  [],
  { tags: ["habits"] },
);

// Wider completion window for the Review page (trends span ~8-12 weeks,
// vs. the 30-day window the habit tracker UI needs).
export const getCachedHabitsForReview = unstable_cache(
  (userId: string) => {
    const since = new Date(new Date().setDate(new Date().getDate() - 120));
    return habitRepository.findAll(userId, since);
  },
  [],
  { tags: ["habits-review"] },
);

export const getCachedActiveHabitChains = unstable_cache(
  (userId: string) => habitChainRepository.findAll(userId),
  [],
  { tags: ["habit-chains"] },
);

// ─── Journal / Daily Entries ──────────────────────────────────────────────────

export const getCachedDailyEntry = unstable_cache(
  (userId: string, dateISO: string) => journalRepository.findByDate(userId, new Date(dateISO)),
  [],
  { tags: ["daily-entry"] },
);

export const getCachedAllEntries = unstable_cache(
  (userId: string) => journalRepository.findAll(userId),
  [],
  { tags: ["daily-entries"] },
);

// ─── Training ─────────────────────────────────────────────────────────────────

export const getCachedExercises = unstable_cache(
  (userId: string) => exerciseRepository.findAll(userId),
  [],
  { tags: ["exercises"] },
);

export const getCachedTrainingPlans = unstable_cache(
  (userId: string) => trainingPlanRepository.findAll(userId),
  [],
  { tags: ["training-plans"] },
);

export const getCachedRecentSessions = unstable_cache(
  (userId: string) => trainingSessionRepository.findRecent(userId),
  [],
  { tags: ["training-sessions"] },
);

export const getCachedSession = unstable_cache(
  (userId: string, id: string) => trainingSessionRepository.findById(id),
  [],
  { tags: ["training-sessions"] },
);
