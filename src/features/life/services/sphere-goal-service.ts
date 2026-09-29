import { sphereGoalRepository, type SphereGoalRow } from "../repositories/sphere-goal.repository";
import { sphereGoalSchema } from "../schemas";
import { MAX_GOALS_PER_SPHERE, type SphereGoalData, type UpsertSphereGoalInput } from "../types";

function getYearBounds(year: number) {
  return { from: new Date(Date.UTC(year, 0, 1)), to: new Date(Date.UTC(year + 1, 0, 1)) };
}

function getExpectedPercent(year: number): number | null {
  const { from, to } = getYearBounds(year);
  const now = Date.now();
  if (now < from.getTime() || now >= to.getTime()) return null;
  return ((now - from.getTime()) / (to.getTime() - from.getTime())) * 100;
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
    order: row.order,
    progressPercent: getProgressPercent(row.startValue, row.targetValue, currentValue),
    expectedPercent: getExpectedPercent(row.year),
  };
}

async function mapGoals(rows: SphereGoalRow[], year: number): Promise<SphereGoalData[]> {
  const { from, to } = getYearBounds(year);
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
