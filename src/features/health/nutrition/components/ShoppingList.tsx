"use client";

import { useSyncExternalStore, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Tabs } from "@/components/ui/navigation/tabs";
import { SHOPPING_LIST } from "../data";
import {
  computedTotal,
  VIEWS,
  type ViewId,
  STORES,
  ALL_STORE_GROUPS,
  storeKeyOf,
  tripIndexOfViewId,
  categoriesForTrip,
  combineShoppingItems,
  homeStockFractionOf,
  homeStockKey,
  checkedStore,
  homeStockStore,
  priceOverrideStore,
  storeSelectionStore,
  priceOf,
  categoryCost,
} from "../utils/shopping-list";
import type { ShoppingItem } from "../types";
import { CategoryList } from "./CategoryList";

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
