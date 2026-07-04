export function getStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getTime() + diff * 86400000);
}

export function calculateStreak(
  completions: { date: Date }[],
  targetDaysPerWeek: number = 7,
): number {
  if (completions.length === 0) return 0;

  if (targetDaysPerWeek >= 7) {

    const today = getStartOfDay();
    const completionDates = new Set(completions.map(c => new Date(c.date).setHours(0, 0, 0, 0)));
    let streak = 0;
    let checkDate = today;
    if (!completionDates.has(checkDate.getTime())) {
      checkDate = new Date(today.getTime() - 86400000);
    }
    while (completionDates.has(checkDate.getTime())) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    }
    return streak;
  }

  const ONE_WEEK_MS = 7 * 86400000;

  const weekCounts = new Map<number, number>();
  for (const c of completions) {
    const key = getWeekStart(new Date(c.date)).getTime();
    weekCounts.set(key, (weekCounts.get(key) ?? 0) + 1);
  }

  let checkWeek = getWeekStart().getTime();

  if ((weekCounts.get(checkWeek) ?? 0) < targetDaysPerWeek) {
    checkWeek -= ONE_WEEK_MS;
  }

  let streak = 0;
  while ((weekCounts.get(checkWeek) ?? 0) >= targetDaysPerWeek) {
    streak++;
    checkWeek -= ONE_WEEK_MS;
  }
  return streak;
}

export function getThisWeekCount(completions: { date: Date }[]): number {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  return completions.filter(c => {
    const d = getStartOfDay(new Date(c.date));
    return d >= weekStart && d < weekEnd;
  }).length;
}
