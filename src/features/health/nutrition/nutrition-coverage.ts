import { WEEK_PLAN, SHOPPING_LIST, PREP_PRODUCTS } from "./data";
import { PRODUCTS } from "./products";

function usedProductKeys(): Set<string> {
  const fromMeals = WEEK_PLAN.flatMap((day) =>
    day.meals.flatMap((meal) => (meal.macroItems ?? []).map((item) => item.food)),
  );
  return new Set([...fromMeals, ...PREP_PRODUCTS]);
}

function coveredProductKeys(): Set<string> {
  const keys = SHOPPING_LIST.flatMap((category) =>
    category.items.flatMap((item) => item.foodKeys ?? []),
  );
  return new Set(keys);
}

const USED_KEYS = usedProductKeys();
const COVERED_KEYS = coveredProductKeys();

export type ProductRegistryStatus = "tracked" | "pantry" | "unknown";

/** Статус продукту в реєстрі — для бейджів у плані/мілпрепі. */
export function getProductKind(key: string): ProductRegistryStatus {
  const product = PRODUCTS[key];
  if (!product) return "unknown";
  return product.kind === "pantry" ? "pantry" : "tracked";
}

export function getProductName(key: string): string {
  return PRODUCTS[key]?.nameUk ?? key;
}

export interface CoverageReport {
  /** Використовується в плані/мілпрепі, є в реєстрі, але відсутнє в списку покупок. */
  missingFromShopping: { key: string; nameUk: string }[];
  /** Використовується в плані/мілпрепі, але немає такого продукту в реєстрі. */
  notInRegistry: string[];
  /** Є в списку покупок, але ніде не використовується в плані/мілпрепі. */
  unusedOnShopping: { key: string; nameUk: string }[];
}

/**
 * Звіряє продукти, що фактично використовуються в тижневому плані та
 * недільному міл-препі, зі списком покупок. Гарантує правило: продукт, що
 * використовується і є в системі, має бути у списку покупок.
 *
 * Обмеження: враховує лише продукти зі структурованими ключами
 * (`macroItems` + `PREP_PRODUCTS`) — вільнотекстові `ingredients[]` без
 * ключів у звірку не потрапляють.
 */
export function getCoverageReport(): CoverageReport {
  const missingFromShopping: CoverageReport["missingFromShopping"] = [];
  const notInRegistry: string[] = [];

  for (const key of USED_KEYS) {
    const product = PRODUCTS[key];
    if (!product) {
      notInRegistry.push(key);
      continue;
    }
    // "prepared" готується з інших tracked-продуктів під час міл-препу —
    // ніколи не купується як окрема позиція, тож не може бракувати в списку.
    if (product.kind === "prepared") continue;
    if (!COVERED_KEYS.has(key)) {
      missingFromShopping.push({ key, nameUk: product.nameUk });
    }
  }

  const unusedOnShopping = [...COVERED_KEYS]
    .filter((key) => !USED_KEYS.has(key))
    .map((key) => ({ key, nameUk: getProductName(key) }));

  return { missingFromShopping, notInRegistry, unusedOnShopping };
}
