"use server";

import { prisma } from "@/lib/db/prisma";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import { invalidateProductMappingCache } from "@/lib/cache/revalidate";
import {
  createFoodEntry,
  searchFoods,
  getFood,
  findFoodIdByBarcode,
  type FatSecretMealType,
  type FoodSearchResultItem,
  type FoodDetail,
} from "@/lib/fatsecret/client";
import {
  getMergedMappings,
  getMappingOverview,
  upsertMapping,
  deleteMapping,
  type UpsertMappingInput,
} from "../services/product-mapping-service";
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

export interface PushPreviewEntry {
  profile: ProfileId;
  food: string;
  grams: number;
  numberOfUnits: number | null;
  mapped: boolean;
  accountLinked: boolean;
}

/** Computes what pushMealToFatSecretAction would send, without calling FatSecret. */
export async function previewFatSecretPushAction(
  mealType: MealType,
  macroItems: MacroItem[],
): Promise<ActionResult<PushPreviewEntry[]>> {
  return withAction(async () => {
    const accounts = await prisma.fatSecretAccount.findMany();
    const linkedProfileIds = new Set(accounts.map((a) => a.profileId));
    const mappings = await getMergedMappings();
    const entries: PushPreviewEntry[] = [];

    for (const profile of PROFILES) {
      const itemsForProfile = macroItems.filter((item) => item[profile.id as ProfileId] > 0);

      for (const item of itemsForProfile) {
        const grams = item[profile.id as ProfileId];
        const mapping = mappings[item.food];
        entries.push({
          profile: profile.id as ProfileId,
          food: getProductName(item.food),
          grams,
          numberOfUnits: mapping ? grams / mapping.servingGrams : null,
          mapped: Boolean(mapping),
          accountLinked: linkedProfileIds.has(profile.id),
        });
      }
    }

    return entries;
  });
}

export async function pushMealToFatSecretAction(
  mealType: MealType,
  macroItems: MacroItem[],
): Promise<ActionResult<PushMealResult>> {
  return withAction(async () => {
    const accounts = await prisma.fatSecretAccount.findMany();
    const accountByProfile = new Map(accounts.map((a) => [a.profileId, a]));
    const mappings = await getMergedMappings();
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

        const mapping = mappings[item.food];
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

export async function getMappingOverviewAction() {
  return withAction(async () => getMappingOverview());
}

export async function searchFatSecretFoodsAction(
  query: string,
): Promise<ActionResult<FoodSearchResultItem[]>> {
  return withAction(async () => searchFoods(query));
}

export async function getFatSecretFoodAction(foodId: string): Promise<ActionResult<FoodDetail>> {
  return withAction(async () => getFood(foodId));
}

export async function findFoodByBarcodeAction(
  barcode: string,
): Promise<ActionResult<FoodDetail | null>> {
  return withAction(async () => {
    const foodId = await findFoodIdByBarcode(barcode);
    if (!foodId) return null;
    return getFood(foodId);
  });
}

export async function upsertProductMappingAction(
  input: UpsertMappingInput,
): Promise<ActionResult<void>> {
  return withAction(async () => {
    await upsertMapping(input);
    invalidateProductMappingCache();
  });
}

export async function deleteProductMappingAction(productKey: string): Promise<ActionResult<void>> {
  return withAction(async () => {
    await deleteMapping(productKey);
    invalidateProductMappingCache();
  });
}
