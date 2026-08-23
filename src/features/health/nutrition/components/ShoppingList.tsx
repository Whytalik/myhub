"use client";

import { useSyncExternalStore, useState } from "react";
import { Check, Home, Pencil, RotateCcw } from "lucide-react";
import { Tabs } from "@/components/ui/navigation/tabs";
import { Input } from "@/components/ui/inputs/input";
import { SHOPPING_LIST } from "../data";
import { getProductName, PRODUCTS } from "../products";
import { sumMacroGramsForSetsMulti, formatGrams } from "../quantities";
import { currentWeekStart, weekStartKey } from "../week";
import { SET_IDS, tripIndexOfSetDay } from "../cycle";
import { getSeasonalPrice, getUnitPrice } from "../utils/seasonal-pricing";
import type { ShoppingCategory, ShoppingDay, ShoppingItem, SetOccurrence } from "../types";

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
  const { food, extraFood, sets, grams = 0, unit, wastePercent = 0 } = item.computedQty;
  const baseTotal =
    sumMacroGramsForSetsMulti([food, ...(extraFood ?? [])], sets, weekStart, seasonOverride) +
    grams;
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
  const { food, extraFood, sets, grams = 0, wastePercent = 0 } = item.computedQty;
  const baseTotal =
    sumMacroGramsForSetsMulti([food, ...(extraFood ?? [])], sets, weekStart, seasonOverride) +
    grams;
  return baseTotal * (1 + wastePercent / 100);
}

const STORAGE_KEY = "nutrition-shopping-v1";
const HOME_STOCK_STORAGE_PREFIX = "nutrition-home-stock-v1";
const PRICE_OVERRIDE_STORAGE_KEY = "nutrition-price-override-v1";

const VIEWS = [
  { id: "all" as const, label: "Усі продукти" },
  { id: "trip0" as const, label: "Закуп 1 · Нд" },
  { id: "trip1" as const, label: "Закуп 2 · Ср" },
  { id: "trip2" as const, label: "Закуп 3 · Нд" },
  { id: "trip3" as const, label: "Закуп 4 · Ср" },
];

type ViewId = (typeof VIEWS)[number]["id"];

/** "trip2" -> 2, "all" -> null (немає трипа — повний 14-денний цикл одразу). */
function tripIndexOfViewId(id: ViewId): number | null {
  return id === "all" ? null : Number(id.slice(4));
}

function defaultTripForBuyDay(buyDay: ShoppingDay): number {
  return buyDay === "sun" ? 0 : 1;
}

/** Which trip(s) an item's set-occurrences fall into, sorted ascending — empty
 *  when `occurrences` is empty (flat-`grams`-only items have no date to derive
 *  a trip from, e.g. cottage cheese bought "just because", not tied to a set). */
function tripsForOccurrences(occurrences: SetOccurrence[]): number[] {
  const trips = new Set<number>();
  for (const occ of occurrences) {
    const days: (1 | 2)[] = occ.day !== undefined ? [occ.day] : [1, 2];
    for (const day of days) trips.add(tripIndexOfSetDay(occ.set, day));
  }
  return [...trips].sort((a, b) => a - b);
}

/** Slices `occurrences` down to just the ones needed for `tripIndex` — a set whose
 *  day1/day2 fall in different trips (set4, set6 — see cycle.ts) gets split into a
 *  single-day occurrence instead of being kept/dropped whole. */
function sliceOccurrencesForTrip(occurrences: SetOccurrence[], tripIndex: number): SetOccurrence[] {
  const sliced: SetOccurrence[] = [];
  for (const occ of occurrences) {
    if (occ.day !== undefined) {
      if (tripIndexOfSetDay(occ.set, occ.day) === tripIndex) sliced.push(occ);
      continue;
    }
    const day1Matches = tripIndexOfSetDay(occ.set, 1) === tripIndex;
    const day2Matches = tripIndexOfSetDay(occ.set, 2) === tripIndex;
    if (day1Matches && day2Matches) sliced.push(occ);
    else if (day1Matches) sliced.push({ set: occ.set, day: 1 });
    else if (day2Matches) sliced.push({ set: occ.set, day: 2 });
  }
  return sliced;
}

/** Notes on hand-typed (no-`computedQty`) items mention sets as free text
 *  ("Сет3, день 1", "Сет1 + Сет7", "Щодня") — scan for those mentions to know which
 *  trip(s) the item is relevant to. Returns [] when nothing is mentioned (e.g. "Нд"
 *  alone), which falls back to `defaultTripForBuyDay`. */
function parseNoteTrips(note: string | undefined): number[] {
  if (!note) return [];
  const lower = note.toLowerCase();
  if (lower.includes("щодня") || lower.includes("усі сети")) return [0, 1, 2, 3];
  const trips = new Set<number>();
  const setRe = /сет\s*(\d)/g;
  let match: RegExpExecArray | null;
  while ((match = setRe.exec(lower))) {
    const setId = SET_IDS[Number(match[1]) - 1];
    if (!setId) continue;
    const tail = lower.slice(match.index, match.index + 20);
    const dayMatch = tail.match(/день\s*(\d)/);
    const days: (1 | 2)[] = dayMatch ? [Number(dayMatch[1]) as 1 | 2] : [1, 2];
    for (const day of days) trips.add(tripIndexOfSetDay(setId, day));
  }
  return [...trips];
}

/**
 * Trip-scoped clone of `item`, or `null` if nothing of it is needed on this
 * specific trip. `computedQty` items get their `sets` sliced to just this trip's
 * occurrences (quantity-safe — `sumMacroGramsForSets` sums exactly what's sliced).
 * Hand-typed `qty` strings can't be numerically split, so those show once, on
 * their earliest matching trip only — showing the same unsplit qty on every
 * matching trip would misread as "buy this amount again each time".
 */
/** Earliest trip an item is relevant to — the same rule `sliceItemForTrip` uses to
 *  decide which single trip keeps a hand-typed `qty`/flat `price`, reused to order
 *  sub-items by shopping-trip proximity (nearest trip first) when spreading a "вже
 *  вдома" amount across them — see `setHomeStockFraction` in `ShoppingList`. */
function firstTripOf(item: ShoppingItem): number {
  if (item.computedQty) {
    return tripsForOccurrences(item.computedQty.sets)[0] ?? defaultTripForBuyDay(item.buyDay);
  }
  const noteTrips = parseNoteTrips(item.note);
  return noteTrips.length > 0 ? Math.min(...noteTrips) : defaultTripForBuyDay(item.buyDay);
}

function sliceItemForTrip(item: ShoppingItem, tripIndex: number): ShoppingItem | null {
  if (item.computedQty) {
    const firstTrip = firstTripOf(item);
    const sets = sliceOccurrencesForTrip(item.computedQty.sets, tripIndex);
    const grams = tripIndex === firstTrip ? (item.computedQty.grams ?? 0) : 0;
    if (sets.length === 0 && grams === 0) return null;
    // `item.price` (top-level) is a FLAT fallback `getSeasonalPrice` returns as-is
    // whenever the product has no `basePrice` to scale by qty — repeating that flat
    // number on every trip an item spans would multiply the shown price by however
    // many trips it appears in, so only the first trip keeps it.
    return {
      ...item,
      price: tripIndex === firstTrip ? item.price : undefined,
      computedQty: { ...item.computedQty, sets, grams },
    };
  }
  return tripIndex === firstTripOf(item) ? item : null;
}

/** Every (trip, grams needed in that trip) pair a row touches — one bucket per trip,
 *  in the item's own native quantity. A hand-typed `qty` row (no `computedQty`) has
 *  exactly one bucket at `firstTripOf`, matching how `sliceItemForTrip` already shows
 *  it just once. Used to spread a "вже вдома" amount entered in "Усі продукти" across
 *  the specific trips it actually covers, nearest first, instead of smearing it
 *  proportionally across every trip the row spans. */
function tripBucketsFor(
  item: ShoppingItem,
  weekStart?: string,
  seasonOverride?: string,
): { tripIndex: number; grams: number }[] {
  if (!item.computedQty) {
    return [
      { tripIndex: firstTripOf(item), grams: computedTotal(item, weekStart, seasonOverride) ?? 0 },
    ];
  }
  const trips = tripsForOccurrences(item.computedQty.sets);
  const relevantTrips = trips.length > 0 ? trips : [defaultTripForBuyDay(item.buyDay)];
  return relevantTrips.map((tripIndex) => {
    const sliced = sliceItemForTrip(item, tripIndex);
    return {
      tripIndex,
      grams: sliced ? (computedTotal(sliced, weekStart, seasonOverride) ?? 0) : 0,
    };
  });
}

/** One bucket per (source row, trip it touches) — flattens `tripBucketsFor` across
 *  every row a merged "Усі продукти" item was built from (or just the item itself,
 *  unmerged). This is the actual unit "вже вдома" fills nearest-trip-first against. */
function homeStockBucketsOf(
  item: ShoppingItem,
  weekStart?: string,
  seasonOverride?: string,
): { rowId: string; tripIndex: number; grams: number }[] {
  const rows = (item as MergedShoppingItem).sourceItems ?? [item];
  return rows.flatMap((row) =>
    tripBucketsFor(row, weekStart, seasonOverride).map((bucket) => ({ ...bucket, rowId: row.id })),
  );
}

/** "Вже вдома" coverage fraction (0–1) of `item`'s full need. In a specific trip's
 *  tab there's only ever one trip in play, so this is a direct key lookup; in "Усі
 *  продукти" it's the buckets' weighted average, since each (row, trip) pair can now
 *  hold its own independent fraction (see `homeStockBucketsOf`). */
function homeStockFractionOf(
  item: ShoppingItem,
  activeTripIndex: number | null,
  homeStock: FractionMap,
  itemTotal: number | null,
  weekStart?: string,
  seasonOverride?: string,
): number {
  if (activeTripIndex !== null) {
    return homeStock[homeStockKey(item.id, activeTripIndex)] ?? 0;
  }
  if (!itemTotal || itemTotal <= 0) return 0;
  const buckets = homeStockBucketsOf(item, weekStart, seasonOverride);
  return buckets.reduce((sum, bucket) => {
    const bucketFraction = homeStock[homeStockKey(bucket.rowId, bucket.tripIndex)] ?? 0;
    return sum + (bucketFraction * bucket.grams) / itemTotal;
  }, 0);
}

/** М'ясо/риба готуються наперед у мілпрепі й заморожуються порціями на весь
 *  14-денний цикл — тож на відміну від решти категорій це НЕ ділиться по трипах,
 *  а купується одним разом на найпершому трипі (Закуп 1), як для мілпрепу і треба. */
const BULK_ONCE_CATEGORY_IDS = new Set(["meat"]);

function categoriesForTrip(tripIndex: number): ShoppingCategory[] {
  return SHOPPING_LIST.map((category) => {
    if (BULK_ONCE_CATEGORY_IDS.has(category.id)) {
      return { ...category, items: tripIndex === 0 ? category.items : [] };
    }
    return {
      ...category,
      items: category.items
        .map((item) => sliceItemForTrip(item, tripIndex))
        .filter((item): item is ShoppingItem => item !== null),
    };
  }).filter((category) => category.items.length > 0);
}

function combineShoppingItems(categories: ShoppingCategory[]): ShoppingCategory[] {
  return categories.map((category) => {
    const mergedItems: ShoppingItem[] = [];
    const grouped = new Map<string, ShoppingItem[]>();

    for (const item of category.items) {
      if (!item.food) {
        mergedItems.push(item);
        continue;
      }
      const list = grouped.get(item.food) || [];
      list.push(item);
      grouped.set(item.food, list);
    }

    for (const [food, items] of grouped.entries()) {
      if (items.length === 1) {
        mergedItems.push(items[0]);
        continue;
      }

      const first = items[0];
      const combinedId = items.map((it) => it.id).join("+");
      const combinedNote = items
        .map((it) => it.note)
        .filter(Boolean)
        .join(" + ");
      const combinedQualifier = items
        .map((it) => it.qualifier)
        .filter(Boolean)
        .join(" / ");

      const hasComputedQty = items.every((it) => !!it.computedQty);
      let combinedComputedQty = undefined;
      if (hasComputedQty) {
        const sets: SetOccurrence[] = [];
        let grams = 0;
        let unit = undefined;
        let wastePercent = undefined;
        const extraFood: string[] = [];

        for (const it of items) {
          const cq = it.computedQty!;
          sets.push(...cq.sets);
          if (cq.grams !== undefined) grams += cq.grams;
          if (cq.unit) unit = cq.unit;
          if (cq.wastePercent) wastePercent = cq.wastePercent;
          if (cq.extraFood) extraFood.push(...cq.extraFood);
        }

        combinedComputedQty = {
          food,
          sets,
          grams: grams > 0 ? grams : undefined,
          unit,
          wastePercent,
          extraFood: extraFood.length > 0 ? extraFood : undefined,
        };
      }

      let combinedQty = undefined;
      if (!hasComputedQty) {
        const qties = items.map((it) => it.qty).filter(Boolean);
        if (qties.length > 0) {
          combinedQty = qties.join(" + ");
        }
      }

      let combinedPrice = undefined;
      const prices = items.map((it) => it.price).filter((p): p is number => typeof p === "number");
      if (prices.length === items.length) {
        combinedPrice = prices.reduce((sum, p) => sum + p, 0);
      }

      const merged: MergedShoppingItem = {
        ...first,
        id: combinedId,
        note: combinedNote || undefined,
        qualifier: combinedQualifier || undefined,
        qty: combinedQty,
        price: combinedPrice,
        computedQty: combinedComputedQty,
        sourceItems: items,
      };
      mergedItems.push(merged);
    }

    return {
      ...category,
      items: mergedItems,
    };
  });
}

/** Boolean per item — has it been bought this trip. */
type FlagMap = Record<string, boolean>;
/** Fraction 0–1 per item — how much of the needed amount is already at home
 *  (0/absent = none, 1 = all of it, e.g. 0.3 = "маю 30%"). */
type FractionMap = Record<string, number>;
/** ₴/кг per product key — a manual correction of products.ts's hardcoded `basePrice`. */
type PriceOverrideMap = Record<string, number>;

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
const EMPTY_PRICE_OVERRIDES: PriceOverrideMap = {};

const checkedStore = makeRecordStore<FlagMap>(() => STORAGE_KEY, EMPTY_FLAGS);
// Namespaced by the current shopping week so "вже вдома" naturally clears itself
// week to week — it's a pre-shopping reminder, not meant to persist forever like `checked`.
const homeStockStore = makeRecordStore<FractionMap>(
  () => `${HOME_STOCK_STORAGE_PREFIX}:${weekStartKey(currentWeekStart())}`,
  EMPTY_FRACTIONS,
);
// Not week-scoped — a price correction should stick until manually changed again.
const priceOverrideStore = makeRecordStore<PriceOverrideMap>(
  () => PRICE_OVERRIDE_STORAGE_KEY,
  EMPTY_PRICE_OVERRIDES,
);

/** getSeasonalPrice, but pulling the manual ₴/кг override for the item's product (if any). */
function priceOf(
  item: ShoppingItem,
  weekStart: string,
  seasonOverride: string | undefined,
  priceOverrides: PriceOverrideMap,
): number {
  const override = item.food ? priceOverrides[item.food] : undefined;
  return getSeasonalPrice(item, weekStart, seasonOverride, override);
}

function categoryCost(
  categories: ShoppingCategory[],
  weekStart: string,
  seasonOverride: string | undefined,
  priceOverrides: PriceOverrideMap,
): number {
  return categories.reduce(
    (sum, category) =>
      sum +
      category.items.reduce(
        (itemSum, item) => itemSum + priceOf(item, weekStart, seasonOverride, priceOverrides),
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

/** "Вже вдома" storage key, scoped to the trip being viewed — the same `item.id` shows
 *  up (sliced) on every trip an item spans, so without this a single tap in one trip's
 *  tab reads back as "already home" on every other trip's tab too, over-crediting the
 *  ones you haven't actually shopped yet. `null` (the "Усі продукти" view) keeps the
 *  bare id — that view represents the whole 14-day total, not one trip. */
function homeStockKey(id: string, tripIndex: number | null): string {
  return tripIndex === null ? id : `trip${tripIndex}:${id}`;
}

/** Extends a merged (combineShoppingItems) item with the pre-merge per-trip rows it was
 *  built from — lets the "Усі продукти" view show "куплено X з Y" from `checked` state
 *  on those original ids, since the merged item's own id/checked state can't see that. */
interface MergedShoppingItem extends ShoppingItem {
  sourceItems?: ShoppingItem[];
}

function CategoryList({
  categories,
  checked,
  homeStock,
  priceOverrides,
  weekStart,
  seasonOverride,
  activeTripIndex,
  onToggle,
  onToggleHomeStock,
  onSetHomeStockFraction,
  onSetHomeStockEntries,
  onSetPriceOverride,
}: {
  categories: ShoppingCategory[];
  checked: FlagMap;
  homeStock: FractionMap;
  priceOverrides: PriceOverrideMap;
  weekStart: string;
  seasonOverride?: string;
  activeTripIndex: number | null;
  onToggle: (id: string) => void;
  onToggleHomeStock: (id: string) => void;
  onSetHomeStockFraction: (id: string, fraction: number) => void;
  onSetHomeStockEntries: (entries: { key: string; fraction: number }[]) => void;
  onSetPriceOverride: (foodKey: string, value: number | null) => void;
}) {
  // Only one price editor open at a time, across the whole list.
  const [editingPriceFood, setEditingPriceFood] = useState<string | null>(null);

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
              // "Усі продукти" only: суми того, що вже відмічено купленим у
              // конкретних трипах — щоб частковий прогрес по трипах був видно тут,
              // а не ховався за одним булевим "куплено все".
              const sourceItems = (item as MergedShoppingItem).sourceItems;
              const itemTotal = computedTotal(item, weekStart, seasonOverride);
              // "Усі продукти": буде рахуватись по трип-бакетах (кожен закуп цього
              // товару — окрема, незалежно заповнювана комірка) — див. `homeStockFractionOf`.
              const buckets =
                activeTripIndex === null
                  ? homeStockBucketsOf(item, weekStart, seasonOverride)
                  : null;
              const fraction = homeStockFractionOf(
                item,
                activeTripIndex,
                homeStock,
                itemTotal,
                weekStart,
                seasonOverride,
              );
              const isHomeStock = fraction > 0;
              const qty = displayQtyOf(item, weekStart, seasonOverride);
              const readout = isHomeStock
                ? homeStockReadout(item, fraction, weekStart, seasonOverride)
                : null;
              const purchasedSoFar =
                sourceItems && sourceItems.length > 1
                  ? sourceItems
                      .filter((sub) => checked[sub.id])
                      .reduce(
                        (sum, sub) => sum + (computedTotal(sub, weekStart, seasonOverride) ?? 0),
                        0,
                      )
                  : 0;
              const purchasedReadout =
                purchasedSoFar > 0 && itemTotal !== null && !isChecked
                  ? `куплено ${formatGrams(purchasedSoFar, item.computedQty?.unit, item.computedQty ? PRODUCTS[item.computedQty.food]?.gramsPerPiece : undefined)} з ${formatGrams(itemTotal, item.computedQty?.unit, item.computedQty ? PRODUCTS[item.computedQty.food]?.gramsPerPiece : undefined)}`
                  : null;
              const itemPrice = priceOf(item, weekStart, seasonOverride, priceOverrides);
              // Не вимагає вже заданого `basePrice` — редагування дозволене для
              // будь-якого продукту з products.ts, щоб можна було вперше проставити
              // ₴/кг товарам, які досі мали лише статичну заглушку `item.price`.
              const canEditPrice = !!item.food && !!PRODUCTS[item.food];
              const priceOverride = item.food ? priceOverrides[item.food] : undefined;
              const isPriceOverridden = priceOverride !== undefined;
              const unitPrice = canEditPrice
                ? (priceOverride ?? getUnitPrice(item, weekStart, seasonOverride))
                : null;
              const isEditingPrice = canEditPrice && editingPriceFood === item.food;
              const hasCheckmark = isChecked || fraction >= 1;
              const checkboxClass = `flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors duration-150 ${
                hasCheckmark
                  ? "bg-accent-nutrition border-accent-nutrition text-white"
                  : "border-white/[0.15]"
              }`;
              // Закреслюємо лише коли "вдома" покриває ВСЮ потрібну кількість —
              // часткова відмітка (кілька грам) не має ховати товар зі списку.
              const nameClass = `text-sm ${
                fraction >= 1
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
              const priceButtonClass = `flex items-center justify-center w-6 h-6 rounded-md shrink-0 transition-colors duration-150 ${
                isPriceOverridden
                  ? "bg-cyan-400/15 text-cyan-400"
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
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (buckets) {
                          const nextVal = isHomeStock ? 0 : 1;
                          onSetHomeStockEntries(
                            buckets.map((bucket) => ({
                              key: homeStockKey(bucket.rowId, bucket.tripIndex),
                              fraction: nextVal,
                            })),
                          );
                        } else {
                          onToggleHomeStock(item.id);
                        }
                      }}
                      className={homeButtonClass}
                      title="Вже є вдома — не купувати цього разу"
                    >
                      <Home size={13} />
                    </button>
                    {canEditPrice && (
                      <button
                        onClick={() =>
                          setEditingPriceFood(isEditingPrice ? null : (item.food ?? null))
                        }
                        className={priceButtonClass}
                        title="Редагувати ціну за кг"
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>

                  {isEditingPrice && item.food && (
                    <div className="flex items-center gap-2 pl-6 -mt-1">
                      <Input
                        type="number"
                        min={0}
                        autoFocus
                        placeholder={unitPrice === null ? "₴/кг" : undefined}
                        defaultValue={unitPrice !== null ? Math.round(unitPrice) : undefined}
                        onBlur={(e) => {
                          const value = Number(e.target.value);
                          if (Number.isFinite(value) && value >= 0 && item.food) {
                            onSetPriceOverride(item.food, value);
                          }
                          setEditingPriceFood(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                          if (e.key === "Escape") setEditingPriceFood(null);
                        }}
                        className="w-20 font-mono text-right text-xs text-cyan-400"
                      />
                      <span className="text-label text-cyan-400/70">₴/кг</span>
                      {isPriceOverridden && (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            if (item.food) onSetPriceOverride(item.food, null);
                            setEditingPriceFood(null);
                          }}
                          className="text-label text-zinc-500 hover:text-zinc-300"
                        >
                          Скинути
                        </button>
                      )}
                    </div>
                  )}

                  {isHomeStock && itemTotal !== null && (
                    <div className="flex items-center gap-2 pl-6 -mt-1">
                      <Input
                        type="number"
                        min={0}
                        variant="inline"
                        value={Math.round(fraction * itemTotal)}
                        onChange={(e) => {
                          const amount = Number(e.target.value);
                          if (!Number.isFinite(amount) || itemTotal === null || itemTotal <= 0)
                            return;
                          const clamped = Math.max(0, amount);
                          if (buckets) {
                            // "Усі продукти": заповнюємо найближчий закуп повністю,
                            // залишок переходить у наступний — а не розмазується
                            // порівну по всіх закупах цього товару одразу. Один
                            // пакетний виклик (не цикл onSetHomeStockFraction) —
                            // інакше кожен виклик пише поверх того самого застарілого
                            // `homeStock` зі снепшоту рендера і губить попередні правки.
                            const ordered = [...buckets].sort((a, b) => a.tripIndex - b.tripIndex);
                            let remaining = clamped;
                            const entries = ordered.map((bucket) => {
                              const covered = Math.min(remaining, bucket.grams);
                              remaining = Math.max(0, remaining - covered);
                              return {
                                key: homeStockKey(bucket.rowId, bucket.tripIndex),
                                fraction: bucket.grams > 0 ? covered / bucket.grams : 0,
                              };
                            });
                            onSetHomeStockEntries(entries);
                          } else {
                            onSetHomeStockFraction(item.id, clamped / itemTotal);
                          }
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

                  {purchasedReadout && (
                    <div className="pl-6 -mt-1">
                      <span className="text-label text-accent-nutrition/80">
                        {purchasedReadout}
                      </span>
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

interface ShoppingListProps {
  weekStart: string;
  seasonOverride?: string;
}

export function ShoppingList({ weekStart, seasonOverride }: ShoppingListProps) {
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
  const priceOverrides = useSyncExternalStore(
    priceOverrideStore.subscribe,
    priceOverrideStore.getSnapshot,
    priceOverrideStore.getServerSnapshot,
  );
  const [activeView, setActiveView] = useState<ViewId>("all");
  const activeTripIndex = tripIndexOfViewId(activeView);

  const filteredCategories =
    activeTripIndex === null
      ? combineShoppingItems(SHOPPING_LIST)
      : categoriesForTrip(activeTripIndex);

  const visibleItems = filteredCategories.flatMap((category) => category.items);
  const fractionOf = (item: ShoppingItem) =>
    homeStockFractionOf(
      item,
      activeTripIndex,
      homeStock,
      computedTotal(item, weekStart, seasonOverride),
      weekStart,
      seasonOverride,
    );

  // "Куплено" рахує лише те, що реально ще треба купити — позиції, повністю
  // відмічені "вдома" (fraction 1) не входять ні в знаменник, ні в лічильник прогресу.
  const buyableItemIds = new Set(
    visibleItems.filter((item) => fractionOf(item) < 1).map((item) => item.id),
  );
  const totalItemsInView = buyableItemIds.size;

  const checkedCountInView = Object.entries(checked).filter(
    ([id, val]) => val && !id.includes("-opt-") && buyableItemIds.has(id),
  ).length;

  const progress =
    totalItemsInView > 0 ? Math.round((checkedCountInView / totalItemsInView) * 100) : 0;

  const totalCost = categoryCost(filteredCategories, weekStart, seasonOverride, priceOverrides);

  const homeStockCost = visibleItems.reduce((sum, item) => {
    const itemPrice = priceOf(item, weekStart, seasonOverride, priceOverrides);
    return sum + itemPrice * fractionOf(item);
  }, 0);

  const checkedCost = visibleItems.reduce((sum, item) => {
    const isChecked = item.id.includes("+")
      ? item.id.split("+").every((subId) => checked[subId])
      : !!checked[item.id];
    if (!isChecked) return sum;
    const itemPrice = priceOf(item, weekStart, seasonOverride, priceOverrides);
    return sum + itemPrice * (1 - fractionOf(item));
  }, 0);

  const remainingCost = totalCost - homeStockCost - checkedCost;

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

  // Only reachable from a specific trip's tab (never "Усі продукти" — merged/"+"
  // items there go through `onSetHomeStockEntries` instead, computed straight from
  // CategoryList where the per-trip buckets are known), so `id` is always plain —
  // ключ у сховищі прив'язується до активної вкладки закупу (`homeStockKey`), щоб
  // позначка "вдома" в одному трипі не "протікала" в інші трипи того самого товару.
  const toggleHomeStock = (id: string) => {
    const key = homeStockKey(id, activeTripIndex);
    homeStockStore.write({ ...homeStock, [key]: (homeStock[key] ?? 0) > 0 ? 0 : 1 });
  };

  // Only reachable from a specific trip's tab, same as `toggleHomeStock` above.
  const setHomeStockFraction = (id: string, fraction: number) => {
    homeStockStore.write({ ...homeStock, [homeStockKey(id, activeTripIndex)]: fraction });
  };

  // `entries` carry fully-resolved storage keys already (CategoryList computed them
  // via `homeStockKey` per bucket) — one batched write so every bucket's update lands
  // in the same `homeStockStore.write` call instead of each clobbering the last.
  const setHomeStockEntries = (entries: { key: string; fraction: number }[]) => {
    const nextHomeStock = { ...homeStock };
    for (const { key, fraction } of entries) {
      nextHomeStock[key] = fraction;
    }
    homeStockStore.write(nextHomeStock);
  };

  const setPriceOverride = (foodKey: string, value: number | null) => {
    if (value === null) {
      const next = { ...priceOverrides };
      delete next[foodKey];
      priceOverrideStore.write(next);
    } else {
      priceOverrideStore.write({ ...priceOverrides, [foodKey]: value });
    }
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
      <p className="text-caption text-zinc-500">
        Повний цикл рецептів — 14 днів (2 тижні), 4 закупівлі. &quot;Усі продукти&quot; — підсумок
        за весь цикл; &quot;Закуп 1-4&quot; — рівно те, що треба до наступної поїздки. М&apos;ясо і
        риба — винятково на Закупі 1: береться одразу на весь цикл під мілпреп.
      </p>

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
        priceOverrides={priceOverrides}
        weekStart={weekStart}
        seasonOverride={seasonOverride}
        activeTripIndex={activeTripIndex}
        onToggle={toggle}
        onToggleHomeStock={toggleHomeStock}
        onSetHomeStockFraction={setHomeStockFraction}
        onSetHomeStockEntries={setHomeStockEntries}
        onSetPriceOverride={setPriceOverride}
      />
    </div>
  );
}
