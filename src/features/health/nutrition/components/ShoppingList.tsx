"use client";

import { useSyncExternalStore } from "react";
import { Check, RotateCcw } from "lucide-react";
import { SHOPPING_LIST } from "../data";

const STORAGE_KEY = "nutrition-shopping-v1";

type CheckedMap = Record<string, boolean>;

function readFromStorage(): CheckedMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

let cache: CheckedMap = typeof window !== "undefined" ? readFromStorage() : {};
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): CheckedMap {
  return cache;
}

function getServerSnapshot(): CheckedMap {
  return {};
}

function write(next: CheckedMap) {
  cache = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

const TOTAL_ITEMS = SHOPPING_LIST.reduce((sum, category) => sum + category.items.length, 0);

export function ShoppingList() {
  const checked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const checkedCount = Object.entries(checked).filter(
    ([id, val]) => val && !id.includes("-opt-"),
  ).length;
  const progress = TOTAL_ITEMS > 0 ? Math.round((checkedCount / TOTAL_ITEMS) * 100) : 0;

  const totalCost = SHOPPING_LIST.reduce((sum, category) => {
    return sum + category.items.reduce((itemSum, item) => itemSum + (item.price || 0), 0);
  }, 0);

  const checkedCost = SHOPPING_LIST.reduce((sum, category) => {
    return (
      sum +
      category.items.reduce((itemSum, item) => {
        return itemSum + (checked[item.id] ? item.price || 0 : 0);
      }, 0)
    );
  }, 0);

  const remainingCost = totalCost - checkedCost;

  const toggle = (id: string) => write({ ...checked, [id]: !checked[id] });
  const reset = () => write({});

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-panel-title">
            {checkedCount} / {TOTAL_ITEMS} куплено
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
            {checkedCost > 0 && (
              <span>
                Куплено: <span className="font-mono text-accent-nutrition">{checkedCost} ₴</span>
              </span>
            )}
          </div>
          {remainingCost > 0 && remainingCost !== totalCost && (
            <span className="text-caption">
              Залишилось: <span className="font-mono text-zinc-200">{remainingCost} ₴</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {SHOPPING_LIST.map((category) => (
          <div key={category.id} className="glass-card p-4 flex flex-col gap-2">
            <span className="text-label">{category.title}</span>
            <ul className="flex flex-col gap-1">
              {category.items.map((item) => {
                const isChecked = !!checked[item.id];
                const checkboxClass = `flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors duration-150 ${
                  isChecked
                    ? "bg-accent-nutrition border-accent-nutrition text-white"
                    : "border-white/[0.15]"
                }`;
                const nameClass = `text-sm ${isChecked ? "text-zinc-500 line-through" : "text-zinc-200"}`;

                return (
                  <li key={item.id} className="flex flex-col gap-1">
                    <button
                      onClick={() => toggle(item.id)}
                      className="flex items-start gap-2.5 py-1.5 text-left w-full"
                    >
                      <span className={checkboxClass}>
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className={nameClass}>
                          {item.name}
                          {item.qty && <span className="text-zinc-500"> — {item.qty}</span>}
                          {item.price && (
                            <span className="font-mono text-xs text-zinc-500 ml-1.5">
                              ~{item.price} ₴
                            </span>
                          )}
                        </span>
                        {item.note && <span className="text-caption">{item.note}</span>}
                      </span>
                    </button>

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
                                onClick={() => toggle(optionId)}
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
    </div>
  );
}
