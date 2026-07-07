import { MappingSource } from "@/app/generated/prisma";
import { getCachedProductMappings } from "@/lib/cache/cache";
import { productMappingRepository } from "../repositories/product-mapping.repository";
import { FATSECRET_MAPPING, type FatSecretMapping } from "../fatsecret-mapping";
import { PRODUCTS, type FoodMacros, type ProductCategory } from "../products";

export interface ProductMappingOverviewItem {
  productKey: string;
  nameUk: string;
  category: ProductCategory;
  mapping: FatSecretMapping | null;
  foodName: string | null;
  servingDescription: string | null;
  targetMacros: FoodMacros | null;
  /** Макроси замапленого serving'у, перераховані на 100г — для порівняння з ціллю. */
  actualMacrosPer100g: FoodMacros | null;
  source: MappingSource | null;
}

export interface UpsertMappingInput {
  productKey: string;
  foodId: string;
  foodName: string;
  servingId: string;
  servingDescription: string;
  servingGrams: number;
  macroGrams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  source: MappingSource;
}

/** DB rows override the static seed file — static file stays as fallback/seed data only. */
export async function getMergedMappings(): Promise<Partial<Record<string, FatSecretMapping>>> {
  const rows = await getCachedProductMappings();
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

function scaleTo100g(
  kcal: number,
  protein: number,
  fat: number,
  carbs: number,
  grams: number,
): FoodMacros | null {
  if (![kcal, protein, fat, carbs, grams].every(Number.isFinite) || grams <= 0) return null;
  // A real serving never nets to literally zero calories — treat as "no macro data" (legacy row).
  if (kcal === 0 && protein === 0 && fat === 0 && carbs === 0) return null;
  const factor = 100 / grams;
  return {
    kcal: Math.round(kcal * factor * 10) / 10,
    protein: Math.round(protein * factor * 10) / 10,
    fat: Math.round(fat * factor * 10) / 10,
    carbs: Math.round(carbs * factor * 10) / 10,
  };
}

export async function getMappingOverview(): Promise<ProductMappingOverviewItem[]> {
  const rows = await getCachedProductMappings();
  const rowByKey = new Map(rows.map((row) => [row.productKey, row]));

  return Object.values(PRODUCTS)
    .filter((product) => product.kind !== "pantry")
    .map((product) => {
      const category = product.category ?? "other";
      const row = rowByKey.get(product.key);
      if (row) {
        return {
          productKey: product.key,
          nameUk: product.nameUk,
          category,
          mapping: {
            foodId: row.foodId,
            servingId: row.servingId,
            servingGrams: row.servingGrams,
          },
          foodName: row.foodName,
          servingDescription: row.servingDescription,
          targetMacros: product.macros ?? null,
          actualMacrosPer100g: scaleTo100g(
            row.kcal,
            row.protein,
            row.fat,
            row.carbs,
            row.macroGrams,
          ),
          source: row.source,
        };
      }
      const staticMapping = FATSECRET_MAPPING[product.key];
      return {
        productKey: product.key,
        nameUk: product.nameUk,
        category,
        mapping: staticMapping ?? null,
        foodName: null,
        servingDescription: null,
        targetMacros: product.macros ?? null,
        actualMacrosPer100g: null,
        source: staticMapping ? MappingSource.MANUAL : null,
      };
    });
}

export async function upsertMapping(input: UpsertMappingInput) {
  return productMappingRepository.upsert(input.productKey, {
    foodId: input.foodId,
    foodName: input.foodName,
    servingId: input.servingId,
    servingDescription: input.servingDescription,
    servingGrams: input.servingGrams,
    macroGrams: input.macroGrams,
    kcal: input.kcal,
    protein: input.protein,
    fat: input.fat,
    carbs: input.carbs,
    source: input.source,
  });
}

export async function deleteMapping(productKey: string) {
  await productMappingRepository.delete(productKey);
}
