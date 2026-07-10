import { getWeekStart, getStartOfDay } from "./habit-utils";
import { getMorningRoutine, EVENING_ROUTINE, type RoutineMap } from "@/lib/life/routine-items";
import { EMOTION_POLARITY } from "@/lib/life/emotion-taxonomy";
import type {
  ReviewEntryData,
  WeekRange,
  WeekSummary,
  EmotionBalance,
  MetricComparison,
  MetricDirection,
  Pattern,
  PatternStrength,
  WeeklyTrendPoint,
  HabitData,
  TaskData,
} from "../types";

const DAY_MS = 86400000;
const MIN_PATTERN_SAMPLE = 10;

export function getWeekRange(ref: Date = new Date()): WeekRange {
  const start = getWeekStart(ref);
  return { start, end: new Date(start.getTime() + 7 * DAY_MS) };
}

export function shiftWeek(range: WeekRange, deltaWeeks: number): WeekRange {
  const start = new Date(range.start.getTime() + deltaWeeks * 7 * DAY_MS);
  return { start, end: new Date(start.getTime() + 7 * DAY_MS) };
}

function isInRange(date: Date, range: WeekRange): boolean {
  const d = getStartOfDay(new Date(date));
  return d >= range.start && d < range.end;
}

export function filterToRange<T extends { date: Date }>(items: T[], range: WeekRange): T[] {
  return items.filter((item) => isInRange(item.date, range));
}

function average(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v !== null && v !== undefined);
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

function round1(value: number | null): number | null {
  return value === null ? null : Math.round(value * 10) / 10;
}

function itemsCompletionPct(map: unknown, items: readonly { id: string }[]): number | null {
  if (!map || items.length === 0) return null;
  const routineMap = map as RoutineMap;
  const done = items.filter((item) => routineMap[item.id]).length;
  return (done / items.length) * 100;
}

function genericMapCompletionPct(map: unknown): number | null {
  if (!map || typeof map !== "object") return null;
  const routineMap = map as RoutineMap;
  const keys = Object.keys(routineMap);
  if (keys.length === 0) return null;
  const done = keys.filter((key) => routineMap[key]).length;
  return (done / keys.length) * 100;
}

export function morningRoutinePct(
  entry: Pick<ReviewEntryData, "morningRoutine" | "date" | "trainingDayName">,
): number | null {
  const isTrainingDay = !!entry.trainingDayName;
  const items = getMorningRoutine(isTrainingDay);
  return itemsCompletionPct(entry.morningRoutine, items);
}

export function eveningRoutinePct(entry: Pick<ReviewEntryData, "eveningRoutine">): number | null {
  return itemsCompletionPct(entry.eveningRoutine, EVENING_ROUTINE);
}

export function recoveryRoutinePct(entry: Pick<ReviewEntryData, "recoveryRoutine">): number | null {
  return genericMapCompletionPct(entry.recoveryRoutine);
}

export function emotionBalance(entries: Pick<ReviewEntryData, "emotions">[]): EmotionBalance {
  const counts = new Map<string, number>();
  let positiveCount = 0;
  let negativeCount = 0;

  for (const entry of entries) {
    const labels = Array.isArray(entry.emotions) ? (entry.emotions as string[]) : [];
    for (const label of labels) {
      counts.set(label, (counts.get(label) ?? 0) + 1);
      const positive = EMOTION_POLARITY[label];
      if (positive === true) positiveCount++;
      else if (positive === false) negativeCount++;
    }
  }

  const top = [...counts.entries()]
    .map(([label, count]) => ({ label, count, positive: EMOTION_POLARITY[label] ?? true }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const total = positiveCount + negativeCount;
  return {
    positiveCount,
    negativeCount,
    ratio: total === 0 ? null : positiveCount / total,
    top,
  };
}

function activeHabits(habits: HabitData[]): HabitData[] {
  return habits.filter((h) => !h.archived);
}

export function habitsAdherencePct(habits: HabitData[], range: WeekRange): number | null {
  const active = activeHabits(habits);
  if (active.length === 0) return null;

  let completions = 0;
  let target = 0;
  for (const habit of active) {
    target += habit.scheduledWeekdays.length;
    completions += habit.completions.filter((c) => isInRange(c.date, range)).length;
  }
  if (target === 0) return null;
  return Math.min(100, (completions / target) * 100);
}

function dailyHabitAdherenceMap(habits: HabitData[]): Map<string, number> {
  const active = activeHabits(habits);
  const map = new Map<string, number>();
  if (active.length === 0) return map;

  const counts = new Map<string, number>();
  for (const habit of active) {
    for (const completion of habit.completions) {
      const key = getStartOfDay(new Date(completion.date)).toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  for (const [key, count] of counts) {
    map.set(key, (count / active.length) * 100);
  }
  return map;
}

function flattenTasks(tasks: TaskData[]): TaskData[] {
  const flat: TaskData[] = [];
  const walk = (list: TaskData[]) => {
    for (const task of list) {
      flat.push(task);
      if (task.children.length > 0) walk(task.children);
    }
  };
  walk(tasks);
  return flat;
}

export function summarizeWeek(
  allEntries: ReviewEntryData[],
  habits: HabitData[],
  tasks: TaskData[],
  range: WeekRange,
): WeekSummary {
  const entries = filterToRange(allEntries, range);
  const flatTasks = flattenTasks(tasks);

  const nutritionValues = entries.map((e) => e.nutrition).filter((v): v is number => v !== null);
  const nutritionAdherencePct =
    nutritionValues.length === 0
      ? null
      : (nutritionValues.filter((v) => v === 5).length / nutritionValues.length) * 100;

  return {
    range,
    daysLogged: entries.length,
    daysCompleted: entries.filter((e) => e.completedAt !== null).length,
    avgMood: round1(average(entries.map((e) => e.mood))),
    avgEnergy: round1(average(entries.map((e) => e.energy))),
    avgEveningEnergy: round1(average(entries.map((e) => e.eveningEnergy))),
    avgSleepHours: round1(average(entries.map((e) => e.sleepHours))),
    avgSleepQuality: round1(average(entries.map((e) => e.sleepQuality))),
    avgWeight: round1(average(entries.map((e) => e.weight))),
    avgRecoveryScore: round1(average(entries.map((e) => e.recoveryScore))),
    nutritionAdherencePct: round1(nutritionAdherencePct),
    morningRoutinePct: round1(average(entries.map(morningRoutinePct))),
    eveningRoutinePct: round1(average(entries.map(eveningRoutinePct))),
    recoveryRoutinePct: round1(average(entries.map(recoveryRoutinePct))),
    habitsAdherencePct: round1(habitsAdherencePct(habits, range)),
    tasksCompleted: flatTasks.filter((t) => t.completedAt && isInRange(t.completedAt, range))
      .length,
    tasksCarriedOver: flatTasks.filter(
      (t) => t.carriedFromDate && isInRange(t.carriedFromDate, range),
    ).length,
    frogsCompleted: flatTasks.filter(
      (t) => t.isFrog && t.completedAt && isInRange(t.completedAt, range),
    ).length,
    emotionBalance: emotionBalance(entries),
    wins: entries.map((e) => e.winToday).filter((v): v is string => !!v),
    gratitudeNotes: entries.map((e) => e.gratitude).filter((v): v is string => !!v),
    improvements: entries.map((e) => e.improveTomorrow).filter((v): v is string => !!v),
  };
}

type NumericWeekMetricKey =
  | "avgMood"
  | "avgEnergy"
  | "avgSleepHours"
  | "avgSleepQuality"
  | "morningRoutinePct"
  | "eveningRoutinePct"
  | "nutritionAdherencePct"
  | "habitsAdherencePct";

const COMPARABLE_METRICS: { key: NumericWeekMetricKey; label: string; unit?: string }[] = [
  { key: "avgMood", label: "Mood", unit: "/10" },
  { key: "avgEnergy", label: "Energy", unit: "/10" },
  { key: "avgSleepHours", label: "Sleep", unit: "h" },
  { key: "avgSleepQuality", label: "Sleep quality", unit: "/10" },
  { key: "morningRoutinePct", label: "Morning routine", unit: "%" },
  { key: "eveningRoutinePct", label: "Evening routine", unit: "%" },
  { key: "nutritionAdherencePct", label: "Nutrition adherence", unit: "%" },
  { key: "habitsAdherencePct", label: "Habit adherence", unit: "%" },
];

function directionOf(delta: number | null): MetricDirection {
  if (delta === null) return "unknown";
  if (Math.abs(delta) < 0.05) return "flat";
  return delta > 0 ? "up" : "down";
}

export function compareWeeks(current: WeekSummary, previous: WeekSummary): MetricComparison[] {
  return COMPARABLE_METRICS.map(({ key, label, unit }) => {
    const currentValue = current[key];
    const previousValue = previous[key];
    const delta =
      currentValue !== null && previousValue !== null ? round1(currentValue - previousValue) : null;
    return {
      key,
      label,
      unit,
      current: currentValue,
      previous: previousValue,
      delta,
      direction: directionOf(delta),
    };
  });
}

export function weeklyTrend(
  allEntries: ReviewEntryData[],
  selector: (entry: ReviewEntryData) => number | null,
  latestWeekStart: Date,
  weeksCount: number,
): WeeklyTrendPoint[] {
  const points: WeeklyTrendPoint[] = [];
  for (let i = weeksCount - 1; i >= 0; i--) {
    const start = new Date(latestWeekStart.getTime() - i * 7 * DAY_MS);
    const range: WeekRange = { start, end: new Date(start.getTime() + 7 * DAY_MS) };
    const entries = filterToRange(allEntries, range);
    points.push({ weekStart: start, value: round1(average(entries.map(selector))) });
  }
  return points;
}

export function pearson(pairs: [number, number][]): number | null {
  const n = pairs.length;
  if (n < 2) return null;

  const meanX = pairs.reduce((s, [x]) => s + x, 0) / n;
  const meanY = pairs.reduce((s, [, y]) => s + y, 0) / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (const [x, y] of pairs) {
    const dx = x - meanX;
    const dy = y - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
  }
  if (varX === 0 || varY === 0) return null;
  return cov / Math.sqrt(varX * varY);
}

function strengthOf(r: number): PatternStrength {
  const abs = Math.abs(r);
  if (abs >= 0.6) return "strong";
  if (abs >= 0.3) return "moderate";
  return "weak";
}

interface CandidateMetric {
  key: string;
  label: string;
  get: (entry: ReviewEntryData, habitAdherence: Map<string, number>) => number | null;
}

const NUTRITION_SCORE: Record<number, number> = { 5: 100, 3: 50, 1: 0 };

const METRICS: CandidateMetric[] = [
  { key: "mood", label: "mood", get: (e) => e.mood },
  { key: "energy", label: "energy", get: (e) => e.energy },
  { key: "eveningEnergy", label: "evening energy", get: (e) => e.eveningEnergy },
  { key: "sleepHours", label: "sleep hours", get: (e) => e.sleepHours },
  { key: "sleepQuality", label: "sleep quality", get: (e) => e.sleepQuality },
  {
    key: "nutrition",
    label: "nutrition adherence",
    get: (e) => (e.nutrition !== null ? (NUTRITION_SCORE[e.nutrition] ?? null) : null),
  },
  { key: "morningRoutine", label: "morning routine", get: (e) => morningRoutinePct(e) },
  { key: "eveningRoutine", label: "evening routine", get: (e) => eveningRoutinePct(e) },
  {
    key: "habitAdherence",
    label: "habit adherence",
    get: (e, habitAdherence) =>
      habitAdherence.get(getStartOfDay(new Date(e.date)).toISOString().slice(0, 10)) ?? null,
  },
];

const CANDIDATE_PAIRS: [string, string][] = [
  ["mood", "sleepQuality"],
  ["mood", "sleepHours"],
  ["mood", "morningRoutine"],
  ["energy", "sleepHours"],
  ["energy", "nutrition"],
  ["mood", "eveningRoutine"],
  ["mood", "habitAdherence"],
  ["eveningEnergy", "mood"],
];

function metricByKey(key: string): CandidateMetric {
  const metric = METRICS.find((m) => m.key === key);
  if (!metric) throw new Error(`Unknown review metric: ${key}`);
  return metric;
}

export function extractPatterns(
  entries: ReviewEntryData[],
  habits: HabitData[],
  minSample: number = MIN_PATTERN_SAMPLE,
): Pattern[] {
  const habitAdherence = dailyHabitAdherenceMap(habits);

  const patterns: Pattern[] = [];
  for (const [keyA, keyB] of CANDIDATE_PAIRS) {
    const metricA = metricByKey(keyA);
    const metricB = metricByKey(keyB);

    const pairs: [number, number][] = [];
    for (const entry of entries) {
      const a = metricA.get(entry, habitAdherence);
      const b = metricB.get(entry, habitAdherence);
      if (a !== null && b !== null) pairs.push([a, b]);
    }

    if (pairs.length < minSample) continue;
    const r = pearson(pairs);
    if (r === null) continue;

    const strength = strengthOf(r);
    const direction = r >= 0 ? "tends to rise with" : "tends to fall as";
    patterns.push({
      id: `${keyA}-${keyB}`,
      labelA: metricA.label,
      labelB: metricB.label,
      r: Math.round(r * 100) / 100,
      n: pairs.length,
      strength,
      description: `Your ${metricA.label} ${direction} ${metricB.label} (${strength} pattern, ${pairs.length} days).`,
    });
  }

  return patterns.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}
