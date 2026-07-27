"use client";

import { useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Gift, Home, RotateCcw } from "lucide-react";
import { Tabs } from "@/components/ui/navigation/tabs";
import { SHOPPING_LIST } from "../data";
import { getProductName, PRODUCTS } from "../products";
import { sumMacroGramsMulti, formatGrams } from "../quantities";
import { currentWeekStart, weekStartKey } from "../week";
import { GiftedItemDialog } from "./GiftedItemDialog";
import { getSeasonalPrice } from "../utils/seasonal-pricing";
import type {
  ComputedQuantity,
  ShoppingCategory,
  ShoppingDay,
  ShoppingItem,
  Weekday,
} from "../types";

export interface GiftedRecord {
  itemId: string;
  productKey: string | null;
  value: number;
  quantityNote: string | null;
  note: string | null;
}

/** Base name always comes from products.ts when `food` is set — `qualifier` layers
 *  on buy-specific detail (fat %, fresh-frozen...) that products.ts has no reason to track. */
function displayNameOf(item: ShoppingItem): string {
  if (item.food) {
    const base = getProductName(item.food);
    return item.qualifier ? `${base} ${item.qualifier}` : base;
  }
  return item.name ?? "?";
}

/** Computed qty derives from macroItems (+ an explicit manual buffer) instead of
 *  being hand-typed — see [[nutrition_products_single_source]] / quantities.ts. */
function displayQtyOf(
  item: ShoppingItem,
  weekStart?: string,
  seasonOverride?: string,
): string | undefined {
  if (!item.computedQty) return item.qty;
  const { food, extraFood, weekdays, grams = 0, unit, wastePercent = 0 } = item.computedQty;
  const baseTotal =
    sumMacroGramsMulti([food, ...(extraFood ?? [])], weekdays, weekStart, seasonOverride) + grams;
  const total = baseTotal * (1 + wastePercent / 100);
  return formatGrams(total, unit, PRODUCTS[food]?.gramsPerPiece);
}

/**
 * Numeric total needed, in the item's native unit — only computable for `computedQty`
 * items (hand-typed `qty` strings like "1 пучок" have no clean number to divide against).
 * Used to translate a "вже вдома" fraction into a real "≈ X з Y" readout.
 */
function computedTotal(
  item: ShoppingItem,
  weekStart?: string,
  seasonOverride?: string,
): number | null {
  if (!item.computedQty) return null;
  const { food, extraFood, weekdays, grams = 0, wastePercent = 0 } = item.computedQty;
  const baseTotal =
    sumMacroGramsMulti([food, ...(extraFood ?? [])], weekdays, weekStart, seasonOverride) + grams;
  return baseTotal * (1 + wastePercent / 100);
}

function isNeededForDay(item: ShoppingItem, day: Weekday): boolean {
  if (item.computedQty) {
    return item.computedQty.weekdays.includes(day);
  }
  if (item.note) {
    const lowerNote = item.note.toLowerCase();
    if (lowerNote.includes("щодня") || lowerNote.includes("кожен день")) return true;
    if (day === "mon" && (lowerNote.includes("пн") || lowerNote.includes("понеділок"))) return true;
    if (day === "tue" && (lowerNote.includes("вт") || lowerNote.includes("вівторок"))) return true;
    if (day === "wed" && (lowerNote.includes("ср") || lowerNote.includes("середа"))) return true;
    if (day === "thu" && (lowerNote.includes("чт") || lowerNote.includes("четвер"))) return true;
    if (
      day === "fri" &&
      (lowerNote.includes("пт") || lowerNote.includes("п’ятниця") || lowerNote.includes("п'ятниця"))
    )
      return true;
    if (day === "sat" && (lowerNote.includes("сб") || lowerNote.includes("субота"))) return true;
    if (day === "sun" && (lowerNote.includes("нд") || lowerNote.includes("неділя"))) return true;
  }
  return false;
}

const STORAGE_KEY = "nutrition-shopping-v1";
const HOME_STOCK_STORAGE_PREFIX = "nutrition-home-stock-v1";

const VIEWS = [
  { id: "all" as const, label: "Всі" },
  { id: "sun" as const, label: "Неділя" },
  { id: "wed" as const, label: "Середа" },
];

type ViewId = (typeof VIEWS)[number]["id"];

function categoriesForDay(day: ShoppingDay): ShoppingCategory[] {
  return SHOPPING_LIST.map((category) => ({
    ...category,
    items: category.items.filter((item) => item.buyDay === day),
  })).filter((category) => category.items.length > 0);
}

/** Boolean per item — has it been bought this trip. */
type FlagMap = Record<string, boolean>;
/** Fraction 0–1 per item — how much of the needed amount is already at home
 *  (0/absent = none, 1 = all of it, e.g. 0.3 = "маю 30%"). */
type FractionMap = Record<string, number>;

function readFromStorage<T>(key: string, empty: T): T {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : empty;
  } catch {
    return empty;
  }
}

/**
 * A `useSyncExternalStore`-backed localStorage record store. `getStorageKey` is called
 * on every read/write (not just once) so a store can be namespaced by something that
 * changes at runtime, e.g. the current shopping week — see `homeStockStore` below,
 * which auto-"resets" across weeks by simply writing to a different key.
 */
function makeRecordStore<T extends Record<string, unknown>>(getStorageKey: () => string, empty: T) {
  let cachedKey = typeof window !== "undefined" ? getStorageKey() : "";
  let cache: T = readFromStorage(cachedKey, empty);
  const listeners = new Set<() => void>();

  function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  function getSnapshot(): T {
    const key = getStorageKey();
    if (key !== cachedKey) {
      cachedKey = key;
      cache = readFromStorage(key, empty);
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return empty;
  }

  function write(next: T) {
    cachedKey = getStorageKey();
    cache = next;
    window.localStorage.setItem(cachedKey, JSON.stringify(next));
    listeners.forEach((listener) => listener());
  }

  return { subscribe, getSnapshot, getServerSnapshot, write };
}

const EMPTY_FLAGS: FlagMap = {};
const EMPTY_FRACTIONS: FractionMap = {};

const checkedStore = makeRecordStore<FlagMap>(() => STORAGE_KEY, EMPTY_FLAGS);
// Namespaced by the current shopping week so "вже вдома" naturally clears itself
// week to week — it's a pre-shopping reminder, not meant to persist forever like `checked`.
const homeStockStore = makeRecordStore<FractionMap>(
  () => `${HOME_STOCK_STORAGE_PREFIX}:${weekStartKey(currentWeekStart())}`,
  EMPTY_FRACTIONS,
);

function categoryCost(
  categories: ShoppingCategory[],
  weekStart: string,
  seasonOverride?: string,
): number {
  return categories.reduce(
    (sum, category) =>
      sum +
      category.items.reduce(
        (itemSum, item) => itemSum + getSeasonalPrice(item, weekStart, seasonOverride),
        0,
      ),
    0,
  );
}

/** "з 990 г — купити ще 690 г" — only when the item has a computable total. */
function homeStockReadout(
  item: ShoppingItem,
  fraction: number,
  weekStart?: string,
  seasonOverride?: string,
): string | null {
  const total = computedTotal(item, weekStart, seasonOverride);
  if (total === null) return null;
  const unit = item.computedQty?.unit;
  const gramsPerPiece = item.computedQty
    ? PRODUCTS[item.computedQty.food]?.gramsPerPiece
    : undefined;
  if (fraction >= 1) return `все, що треба (${formatGrams(total, unit, gramsPerPiece)})`;
  const remaining = formatGrams(total * (1 - fraction), unit, gramsPerPiece);
  return `з ${formatGrams(total, unit, gramsPerPiece)} — купити ще ${remaining}`;
}

/** Grams-input unit label ("г"/"шт"/"мл") for the "вже вдома" amount field. */
function homeStockUnitLabel(item: ShoppingItem): string {
  const unit = item.computedQty?.unit ?? "g";
  if (unit === "piece") return "шт";
  if (unit === "ml") return "мл";
  return "г";
}

function CategoryList({
  categories,
  checked,
  homeStock,
  giftedByItemId,
  weekStart,
  seasonOverride,
  onToggle,
  onToggleHomeStock,
  onSetHomeStockFraction,
  onOpenGiftDialog,
}: {
  categories: ShoppingCategory[];
  checked: FlagMap;
  homeStock: FractionMap;
  giftedByItemId: Map<string, GiftedRecord>;
  weekStart: string;
  seasonOverride?: string;
  onToggle: (id: string) => void;
  onToggleHomeStock: (id: string) => void;
  onSetHomeStockFraction: (id: string, fraction: number) => void;
  onOpenGiftDialog: (item: ShoppingItem) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {categories.map((category) => (
        <div key={category.id} className="glass-card p-4 flex flex-col gap-2">
          <span className="text-label">{category.title}</span>
          <ul className="flex flex-col gap-1">
            {category.items.map((item) => {
              const isChecked = item.id.includes("+")
                ? item.id.split("+").every((subId) => checked[subId])
                : !!checked[item.id];
              const fraction = item.id.includes("+")
                ? (homeStock[item.id.split("+")[0]] ?? 0)
                : (homeStock[item.id] ?? 0);
              const isHomeStock = fraction > 0;
              const giftedRecord = item.id.includes("+")
                ? (item.id
                    .split("+")
                    .map((subId) => giftedByItemId.get(subId))
                    .find(Boolean) ?? null)
                : (giftedByItemId.get(item.id) ?? null);
              const isGifted = giftedRecord !== null;
              const qty = displayQtyOf(item, weekStart, seasonOverride);
              const itemTotal = computedTotal(item, weekStart, seasonOverride);
              const readout = isHomeStock
                ? homeStockReadout(item, fraction, weekStart, seasonOverride)
                : null;
              const itemPrice = getSeasonalPrice(item, weekStart, seasonOverride);
              const hasCheckmark = isChecked || fraction >= 1 || isGifted;
              const checkboxClass = `flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors duration-150 ${
                hasCheckmark
                  ? "bg-accent-nutrition border-accent-nutrition text-white"
                  : "border-white/[0.15]"
              }`;
              const nameClass = `text-sm ${
                isGifted
                  ? "text-fuchsia-400/80 line-through decoration-fuchsia-400/40"
                  : isHomeStock
                    ? "text-amber-400/80 line-through decoration-amber-400/40"
                    : isChecked
                      ? "text-zinc-500 line-through"
                      : "text-zinc-200"
              }`;
              const homeButtonClass = `flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-colors duration-150 ${
                isHomeStock
                  ? "bg-amber-400/15 text-amber-400"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
              }`;
              const giftButtonClass = `flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-colors duration-150 ${
                isGifted
                  ? "bg-fuchsia-400/15 text-fuchsia-400"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
              }`;

              return (
                <li key={item.id} className="flex flex-col gap-1">
                  <div className="flex items-start gap-1.5 py-1.5">
                    <button
                      onClick={() => onToggle(item.id)}
                      className="flex items-start gap-2.5 text-left flex-1 min-w-0"
                    >
                      <span className={checkboxClass}>
                        {hasCheckmark && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className={nameClass}>
                          {displayNameOf(item)}
                          {qty && <span className="text-zinc-500"> — {qty}</span>}
                          {itemPrice > 0 && (
                            <span className="font-mono text-xs text-zinc-500 ml-1.5">
                              ~{itemPrice} ₴
                            </span>
                          )}
                        </span>
                        {item.note && <span className="text-caption">{item.note}</span>}
                        {isGifted && giftedRecord && (
                          <span className="text-caption text-fuchsia-400/70">
                            подаровано · {giftedRecord.value} ₴
                            {giftedRecord.quantityNote ? ` · ${giftedRecord.quantityNote}` : ""}
                          </span>
                        )}
                      </span>
                    </button>
                    <button
                      onClick={() => onToggleHomeStock(item.id)}
                      className={homeButtonClass}
                      title="Вже є вдома — не купувати цього разу"
                    >
                      <Home size={13} />
                    </button>
                    {!item.id.includes("+") && (
                      <button
                        onClick={() => onOpenGiftDialog(item)}
                        className={giftButtonClass}
                        title="Подаровано батьками"
                      >
                        <Gift size={13} />
                      </button>
                    )}
                  </div>

                  {isHomeStock && itemTotal !== null && (
                    <div className="flex items-center gap-2 pl-6 -mt-1">
                      <input
                        type="number"
                        min={0}
                        value={Math.round(fraction * itemTotal)}
                        onChange={(e) => {
                          const amount = Number(e.target.value);
                          if (!Number.isFinite(amount) || itemTotal <= 0) return;
                          const clamped = Math.max(0, amount);
                          onSetHomeStockFraction(item.id, clamped / itemTotal);
                        }}
                        className="w-16 text-right text-xs bg-white/5 rounded border border-white/10 px-1.5 py-0.5 text-amber-400 focus:outline-none focus:border-amber-400/50"
                      />
                      <span className="text-label text-amber-400/70">
                        {homeStockUnitLabel(item)} вдома{readout ? ` · ${readout}` : ""}
                      </span>
                    </div>
                  )}
                  {isHomeStock && itemTotal === null && (
                    <div className="pl-6 -mt-1">
                      <span className="text-label text-amber-400/70">вже вдома (повністю)</span>
                    </div>
                  )}

                  {item.options && item.options.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-6">
                      {item.options.map((option, idx) => {
                        const optionId = `${item.id}-opt-${idx}`;
                        const isOptChecked = !!checked[optionId];
                        const optCheckboxClass = `flex items-center justify-center w-3.5 h-3.5 rounded border shrink-0 transition-colors duration-150 ${
                          isOptChecked
                            ? "bg-accent-nutrition border-accent-nutrition text-white"
                            : "border-white/[0.15]"
                        }`;
                        const optTextClass = `text-xs ${isOptChecked ? "text-zinc-500 line-through" : "text-zinc-400"}`;

                        return (
                          <li key={idx}>
                            <button
                              onClick={() => onToggle(optionId)}
                              className="flex items-center gap-2 py-1 text-left"
                            >
                              <span className={optCheckboxClass}>
                                {isOptChecked && <Check size={9} strokeWidth={3.5} />}
                              </span>
                              <span className={optTextClass}>{option}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function getConsolidatedCategories(
  categories: ShoppingCategory[],
  weekStart: string,
  seasonOverride?: string,
): ShoppingCategory[] {
  return categories.map((category) => {
    const grouped = new Map<string, ShoppingItem[]>();
    for (const item of category.items) {
      const key = displayNameOf(item);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    const items: ShoppingItem[] = [];
    for (const [_name, list] of grouped.entries()) {
      if (list.length === 1) {
        items.push(list[0]);
        continue;
      }

      // Merge duplicates
      const base = list[0];
      const mergedId = list.map((item) => item.id).join("+");
      const totalCostVal = list.reduce(
        (sum, item) => sum + getSeasonalPrice(item, weekStart, seasonOverride),
        0,
      );

      // Combine notes
      const notes = list.map((item) => item.note).filter(Boolean);
      const combinedNote = notes.length > 0 ? notes.join(" + ") : undefined;

      // Combine quantities
      let combinedQty: string | undefined = undefined;
      let mergedComputedQty: ComputedQuantity | undefined = undefined;
      const allComputed = list.every((item) => !!item.computedQty);
      if (allComputed) {
        const weekdays = Array.from(new Set(list.flatMap((item) => item.computedQty!.weekdays)));
        const grams = list.reduce((sum, item) => sum + (item.computedQty!.grams ?? 0), 0);
        mergedComputedQty = {
          ...base.computedQty!,
          weekdays,
          grams,
        };
      } else {
        let totalGrams = 0;
        let totalPieces = 0;
        let totalMl = 0;
        let hasParsed = true;
        for (const item of list) {
          const qtyStr = item.qty || "";
          const matchG = qtyStr.match(/^([\d.,]+)\s*г$/i);
          const matchKg = qtyStr.match(/^([\d.,]+)\s*кг$/i);
          const matchMl = qtyStr.match(/^([\d.,]+)\s*мл$/i);
          const matchPcs = qtyStr.match(/^([\d.,]+)\s*шт$/i);
          if (matchG) {
            totalGrams += parseFloat(matchG[1].replace(",", "."));
          } else if (matchKg) {
            totalGrams += parseFloat(matchKg[1].replace(",", ".")) * 1000;
          } else if (matchMl) {
            totalMl += parseFloat(matchMl[1].replace(",", "."));
          } else if (matchPcs) {
            totalPieces += parseFloat(matchPcs[1].replace(",", "."));
          } else {
            hasParsed = false;
            break;
          }
        }
        if (hasParsed) {
          if (totalGrams > 0) {
            combinedQty = totalGrams >= 1000 ? `${totalGrams / 1000} кг` : `${totalGrams} г`;
          } else if (totalMl > 0) {
            combinedQty = totalMl >= 1000 ? `${totalMl / 1000} л` : `${totalMl} мл`;
          } else if (totalPieces > 0) {
            combinedQty = `${totalPieces} шт`;
          }
        } else {
          combinedQty = list
            .map((item) => item.qty)
            .filter(Boolean)
            .join(" + ");
        }
      }

      items.push({
        ...base,
        id: mergedId,
        qty: combinedQty,
        computedQty: mergedComputedQty,
        price: totalCostVal,
        note: combinedNote,
      });
    }

    return {
      ...category,
      items,
    };
  });
}

interface ShoppingListProps {
  weekStart: string;
  seasonOverride?: string;
  gifted: GiftedRecord[];
}

export function ShoppingList({ weekStart, seasonOverride, gifted }: ShoppingListProps) {
  const router = useRouter();
  const checked = useSyncExternalStore(
    checkedStore.subscribe,
    checkedStore.getSnapshot,
    checkedStore.getServerSnapshot,
  );
  const homeStock = useSyncExternalStore(
    homeStockStore.subscribe,
    homeStockStore.getSnapshot,
    homeStockStore.getServerSnapshot,
  );
  const [activeView, setActiveView] = useState<ViewId>("all");
  const [selectedDay, setSelectedDay] = useState<"all" | Weekday>("all");
  const [giftDialogItem, setGiftDialogItem] = useState<ShoppingItem | null>(null);

  const [lastActiveView, setLastActiveView] = useState(activeView);
  if (activeView !== lastActiveView) {
    setLastActiveView(activeView);
    setSelectedDay("all");
  }

  const giftedByItemId = new Map(gifted.map((g) => [g.itemId, g]));

  const visibleCategories = activeView === "all" ? SHOPPING_LIST : categoriesForDay(activeView);

  const filteredCategories =
    selectedDay === "all"
      ? activeView === "all"
        ? getConsolidatedCategories(visibleCategories, weekStart, seasonOverride)
        : visibleCategories
      : visibleCategories
          .map((category) => ({
            ...category,
            items: category.items.filter((item) => isNeededForDay(item, selectedDay)),
          }))
          .filter((category) => category.items.length > 0);

  const visibleItemIds = new Set(
    filteredCategories.flatMap((category) => category.items.map((item) => item.id)),
  );

  // "Куплено" рахує лише те, що реально ще треба купити — позиції, повністю
  // відмічені "вдома" (fraction 1) або подаровані, не входять ні в знаменник, ні в лічильник прогресу.
  const buyableItemIds = new Set(
    [...visibleItemIds].filter((id) => {
      if (id.includes("+")) {
        const ids = id.split("+");
        return ids.some((subId) => (homeStock[subId] ?? 0) < 1 && !giftedByItemId.has(subId));
      }
      return (homeStock[id] ?? 0) < 1 && !giftedByItemId.has(id);
    }),
  );
  const totalItemsInView = buyableItemIds.size;

  const checkedCountInView = Object.entries(checked).filter(
    ([id, val]) => val && !id.includes("-opt-") && buyableItemIds.has(id),
  ).length;

  const progress =
    totalItemsInView > 0 ? Math.round((checkedCountInView / totalItemsInView) * 100) : 0;

  const totalCost = categoryCost(filteredCategories, weekStart, seasonOverride);

  const homeStockCost = filteredCategories.reduce((sum, category) => {
    return (
      sum +
      category.items.reduce((itemSum, item) => {
        if (item.id.includes("+")) {
          const ids = item.id.split("+");
          const itemPrice = getSeasonalPrice(item, weekStart, seasonOverride);
          const fraction = homeStock[ids[0]] ?? 0;
          return itemSum + itemPrice * fraction;
        }
        const fraction = homeStock[item.id] ?? 0;
        const itemPrice = getSeasonalPrice(item, weekStart, seasonOverride);
        return itemSum + itemPrice * fraction;
      }, 0)
    );
  }, 0);

  const giftedCost = filteredCategories.reduce((sum, category) => {
    return (
      sum +
      category.items.reduce((itemSum, item) => {
        if (item.id.includes("+")) {
          const ids = item.id.split("+");
          const totalVal = ids.reduce((s, subId) => s + (giftedByItemId.get(subId)?.value ?? 0), 0);
          return itemSum + totalVal;
        }
        return itemSum + (giftedByItemId.get(item.id)?.value ?? 0);
      }, 0)
    );
  }, 0);

  const checkedCost = filteredCategories.reduce((sum, category) => {
    return (
      sum +
      category.items.reduce((itemSum, item) => {
        const isChecked = item.id.includes("+")
          ? item.id.split("+").every((subId) => checked[subId])
          : !!checked[item.id];
        if (!isChecked) return itemSum;

        if (item.id.includes("+")) {
          const ids = item.id.split("+");
          const fraction = homeStock[ids[0]] ?? 0;
          const itemPrice = getSeasonalPrice(item, weekStart, seasonOverride);
          let activePrice = 0;
          for (let i = 0; i < ids.length; i++) {
            const subId = ids[i];
            if (!giftedByItemId.has(subId)) {
              activePrice += (itemPrice / ids.length) * (1 - fraction);
            }
          }
          return itemSum + activePrice;
        }

        if (giftedByItemId.has(item.id)) return itemSum;
        const fraction = homeStock[item.id] ?? 0;
        const itemPrice = getSeasonalPrice(item, weekStart, seasonOverride);
        return itemSum + itemPrice * (1 - fraction);
      }, 0)
    );
  }, 0);

  const remainingCost = totalCost - homeStockCost - giftedCost - checkedCost;

  const toggle = (id: string) => {
    if (id.includes("+")) {
      const ids = id.split("+");
      const nextChecked = { ...checked };
      const nextVal = !checked[ids[0]];
      for (const subId of ids) {
        nextChecked[subId] = nextVal;
      }
      checkedStore.write(nextChecked);
    } else {
      checkedStore.write({ ...checked, [id]: !checked[id] });
    }
  };

  const reset = () => checkedStore.write({});

  const toggleHomeStock = (id: string) => {
    if (id.includes("+")) {
      const ids = id.split("+");
      const nextHomeStock = { ...homeStock };
      const nextVal = (homeStock[ids[0]] ?? 0) > 0 ? 0 : 1;
      for (const subId of ids) {
        nextHomeStock[subId] = nextVal;
      }
      homeStockStore.write(nextHomeStock);
    } else {
      homeStockStore.write({ ...homeStock, [id]: (homeStock[id] ?? 0) > 0 ? 0 : 1 });
    }
  };

  const setHomeStockFraction = (id: string, fraction: number) => {
    if (id.includes("+")) {
      const ids = id.split("+");
      const nextHomeStock = { ...homeStock };
      for (const subId of ids) {
        nextHomeStock[subId] = fraction;
      }
      homeStockStore.write(nextHomeStock);
    } else {
      homeStockStore.write({ ...homeStock, [id]: fraction });
    }
  };

  const closeGiftDialog = () => setGiftDialogItem(null);
  const handleGiftSaved = () => {
    setGiftDialogItem(null);
    router.refresh();
  };

  const tabPills = VIEWS.map((v) => ({ id: v.id, label: v.label }));

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        tabs={tabPills}
        activeTab={activeView}
        onTabChange={(id) => setActiveView(id as ViewId)}
        contentClassName="hidden"
      />

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Фільтр за днем вживання:
        </span>
        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: "all", label: "Усі дні" },
              { id: "mon", label: "Пн" },
              { id: "tue", label: "Вт" },
              { id: "wed", label: "Ср" },
              { id: "thu", label: "Чт" },
              { id: "fri", label: "Пт" },
              { id: "sat", label: "Сб" },
              { id: "sun", label: "Нд" },
            ] as { id: "all" | Weekday; label: string }[]
          ).map((dayOption) => {
            const isDayActive = selectedDay === dayOption.id;
            return (
              <button
                key={dayOption.id}
                onClick={() => setSelectedDay(dayOption.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors duration-150 border ${
                  isDayActive
                    ? "bg-accent-nutrition/15 border-accent-nutrition/30 text-accent-nutrition"
                    : "border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                {dayOption.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-panel-title">
            {checkedCountInView} / {totalItemsInView} куплено
          </span>
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <RotateCcw size={12} />
            Скинути
          </button>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-accent-nutrition rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 text-caption">
            <span>
              Бюджет: <span className="font-mono text-zinc-200">{totalCost} ₴</span>
            </span>
            {homeStockCost > 0 && (
              <span>
                Вдома:{" "}
                <span className="font-mono text-amber-400">{Math.round(homeStockCost)} ₴</span>
              </span>
            )}
            {giftedCost > 0 && (
              <span>
                Подаровано:{" "}
                <span className="font-mono text-fuchsia-400">{Math.round(giftedCost)} ₴</span>
              </span>
            )}
            {checkedCost > 0 && (
              <span>
                Куплено:{" "}
                <span className="font-mono text-accent-nutrition">{Math.round(checkedCost)} ₴</span>
              </span>
            )}
          </div>
          {remainingCost > 0 && Math.round(remainingCost) !== totalCost && (
            <span className="text-caption">
              Залишилось:{" "}
              <span className="font-mono text-zinc-200">{Math.round(remainingCost)} ₴</span>
            </span>
          )}
        </div>
      </div>

      <CategoryList
        categories={filteredCategories}
        checked={checked}
        homeStock={homeStock}
        giftedByItemId={giftedByItemId}
        weekStart={weekStart}
        seasonOverride={seasonOverride}
        onToggle={toggle}
        onToggleHomeStock={toggleHomeStock}
        onSetHomeStockFraction={setHomeStockFraction}
        onOpenGiftDialog={setGiftDialogItem}
      />

      {giftDialogItem && (
        <GiftedItemDialog
          isOpen
          onClose={closeGiftDialog}
          onSaved={handleGiftSaved}
          weekStart={weekStart}
          seasonOverride={seasonOverride}
          itemId={giftDialogItem.id}
          itemName={displayNameOf(giftDialogItem)}
          productKey={giftDialogItem.food ?? null}
          unit={giftDialogItem.computedQty?.unit}
          existing={giftedByItemId.get(giftDialogItem.id) ?? null}
          defaultValue={getSeasonalPrice(giftDialogItem, weekStart, seasonOverride)}
        />
      )}
    </div>
  );
}
