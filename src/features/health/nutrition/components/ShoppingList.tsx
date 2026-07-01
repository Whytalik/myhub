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

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = TOTAL_ITEMS > 0 ? Math.round((checkedCount / TOTAL_ITEMS) * 100) : 0;

  const toggle = (id: string) => write({ ...checked, [id]: !checked[id] });
  const reset = () => write({});

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-note font-medium text-text-primary">
            {checkedCount} / {TOTAL_ITEMS} куплено
          </span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-caption font-medium text-text-muted hover:text-text-primary transition-colors duration-200"
          >
            <RotateCcw size={12} />
            Скинути
          </button>
        </div>
        <div className="h-1.5 w-full bg-border-dim rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOPPING_LIST.map((category) => (
          <div
            key={category.id}
            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2"
          >
            <span className="text-caption font-mono uppercase tracking-wider text-text-muted px-1">
              {category.title}
            </span>
            <ul className="flex flex-col gap-0.5">
              {category.items.map((item) => {
                const isChecked = !!checked[item.id];
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-start gap-2.5 px-1 py-1.5 rounded-lg text-left hover:bg-surface-hover transition-colors duration-150"
                    >
                      <span
                        className={`mt-0.5 shrink-0 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-150 ${
                          isChecked ? "bg-accent border-accent" : "border-border-strong"
                        }`}
                      >
                        {isChecked && <Check size={11} className="text-bg" strokeWidth={3} />}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span
                          className={`text-caption leading-snug transition-colors duration-150 ${
                            isChecked ? "text-text-muted line-through" : "text-text-primary"
                          }`}
                        >
                          {item.name}
                          {item.qty && (
                            <span className="text-text-secondary font-medium"> — {item.qty}</span>
                          )}
                        </span>
                        {item.note && (
                          <span className="text-label text-text-muted leading-snug">
                            {item.note}
                          </span>
                        )}
                      </span>
                    </button>
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
