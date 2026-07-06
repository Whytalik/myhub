export interface FatSecretMapping {
  foodId: string;
  servingId: string;
  /** Grams represented by one unit of `servingId` — used to compute number_of_units. */
  servingGrams: number;
}

/**
 * Product key (from `products.ts`) → FatSecret food/serving. Populated by
 * running `scripts/fatsecret-map-products.ts` and reviewing its output —
 * see that script's header comment for why this isn't auto-generated.
 * Products missing here are silently skipped by `pushMealToFatSecretAction`.
 */
export const FATSECRET_MAPPING: Partial<Record<string, FatSecretMapping>> = {
  potato: { foodId: "5718", servingId: "54398", servingGrams: 100 },
};
