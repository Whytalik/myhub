import { getCachedGiftedGroceries } from "@/lib/cache/cache";
import { giftedGroceryRepository } from "../repositories/gifted-grocery.repository";
import { SHOPPING_LIST } from "../data";
import { weekStartKey } from "../week";
import { getSeasonalPrice } from "../utils/seasonal-pricing";

export interface UpsertGiftedInput {
  weekStart: string; // YYYY-MM-DD
  itemId: string;
  productKey: string | null;
  value: number;
  quantityNote: string | null;
  note: string | null;
}

export interface WeekSpend {
  weekStart: string;
  plannedTotal: number;
  giftedTotal: number;
  actualSpend: number;
}

/**
 * Сума сезонних цін усіх позицій статичного SHOPPING_LIST для заданого тижня з урахуванням налаштувань.
 */
function plannedWeekTotal(weekStart: string, seasonOverride?: string): number {
  return SHOPPING_LIST.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + getSeasonalPrice(item, weekStart, seasonOverride), 0),
    0,
  );
}

export async function getGiftedForWeek(weekStart: string) {
  const rows = await getCachedGiftedGroceries();
  return rows.filter((row) => weekStartKey(row.weekStart) === weekStart);
}

export async function upsertGifted(input: UpsertGiftedInput) {
  return giftedGroceryRepository.upsert(new Date(`${input.weekStart}T00:00:00`), input.itemId, {
    productKey: input.productKey,
    value: input.value,
    quantityNote: input.quantityNote,
    note: input.note,
  });
}

export async function removeGifted(weekStart: string, itemId: string) {
  await giftedGroceryRepository.remove(new Date(`${weekStart}T00:00:00`), itemId);
}

export async function getActualSpendForWeek(weekStart: string, seasonOverride?: string): Promise<WeekSpend> {
  const gifted = await getGiftedForWeek(weekStart);
  const giftedTotal = gifted.reduce((sum, row) => sum + row.value, 0);
  const plannedTotal = plannedWeekTotal(weekStart, seasonOverride);
  return { weekStart, plannedTotal, giftedTotal, actualSpend: plannedTotal - giftedTotal };
}

/**
 * Один рядок на тиждень, де є хоч один запис подарунка. Використовує сезонні ціни
 * для кожного окремого історичного тижня на основі його дати weekStart та налаштувань.
 */
export async function getSpendHistory(seasonOverride?: string): Promise<WeekSpend[]> {
  const rows = await getCachedGiftedGroceries();
  const byWeek = new Map<string, number>();
  for (const row of rows) {
    const key = weekStartKey(row.weekStart);
    byWeek.set(key, (byWeek.get(key) ?? 0) + row.value);
  }

  return [...byWeek.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([weekStart, giftedTotal]) => {
      const plannedTotal = plannedWeekTotal(weekStart, seasonOverride);
      return {
        weekStart,
        plannedTotal,
        giftedTotal,
        actualSpend: plannedTotal - giftedTotal,
      };
    });
}
