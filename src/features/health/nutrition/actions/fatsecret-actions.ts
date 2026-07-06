"use server";

import { prisma } from "@/lib/db/prisma";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import { createFoodEntry, type FatSecretMealType } from "@/lib/fatsecret/client";
import { FATSECRET_MAPPING } from "../fatsecret-mapping";
import { getProductName } from "../products";
import { PROFILES } from "../data";
import type { MacroItem, MealType } from "../types";

const MEAL_TYPE_MAP: Record<MealType, FatSecretMealType> = {
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  snack: "other",
};

type ProfileId = "vitalii" | "olesia";

export type PushEntryStatus = "ok" | "unmapped" | "failed";

export interface PushEntryResult {
  profile: ProfileId;
  food: string;
  status: PushEntryStatus;
  detail?: string;
}

export interface PushMealResult {
  entries: PushEntryResult[];
}

export async function pushMealToFatSecretAction(
  mealType: MealType,
  macroItems: MacroItem[],
): Promise<ActionResult<PushMealResult>> {
  return withAction(async () => {
    const accounts = await prisma.fatSecretAccount.findMany();
    const accountByProfile = new Map(accounts.map((a) => [a.profileId, a]));
    const fatSecretMeal = MEAL_TYPE_MAP[mealType];
    const entries: PushEntryResult[] = [];

    for (const profile of PROFILES) {
      const account = accountByProfile.get(profile.id);
      const itemsForProfile = macroItems.filter((item) => item[profile.id as ProfileId] > 0);

      for (const item of itemsForProfile) {
        const productName = getProductName(item.food);

        if (!account) {
          entries.push({
            profile: profile.id as ProfileId,
            food: productName,
            status: "failed",
            detail: "FatSecret не підключено для цього профілю",
          });
          continue;
        }

        const mapping = FATSECRET_MAPPING[item.food];
        if (!mapping) {
          entries.push({
            profile: profile.id as ProfileId,
            food: productName,
            status: "unmapped",
          });
          continue;
        }

        const grams = item[profile.id as ProfileId];
        const numberOfUnits = grams / mapping.servingGrams;

        try {
          await createFoodEntry({
            accessToken: { key: account.accessToken, secret: account.accessTokenSecret },
            foodId: mapping.foodId,
            servingId: mapping.servingId,
            numberOfUnits,
            meal: fatSecretMeal,
            entryName: productName,
          });
          entries.push({ profile: profile.id as ProfileId, food: productName, status: "ok" });
        } catch (error) {
          entries.push({
            profile: profile.id as ProfileId,
            food: productName,
            status: "failed",
            detail: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    return { entries };
  });
}
