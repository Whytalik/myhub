import { ACTIVITY_MULTIPLIERS, type BodyStats } from "./body-stats";

export interface ScienceProfile {
  leanBodyMassKg: number;
  fatMassKg: number;
  bmr: number;
  tdee: number;
  targetKcal: number;
  /** Negative = deficit, positive = surplus, relative to TDEE. */
  adjustmentPercent: number;
  proteinGramsPerKgLbm: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Lean body mass = total weight minus estimated fat mass. */
export function calculateLeanBodyMass(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

/**
 * Katch-McArdle BMR — uses lean body mass instead of total weight, more
 * accurate than Mifflin-St Jeor when body fat % is known/estimated, especially
 * outside "average" body compositions (Katch & McArdle, 1996).
 */
export function calculateBMR(leanBodyMassKg: number): number {
  return 370 + 21.6 * leanBodyMassKg;
}

/**
 * Derives a full science-based nutrition profile from body stats: BMR
 * (Katch-McArdle) → TDEE → goal-adjusted target calories → macros.
 *
 * Deficit/surplus sizing and protein-per-LBM ranges follow Helms, Aragon &
 * Fitschen (2013/2014, systematic review + ISSN position stand, PubMed
 * 24092765 / 24864135): ~20-25% deficit for fat loss while preserving
 * muscle, ~10-15% surplus for lean gain; 2.3-3.1 g/kg LBM protein during a
 * cut, ~1.8-2.2 g/kg LBM during a surplus.
 *
 * The cut range explicitly "scales upward with severity of caloric
 * restriction and leanness" per the source review — it was established on
 * already-lean, contest-prep bodybuilders (~8-15% body fat) where muscle-loss
 * risk is highest because there's little fat mass left to draw energy from.
 * We deliberately use the LOW end (2.3), not the middle/top, for anyone not
 * in that lean/aggressive-cut situation — a moderate deficit with substantial
 * fat mass remaining doesn't need to push toward 3.1 g/kg LBM. This still
 * uses lean-mass-based scaling (not raw body weight), which is the correct
 * way to size protein for someone with higher body fat in the first place.
 * Fat is set to a 25%-of-calories floor for hormonal health; carbs fill the
 * remainder — standard practice when protein and fat are fixed first.
 */
export function calculateScienceProfile(stats: BodyStats): ScienceProfile {
  const leanBodyMassKg = calculateLeanBodyMass(stats.weightKg, stats.bodyFatPercent);
  const fatMassKg = stats.weightKg - leanBodyMassKg;
  const bmr = calculateBMR(leanBodyMassKg);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[stats.activityLevel];

  const isCut = stats.goal === "cut";
  const adjustmentPercent = isCut ? -22 : 12;
  const targetKcal = tdee * (1 + adjustmentPercent / 100);

  const proteinGramsPerKgLbm = isCut ? 2.3 : 2.0;
  const proteinG = proteinGramsPerKgLbm * leanBodyMassKg;
  const fatG = (targetKcal * 0.25) / 9;
  const carbsG = Math.max(0, (targetKcal - proteinG * 4 - fatG * 9) / 4);

  return {
    leanBodyMassKg: round(leanBodyMassKg, 1),
    fatMassKg: round(fatMassKg, 1),
    bmr: round(bmr),
    tdee: round(tdee),
    targetKcal: round(targetKcal),
    adjustmentPercent,
    proteinGramsPerKgLbm,
    proteinG: round(proteinG),
    fatG: round(fatG),
    carbsG: round(carbsG),
  };
}
