"use client";

import { useState } from "react";
import { Scale, ClipboardList, Flame, UtensilsCrossed, Snowflake } from "lucide-react";
import { CookingModeModal } from "./CookingModeModal";
import { PROFILES } from "../data";
import { calculateDayMacros, type MacroOverrides } from "../nutrition-calc";
import { PRODUCTS, getProductName } from "../products";
import { highlightProductMentions, findMentionedPantryProductKeys } from "../highlight-products";
import { MealCard } from "./MealCard";
import { PushToFatSecretButton } from "./PushToFatSecretButton";
import { weekStartKey } from "../week";
import { formatGrams } from "../quantities";
import type { ResolvedDayView } from "../cycle";
import type { Meal, MacroItem, MealType, PrepSection, ThawInstruction } from "../types";

function isRepeatPortion(meal: Meal): boolean {
  return meal.ingredients.some((ing) => {
    const lower = ing.toLowerCase();
    return lower.includes("друга порція") || lower.includes("обідньої страви");
  });
}

interface ServingGroup {
  label: string;
  vitalii: number;
  olesia: number;
  foodKey?: string;
}

interface ServingEntry {
  labels: string[];
  title: string;
  mealType: MealType;
  groups: ServingGroup[];
  rawMacroItems: MacroItem[];
}

/**
 * Об'єднує прийоми їжі в блоки для сервування: "друга порція" (той самий
 * приготований обсяг, з'їдений за два рази) зливається з попереднім
 * прийомом, а не показується як ще одна повна порція зверху — інакше
 * реальна кількість подвоюється проти того, що фактично приготовано.
 * Продукти всередині прийому групуються за `component` (складова страви,
 * напр. "Грецький салат"), щоб показати порцію страви, а не кожен
 * інгредієнт окремо.
 */
function buildServingEntries(meals: Meal[]): ServingEntry[] {
  const entries: ServingEntry[] = [];

  for (const meal of meals) {
    if (isRepeatPortion(meal) && entries.length > 0) {
      entries[entries.length - 1].labels.push(meal.label);
      continue;
    }

    const groups = new Map<string, ServingGroup & { component?: string }>();
    for (const item of meal.macroItems ?? []) {
      if (item.vitalii <= 0 && item.olesia <= 0) continue;
      const key = item.component ?? item.food;
      const existing = groups.get(key);
      if (existing) {
        existing.vitalii += item.vitalii;
        existing.olesia += item.olesia;
        if (existing.foodKey !== item.food) {
          existing.foodKey = undefined;
        }
      } else {
        groups.set(key, {
          label: key,
          component: item.component,
          vitalii: item.vitalii,
          olesia: item.olesia,
          foodKey: item.food,
        });
      }
    }

    // Component на групі з єдиним foodKey — це лише позначка призначення
    // (напр. "Для смаження курки"), не назва самостійної страви з кількох
    // продуктів (як "Капрезе") — тому показуємо назву продукту, а
    // призначення додаємо в дужках, а не ховаємо продукт за поміткою.
    const finalizedGroups: ServingGroup[] = [...groups.values()].map(({ component, ...group }) => ({
      ...group,
      label: group.foodKey
        ? component
          ? `${getProductName(group.foodKey)} (${component})`
          : getProductName(group.foodKey)
        : group.label,
    }));

    entries.push({
      labels: [meal.label],
      title: meal.title,
      mealType: meal.type,
      groups: finalizedGroups,
      rawMacroItems: meal.macroItems ?? [],
    });
  }

  return entries;
}

interface DayProductTotal {
  foodKey: string;
  name: string;
  vitalii: number;
  olesia: number;
}

/**
 * Підсумовує кожен продукт за весь день напряму з `macroItems` (структуровані
 * дані), а не з вільнотекстових `ingredients` — деякі рядки тексту описують
 * одразу кілька продуктів в одному реченні (напр. "Для салату: помідори...,
 * огірок..., перець...") і не розбиваються чисто на "продукт" + "кількість".
 */
function buildDayProductTotals(meals: Meal[], prepSteps?: PrepSection[]): DayProductTotal[] {
  const totals = new Map<string, DayProductTotal>();

  for (const meal of meals) {
    for (const item of meal.macroItems ?? []) {
      if (item.vitalii <= 0 && item.olesia <= 0) continue;
      const name = getProductName(item.food);
      const existing = totals.get(item.food);
      if (existing) {
        existing.vitalii += item.vitalii;
        existing.olesia += item.olesia;
      } else {
        totals.set(item.food, {
          foodKey: item.food,
          name,
          vitalii: item.vitalii,
          olesia: item.olesia,
        });
      }
    }
  }

  // Pantry products (спеції) carry no macros, so they never show up above —
  // recover them from the day's free text instead, with a "—" quantity.
  const texts = [
    ...meals.flatMap((meal) => meal.ingredients),
    ...(prepSteps?.flatMap((section) => section.steps) ?? []),
  ];
  for (const key of findMentionedPantryProductKeys(texts)) {
    if (totals.has(key)) continue;
    totals.set(key, { foodKey: key, name: getProductName(key), vitalii: 0, olesia: 0 });
  }

  return [...totals.values()];
}

function splitRepeatMeals(day: ResolvedDayView): ResolvedDayView {
  // Deep copy meals so we don't mutate the static SET_PLAN
  const meals: Meal[] = day.meals.map((meal) => ({
    ...meal,
    macroItems: meal.macroItems ? meal.macroItems.map((item) => ({ ...item })) : [],
    ingredients: [...meal.ingredients],
  }));

  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];
    if (meal.type === "dinner" && isRepeatPortion(meal)) {
      const lunch = meals.find((m) => m.type === "lunch");
      if (lunch && lunch.macroItems && lunch.macroItems.length > 0) {
        const lunchHalfItems: MacroItem[] = [];
        const dinnerHalfItems: MacroItem[] = [];

        for (const item of lunch.macroItems) {
          // Halve values, rounding to 1 decimal place to avoid float issues
          const vHalf = Math.round((item.vitalii / 2) * 10) / 10;
          const oHalf = Math.round((item.olesia / 2) * 10) / 10;

          lunchHalfItems.push({
            ...item,
            vitalii: vHalf,
            olesia: oHalf,
          });

          dinnerHalfItems.push({
            ...item,
            vitalii: vHalf,
            olesia: oHalf,
          });
        }

        lunch.macroItems = lunchHalfItems;
        meal.macroItems = dinnerHalfItems;
        meal.title = lunch.title;
        meal.ingredients = [
          "Друга порція обідньої страви (розігріти м'ясо та гарнір, салат зробити свіжим)",
        ];
      }
    }
  }

  return {
    ...day,
    meals,
  };
}

interface ServingDisplay {
  totalLabel: string;
  vitalii: React.ReactNode;
  olesia: React.ReactNode;
}

/** Shared weight formatting (raw vs. cooked, per-person %) for both the mobile card list and the desktop table. */
function computeServingDisplay(group: ServingGroup): ServingDisplay {
  const product = group.foodKey ? PRODUCTS[group.foodKey] : undefined;
  const multiplier = product?.cookedMultiplier;
  const gramsPerPiece = product?.gramsPerPiece;

  const totalRaw = group.vitalii + group.olesia;
  const vitaliiPct = totalRaw > 0 ? Math.round((group.vitalii / totalRaw) * 100) : 0;
  const olesiaPct = totalRaw > 0 ? 100 - vitaliiPct : 0;
  const showPct = totalRaw > 0 && group.vitalii > 0 && group.olesia > 0;

  let totalLabel = "";
  if (showPct) {
    totalLabel = multiplier
      ? `~${Math.round(totalRaw * multiplier)} г готового`
      : gramsPerPiece
        ? `${formatGrams(totalRaw, "piece", gramsPerPiece)} (${totalRaw} г)`
        : product?.key === "milk"
          ? `~${Math.round(totalRaw)} мл`
          : `~${Math.round(totalRaw)} г`;
  }

  const formatWeight = (rawWeight: number, pct: number) => {
    if (rawWeight <= 0) return "—";
    const pctSuffix = showPct ? ` (${pct}%)` : "";

    if (gramsPerPiece) {
      return `${formatGrams(rawWeight, "piece", gramsPerPiece)} (${rawWeight} г)${pctSuffix}`;
    }

    if (product?.key === "milk") {
      return `${Math.round(rawWeight)} мл${pctSuffix}`;
    }

    if (multiplier) {
      const rawLabel = product?.category === "grains" ? "сух." : "сир.";
      return (
        <span className="flex flex-col items-end sm:inline sm:space-x-1">
          <span className="text-zinc-500">
            {rawWeight} г ({rawLabel})
          </span>
          <span className="hidden sm:inline text-zinc-600 mx-1.5">→</span>
          <span className="text-accent-nutrition font-bold">
            ~{Math.round(rawWeight * multiplier)} г (гот.){pctSuffix}
          </span>
        </span>
      );
    }
    return `${rawWeight} г${pctSuffix}`;
  };

  return {
    totalLabel,
    vitalii: formatWeight(group.vitalii, vitaliiPct),
    olesia: formatWeight(group.olesia, olesiaPct),
  };
}

export function DayPlan({
  day,
  tomorrowThaw,
  overrides,
}: {
  day: ResolvedDayView;
  tomorrowThaw: ThawInstruction[];
  overrides?: MacroOverrides;
}) {
  const processedDay = splitRepeatMeals(day);
  const viewedDayKey = weekStartKey(day.date);
  const actual = {
    vitalii: calculateDayMacros(processedDay, "vitalii", overrides),
    olesia: calculateDayMacros(processedDay, "olesia", overrides),
  };

  const dayProductTotals = buildDayProductTotals(processedDay.meals, processedDay.prepSteps);
  const [isCookingMode, setIsCookingMode] = useState(false);

  const sectionIconClass =
    "flex items-center justify-center w-8 h-8 rounded-lg bg-accent-nutrition/10 text-accent-nutrition shrink-0";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROFILES.map((profile) => {
          const macros = actual[profile.id as keyof typeof actual];

          return (
            <div key={profile.id} className="glass-card p-3 flex flex-col gap-2">
              <span className="text-sm font-semibold text-zinc-100">{profile.name}</span>
              <div className="rounded-xl bg-white/[0.02] px-2">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="text-label text-left py-1.5 pr-2 w-14"></th>
                      <th className="text-label text-right py-1.5 px-2 w-16">Ккал</th>
                      <th className="text-label text-right py-1.5 px-2 w-14">Б</th>
                      <th className="text-label text-right py-1.5 px-2 w-14">Ж</th>
                      <th className="text-label text-right py-1.5 w-14">В</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/[0.03]">
                      <td className="py-1.5 pr-2 text-caption">План</td>
                      <td className="py-1.5 px-2 text-right font-mono text-zinc-300">
                        {profile.kcal}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-zinc-300">
                        {profile.macros.protein}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-zinc-300">
                        {profile.macros.fat}
                      </td>
                      <td className="py-1.5 text-right font-mono text-zinc-300">
                        {profile.macros.carbs}
                      </td>
                    </tr>
                    <tr className="bg-accent-nutrition/5">
                      <td className="py-1.5 pr-2 text-caption">Факт</td>
                      <td className="py-1.5 px-2 text-right font-mono text-accent-nutrition">
                        {macros.kcal}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-zinc-100">
                        {macros.protein}
                      </td>
                      <td className="py-1.5 px-2 text-right font-mono text-zinc-100">
                        {macros.fat}
                      </td>
                      <td className="py-1.5 text-right font-mono text-zinc-100">{macros.carbs}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {processedDay.note && (
        <p className="text-caption italic">{highlightProductMentions(processedDay.note)}</p>
      )}

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <UtensilsCrossed size={16} />
          </div>
          <span className="text-panel-title">Прийоми їжі</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {processedDay.meals.map((meal) => (
            <MealCard key={`${meal.type}-${meal.label}`} meal={meal} overrides={overrides} />
          ))}
        </div>
      </div>

      {dayProductTotals.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className={sectionIconClass}>
              <ClipboardList size={16} />
            </div>
            <span className="text-panel-title">Продукти на день</span>
          </div>
          <div className="overflow-x-auto rounded-xl bg-white/[0.02] px-3">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="text-label text-left py-2 pr-3">Продукт</th>
                  <th className="text-label text-right py-2 w-24">Кількість</th>
                </tr>
              </thead>
              <tbody>
                {dayProductTotals.map((total, i) => {
                  const grams = total.vitalii + total.olesia;
                  const product = PRODUCTS[total.foodKey];
                  let displayValue = "—";
                  if (grams > 0) {
                    if (product?.gramsPerPiece) {
                      const pcs = Math.round(grams / product.gramsPerPiece);
                      displayValue = `${pcs} шт (${grams} г)`;
                    } else if (product?.key === "milk") {
                      displayValue = `${grams} мл`;
                    } else {
                      displayValue = `${grams} г`;
                    }
                  }
                  return (
                    <tr key={i} className="border-b border-white/[0.03] last:border-0">
                      <td className="py-2 pr-3 text-zinc-200">{total.name}</td>
                      <td className="py-2 text-right font-mono text-xs text-zinc-400">
                        {displayValue}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {processedDay.prepSteps && processedDay.prepSteps.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={sectionIconClass}>
                <Flame size={16} />
              </div>
              <span className="text-panel-title">Алгоритм приготування</span>
            </div>
            <button
              onClick={() => setIsCookingMode(true)}
              className="px-4 py-2 bg-accent-nutrition text-white rounded-lg font-medium shadow-lg hover:bg-accent-nutrition/90 transition-colors flex items-center gap-2 w-fit"
            >
              <Flame size={16} />
              Почати готувати
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {processedDay.prepSteps.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-zinc-200">{section.title}</span>
                <ul className="flex flex-col gap-1">
                  {section.steps.map((step, stepIdx) => (
                    <li key={stepIdx} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="font-mono text-xs text-zinc-500 shrink-0">
                        {stepIdx + 1}.
                      </span>
                      <span>{highlightProductMentions(step)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <Scale size={16} />
          </div>
          <span className="text-panel-title">Сервування — порції на сьогодні</span>
        </div>
        <div className="flex flex-col gap-6">
          {buildServingEntries(processedDay.meals).map((entry, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-200">
                  {entry.labels.join(" + ")} · {entry.title}
                </span>
                <PushToFatSecretButton
                  mealType={entry.mealType}
                  macroItems={entry.rawMacroItems}
                  pushedKey={`${viewedDayKey}-${entry.mealType}-${entry.labels.join("+")}`}
                />
              </div>
              {entry.labels.length > 1 && (
                <p className="text-caption italic">
                  Разом на {entry.labels.length.toString()} прийоми — ділити приблизно порівну
                </p>
              )}
              <div className="h-px bg-white/[0.06]" />
              {entry.groups.length > 0 ? (
                <>
                  <div className="flex sm:hidden flex-col gap-2">
                    {entry.groups.map((group, groupIdx) => {
                      const display = computeServingDisplay(group);
                      return (
                        <div
                          key={groupIdx}
                          className="rounded-lg bg-white/[0.02] p-2.5 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-zinc-200">{group.label}</span>
                            {display.totalLabel && (
                              <span className="text-xs font-mono text-zinc-500 shrink-0">
                                {display.totalLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 text-xs font-mono text-zinc-400">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-zinc-500">Віталій</span>
                              {display.vitalii}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-zinc-500">Олеся</span>
                              {display.olesia}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden sm:block overflow-x-auto rounded-xl bg-white/[0.02] px-3">
                    <table className="w-full text-sm table-fixed">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="text-label text-left py-2 pr-3">Продукт</th>
                          <th className="text-label text-right py-2 pr-3 w-36">Всього</th>
                          <th className="text-label text-right py-2 pr-3 w-56">Віталій</th>
                          <th className="text-label text-right py-2 w-56">Олеся</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.groups.map((group, groupIdx) => {
                          const display = computeServingDisplay(group);
                          return (
                            <tr
                              key={groupIdx}
                              className="border-b border-white/[0.03] last:border-0"
                            >
                              <td className="py-2 pr-3 text-zinc-200">{group.label}</td>
                              <td className="py-2 pr-3 text-right font-mono text-xs text-zinc-400">
                                {display.totalLabel || "—"}
                              </td>
                              <td className="py-2 pr-3 text-right font-mono text-xs text-zinc-400">
                                {display.vitalii}
                              </td>
                              <td className="py-2 text-right font-mono text-xs text-zinc-400">
                                {display.olesia}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-caption italic">Без окремих продуктів для розрахунку</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Підготовка на завтра */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <Snowflake size={16} />
          </div>
          <div>
            <h3 className="text-panel-title">Підготовка на завтра</h3>
            <p className="text-caption">
              Що потрібно зробити сьогодні ввечері (дістати з морозилки тощо)
            </p>
          </div>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {tomorrowThaw.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {tomorrowThaw.map((prep, idx) => (
              <li
                key={idx}
                className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 shrink-0 text-xs mt-0.5 font-bold">
                  !
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-zinc-150">{prep.title}</span>
                  <p className="text-sm text-zinc-300">{prep.action}</p>
                  {prep.note && <span className="text-caption text-zinc-400">{prep.note}</span>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex gap-3 p-3 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 text-emerald-400">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 text-xs mt-0.5 font-bold">
              ✓
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">Розморожування не потрібне</span>
              <p className="text-sm text-zinc-300">
                Для завтрашніх страв не потрібно нічого діставати з морозилки.
              </p>
            </div>
          </div>
        )}
      </div>
      {isCookingMode && (
        <CookingModeModal algorithm={processedDay.prepSteps!} onClose={() => setIsCookingMode(false)} />
      )}
    </div>
  );
}
