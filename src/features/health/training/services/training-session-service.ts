import { getCachedRecentSessions, getCachedSession } from "@/lib/cache/cache";
import { trainingSessionRepository } from "../repositories/training-session.repository";
import { trainingDayRepository } from "../repositories/training-day.repository";
import type { Prisma } from "@/app/generated/prisma";
import type { StartSessionInput, UpdateSetLogInput, CompleteSessionInput } from "../types";
import { setLogRepository } from "../repositories/set-log.repository";
import { prisma } from "@/lib/db/prisma";
import { buildWeeklyReportMarkdown } from "../utils/weekly-report";

export async function getRecentSessions(userId: string) {
  return getCachedRecentSessions(userId);
}

export async function getSession(userId: string, id: string) {
  const session = await getCachedSession(userId, id);
  if (!session || session.userId !== userId) throw new Error("Session not found or unauthorized");
  return session;
}

export async function startSession(userId: string, input: StartSessionInput) {
  const day = await trainingDayRepository.findById(input.dayId);
  if (!day || day.userId !== userId) throw new Error("Day not found or unauthorized");

  const setLogsData: Omit<Prisma.SetLogUncheckedCreateInput, "sessionId">[] = [];
  let order = 0;

  for (const dayExercise of day.exercises) {
    const setCount = dayExercise.sets || 1;
    for (let setNumber = 1; setNumber <= setCount; setNumber++) {
      setLogsData.push({
        userId,
        exerciseId: dayExercise.exerciseId,
        exerciseName: dayExercise.exercise.name,
        setNumber,
        reps: dayExercise.targetReps,
        weight: dayExercise.targetWeight,
        rpe: dayExercise.targetRpe,
        rir: dayExercise.targetRir,
        restSeconds: dayExercise.restSeconds,
        durationSeconds: dayExercise.targetDurationSeconds,
        distanceMeters: dayExercise.targetDistanceMeters,
        completed: false,
        order: order++,
      });
    }
  }

  return trainingSessionRepository.createWithLogs(
    { userId, dayId: day.id, dayName: day.name, status: "in_progress" },
    setLogsData,
  );
}

export async function updateSetLog(userId: string, input: UpdateSetLogInput) {
  const { id, ...data } = input;
  return setLogRepository.update(id, userId, data);
}

export async function completeSession(userId: string, input: CompleteSessionInput) {
  const { id, ...data } = input;
  return trainingSessionRepository.update(id, userId, { ...data, status: "completed" });
}

export async function updateSessionNotes(userId: string, id: string, notes: string | null) {
  return trainingSessionRepository.update(id, userId, { notes });
}

export async function deleteSession(userId: string, id: string) {
  return trainingSessionRepository.delete(id, userId);
}

export async function getWeeklyReport(userId: string) {
  const weekEnd = new Date();
  weekEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(weekEnd);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const sessions = await trainingSessionRepository.findInRange(userId, weekStart, weekEnd);

  const exerciseIds = Array.from(
    new Set(sessions.flatMap((s) => s.setLogs.map((l) => l.exerciseId))),
  );
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, muscleGroup: true },
  });
  const muscleGroupByExerciseId = new Map(exercises.map((e) => [e.id, e.muscleGroup]));

  return buildWeeklyReportMarkdown({ weekStart, weekEnd, sessions, muscleGroupByExerciseId });
}

export async function getPastLogsForSession(userId: string, sessionId: string) {
  const session = await trainingSessionRepository.findById(sessionId);
  if (!session || session.userId !== userId) return {};

  const exerciseIds = Array.from(new Set(session.setLogs.map((l) => l.exerciseId)));
  const pastLogs: Record<
    string,
    {
      reps: number | null;
      weight: number | null;
      rpe: number | null;
      rir: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
    }[]
  > = {};

  for (const exerciseId of exerciseIds) {
    const latestCompletedSessionWithExercise = await prisma.trainingSession.findFirst({
      where: {
        userId,
        status: "completed",
        date: {
          lt: session.date,
        },
        setLogs: {
          some: {
            exerciseId,
            completed: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      include: {
        setLogs: {
          where: {
            exerciseId,
            completed: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (latestCompletedSessionWithExercise) {
      pastLogs[exerciseId] = latestCompletedSessionWithExercise.setLogs.map((l) => ({
        reps: l.reps,
        weight: l.weight,
        rpe: l.rpe,
        rir: l.rir,
        durationSeconds: l.durationSeconds,
        distanceMeters: l.distanceMeters,
      }));
    }
  }

  return pastLogs;
}
