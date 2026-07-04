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

  const checkedCount = Object.entries(checked).filter(([id, val]) => val && !id.includes("-opt-")).length;
  const progress = TOTAL_ITEMS > 0 ? Math.round((checkedCount / TOTAL_ITEMS) * 100) : 0;

  const totalCost = SHOPPING_LIST.reduce((sum, category) => {
    return sum + category.items.reduce((itemSum, item) => itemSum + (item.price || 0), 0);
  }, 0);

  const checkedCost = SHOPPING_LIST.reduce((sum, category) => {
    return sum + category.items.reduce((itemSum, item) => {
      return itemSum + (checked[item.id] ? (item.price || 0) : 0);
    }, 0);
  }, 0);

  const remainingCost = totalCost - checkedCost;

  const toggle = (id: string) => write({ ...checked, [id]: !checked[id] });
  const reset = () => write({});

  return (
    <div >
      {}
      <div >
        <div >
          <span >
            {checkedCount} / {TOTAL_ITEMS} куплено
          </span>
          <button
            onClick={reset}

          >
            <RotateCcw size={12} />
            Скинути
          </button>
        </div>
        <div >
          <div

          />
        </div>
        <div >
          <div >
            <span >
              Бюджет: <span >{totalCost} ₴</span>
            </span>
            {checkedCost > 0 && (
              <span >
                Куплено: <span >{checkedCost} ₴</span>
              </span>
            )}
          </div>
          {remainingCost > 0 && remainingCost !== totalCost && (
            <span >
              Залишилось: <span >{remainingCost} ₴</span>
            </span>
          )}
        </div>
      </div>

      {}
      <div >
        {SHOPPING_LIST.map((category) => (
          <div
            key={category.id}

          >
            <span >
              {category.title}
            </span>
            <ul >
              {category.items.map((item) => {
                const isChecked = !!checked[item.id];
                return (
                  <li key={item.id} >
                    <button
                      onClick={() => toggle(item.id)}

                    >
                      <span

                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span >
                        <span

                        >
                          {item.name}
                          {item.qty && (
                            <span > — {item.qty}</span>
                          )}
                          {item.price && (
                            <span >
                              ~{item.price} ₴
                            </span>
                          )}
                        </span>
                        {item.note && (
                          <span >
                            {item.note}
                          </span>
                        )}
                      </span>
                    </button>

                    {item.options && item.options.length > 0 && (
                      <ul >
                        {item.options.map((option, idx) => {
                          const optionId = `${item.id}-opt-${idx}`;
                          const isOptChecked = !!checked[optionId];
                          return (
                            <li key={idx}>
                              <button
                                onClick={() => toggle(optionId)}

                              >
                                <span

                                >
                                  {isOptChecked && <Check size={9} strokeWidth={3.5} />}
                                </span>
                                <span

                                >
                                  {option}
                                </span>
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
