export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extra";

/** Standard Mifflin-St Jeor / Harris-Benedict activity multipliers — apply equally to Katch-McArdle BMR. */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Малорухливий спосіб життя",
  light: "Легка активність (щоденні кроки, без тренувань)",
  moderate: "Помірна активність (3–5 тренувань/тиждень)",
  very: "Висока активність (6–7 тренувань/тиждень)",
  extra: "Дуже висока активність (спорт + фізична робота)",
};

export interface BodyStats {
  weightKg: number;
  heightCm: number;
  age: number;
  bodyFatPercent: number;
  /** True when body fat % is a rough estimate, not a measured value — shown as a caveat in the UI. */
  bodyFatEstimated?: boolean;
  activityLevel: ActivityLevel;
  goal: "cut" | "gain";
}

/**
 * Physical inputs for the science-based profile calculator (`profile-science.ts`).
 * Separate from `PROFILES` in `data.ts` (which holds the display name/goal and
 * the currently-configured plan target) — this is the raw data the science
 * layer derives BMR/TDEE/macros from. Update these by hand as stats change.
 */
export const BODY_STATS: Record<string, BodyStats> = {
  vitalii: {
    weightKg: 93,
    heightCm: 180,
    age: 21,
    bodyFatPercent: 29,
    activityLevel: "moderate",
    goal: "cut",
  },
  olesia: {
    weightKg: 53,
    heightCm: 170,
    age: 21,
    bodyFatPercent: 19,
    bodyFatEstimated: true,
    activityLevel: "light",
    goal: "gain",
  },
};
