import { yearFocusRepository } from "../repositories/year-focus.repository";
import type { SetYearFocusInput, YearFocusData } from "../types";

function mapFocus(row: {
  id: string;
  year: number;
  sphereId: string;
  leverGoalId: string | null;
  leverReason: string | null;
  allowImperfect: string | null;
}): YearFocusData {
  return {
    id: row.id,
    year: row.year,
    sphereId: row.sphereId,
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
    leverGoalId,
    leverReason: cleanText(input.leverReason),
    allowImperfect: cleanText(input.allowImperfect),
  });
  return mapFocus(saved);
}

export async function clearFocus(userId: string, year: number): Promise<void> {
  await yearFocusRepository.deleteByYear(userId, year);
}
