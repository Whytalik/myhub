import { MappingSource } from "@/app/generated/prisma";
import { getCachedProductMappings } from "@/lib/cache/cache";
import { productMappingRepository } from "../repositories/product-mapping.repository";
import { FATSECRET_MAPPING, type FatSecretMapping } from "../fatsecret-mapping";
import { PRODUCTS } from "../products";

export interface ProductMappingOverviewItem {
  productKey: string;
  nameUk: string;
  mapping: FatSecretMapping | null;
  foodName: string | null;
  servingDescription: string | null;
  source: MappingSource | null;
}

export interface UpsertMappingInput {
  productKey: string;
  foodId: string;
  foodName: string;
  servingId: string;
  servingDescription: string;
  servingGrams: number;
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

export async function getMappingOverview(): Promise<ProductMappingOverviewItem[]> {
  const rows = await getCachedProductMappings();
  const rowByKey = new Map(rows.map((row) => [row.productKey, row]));

  return Object.values(PRODUCTS)
    .filter((product) => product.kind !== "pantry")
    .map((product) => {
      const row = rowByKey.get(product.key);
      if (row) {
        return {
          productKey: product.key,
          nameUk: product.nameUk,
          mapping: {
            foodId: row.foodId,
            servingId: row.servingId,
            servingGrams: row.servingGrams,
          },
          foodName: row.foodName,
          servingDescription: row.servingDescription,
          source: row.source,
        };
      }
      const staticMapping = FATSECRET_MAPPING[product.key];
      return {
        productKey: product.key,
        nameUk: product.nameUk,
        mapping: staticMapping ?? null,
        foodName: null,
        servingDescription: null,
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
    source: input.source,
  });
}

export async function deleteMapping(productKey: string) {
  await productMappingRepository.delete(productKey);
}
