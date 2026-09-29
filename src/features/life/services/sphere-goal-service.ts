import { sphereGoalRepository, type SphereGoalRow } from "../repositories/sphere-goal.repository";
import { sphereGoalSchema } from "../schemas";
import {
  MAX_GOALS_PER_SPHERE,
  type SphereGoalData,
  type SprintGoalProgress,
  type UpsertSphereGoalInput,
} from "../types";

function getYearBounds(year: number) {
  return { from: new Date(Date.UTC(year, 0, 1)), to: new Date(Date.UTC(year + 1, 0, 1)) };
}

// Share of the goal's period that has passed. A goal with a deadline is measured from
// when it was set (never before the start of its year) to that deadline.
function getExpectedPercent(year: number, deadline: Date | null, createdAt: Date): number | null {
  const yearBounds = getYearBounds(year);
  const from = deadline
    ? Math.max(createdAt.getTime(), yearBounds.from.getTime())
    : yearBounds.from.getTime();
  const to = deadline ? deadline.getTime() : yearBounds.to.getTime();
  const now = Date.now();
  if (to <= from || now < from || now >= to) return null;
  return ((now - from) / (to - from)) * 100;
}

function getProgressPercent(start: number, target: number, current: number): number {
  if (target === start) return 0;
  const ratio = (current - start) / (target - start);
  return Math.max(0, Math.min(100, ratio * 100));
}

function mapGoal(row: SphereGoalRow, completionsByHabit: Map<string, number>): SphereGoalData {
  const isAutoTracked = row.habitId !== null && row.type !== "VALUE";
  const currentValue = isAutoTracked
    ? (completionsByHabit.get(row.habitId as string) ?? 0)
    : row.currentValue;

  return {
    id: row.id,
    sphereId: row.sphereId,
    year: row.year,
    title: row.title,
    type: row.type,
    unit: row.unit,
    startValue: row.startValue,
    targetValue: row.targetValue,
    currentValue,
    isAutoTracked,
    habitId: row.habitId,
    habitName: row.habit?.name ?? null,
    deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : null,
    createdAt: row.createdAt.toISOString(),
    order: row.order,
    progressPercent: getProgressPercent(row.startValue, row.targetValue, currentValue),
    expectedPercent: getExpectedPercent(row.year, row.deadline, row.createdAt),
  };
}

async function mapGoals(rows: SphereGoalRow[], year: number): Promise<SphereGoalData[]> {
  // Habit days are counted from the earliest goal year to the latest year or deadline.
  const firstYear = Math.min(year, ...rows.map((row) => row.year));
  const lastMoment = Math.max(
    getYearBounds(year).to.getTime(),
    ...rows.map((row) => (row.deadline ? row.deadline.getTime() + 24 * 60 * 60 * 1000 : 0)),
  );
  const from = getYearBounds(firstYear).from;
  const to = new Date(lastMoment);
  const habitIds = [...new Set(rows.flatMap((row) => (row.habitId ? [row.habitId] : [])))];
  const completions = await sphereGoalRepository.countHabitCompletions(habitIds, from, to);
  return rows.map((row) => mapGoal(row, completions));
}

export async function getGoalsForYear(userId: string, year: number): Promise<SphereGoalData[]> {
  return mapGoals(await sphereGoalRepository.findByYear(userId, year), year);
}

export async function upsertGoal(
  userId: string,
  input: UpsertSphereGoalInput,
): Promise<SphereGoalData> {
  const existing = input.id ? await sphereGoalRepository.findById(input.id, userId) : null;
  if (input.id && !existing) throw new Error("Goal not found");

  const merged = {
    title: input.title ?? existing?.title ?? "",
    type: input.type ?? existing?.type ?? "COUNTER",
    unit: input.unit !== undefined ? (input.unit ?? undefined) : (existing?.unit ?? undefined),
    startValue: input.startValue ?? existing?.startValue ?? 0,
    targetValue: input.targetValue ?? existing?.targetValue ?? 0,
    habitId: input.habitId !== undefined ? input.habitId : (existing?.habitId ?? null),
    deadline:
      input.deadline !== undefined
        ? input.deadline
        : (existing?.deadline?.toISOString().slice(0, 10) ?? null),
  };
  const parsed = sphereGoalSchema.safeParse(merged);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const goal = parsed.data;

  if (goal.habitId && !(await sphereGoalRepository.findHabitForUser(goal.habitId, userId))) {
    throw new Error("Habit not found");
  }

  const startValue = goal.type === "VALUE" ? (goal.startValue ?? 0) : 0;
  const data = {
    title: goal.title,
    type: goal.type,
    unit: goal.unit?.trim() || null,
    startValue,
    targetValue: goal.targetValue,
    habitId: goal.habitId ?? null,
    deadline: goal.deadline ? new Date(goal.deadline) : null,
  };

  if (existing) {
    const saved = await sphereGoalRepository.update(existing.id, userId, {
      ...data,
      // Changing the start of a manual value goal shouldn't leave a stale current value.
      ...(goal.type === "VALUE" && existing.currentValue === existing.startValue
        ? { currentValue: startValue }
        : {}),
    });
    return (await mapGoals([saved], saved.year))[0];
  }

  if (!input.sphereId) throw new Error("Sphere is required");
  const year = input.year ?? new Date().getFullYear();
  if (!(await sphereGoalRepository.findSphereForUser(input.sphereId, userId))) {
    throw new Error("Sphere not found");
  }
  const count = await sphereGoalRepository.countInSphere(userId, input.sphereId, year);
  if (count >= MAX_GOALS_PER_SPHERE) {
    throw new Error(`A sphere can have at most ${MAX_GOALS_PER_SPHERE} goals per year`);
  }

  const saved = await sphereGoalRepository.create({
    userId,
    sphereId: input.sphereId,
    year,
    order: count,
    currentValue: startValue,
    ...data,
  });
  // A goal added mid-sprint gets its sprint slice right away, so the baseline is exact.
  const activeSprint = await sphereGoalRepository.findActiveSprint(userId);
  if (activeSprint) await ensureSprintSlices(userId, activeSprint);
  return (await mapGoals([saved], year))[0];
}

export async function setGoalValue(
  userId: string,
  id: string,
  value: number,
): Promise<SphereGoalData> {
  if (!Number.isFinite(value)) throw new Error("Invalid value");
  const existing = await sphereGoalRepository.findById(id, userId);
  if (!existing) throw new Error("Goal not found");
  if (existing.habitId && existing.type !== "VALUE") {
    throw new Error("This goal is tracked by a habit");
  }
  const saved = await sphereGoalRepository.update(id, userId, { currentValue: value });
  return (await mapGoals([saved], saved.year))[0];
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  await sphereGoalRepository.delete(id, userId);
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The end of a goal's period: its deadline (inclusive) or the end of its year.
function getGoalEnd(goal: SphereGoalData): Date {
  return goal.deadline
    ? new Date(new Date(goal.deadline).getTime() + MS_PER_DAY)
    : getYearBounds(goal.year).to;
}

// The sprint's share of a goal is proportional to the time the sprint covers out
// of the time the goal still has, from when it started counting in this sprint.
function getDefaultSliceTarget(
  goal: SphereGoalData,
  windowStart: Date,
  sprintEnd: Date,
  baseline: number,
): number {
  const goalEnd = getGoalEnd(goal).getTime();
  const total = Math.max(goalEnd - windowStart.getTime(), MS_PER_DAY);
  const window = Math.min(sprintEnd.getTime(), goalEnd) - windowStart.getTime();
  const share = Math.max(0, Math.min(1, window / total));
  const target = (goal.targetValue - baseline) * share;
  return goal.type === "VALUE" ? target : Math.max(0, Math.round(target * 10) / 10);
}

type SprintRef = { id: string; startDate: Date; endDate: Date; year: number };

// Creates a slice for every yearly goal that doesn't have one in this sprint yet.
// Called when a sprint starts and when a goal is added. Habit-tracked goals get an
// exact baseline (completions before the slice's start); manual goals get their
// current value. Idempotent.
export async function ensureSprintSlices(userId: string, sprint: SprintRef): Promise<void> {
  const [goals, slices] = await Promise.all([
    getGoalsForYear(userId, sprint.year),
    sphereGoalRepository.findSlices(sprint.id),
  ]);
  const sliced = new Set(slices.map((slice) => slice.goalId));
  const missing = goals.filter((goal) => !sliced.has(goal.id));
  if (missing.length === 0) return;

  const rows = await Promise.all(
    missing.map(async (goal) => {
      const windowStart = new Date(
        Math.max(new Date(sprint.startDate).getTime(), new Date(goal.createdAt).getTime()),
      );
      let baseline = goal.currentValue;
      if (goal.isAutoTracked && goal.habitId) {
        const counted = await sphereGoalRepository.countHabitCompletions(
          [goal.habitId],
          getYearBounds(goal.year).from,
          windowStart,
        );
        baseline = counted.get(goal.habitId) ?? 0;
      }
      return {
        goalId: goal.id,
        sprintId: sprint.id,
        targetValue: getDefaultSliceTarget(goal, windowStart, new Date(sprint.endDate), baseline),
        baselineValue: baseline,
      };
    }),
  );
  await sphereGoalRepository.createSlices(rows);
}

export async function getSprintGoalProgress(
  userId: string,
  sprint: SprintRef,
): Promise<SprintGoalProgress[]> {
  await ensureSprintSlices(userId, sprint);
  const [goals, slices] = await Promise.all([
    getGoalsForYear(userId, sprint.year),
    sphereGoalRepository.findSlices(sprint.id),
  ]);
  const sliceByGoal = new Map(slices.map((slice) => [slice.goalId, slice]));
  const weeksLeft = (new Date(sprint.endDate).getTime() - Date.now()) / MS_PER_WEEK;

  return goals.flatMap((goal) => {
    const slice = sliceByGoal.get(goal.id);
    if (!slice) return [];

    const sprintValue = goal.currentValue - slice.baselineValue;
    const leftInSlice = slice.targetValue - sprintValue;
    return [
      {
        sliceId: slice.id,
        goalId: goal.id,
        sphereId: goal.sphereId,
        title: goal.title,
        type: goal.type,
        unit: goal.unit,
        sprintTarget: slice.targetValue,
        sprintValue,
        sprintPercent:
          slice.targetValue === 0
            ? goal.progressPercent >= 100
              ? 100
              : 0
            : Math.max(0, Math.min(100, (sprintValue / slice.targetValue) * 100)),
        perWeekNeeded:
          weeksLeft <= 0
            ? null
            : Math.round((Math.max(0, leftInSlice) / Math.max(weeksLeft, 1)) * 10) / 10,
        yearlyCurrent: goal.currentValue,
        yearlyTarget: goal.targetValue,
        yearlyPercent: goal.progressPercent,
      },
    ];
  });
}

export async function setSliceTarget(
  userId: string,
  sliceId: string,
  targetValue: number,
): Promise<void> {
  if (!Number.isFinite(targetValue)) throw new Error("Invalid value");
  if (!(await sphereGoalRepository.findSliceForUser(sliceId, userId))) {
    throw new Error("Slice not found");
  }
  await sphereGoalRepository.updateSliceTarget(sliceId, targetValue);
}
