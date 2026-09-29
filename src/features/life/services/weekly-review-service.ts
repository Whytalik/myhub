import {
  addDays,
  differenceInCalendarWeeks,
  endOfWeek,
  startOfDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { Prisma } from "@/app/generated/prisma";
import {
  weeklyReviewRepository,
  type WeeklyReviewTaskRow,
} from "../repositories/weekly-review.repository";
import {
  type MissedReason,
  type SaveWeeklyReviewInput,
  type WeeklyReviewAtom,
  type WeeklyReviewData,
  type WeeklyReviewExtras,
  type WeeklyReviewSettings,
} from "../types";
import * as goalPlaybookService from "./goal-playbook-service";
import * as sphereGoalService from "./sphere-goal-service";
import * as sprintService from "./sprint-service";
import * as yearFocusService from "./year-focus-service";

const WEEK_OPTIONS = { weekStartsOn: 1 } as const;
const INBOX_STATUS_NAMES = ["inbox", "інбокс", "беклог", "backlog", "вхідні"];
const MISSED_REASONS: MissedReason[] = [
  "NO_TIME",
  "RESISTANCE",
  "UNCLEAR",
  "BLOCKED",
  "NOT_IMPORTANT",
];

function mapAtom(row: WeeklyReviewTaskRow): WeeklyReviewAtom {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    plannedDate: row.plannedDate?.toISOString() ?? null,
    hasPlannedTime: row.hasPlannedTime,
    plannedEndDate: row.plannedEndDate?.toISOString() ?? null,
    sphereId: row.sphereId,
    projectId: row.projectId,
    projectTitle: row.project?.title ?? null,
    carryOverReason: row.carryOverReason,
  };
}

function average(values: (number | null)[]): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (present.length === 0) return null;
  return Math.round((present.reduce((sum, value) => sum + value, 0) / present.length) * 10) / 10;
}

export function readPriorities(value: unknown): string[] {
  return readExtras(value).priorities;
}

function readExtras(value: unknown): WeeklyReviewExtras {
  const raw = (value ?? {}) as Partial<WeeklyReviewExtras>;
  const missedReasons: Record<string, MissedReason> = {};
  for (const [taskId, reason] of Object.entries(raw.missedReasons ?? {})) {
    if (MISSED_REASONS.includes(reason as MissedReason))
      missedReasons[taskId] = reason as MissedReason;
  }
  return {
    executionPercent: typeof raw.executionPercent === "number" ? raw.executionPercent : null,
    missedReasons,
    priorities: Array.isArray(raw.priorities)
      ? raw.priorities.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function getWeekNumber(sprintStart: Date, date: Date): number {
  const firstWeek = startOfWeek(new Date(sprintStart), WEEK_OPTIONS);
  return differenceInCalendarWeeks(date, firstWeek, WEEK_OPTIONS) + 1;
}

function resolveWeekStart(weekStart?: string): Date {
  return startOfWeek(weekStart ? new Date(weekStart) : new Date(), WEEK_OPTIONS);
}

export async function getWeeklyReviewData(
  userId: string,
  weekStartParam?: string,
): Promise<WeeklyReviewData> {
  const sprint = await sprintService.getActiveSprint(userId);
  const weekStart = resolveWeekStart(weekStartParam);
  const weekEnd = endOfWeek(weekStart, WEEK_OPTIONS);
  const nextWeekStart = addDays(weekStart, 7);
  const nextWeekEnd = endOfWeek(nextWeekStart, WEEK_OPTIONS);
  const weekNumber = getWeekNumber(sprint.startDate, weekStart);
  const year = sprint.year;

  const [
    planned,
    overdueRows,
    nextWeekRows,
    entries,
    reviews,
    settings,
    focus,
    goals,
    allGoals,
    focusSummary,
    inboxCount,
  ] = await Promise.all([
    weeklyReviewRepository.findPlannedAtoms(userId, weekStart, weekEnd),
    weeklyReviewRepository.findOverdueAtoms(userId, weekStart),
    weeklyReviewRepository.findSprintAtomsForRange(userId, sprint.id, nextWeekStart, nextWeekEnd),
    weeklyReviewRepository.findJournalEntries(userId, weekStart, weekEnd),
    weeklyReviewRepository.findReviews(sprint.id),
    weeklyReviewRepository.findUserSettings(userId),
    yearFocusService.getFocus(userId, year),
    sphereGoalService.getSprintGoalProgress(userId, sprint),
    sphereGoalService.getGoalsForYear(userId, year),
    goalPlaybookService.getFocusSummary(userId),
    weeklyReviewRepository.countInboxThoughts(userId, INBOX_STATUS_NAMES),
  ]);

  const doneCount = planned.filter((task) => task.status === "DONE").length;
  const sphereIds = [...new Set(planned.map((task) => task.sphereId))];
  const focusAtoms = focus ? planned.filter((task) => task.sphereId === focus.sphereId) : [];

  const reviewRow = reviews.find((review) => review.weekNumber === weekNumber);
  const previousRow = reviews.find((review) => review.weekNumber === weekNumber - 1);
  const reviewedWeeks = new Set(
    reviews.filter((review) => review.score !== null).map((review) => review.weekNumber),
  );
  let streak = 0;
  let cursor = reviewedWeeks.has(weekNumber) ? weekNumber : weekNumber - 1;
  while (cursor >= 1 && reviewedWeeks.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return {
    sprint: { id: sprint.id, number: sprint.number },
    weekNumber,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    nextWeekStart: nextWeekStart.toISOString(),
    execution: {
      planned: planned.length,
      done: doneCount,
      percent: planned.length > 0 ? Math.round((doneCount / planned.length) * 100) : null,
      bySphere: sphereIds.map((sphereId) => {
        const inSphere = planned.filter((task) => task.sphereId === sphereId);
        return {
          sphereId,
          planned: inSphere.length,
          done: inSphere.filter((task) => task.status === "DONE").length,
        };
      }),
      focusSphereId: focus?.sphereId ?? null,
      focusPlanned: focusAtoms.length,
      focusDone: focusAtoms.filter((task) => task.status === "DONE").length,
    },
    missed: planned.filter((task) => task.status !== "DONE").map(mapAtom),
    overdue: overdueRows.map(mapAtom),
    goals,
    manualGoals: allGoals.filter((goal) => !goal.isAutoTracked),
    leverGoal: focusSummary?.leverGoal ?? null,
    pedalTask: focusSummary?.pedalTask ?? null,
    identity: focus?.identity
      ? {
          statement: focus.identity,
          votesWeek: await yearFocusService.countVotes(
            userId,
            focus.sphereId,
            weekStart,
            addDays(weekEnd, 1),
          ),
          votesTotal: focusSummary?.votes?.total ?? 0,
        }
      : null,
    journal: {
      entries: entries.map((entry) => ({
        date: entry.date.toISOString().slice(0, 10),
        winToday: entry.winToday,
        improveTomorrow: entry.improveTomorrow,
        frictionToday: entry.frictionToday,
        gratitude: entry.gratitude,
      })),
      avgEnergy: average(entries.map((entry) => entry.energy)),
      avgMood: average(entries.map((entry) => entry.mood)),
      avgSleepHours: average(entries.map((entry) => entry.sleepHours)),
      entryCount: entries.length,
    },
    inboxCount,
    nextWeekAtoms: nextWeekRows.map(mapAtom),
    dailyBudget: settings?.dailyResistanceBudget ?? 8,
    review: reviewRow
      ? {
          score: reviewRow.score,
          wins: reviewRow.wins ?? "",
          challenges: reviewRow.challenges ?? "",
          adjustments: reviewRow.adjustments ?? "",
          extras: readExtras(reviewRow.kaizenVector),
        }
      : null,
    previousKaizen: previousRow?.adjustments ?? null,
    streak,
    history: reviews.map((review) => ({
      weekNumber: review.weekNumber,
      score: review.score,
      executionPercent: readExtras(review.kaizenVector).executionPercent,
    })),
  };
}

export async function saveWeeklyReview(
  userId: string,
  input: SaveWeeklyReviewInput,
): Promise<void> {
  if (!Number.isInteger(input.score) || input.score < 1 || input.score > 10) {
    throw new Error("Score must be between 1 and 10");
  }
  const sprint = await sprintService.getActiveSprint(userId);
  const weekStart = resolveWeekStart(input.weekStart);
  const weekNumber = getWeekNumber(sprint.startDate, weekStart);
  if (weekNumber < 1) throw new Error("This week is before the sprint started");

  const extras: WeeklyReviewExtras = {
    executionPercent: input.extras.executionPercent,
    missedReasons: input.extras.missedReasons,
    priorities: input.extras.priorities
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3),
  };
  await sprintService.saveSprintReview(userId, sprint.id, weekNumber, weekStart, {
    score: input.score,
    wins: input.wins.trim(),
    challenges: input.challenges.trim(),
    adjustments: input.adjustments.trim(),
    kaizenVector: extras as unknown as Prisma.InputJsonValue,
  });
}

export async function getSettings(userId: string): Promise<WeeklyReviewSettings> {
  const settings = await weeklyReviewRepository.findUserSettings(userId);
  return { day: settings?.weeklyReviewDay ?? 0, time: settings?.weeklyReviewTime ?? "20:00" };
}

export async function saveSettings(userId: string, input: WeeklyReviewSettings): Promise<void> {
  if (!Number.isInteger(input.day) || input.day < 0 || input.day > 6)
    throw new Error("Invalid day");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) throw new Error("Invalid time");
  await weeklyReviewRepository.updateSettings(userId, {
    weeklyReviewDay: input.day,
    weeklyReviewTime: input.time,
  });
}

// The review is due once the scheduled moment of a week has passed and that week has
// no saved review. The scheduled moment belongs to the Monday-Sunday week containing it.
export async function getReviewDueState(
  userId: string,
): Promise<{ isDue: boolean; weekStart: string; settings: WeeklyReviewSettings }> {
  const [settings, sprint] = await Promise.all([
    getSettings(userId),
    sprintService.getActiveSprint(userId),
  ]);
  const now = new Date();
  const [hours, minutes] = settings.time.split(":").map(Number);

  const occurrence = startOfDay(now);
  occurrence.setDate(occurrence.getDate() - ((occurrence.getDay() - settings.day + 7) % 7));
  occurrence.setHours(hours, minutes, 0, 0);
  if (occurrence > now) occurrence.setDate(occurrence.getDate() - 7);

  const weekStart = startOfWeek(occurrence, WEEK_OPTIONS);
  const weekNumber = getWeekNumber(sprint.startDate, weekStart);
  const reviews = await weeklyReviewRepository.findReviews(sprint.id);
  const isReviewed = reviews.some(
    (review) => review.weekNumber === weekNumber && review.score !== null,
  );

  return {
    isDue: weekNumber >= 1 && !isReviewed && subWeeks(now, 2) < weekStart,
    weekStart: weekStart.toISOString(),
    settings,
  };
}
