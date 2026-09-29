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

// --- Monthly and quarterly recurrence -------------------------------------------------
// MONTHLY: due on the last <weekday> of the month. QUARTERLY: due on <weekday> of the
// week (Monday to Sunday) that contains the last day of the quarter.

type Recurrence = "WEEKLY" | "MONTHLY" | "QUARTERLY";

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const back = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - back);
}

function weekdayInWeekOf(date: Date, weekday: number): Date {
  const monday = getWeekStart(date);
  const offset = (weekday + 6) % 7;
  return new Date(monday.getTime() + offset * 86400000);
}

function quarterEndWeekDate(year: number, quarter: number, weekday: number): Date {
  return weekdayInWeekOf(new Date(year, quarter * 3 + 3, 0), weekday);
}

export function getDueDates(
  recurrence: Recurrence,
  scheduledWeekdays: number[],
  around: Date = new Date(),
): Date[] {
  const weekday = scheduledWeekdays[0] ?? 6;
  const year = around.getFullYear();
  if (recurrence === "MONTHLY") {
    return [-1, 0, 1].map((shift) => {
      const base = new Date(year, around.getMonth() + shift, 1);
      return lastWeekdayOfMonth(base.getFullYear(), base.getMonth(), weekday);
    });
  }
  if (recurrence === "QUARTERLY") {
    const quarter = Math.floor(around.getMonth() / 3);
    return [-1, 0, 1].map((shift) => {
      const index = quarter + shift;
      return quarterEndWeekDate(year + Math.floor(index / 4), ((index % 4) + 4) % 4, weekday);
    });
  }
  return [];
}

export function isHabitDueOnDate(
  recurrence: Recurrence,
  scheduledWeekdays: number[],
  date: Date,
): boolean {
  if (recurrence === "WEEKLY") return isScheduledOnDate(scheduledWeekdays, date);
  const day = getStartOfDay(date).getTime();
  return getDueDates(recurrence, scheduledWeekdays, date).some((due) => due.getTime() === day);
}

// The next due date on or after today (used for the card label).
export function getNextDueDate(
  recurrence: Recurrence,
  scheduledWeekdays: number[],
  from: Date = new Date(),
): Date | null {
  if (recurrence === "WEEKLY") return null;
  const today = getStartOfDay(from).getTime();
  const candidates = [from, new Date(from.getFullYear(), from.getMonth() + 3, 1)].flatMap((date) =>
    getDueDates(recurrence, scheduledWeekdays, date),
  );
  const next = candidates.filter((due) => due.getTime() >= today).sort((a, b) => +a - +b)[0];
  return next ?? null;
}

// Consecutive periods (months or quarters) with at least one completion. A period
// still in progress does not break the streak. Quarterly completions are shifted back
// six days so a completion on the first days of the next quarter counts for the one
// that just ended.
function periodKey(recurrence: Recurrence, date: Date): number {
  if (recurrence === "MONTHLY") return date.getFullYear() * 12 + date.getMonth();
  const shifted = new Date(date.getTime() - 6 * 86400000);
  return shifted.getFullYear() * 4 + Math.floor(shifted.getMonth() / 3);
}

export function calculatePeriodStreak(
  completions: { date: Date }[],
  recurrence: Recurrence,
  today: Date = new Date(),
): number {
  if (recurrence === "WEEKLY" || completions.length === 0) return 0;
  const done = new Set(
    completions.map((completion) => periodKey(recurrence, new Date(completion.date))),
  );
  let key = periodKey(recurrence, today);
  if (!done.has(key)) key -= 1;
  let streak = 0;
  while (done.has(key)) {
    streak += 1;
    key -= 1;
  }
  return streak;
}
