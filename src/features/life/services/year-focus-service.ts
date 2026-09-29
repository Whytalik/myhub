import { yearFocusRepository } from "../repositories/year-focus.repository";
import { addDays, startOfDay, startOfWeek } from "date-fns";
import type { IdentityVotes, SetYearFocusInput, YearFocusData } from "../types";

function mapFocus(row: {
  id: string;
  year: number;
  sphereId: string;
  identity: string | null;
  leverGoalId: string | null;
  leverReason: string | null;
  allowImperfect: string | null;
}): YearFocusData {
  return {
    id: row.id,
    year: row.year,
    sphereId: row.sphereId,
    identity: row.identity,
    leverGoalId: row.leverGoalId,
    leverReason: row.leverReason,
    allowImperfect: row.allowImperfect,
  };
}

const cleanText = (value: string | null | undefined) => value?.trim() || null;

export async function getFocus(userId: string, year: number): Promise<YearFocusData | null> {
  const row = await yearFocusRepository.findByYear(userId, year);
  return row ? mapFocus(row) : null;
}

export async function setFocus(userId: string, input: SetYearFocusInput): Promise<YearFocusData> {
  if (!(await yearFocusRepository.findSphereForUser(input.sphereId, userId))) {
    throw new Error("Sphere not found");
  }

  const leverGoalId = input.leverGoalId ?? null;
  if (leverGoalId) {
    const goal = await yearFocusRepository.findGoalForUser(leverGoalId, userId);
    if (!goal || goal.sphereId !== input.sphereId || goal.year !== input.year) {
      throw new Error("The lever must be one of the focus sphere's goals for this year");
    }
  }

  const saved = await yearFocusRepository.upsert(userId, input.year, {
    sphereId: input.sphereId,
    identity: cleanText(input.identity),
    leverGoalId,
    leverReason: cleanText(input.leverReason),
    allowImperfect: cleanText(input.allowImperfect),
  });
  return mapFocus(saved);
}

export async function clearFocus(userId: string, year: number): Promise<void> {
  await yearFocusRepository.deleteByYear(userId, year);
}

export async function countVotes(
  userId: string,
  sphereId: string,
  from: Date,
  to: Date,
): Promise<number> {
  return yearFocusRepository.countVotes(userId, sphereId, from, to);
}

export async function getIdentityVotes(userId: string, sphereId: string): Promise<IdentityVotes> {
  const now = new Date();
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const [total, week, todayVotes, yesterday] = await Promise.all([
    countVotes(userId, sphereId, yearStart, tomorrow),
    countVotes(userId, sphereId, startOfWeek(now, { weekStartsOn: 1 }), tomorrow),
    countVotes(userId, sphereId, today, tomorrow),
    countVotes(userId, sphereId, addDays(today, -1), today),
  ]);
  return { total, week, today: todayVotes, yesterday };
}

// Shown right after finishing a habit or task: the identity and the new vote count,
// only when the item belongs to the focus sphere.
export async function getVoteMoment(
  userId: string,
  source: { taskId?: string; habitId?: string },
): Promise<{ identity: string; total: number } | null> {
  const owner = source.taskId
    ? await yearFocusRepository.findTaskSphere(source.taskId, userId)
    : source.habitId
      ? await yearFocusRepository.findHabitSphere(source.habitId, userId)
      : null;
  if (!owner?.sphereId) return null;

  const focus = await getFocus(userId, new Date().getFullYear());
  if (!focus?.identity || focus.sphereId !== owner.sphereId) return null;

  const votes = await getIdentityVotes(userId, focus.sphereId);
  return { identity: focus.identity, total: votes.total };
}

export async function getMinimumAction(userId: string, sphereId: string): Promise<string | null> {
  const habit = await yearFocusRepository.findMinimalThreshold(sphereId, userId);
  return habit?.minimalThreshold ?? null;
}
