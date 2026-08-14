import { PRODUCTS } from "../products";
import { sumMacroGramsForSetsMulti } from "../quantities";
import type { ShoppingItem } from "../types";

// Коефіцієнти сезонності для категорій продуктів по місяцях (0 = Січень, 11 = Грудень)
export const CATEGORY_SEASONALITY: Record<string, number[]> = {
  vegetables: [
    1.5,
    1.4,
    1.3,
    1.2,
    1.1, // Січ - Трав (теплиці/імпорт, дорого)
    0.7,
    0.4,
    0.3,
    0.4, // Черв - Верес (ґрунтовий сезон, дешево)
    0.8,
    1.1,
    1.4, // Жовт - Груд
  ],
  fruits: [
    1.4,
    1.4,
    1.3,
    1.2,
    1.1, // Січ - Трав
    0.6,
    0.5,
    0.6,
    0.8, // Черв - Верес (сезонні ягоди/фрукти)
    1.0,
    1.2,
    1.3,
  ],
};

/**
 * Парсить кількість та одиницю виміру з текстового рядка кількості (наприклад, "~1.66 кг" -> { amount: 1.66, unit: "kg" })
 * Для "шт" також витягує вагову підказку з дужок ("2 шт (~590 г)" -> gramsHint: 590), якщо є —
 * basePrice завжди ₴/кг, тож ціну штучних позицій треба рахувати через вагу, не через кількість штук.
 */
function parseQtyString(
  qtyStr: string,
): { amount: number; unit: "kg" | "g" | "piece" | "ml"; gramsHint?: number } | null {
  const clean = qtyStr.toLowerCase().replace(/~/g, "").trim();

  // 1. Кілограми (кг)
  const kgMatch = clean.match(/^([\d.,]+)\s*кг/);
  if (kgMatch) {
    const amount = parseFloat(kgMatch[1].replace(",", "."));
    return { amount, unit: "kg" };
  }

  // 2. Грами (г)
  const gMatch = clean.match(/^([\d.,]+)\s*г/);
  if (gMatch) {
    const amount = parseFloat(gMatch[1].replace(",", "."));
    return { amount, unit: "g" };
  }

  // 3. Штуки (шт)
  const pcsMatch = clean.match(/^([\d.,]+)\s*шт/);
  if (pcsMatch) {
    const amount = parseFloat(pcsMatch[1].replace(",", "."));
    const gramsHintMatch = clean.match(/\(([\d.,]+)\s*г\)/);
    const gramsHint = gramsHintMatch ? parseFloat(gramsHintMatch[1].replace(",", ".")) : undefined;
    return { amount, unit: "piece", gramsHint };
  }

  // 4. Мілілітри (мл)
  const mlMatch = clean.match(/^([\d.,]+)\s*мл/);
  if (mlMatch) {
    const amount = parseFloat(mlMatch[1].replace(",", "."));
    return { amount, unit: "ml" };
  }

  return null;
}

/**
 * Повертає сезонний коефіцієнт для продукту на основі дати або примусового сезону
 */
export function getProductSeasonMultiplier(
  productKey: string,
  weekStartKey: string,
  seasonOverride?: string,
): number {
  const product = PRODUCTS[productKey];
  if (!product) return 1.0;

  const category = product.category ?? "other";

  // Якщо передано конкретний сезон, використовуємо типовий місяць для цього сезону:
  // Зима = Січень (0), Весна = Квітень (3), Літо = Липень (6), Осінь = Жовтень (9)
  if (seasonOverride === "winter") return CATEGORY_SEASONALITY[category]?.[0] ?? 1.0;
  if (seasonOverride === "spring") return CATEGORY_SEASONALITY[category]?.[3] ?? 1.0;
  if (seasonOverride === "summer") return CATEGORY_SEASONALITY[category]?.[6] ?? 1.0;
  if (seasonOverride === "autumn") return CATEGORY_SEASONALITY[category]?.[9] ?? 1.0;

  const date = new Date(`${weekStartKey}T00:00:00`);
  const month = isNaN(date.getTime()) ? new Date().getMonth() : date.getMonth();

  return CATEGORY_SEASONALITY[category]?.[month] ?? 1.0;
}

/**
 * Повертає сезонну ціну за одиницю (кг/штуку) з урахуванням override.
 */
export function getUnitPrice(
  item: ShoppingItem,
  weekStartKey: string,
  seasonOverride?: string,
  priceOverride?: number,
): number | null {
  if (!item.food) return null;
  const product = PRODUCTS[item.food];
  if (!product || product.basePrice === undefined) return null;
  if (priceOverride !== undefined) return priceOverride;
  const multiplier = getProductSeasonMultiplier(item.food, weekStartKey, seasonOverride);
  return product.basePrice * multiplier;
}

/**
 * Розраховує динамічну сезонну ціну для позиції списку покупок.
 * Якщо розрахувати неможливо (немає basePrice), повертає оригінальну статичну ціну.
 * `priceOverride` — ручна ціна за одиницю (кг/штуку), що замінює сезонну.
 */
export function getSeasonalPrice(
  item: ShoppingItem,
  weekStartKey: string,
  seasonOverride?: string,
  priceOverride?: number,
): number {
  if (!item.food) return item.price ?? 0;

  const product = PRODUCTS[item.food];
  if (!product || product.basePrice === undefined) {
    return item.price ?? 0;
  }

  const seasonalUnitPrice =
    priceOverride ??
    product.basePrice * getProductSeasonMultiplier(item.food, weekStartKey, seasonOverride);

  // 1. Якщо кількість розраховується автоматично через computedQty
  // sumMacroGramsForSetsMulti завжди повертає грами (незалежно від display-одиниці "unit"),
  // а basePrice завжди ₴/кг — тож рахуємо ціну за вагою в обох випадках.
  if (item.computedQty) {
    const { food, extraFood, sets, grams = 0, wastePercent = 0 } = item.computedQty;
    const baseTotal =
      sumMacroGramsForSetsMulti([food, ...(extraFood ?? [])], sets, weekStartKey) + grams;
    const totalQty = baseTotal * (1 + wastePercent / 100);
    return Math.round((totalQty / 1000) * seasonalUnitPrice);
  }

  // 2. Якщо є статична кількість у вигляді текстового рядка qty
  if (item.qty) {
    const parsed = parseQtyString(item.qty);
    if (parsed) {
      if (parsed.unit === "kg" || parsed.unit === "ml") {
        return Math.round(parsed.amount * seasonalUnitPrice);
      }
      if (parsed.unit === "g") {
        return Math.round((parsed.amount / 1000) * seasonalUnitPrice);
      }
      if (parsed.unit === "piece") {
        // basePrice ₴/кг -> кількість штук треба спершу перевести у вагу.
        const gramsPerPiece = PRODUCTS[item.food]?.gramsPerPiece;
        const totalGrams =
          parsed.gramsHint ?? (gramsPerPiece ? parsed.amount * gramsPerPiece : undefined);
        if (totalGrams !== undefined) {
          return Math.round((totalGrams / 1000) * seasonalUnitPrice);
        }
        return item.price ?? 0;
      }
    }
  }

  // 3. Фолбек: множимо статичну ціну на сезонний коефіцієнт
  return Math.round(
    (item.price ?? 0) * getProductSeasonMultiplier(item.food, weekStartKey, seasonOverride),
  );
}
