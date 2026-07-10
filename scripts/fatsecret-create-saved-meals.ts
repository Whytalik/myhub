/**
 * One-time / re-runnable provisioning: for every meal with mapped products in a
 * chosen seasonal WEEK_PLAN, creates (or replaces) a FatSecret "Saved Meal" in
 * each linked profile's real FatSecret account — so on a day someone wants
 * something other than the plan, they can just tap the saved dish inside the
 * FatSecret app's own SAVED MEALS tab instead of logging products by hand.
 *
 * Idempotent: re-running for the same (profile, season, weekday, mealType) slot
 * deletes the previously provisioned saved meal (tracked in FatSecretSavedMeal)
 * and creates a fresh one, so edits to the plan propagate instead of duplicating.
 *
 * Run with:
 *   set -a; source .env.local; set +a
 *   npx tsx scripts/fatsecret-create-saved-meals.ts <summer|winter|autumn|spring>
 */
import { prisma } from "../src/lib/db/prisma";
import {
  PROFILES,
  SUMMER_WEEK_PLAN,
  WINTER_WEEK_PLAN,
  AUTUMN_WEEK_PLAN,
  SPRING_WEEK_PLAN,
} from "../src/features/health/nutrition/data";
import { getProductName } from "../src/features/health/nutrition/products";
import { productMappingRepository } from "../src/features/health/nutrition/repositories/product-mapping.repository";
import {
  FATSECRET_MAPPING,
  type FatSecretMapping,
} from "../src/features/health/nutrition/fatsecret-mapping";
import { createSavedMeal, addSavedMealItem, deleteSavedMeal } from "../src/lib/fatsecret/client";
import type { DayPlan } from "../src/features/health/nutrition/types";

/** Standalone-script equivalent of product-mapping-service's getMergedMappings —
 *  that one goes through Next's unstable_cache, which throws outside a Next server. */
async function getMergedMappingsStandalone(): Promise<Partial<Record<string, FatSecretMapping>>> {
  const rows = await productMappingRepository.findAll();
  const merged: Partial<Record<string, FatSecretMapping>> = { ...FATSECRET_MAPPING };
  for (const row of rows) {
    merged[row.productKey] = {
      foodId: row.foodId,
      servingId: row.servingId,
      servingGrams: row.servingGrams,
    };
  }
  return merged;
}

const SEASON_PLANS: Record<string, DayPlan[]> = {
  summer: SUMMER_WEEK_PLAN,
  winter: WINTER_WEEK_PLAN,
  autumn: AUTUMN_WEEK_PLAN,
  spring: SPRING_WEEK_PLAN,
};

type ProfileId = "vitalii" | "olesia";

const RATE_LIMIT_DELAY_MS = 300;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const season = process.argv[2];
  const plan = season ? SEASON_PLANS[season] : undefined;
  if (!plan) {
    console.error(
      `Usage: npx tsx scripts/fatsecret-create-saved-meals.ts <${Object.keys(SEASON_PLANS).join("|")}>`,
    );
    process.exit(1);
  }

  const accounts = await prisma.fatSecretAccount.findMany();
  if (accounts.length === 0) {
    console.error(
      "No linked FatSecret accounts found — link a profile at /health/nutrition first.",
    );
    process.exit(1);
  }

  const mappings = await getMergedMappingsStandalone();
  const profileIds = new Set(PROFILES.map((p) => p.id));

  let createdCount = 0;
  let skippedCount = 0;

  for (const account of accounts) {
    if (!profileIds.has(account.profileId)) continue;
    const profileId = account.profileId as ProfileId;
    const token = { key: account.accessToken, secret: account.accessTokenSecret };
    console.log(`\n=== ${profileId} (season: ${season}) ===`);

    for (const day of plan) {
      for (const meal of day.meals) {
        if (!meal.macroItems || meal.macroItems.length === 0) {
          continue;
        }

        const resolved = meal.macroItems
          .filter((item) => item[profileId] > 0)
          .map((item) => ({ item, mapping: mappings[item.food] }));

        const mappedItems = resolved.filter(
          (
            x,
          ): x is {
            item: (typeof resolved)[number]["item"];
            mapping: NonNullable<(typeof resolved)[number]["mapping"]>;
          } => Boolean(x.mapping),
        );
        const unmappedCount = resolved.length - mappedItems.length;

        if (mappedItems.length === 0) {
          console.log(`  · skip ${day.labelShort} ${meal.label} — 0 mapped items`);
          skippedCount++;
          continue;
        }

        const title = `${day.labelShort} ${meal.label} — ${meal.title}`.slice(0, 100);
        const slotKey = {
          profileId_season_weekday_mealType: {
            profileId,
            season,
            weekday: day.weekday,
            mealType: meal.type,
          },
        };

        const existing = await prisma.fatSecretSavedMeal.findUnique({ where: slotKey });
        if (existing) {
          try {
            await deleteSavedMeal(existing.savedMealId, token);
            await sleep(RATE_LIMIT_DELAY_MS);
          } catch (error) {
            console.warn(
              `  ! could not delete previous saved meal ${existing.savedMealId} for ${title}: ${
                error instanceof Error ? error.message : error
              }`,
            );
          }
        }

        try {
          const savedMealId = await createSavedMeal(title, token);
          await sleep(RATE_LIMIT_DELAY_MS);

          for (const { item, mapping } of mappedItems) {
            const grams = item[profileId];
            const numberOfUnits = grams / mapping.servingGrams;
            await addSavedMealItem(
              savedMealId,
              mapping.foodId,
              mapping.servingId,
              numberOfUnits,
              getProductName(item.food),
              token,
            );
            await sleep(RATE_LIMIT_DELAY_MS);
          }

          await prisma.fatSecretSavedMeal.upsert({
            where: slotKey,
            create: {
              profileId,
              season,
              weekday: day.weekday,
              mealType: meal.type,
              title,
              savedMealId,
            },
            update: { title, savedMealId },
          });

          console.log(
            `  ✓ ${title} (${mappedItems.length} items${
              unmappedCount ? `, ${unmappedCount} unmapped skipped` : ""
            })`,
          );
          createdCount++;
        } catch (error) {
          console.error(`  ✗ ${title} — ${error instanceof Error ? error.message : error}`);
        }
      }
    }
  }

  console.log(
    `\nDone. Created/updated: ${createdCount}, skipped (0 mapped items): ${skippedCount}.`,
  );
  await prisma.$disconnect();
}

main();
