export function getStartOfDay(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeekStart(date: Date = new Date()): Date {
  const d = getStartOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getTime() + diff * 86400000);
}

const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const MAX_STREAK_LOOKBACK_MS = 3 * 365 * 86400000;

export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const WEEKDAY_LABELS: Record<number, string> = {
  0: "Нд",
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
};

export function isScheduledOnDate(scheduledWeekdays: number[], date: Date): boolean {
  return scheduledWeekdays.includes(date.getDay());
}

export function calculateStreak(
  completions: { date: Date }[],
  scheduledWeekdays: number[] = ALL_WEEKDAYS,
): number {
  if (completions.length === 0) return 0;

  const today = getStartOfDay();
  const completionDates = new Set(completions.map((c) => new Date(c.date).setHours(0, 0, 0, 0)));

  let checkDate = today;
  if (
    isScheduledOnDate(scheduledWeekdays, checkDate) &&
    !completionDates.has(checkDate.getTime())
  ) {
    checkDate = new Date(checkDate.getTime() - 86400000);
  }

  let streak = 0;
  while (today.getTime() - checkDate.getTime() <= MAX_STREAK_LOOKBACK_MS) {
    if (isScheduledOnDate(scheduledWeekdays, checkDate)) {
      if (completionDates.has(checkDate.getTime())) {
        streak++;
      } else {
        break;
      }
    }
    checkDate = new Date(checkDate.getTime() - 86400000);
  }
  return streak;
}

export function getThisWeekCount(completions: { date: Date }[]): number {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  return completions.filter((c) => {
    const d = getStartOfDay(new Date(c.date));
    return d >= weekStart && d < weekEnd;
  }).length;
}

export function getScheduledCountThisWeek(scheduledWeekdays: number[]): number {
  const weekStart = getWeekStart();
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart.getTime() + i * 86400000);
    if (isScheduledOnDate(scheduledWeekdays, day)) count++;
  }
  return count;
}
