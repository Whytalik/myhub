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

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" });
}

interface WeeklySetLog {
  exerciseId: string;
  exerciseName: string;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  completed: boolean;
}

interface WeeklySession {
  date: Date;
  dayName: string;
  durationSeconds: number | null;
  notes: string | null;
  setLogs: WeeklySetLog[];
}

interface WeeklyReportInput {
  weekStart: Date;
  weekEnd: Date;
  sessions: WeeklySession[];
  muscleGroupByExerciseId: Map<string, string | null>;
}

export function buildWeeklyReportMarkdown(input: WeeklyReportInput): string {
  const lines: string[] = [];
  lines.push(`# Тижневий звіт: ${formatDate(input.weekStart)}–${formatDate(input.weekEnd)}`);
  lines.push("");
  lines.push(`## Сесії (${input.sessions.length})`);
  for (const session of input.sessions) {
    const total = session.setLogs.length;
    const done = session.setLogs.filter((l) => l.completed).length;
    const duration =
      session.durationSeconds != null ? formatDuration(session.durationSeconds) : "—";
    lines.push(
      `- ${formatDate(session.date)} — ${session.dayName}, ${duration}, ${done}/${total} підходів виконано`,
    );
  }

  const setsByExercise = new Map<
    string,
    { exerciseName: string; sets: { date: Date; log: WeeklySetLog }[] }
  >();
  for (const session of input.sessions) {
    for (const log of session.setLogs) {
      if (!log.completed) continue;
      if (!setsByExercise.has(log.exerciseId)) {
        setsByExercise.set(log.exerciseId, { exerciseName: log.exerciseName, sets: [] });
      }
      setsByExercise.get(log.exerciseId)!.sets.push({ date: session.date, log });
    }
  }

  if (setsByExercise.size > 0) {
    lines.push("");
    lines.push("## Вправи за тиждень");
    for (const { exerciseName, sets } of setsByExercise.values()) {
      lines.push(`### ${exerciseName}`);

      const setsByDate = new Map<string, { date: Date; log: WeeklySetLog }[]>();
      for (const set of sets) {
        const key = new Date(set.date).toDateString();
        if (!setsByDate.has(key)) setsByDate.set(key, []);
        setsByDate.get(key)!.push(set);
      }

      for (const dateSets of setsByDate.values()) {
        const dateLabel = formatDate(dateSets[0].date);
        const setsStr = dateSets
          .map(({ log }) => {
            const parts: string[] = [];
            if (log.reps != null) parts.push(`${log.reps}×${log.weight ?? "-"}кг`);
            if (log.durationSeconds != null) parts.push(`${log.durationSeconds}с`);
            if (log.distanceMeters != null) parts.push(`${log.distanceMeters}м`);
            if (log.rpe != null) parts.push(`RPE${log.rpe}`);
            return parts.join(" ");
          })
          .join(", ");
        lines.push(`- ${dateLabel}: ${setsStr}`);
      }
    }
  }

  const tonnageByGroup = new Map<string, number>();
  for (const session of input.sessions) {
    for (const log of session.setLogs) {
      if (!log.completed || log.reps == null || log.weight == null) continue;
      const group = input.muscleGroupByExerciseId.get(log.exerciseId) || "Інше";
      tonnageByGroup.set(group, (tonnageByGroup.get(group) ?? 0) + log.reps * log.weight);
    }
  }
  if (tonnageByGroup.size > 0) {
    lines.push("");
    lines.push("## Обсяг за м'язовими групами (сума вага × повторення)");
    for (const [group, tonnage] of [...tonnageByGroup.entries()].sort((a, b) => b[1] - a[1])) {
      lines.push(`- ${group}: ${Math.round(tonnage)} кг`);
    }
  }

  const notedSessions = input.sessions.filter((s) => s.notes?.trim());
  if (notedSessions.length > 0) {
    lines.push("");
    lines.push("## Нотатки сесій");
    for (const session of notedSessions) {
      lines.push(`- ${formatDate(session.date)}: ${session.notes!.trim()}`);
    }
  }

  return lines.join("\n");
}
