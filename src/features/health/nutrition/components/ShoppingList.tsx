"use client";

import { useSyncExternalStore, useState } from "react";
import { Check, Home, Pencil, RotateCcw } from "lucide-react";
import { Tabs } from "@/components/ui/navigation/tabs";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { SHOPPING_LIST } from "../data";
import { PRODUCTS } from "../products";
import { formatGrams } from "../quantities";
import { getUnitPrice } from "../utils/seasonal-pricing";
import {
  displayNameOf,
  displayQtyOf,
  computedTotal,
  VIEWS,
  type ViewId,
  STORES,
  ALL_STORE_GROUPS,
  storeKeyOf,
  tripIndexOfViewId,
  categoriesForTrip,
  combineShoppingItems,
  homeStockBucketsOf,
  homeStockFractionOf,
  homeStockReadout,
  homeStockUnitLabel,
  homeStockKey,
  checkedStore,
  homeStockStore,
  priceOverrideStore,
  storeSelectionStore,
  priceOf,
  categoryCost,
  type FlagMap,
  type FractionMap,
  type PriceOverrideMap,
  type MergedShoppingItem,
} from "../utils/shopping-list";
import type { ShoppingCategory, ShoppingItem } from "../types";

function CategoryList({
  categories,
  checked,
  homeStock,
  priceOverrides,
  storeSelections,
  weekStart,
  seasonOverride,
  activeTripIndex,
  onToggle,
  onToggleHomeStock,
  onSetHomeStockFraction,
  onSetHomeStockEntries,
  onSetPriceOverride,
  onSetStoreSelection,
}: {
  categories: ShoppingCategory[];
  checked: FlagMap;
  homeStock: FractionMap;
  priceOverrides: PriceOverrideMap;
  storeSelections: Record<string, string>;
  weekStart: string;
  seasonOverride?: string;
  activeTripIndex: number | null;
  onToggle: (id: string) => void;
  onToggleHomeStock: (id: string) => void;
  onSetHomeStockFraction: (id: string, fraction: number) => void;
  onSetHomeStockEntries: (entries: { key: string; fraction: number }[]) => void;
  onSetPriceOverride: (foodKey: string, value: number | null) => void;
  onSetStoreSelection: (key: string, storeId: string) => void;
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
                    <div className="w-24 shrink-0">
                      <Select
                        variant="inline"
                        value={storeSelections[storeKeyOf(item)] ?? "none"}
                        onChange={(e) => onSetStoreSelection(storeKeyOf(item), e.target.value)}
                        className="text-xs text-zinc-400 bg-white/5 border border-white/10 rounded px-2 py-0.5"
                      >
                        <option value="none" className="bg-zinc-900 text-zinc-400">
                          Магазин...
                        </option>
                        {STORES.map((store) => (
                          <option
                            key={store.id}
                            value={store.id}
                            className="bg-zinc-900 text-zinc-200"
                          >
                            {store.label}
                          </option>
                        ))}
                      </Select>
                    </div>
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
  const storeSelections = useSyncExternalStore(
    storeSelectionStore.subscribe,
    storeSelectionStore.getSnapshot,
    storeSelectionStore.getServerSnapshot,
  );
  const [activeView, setActiveView] = useState<ViewId>("all");
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("all");
  const [groupingMode, setGroupingMode] = useState<"category" | "store">("category");

  const activeTripIndex = tripIndexOfViewId(activeView);

  const currentCategories =
    activeTripIndex === null
      ? combineShoppingItems(SHOPPING_LIST)
      : categoriesForTrip(activeTripIndex);

  const filteredCategories = currentCategories
    .map((category) => {
      return {
        ...category,
        items: category.items.filter((item) => {
          const itemStore = storeSelections[storeKeyOf(item)] ?? "none";
          if (selectedStoreFilter === "all") return true;
          return itemStore === selectedStoreFilter;
        }),
      };
    })
    .filter((category) => category.items.length > 0);

  const displayedCategories =
    groupingMode === "store"
      ? ALL_STORE_GROUPS.map((store) => {
          const storeItems = filteredCategories
            .flatMap((category) => category.items)
            .filter((item) => {
              const itemStore = storeSelections[storeKeyOf(item)] ?? "none";
              return itemStore === store.id;
            });
          return {
            id: store.id,
            title: store.label,
            items: storeItems,
          };
        }).filter((group) => group.items.length > 0)
      : filteredCategories;

  const visibleItems = displayedCategories.flatMap((category) => category.items);
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

  const totalCost = categoryCost(displayedCategories, weekStart, seasonOverride, priceOverrides);

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

  const setStoreSelection = (key: string, storeId: string) => {
    storeSelectionStore.write({ ...storeSelections, [key]: storeId });
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

      {/* Controls row */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Магазин:
          </span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedStoreFilter("all")}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all duration-150 ${
                selectedStoreFilter === "all"
                  ? "bg-accent-nutrition border-accent-nutrition text-white"
                  : "border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Всі
            </button>
            {STORES.map((store) => (
              <button
                key={store.id}
                onClick={() => setSelectedStoreFilter(store.id)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all duration-150 ${
                  selectedStoreFilter === store.id
                    ? "bg-accent-nutrition border-accent-nutrition text-white"
                    : "border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {store.label}
              </button>
            ))}
            <button
              onClick={() => setSelectedStoreFilter("none")}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-all duration-150 ${
                selectedStoreFilter === "none"
                  ? "bg-accent-nutrition border-accent-nutrition text-white"
                  : "border-white/10 hover:border-white/20 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Не вказано
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Групувати за:
          </span>
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setGroupingMode("category")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-150 ${
                groupingMode === "category"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Категоріями
            </button>
            <button
              onClick={() => setGroupingMode("store")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-all duration-150 ${
                groupingMode === "store"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Магазинами
            </button>
          </div>
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
        categories={displayedCategories}
        checked={checked}
        homeStock={homeStock}
        priceOverrides={priceOverrides}
        storeSelections={storeSelections}
        weekStart={weekStart}
        seasonOverride={seasonOverride}
        activeTripIndex={activeTripIndex}
        onToggle={toggle}
        onToggleHomeStock={toggleHomeStock}
        onSetHomeStockFraction={setHomeStockFraction}
        onSetHomeStockEntries={setHomeStockEntries}
        onSetPriceOverride={setPriceOverride}
        onSetStoreSelection={setStoreSelection}
      />
    </div>
  );
}
