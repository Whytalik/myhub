interface StatsSetLog {
  exerciseId: string;
  exerciseName: string;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  rir: number | null;
  completed: boolean;
}

interface StatsSession {
  date: Date;
  setLogs: StatsSetLog[];
}

export interface WeekBucket {
  weekStart: Date;
  weekEnd: Date;
  sessionsCount: number;
}

export function computeWeeklyAdherence(
  sessions: StatsSession[],
  weeksCount: number,
  referenceDate: Date,
): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  const end = new Date(referenceDate);
  end.setHours(23, 59, 59, 999);

  for (let i = weeksCount - 1; i >= 0; i--) {
    const weekEnd = new Date(end);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const sessionsCount = sessions.filter((s) => s.date >= weekStart && s.date <= weekEnd).length;
    buckets.push({ weekStart, weekEnd, sessionsCount });
  }

  return buckets;
}

function epley1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

export interface E1rmSeries {
  exerciseId: string;
  exerciseName: string;
  points: { date: Date; e1rm: number }[];
}

export function computeE1rmSeries(
  sessions: StatsSession[],
  trackingTypeByExerciseId: Map<string, string>,
): E1rmSeries[] {
  const byExercise = new Map<
    string,
    { exerciseName: string; points: { date: Date; e1rm: number }[] }
  >();

  for (const session of sessions) {
    const bestByExercise = new Map<string, number>();
    const nameByExercise = new Map<string, string>();

    for (const log of session.setLogs) {
      if (!log.completed || log.reps == null || log.weight == null) continue;
      if (log.weight <= 0 || log.reps <= 0) continue;
      if (trackingTypeByExerciseId.get(log.exerciseId) !== "weight_reps") continue;

      const e1rm = epley1RM(log.weight, log.reps);
      const current = bestByExercise.get(log.exerciseId) ?? 0;
      if (e1rm > current) bestByExercise.set(log.exerciseId, e1rm);
      nameByExercise.set(log.exerciseId, log.exerciseName);
    }

    for (const [exerciseId, e1rm] of bestByExercise) {
      if (!byExercise.has(exerciseId)) {
        byExercise.set(exerciseId, { exerciseName: nameByExercise.get(exerciseId)!, points: [] });
      }
      byExercise
        .get(exerciseId)!
        .points.push({ date: session.date, e1rm: Math.round(e1rm * 10) / 10 });
    }
  }

  return Array.from(byExercise.entries())
    .map(([exerciseId, data]) => ({
      exerciseId,
      exerciseName: data.exerciseName,
      points: data.points,
    }))
    .filter((series) => series.points.length >= 2);
}

export function computeRpeSeries(sessions: StatsSession[]): { date: Date; avgRpe: number }[] {
  const points: { date: Date; avgRpe: number }[] = [];

  for (const session of sessions) {
    const rpes = session.setLogs.filter((l) => l.completed && l.rpe != null).map((l) => l.rpe!);
    if (rpes.length === 0) continue;

    const avg = rpes.reduce((a, b) => a + b, 0) / rpes.length;
    points.push({ date: session.date, avgRpe: Math.round(avg * 10) / 10 });
  }

  return points;
}

export function computeRirSeries(sessions: StatsSession[]): { date: Date; avgRir: number }[] {
  const points: { date: Date; avgRir: number }[] = [];

  for (const session of sessions) {
    const rirs = session.setLogs.filter((l) => l.completed && l.rir != null).map((l) => l.rir!);
    if (rirs.length === 0) continue;

    const avg = rirs.reduce((a, b) => a + b, 0) / rirs.length;
    points.push({ date: session.date, avgRir: Math.round(avg * 10) / 10 });
  }

  return points;
}

export interface MuscleGroupTonnage {
  muscleGroup: string;
  tonnage: number;
}

export function computeMuscleGroupTonnage(
  sessions: StatsSession[],
  muscleGroupByExerciseId: Map<string, string | null>,
  since: Date,
): MuscleGroupTonnage[] {
  const tonnageByGroup = new Map<string, number>();

  for (const session of sessions) {
    if (session.date < since) continue;
    for (const log of session.setLogs) {
      if (!log.completed || log.reps == null || log.weight == null) continue;
      const group = muscleGroupByExerciseId.get(log.exerciseId) || "Інше";
      tonnageByGroup.set(group, (tonnageByGroup.get(group) ?? 0) + log.reps * log.weight);
    }
  }

  return Array.from(tonnageByGroup.entries())
    .map(([muscleGroup, tonnage]) => ({ muscleGroup, tonnage: Math.round(tonnage) }))
    .sort((a, b) => b.tonnage - a.tonnage);
}
