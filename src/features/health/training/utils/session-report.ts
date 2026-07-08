import type { SetLogData, TrainingSessionStatus } from "../types";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(hours.toString().padStart(2, "0"));
  parts.push(minutes.toString().padStart(2, "0"));
  parts.push(seconds.toString().padStart(2, "0"));

  return parts.join(":");
}

function groupByExercise(setLogs: SetLogData[]) {
  const result: { exerciseId: string; exerciseName: string; sets: SetLogData[] }[] = [];
  for (const log of setLogs) {
    const last = result[result.length - 1];
    if (last && last.exerciseId === log.exerciseId) {
      last.sets.push(log);
    } else {
      result.push({ exerciseId: log.exerciseId, exerciseName: log.exerciseName, sets: [log] });
    }
  }
  return result;
}

interface SessionReportInput {
  dayName: string;
  date: Date;
  durationSeconds: number;
  status: TrainingSessionStatus;
  setLogs: SetLogData[];
  notes: string;
}

export function buildSessionReportMarkdown(input: SessionReportInput): string {
  const dateStr = new Date(input.date).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const lines: string[] = [];
  lines.push(`# Тренування: ${input.dayName} — ${dateStr}`);
  lines.push(`Тривалість: ${formatDuration(input.durationSeconds)}`);
  lines.push(`Статус: ${input.status === "completed" ? "Завершено" : "В процесі"}`);
  lines.push("");
  lines.push("## Вправи");

  for (const group of groupByExercise(input.setLogs)) {
    lines.push("");
    lines.push(`### ${group.exerciseName}`);
    group.sets.forEach((set, index) => {
      const parts: string[] = [];
      if (set.reps != null) parts.push(`${set.reps} повт`);
      if (set.weight != null) parts.push(`${set.weight} кг`);
      if (set.durationSeconds != null) parts.push(`${set.durationSeconds} с`);
      if (set.distanceMeters != null) parts.push(`${set.distanceMeters} м`);
      if (set.rpe != null) parts.push(`RPE ${set.rpe}`);
      const status = set.completed ? "" : " (не виконано)";
      const notes = set.notes ? ` — ${set.notes}` : "";
      lines.push(`${index + 1}. ${parts.join(" × ") || "—"}${status}${notes}`);
    });
  }

  if (input.notes.trim()) {
    lines.push("");
    lines.push("## Загальні нотатки сесії");
    lines.push(input.notes.trim());
  }

  return lines.join("\n");
}
