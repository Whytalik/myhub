"use server";

import { prisma } from "@/lib/db/prisma";
import { withAction, ActionResult } from "@/lib/actions/action-utils";
import { invalidateProductMappingCache } from "@/lib/cache/revalidate";
import {
  createFoodEntry,
  getFood,
  getFavorites,
  searchFoods,
  getMostEaten,
  getRecentlyEaten,
  getFoodEntriesForDate,
  type FatSecretMealType,
  type FoodDetail,
  type FavoriteFood,
  type FoodSearchResultItem,
} from "@/lib/fatsecret/client";
import {
  getMergedMappings,
  getMappingOverview,
  upsertMapping,
  deleteMapping,
  type UpsertMappingInput,
} from "../services/product-mapping-service";
import { getProductName, PRODUCTS } from "../products";
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
      const itemsForProfile = macroItems.filter(
        (item) => item[profile.id as ProfileId] > 0 && PRODUCTS[item.food]?.macros,
      );

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
      const itemsForProfile = macroItems.filter(
        (item) => item[profile.id as ProfileId] > 0 && PRODUCTS[item.food]?.macros,
      );

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

export async function getFatSecretFoodAction(
  foodId: string,
  profileId?: string,
): Promise<ActionResult<FoodDetail>> {
  return withAction(async () => {
    if (profileId) {
      const account = await prisma.fatSecretAccount.findUnique({
        where: { profileId },
      });
      if (account) {
        try {
          return await getFood(foodId, {
            key: account.accessToken,
            secret: account.accessTokenSecret,
          });
        } catch (error) {
          console.warn(
            `OAuth1 food.get failed for profile ${profileId}, falling back to OAuth2:`,
            error,
          );
        }
      }
    }
    return getFood(foodId);
  });
}

export interface ProfileFavorite {
  profile: ProfileId;
  food: FavoriteFood;
}

/** Favorites from every linked profile's real FatSecret app — see getFavorites() for why. */
export async function getFatSecretFavoritesAction(): Promise<ActionResult<ProfileFavorite[]>> {
  return withAction(async () => {
    const accounts = await prisma.fatSecretAccount.findMany();
    const results: ProfileFavorite[] = [];
    for (const account of accounts) {
      const favorites = await getFavorites({
        key: account.accessToken,
        secret: account.accessTokenSecret,
      });
      for (const food of favorites) {
        results.push({ profile: account.profileId as ProfileId, food });
      }
    }
    return results;
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

export async function searchFatSecretFoodAction(
  query: string,
): Promise<ActionResult<FoodSearchResultItem[]>> {
  return withAction(async () => searchFoods(query));
}

export async function getFatSecretMostEatenAction(): Promise<ActionResult<ProfileFavorite[]>> {
  return withAction(async () => {
    const accounts = await prisma.fatSecretAccount.findMany();
    const results: ProfileFavorite[] = [];
    for (const account of accounts) {
      const list = await getMostEaten({
        key: account.accessToken,
        secret: account.accessTokenSecret,
      });
      for (const food of list) {
        results.push({ profile: account.profileId as ProfileId, food });
      }
    }
    return results;
  });
}

export async function getFatSecretRecentlyEatenAction(): Promise<ActionResult<ProfileFavorite[]>> {
  return withAction(async () => {
    const accounts = await prisma.fatSecretAccount.findMany();
    const results: ProfileFavorite[] = [];

    for (const account of accounts) {
      const token = { key: account.accessToken, secret: account.accessTokenSecret };
      const uniqueFoodIds = new Set<string>();

      // 1. Fetch recently eaten list (usually last 20 items)
      try {
        const recentlyEatenList = await getRecentlyEaten(token);
        for (const food of recentlyEatenList) {
          if (!uniqueFoodIds.has(food.food_id)) {
            uniqueFoodIds.add(food.food_id);
            results.push({
              profile: account.profileId as ProfileId,
              food: {
                ...food,
                food_description: food.food_description || "З історії споживання",
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to get recently eaten list:", error);
      }

      // 2. Fetch diary entries from the last 4 days to ensure nothing is missed
      const datesToFetch = [
        new Date(),
        new Date(Date.now() - 86_400_000),
        new Date(Date.now() - 172_800_000),
        new Date(Date.now() - 259_200_000),
      ];
      const dateLabels = ["Сьогодні", "Вчора", "Позавчора", "3 дні тому"];

      for (let i = 0; i < datesToFetch.length; i++) {
        const date = datesToFetch[i];
        const dateLabel = dateLabels[i];
        try {
          const diaryEntries = await getFoodEntriesForDate(date, token);
          for (const entry of diaryEntries) {
            if (!uniqueFoodIds.has(entry.food_id)) {
              uniqueFoodIds.add(entry.food_id);
              results.push({
                profile: account.profileId as ProfileId,
                food: {
                  food_id: entry.food_id,
                  food_name: entry.food_entry_name,
                  food_type: "Brand",
                  serving_id: entry.serving_id,
                  food_description: `Спожито: ${dateLabel}`,
                },
              });
            }
          }
        } catch (error) {
          console.error(`Failed to get food entries for date ${date.toDateString()}:`, error);
        }
      }
    }

    return results;
  });
}
