import type { TrainingDayData, TrainingDayExerciseData } from "../types";

export function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

export function formatPrescription(de: TrainingDayExerciseData): string {
  const isTimeBased =
    de.exercise.trackingType === "duration" || de.exercise.trackingType === "cardio";
  if (isTimeBased) {
    const parts: string[] = [];
    if (de.targetDurationSeconds) parts.push(`${de.targetDurationSeconds}s`);
    if (de.targetDistanceMeters) parts.push(`${de.targetDistanceMeters}m`);
    return `${de.sets} × ${parts.join(" / ") || "—"}`;
  }
  const reps = de.targetReps ? `${de.targetReps}` : "—";
  const weight = de.targetWeight ? ` @ ${de.targetWeight}kg` : "";
  return `${de.sets} × ${reps}${weight}`;
}

export function calculateWeeklyVolume(days: TrainingDayData[]) {
  const hypertrophyMap: Record<string, number> = {};
  const otherMap: Record<string, number> = {};
  for (const day of days) {
    for (const de of day.exercises) {
      if (!de.exercise) continue;
      // weight_reps/bodyweight = sets dosed near failure (MEV/MAV/MRV domain).
      // duration/cardio = mobility, stability, and cardio work, dosed by
      // frequency and time, not sets — mixing them under one "Оптимально/
      // Підтримка" threshold misapplies the hypertrophy dose-response model.
      const isHypertrophy =
        de.exercise.trackingType === "weight_reps" || de.exercise.trackingType === "bodyweight";
      const targetMap = isHypertrophy ? hypertrophyMap : otherMap;
      const muscle = de.exercise.muscleGroup || "Інше";
      const muscles = muscle.split(/[\/,]|\s+та\s+/).map((m) => m.trim());
      for (const m of muscles) {
        if (m) {
          targetMap[m] = (targetMap[m] || 0) + de.sets;
        }
      }
    }
  }
  const toSorted = (map: Record<string, number>) =>
    Object.entries(map)
      .map(([muscle, sets]) => ({ muscle, sets }))
      .sort((a, b) => b.sets - a.sets);
  return { hypertrophy: toSorted(hypertrophyMap), other: toSorted(otherMap) };
}

export function getVolumeStatus(sets: number) {
  if (sets < 6) {
    return {
      label: "Підтримка",
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      barColor: "bg-amber-500",
      description:
        "1-5 підходів: об'єм підтримки (MV). Мало для росту, але добре для підтримки або відновлення.",
    };
  } else if (sets <= 20) {
    return {
      label: "Оптимально",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      barColor: "bg-emerald-500",
      description:
        "6-20 підходів: оптимальна зона для гіпертрофії (MEV/MAV). Найкращий баланс росту та відновлення.",
    };
  } else {
    return {
      label: "Надмірно",
      colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      barColor: "bg-rose-500",
      description:
        "20+ підходів: перевищує об'єм відновлення (MRV). Високий ризик перетренованості та накопичення втоми.",
    };
  }
}
