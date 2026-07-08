import { prisma } from "@/lib/db/prisma";
import { trainingSessionRepository } from "../repositories/training-session.repository";
import {
  computeWeeklyAdherence,
  computeE1rmSeries,
  computeRpeSeries,
  computeMuscleGroupTonnage,
} from "../utils/stats";

const WEEKS_OF_HISTORY = 12;

export async function getTrainingStats(userId: string) {
  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - WEEKS_OF_HISTORY * 7);
  rangeStart.setHours(0, 0, 0, 0);

  const sessionsInRange = await trainingSessionRepository.findInRange(userId, rangeStart, now);
  const completedSessions = sessionsInRange.filter((s) => s.status === "completed");

  const exerciseIds = Array.from(
    new Set(completedSessions.flatMap((s) => s.setLogs.map((l) => l.exerciseId))),
  );
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, muscleGroup: true, trackingType: true },
  });
  const muscleGroupByExerciseId = new Map(exercises.map((e) => [e.id, e.muscleGroup]));
  const trackingTypeByExerciseId = new Map(exercises.map((e) => [e.id, e.trackingType]));

  const weeklyTonnageSince = new Date(now);
  weeklyTonnageSince.setDate(weeklyTonnageSince.getDate() - 6);
  weeklyTonnageSince.setHours(0, 0, 0, 0);

  return {
    weeks: computeWeeklyAdherence(completedSessions, WEEKS_OF_HISTORY, now),
    e1rmSeries: computeE1rmSeries(completedSessions, trackingTypeByExerciseId),
    rpeSeries: computeRpeSeries(completedSessions),
    muscleGroupTonnage: computeMuscleGroupTonnage(
      completedSessions,
      muscleGroupByExerciseId,
      weeklyTonnageSince,
    ),
  };
}

export type TrainingStatsData = Awaited<ReturnType<typeof getTrainingStats>>;
