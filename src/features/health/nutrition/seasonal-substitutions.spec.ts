import assert from "node:assert";
import {
  getCurrentSeason,
  calculateScaledGrams,
  findSubstitutionRule,
  transformPlanForSeason,
} from "./seasonal-substitutions";
import { SET_PLAN } from "./data";
import { calculateDayMacros } from "./nutrition-calc";

// TC-NUT-U-001: Season determination
assert.strictEqual(getCurrentSeason(new Date("2026-10-01")), "autumn");
assert.strictEqual(getCurrentSeason(new Date("2026-07-15")), "summer");
assert.strictEqual(getCurrentSeason(new Date("2026-01-10")), "winter");
assert.strictEqual(getCurrentSeason(new Date("2026-04-20")), "spring");

// TC-NUT-U-002: Calorie-matched gram scaling
// plum (46 kcal/100g) → apple (52 kcal/100g)
// 100g plum = 46 kcal → target apple grams = (46 / 52) * 100 = 88.46g → 88g
const scaledGrams = calculateScaledGrams("plum", "apple", 100, "match_kcal");
assert.strictEqual(scaledGrams, 88);

// TC-NUT-U-003: Substitution rule resolution
const rule = findSubstitutionRule("plum", "autumn", 9); // October
assert.ok(rule !== undefined);
assert.strictEqual(rule?.replacements[0].targetFoodKey, "apple");

// TC-NUT-U-004: Calorie preservation check
const autumnPlan = transformPlanForSeason(SET_PLAN, "autumn", 9);
const originalVitaliiMacros = calculateDayMacros(SET_PLAN[1], "vitalii");
const autumnVitaliiMacros = calculateDayMacros(autumnPlan[1], "vitalii");
assert.ok(Math.abs(autumnVitaliiMacros.kcal - originalVitaliiMacros.kcal) <= 2);

console.log("✅ All seasonal-substitutions tests passed successfully!");
