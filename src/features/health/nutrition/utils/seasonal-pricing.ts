import { PRODUCTS } from "../products";
import { sumMacroGramsMulti } from "../quantities";
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
 */
function parseQtyString(
  qtyStr: string,
): { amount: number; unit: "kg" | "g" | "piece" | "ml" } | null {
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
    return { amount, unit: "piece" };
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
 * Розраховує динамічну сезонну ціну для позиції списку покупок.
 * Якщо розрахувати неможливо (немає basePrice), повертає оригінальну статичну ціну.
 */
export function getSeasonalPrice(
  item: ShoppingItem,
  weekStartKey: string,
  seasonOverride?: string,
): number {
  if (!item.food) return item.price ?? 0;

  const product = PRODUCTS[item.food];
  if (!product || product.basePrice === undefined) {
    return item.price ?? 0;
  }

  const multiplier = getProductSeasonMultiplier(item.food, weekStartKey, seasonOverride);
  const seasonalUnitPrice = product.basePrice * multiplier;

  // 1. Якщо кількість розраховується автоматично через computedQty
  if (item.computedQty) {
    const { food, extraFood, weekdays, grams = 0, unit = "g", wastePercent = 0 } = item.computedQty;
    const baseTotal =
      sumMacroGramsMulti([food, ...(extraFood ?? [])], weekdays, weekStartKey) + grams;
    const totalQty = baseTotal * (1 + wastePercent / 100);

    if (unit === "piece") {
      return Math.round(totalQty * seasonalUnitPrice);
    } else {
      // г або мл -> ціна вказана за кг або літр
      return Math.round((totalQty / 1000) * seasonalUnitPrice);
    }
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
        return Math.round(parsed.amount * seasonalUnitPrice);
      }
    }
  }

  // 3. Фолбек: множимо статичну ціну на сезонний коефіцієнт
  return Math.round((item.price ?? 0) * multiplier);
}
