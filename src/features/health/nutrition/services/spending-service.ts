import { SHOPPING_LIST } from "../data";
import { getSeasonalPrice } from "../utils/seasonal-pricing";

/**
 * Сума сезонних цін усіх позицій статичного SHOPPING_LIST для заданого тижня з урахуванням налаштувань.
 */
export function plannedWeekTotal(weekStart: string, seasonOverride?: string): number {
  return SHOPPING_LIST.reduce(
    (sum, category) =>
      sum +
      category.items.reduce(
        (itemSum, item) => itemSum + getSeasonalPrice(item, weekStart, seasonOverride),
        0,
      ),
    0,
  );
}
