/**
 * One-time helper: fills in kcal/protein/fat/carbs (+ foodName/servingDescription)
 * for every already-chosen product mapping that predates the macro-tracking columns
 * on ProductFatSecretMapping — both legacy DB rows and productKeys that only exist
 * in the static fatsecret-mapping.ts seed.
 *
 * This does NOT re-search or re-pick a food — it only calls food.get on the
 * foodId/servingId that was already chosen (by a human, or by an earlier
 * confirmed UI save) and reads that exact serving's macros. Run with:
 *
 *   set -a; source .env.local; set +a; npx tsx scripts/backfill-mapping-macros.ts
 */
import { prisma } from "../src/lib/db/prisma";
import { PRODUCTS } from "../src/features/health/nutrition/products";
import { FATSECRET_MAPPING } from "../src/features/health/nutrition/fatsecret-mapping";
import { getFood, type FoodServing } from "../src/lib/fatsecret/client";

function findServing(servings: FoodServing | FoodServing[], servingId: string): FoodServing | null {
  const list = Array.isArray(servings) ? servings : [servings];
  return list.find((s) => s.serving_id === servingId) ?? null;
}

async function main() {
  const rows = await prisma.productFatSecretMapping.findMany();
  const rowByKey = new Map(rows.map((row) => [row.productKey, row]));

  const productKeys = Object.values(PRODUCTS)
    .filter((p) => p.kind !== "pantry")
    .map((p) => p.key);

  let updated = 0;
  let skipped = 0;

  for (const productKey of productKeys) {
    const row = rowByKey.get(productKey);
    // macroGrams is the field this backfill exists to populate — reprocess until it's set,
    // regardless of whether kcal/etc already have (possibly wrong-basis) values.
    if (row && row.macroGrams > 0) {
      console.log(`= ${productKey}: already has macroGrams, skipping`);
      skipped++;
      continue;
    }

    const source = row ?? FATSECRET_MAPPING[productKey];
    if (!source) {
      console.log(`- ${productKey}: no mapping at all, skipping`);
      skipped++;
      continue;
    }

    try {
      const detail = await getFood(source.foodId);
      const serving = findServing(detail.servings.serving, source.servingId);
      if (!serving || !serving.calories || !serving.metric_serving_amount) {
        console.log(
          `⚠ ${productKey}: serving ${source.servingId} not found or has no gram-based macros on food ${source.foodId}`,
        );
        skipped++;
        continue;
      }
      const macroGrams = Number(serving.metric_serving_amount);

      await prisma.productFatSecretMapping.upsert({
        where: { productKey },
        // Only reached for productKeys with no DB row yet — servingGrams comes from the
        // already-tested static seed (fatsecret-mapping.ts), never recomputed here.
        create: {
          productKey,
          foodId: source.foodId,
          foodName: detail.food_name,
          servingId: source.servingId,
          servingDescription: serving.serving_description,
          servingGrams: source.servingGrams,
          macroGrams,
          kcal: Number(serving.calories),
          protein: Number(serving.protein ?? 0),
          fat: Number(serving.fat ?? 0),
          carbs: Number(serving.carbohydrate ?? 0),
          source: "MANUAL",
        },
        // Existing row: only fill in the macro side — never touch servingGrams, it's the
        // live push multiplier and this script must not risk mis-logging real diary entries.
        update: {
          foodName: detail.food_name,
          servingDescription: serving.serving_description,
          macroGrams,
          kcal: Number(serving.calories),
          protein: Number(serving.protein ?? 0),
          fat: Number(serving.fat ?? 0),
          carbs: Number(serving.carbohydrate ?? 0),
        },
      });
      console.log(
        `✓ ${productKey}: ${detail.food_name} — ${serving.calories} kcal / ${macroGrams}g`,
      );
      updated++;
    } catch (error) {
      console.log(`⚠ ${productKey}: ERROR ${error instanceof Error ? error.message : error}`);
      skipped++;
    }

    // FatSecret rate-limits — delay between calls to stay well under it.
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
  await prisma.$disconnect();
}

main();
