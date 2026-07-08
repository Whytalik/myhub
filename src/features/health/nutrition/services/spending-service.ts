import { getCachedGiftedGroceries } from "@/lib/cache/cache";
import { giftedGroceryRepository } from "../repositories/gifted-grocery.repository";
import { SHOPPING_LIST } from "../data";
import { weekStartKey } from "../week";

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
 * Сума цін усіх позицій статичного SHOPPING_LIST (обидва buyDay) — повний плановий
 * тижневий бюджет. Незмінний по тижнях, бо шаблон статичний — див. коментар у сервісі
 * getSpendHistory нижче про те, чому історія рахує сьогоднішній total для минулих тижнів.
 */
function plannedWeekTotal(): number {
  return SHOPPING_LIST.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + (item.price ?? 0), 0),
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

export async function getActualSpendForWeek(weekStart: string): Promise<WeekSpend> {
  const gifted = await getGiftedForWeek(weekStart);
  const giftedTotal = gifted.reduce((sum, row) => sum + row.value, 0);
  const plannedTotal = plannedWeekTotal();
  return { weekStart, plannedTotal, giftedTotal, actualSpend: plannedTotal - giftedTotal };
}

/**
 * Один рядок на тиждень, де є хоч один запис подарунка — не вигадуємо рядки для тижнів
 * без жодних записів (нема чого коригувати). Використовує СЬОГОДНІШНІЙ plannedWeekTotal
 * для всіх минулих тижнів (шаблон статичний і рідко змінюється) — якщо колись
 * SHOPPING_LIST зміниться, історичні actualSpend "заднім числом" перерахуються під
 * новий шаблон. Прийнятно для MVP, позначено як подальше вдосконалення.
 */
export async function getSpendHistory(): Promise<WeekSpend[]> {
  const rows = await getCachedGiftedGroceries();
  const byWeek = new Map<string, number>();
  for (const row of rows) {
    const key = weekStartKey(row.weekStart);
    byWeek.set(key, (byWeek.get(key) ?? 0) + row.value);
  }

  const plannedTotal = plannedWeekTotal();
  return [...byWeek.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([weekStart, giftedTotal]) => ({
      weekStart,
      plannedTotal,
      giftedTotal,
      actualSpend: plannedTotal - giftedTotal,
    }));
}
