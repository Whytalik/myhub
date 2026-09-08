import { useState } from "react";
import { Check, Home, Pencil } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { PRODUCTS } from "../products";
import { formatGrams } from "../quantities";
import { getUnitPrice } from "../utils/seasonal-pricing";
import {
  displayNameOf,
  displayQtyOf,
  computedTotal,
  STORES,
  storeKeyOf,
  homeStockBucketsOf,
  homeStockFractionOf,
  homeStockReadout,
  homeStockUnitLabel,
  homeStockKey,
  priceOf,
  type FlagMap,
  type FractionMap,
  type PriceOverrideMap,
  type MergedShoppingItem,
} from "../utils/shopping-list";
import type { ShoppingCategory } from "../types";

export function CategoryList({
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
