import { PRODUCTS, type FoodMacros } from "./products";

export type { FoodMacros };

/**
 * @deprecated Похідний від `PRODUCTS` (`products.ts`) для зворотної сумісності.
 * Нові звернення мають читати макроси напряму з `PRODUCTS`.
 */
export const FOOD_NUTRITION: Record<string, FoodMacros> = Object.fromEntries(
  Object.values(PRODUCTS)
    .filter((product) => product.macros)
    .map((product) => [product.key, product.macros as FoodMacros]),
);

export type FoodKey = keyof typeof FOOD_NUTRITION;
