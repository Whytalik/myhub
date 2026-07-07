"use client";

import { Scale, ClipboardList, Flame, UtensilsCrossed } from "lucide-react";
import { PROFILES } from "../data";
import { calculateDayMacros } from "../nutrition-calc";
import { PRODUCTS, getProductName } from "../products";
import { highlightProductMentions } from "../highlight-products";
import { MealCard } from "./MealCard";
import { PushToFatSecretButton } from "./PushToFatSecretButton";
import type { DayPlan as DayPlanType, Meal, MacroItem, MealType } from "../types";

function isRepeatPortion(meal: Meal): boolean {
  return (
    (meal.macroItems ?? []).length === 0 &&
    meal.ingredients.some((ing) => {
      const lower = ing.toLowerCase();
      return lower.includes("друга порція") || lower.includes("обідньої страви");
    })
  );
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

    const groups = new Map<string, ServingGroup>();
    for (const item of meal.macroItems ?? []) {
      if (item.vitalii <= 0 && item.olesia <= 0) continue;
      const label = item.component ?? getProductName(item.food);
      const existing = groups.get(label);
      if (existing) {
        existing.vitalii += item.vitalii;
        existing.olesia += item.olesia;
        if (existing.foodKey !== item.food) {
          existing.foodKey = undefined;
        }
      } else {
        groups.set(label, {
          label,
          vitalii: item.vitalii,
          olesia: item.olesia,
          foodKey: item.food,
        });
      }
    }

    entries.push({
      labels: [meal.label],
      title: meal.title,
      mealType: meal.type,
      groups: [...groups.values()],
      rawMacroItems: meal.macroItems ?? [],
    });
  }

  return entries;
}

interface DayProductTotal {
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
function buildDayProductTotals(meals: Meal[]): DayProductTotal[] {
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
        totals.set(item.food, { name, vitalii: item.vitalii, olesia: item.olesia });
      }
    }
  }

  return [...totals.values()];
}

function splitRepeatMeals(day: DayPlanType): DayPlanType {
  // Deep copy meals so we don't mutate the static WEEK_PLAN
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

export function DayPlan({ day }: { day: DayPlanType }) {
  const processedDay = splitRepeatMeals(day);
  const actual = {
    vitalii: calculateDayMacros(processedDay, "vitalii"),
    olesia: calculateDayMacros(processedDay, "olesia"),
  };

  const dayProductTotals = buildDayProductTotals(processedDay.meals);

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

      {processedDay.note && <p className="text-caption italic">{highlightProductMentions(processedDay.note)}</p>}

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className={sectionIconClass}>
            <UtensilsCrossed size={16} />
          </div>
          <span className="text-panel-title">Прийоми їжі</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {processedDay.meals.map((meal) => (
            <MealCard key={meal.type} meal={meal} />
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
                  <th className="text-label text-right py-2 pr-3 w-24">Віталій</th>
                  <th className="text-label text-right py-2 w-24">Олеся</th>
                </tr>
              </thead>
              <tbody>
                {dayProductTotals.map((total, i) => (
                  <tr key={i} className="border-b border-white/[0.03] last:border-0">
                    <td className="py-2 pr-3 text-zinc-200">{total.name}</td>
                    <td className="py-2 pr-3 text-right font-mono text-xs text-zinc-400">
                      {total.vitalii > 0 ? `${total.vitalii} г` : "—"}
                    </td>
                    <td className="py-2 text-right font-mono text-xs text-zinc-400">
                      {total.olesia > 0 ? `${total.olesia} г` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {processedDay.prepSteps && processedDay.prepSteps.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className={sectionIconClass}>
              <Flame size={16} />
            </div>
            <span className="text-panel-title">Алгоритм приготування</span>
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
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-zinc-200">
                  {entry.labels.join(" + ")} · {entry.title}
                </span>
                <PushToFatSecretButton mealType={entry.mealType} macroItems={entry.rawMacroItems} />
              </div>
              {entry.labels.length > 1 && (
                <p className="text-caption italic">
                  Разом на {entry.labels.length.toString()} прийоми — ділити приблизно порівну
                </p>
              )}
              <div className="h-px bg-white/[0.06]" />
              {entry.groups.length > 0 ? (
                <div className="overflow-x-auto rounded-xl bg-white/[0.02] px-3">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                        <th className="text-label text-left py-2 pr-3">Продукт</th>
                        <th className="text-label text-right py-2 pr-3 w-28 sm:w-56">Віталій</th>
                        <th className="text-label text-right py-2 w-28 sm:w-56">Олеся</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.groups.map((group, groupIdx) => {
                        const product = group.foodKey ? PRODUCTS[group.foodKey] : undefined;
                        const multiplier = product?.cookedMultiplier;

                        // Calculate total and percentages
                        const totalRaw = group.vitalii + group.olesia;
                        const vitaliiPct = totalRaw > 0 ? Math.round((group.vitalii / totalRaw) * 100) : 0;
                        const olesiaPct = totalRaw > 0 ? 100 - vitaliiPct : 0;

                        let totalLabel = "";
                        if (totalRaw > 0 && group.vitalii > 0 && group.olesia > 0) {
                          if (multiplier) {
                            totalLabel = ` (всього ~${Math.round(totalRaw * multiplier)} г готового)`;
                          } else {
                            totalLabel = ` (всього ~${Math.round(totalRaw)} г)`;
                          }
                        }

                        const formatWeight = (rawWeight: number, pct: number) => {
                          if (rawWeight <= 0) return "—";
                          
                          const pctSuffix = totalRaw > 0 && group.vitalii > 0 && group.olesia > 0 ? ` (${pct}%)` : "";

                          if (multiplier) {
                            return (
                              <span className="flex flex-col items-end sm:inline sm:space-x-1">
                                <span className="text-zinc-500">{rawWeight} г (сух.)</span>
                                <span className="hidden sm:inline text-zinc-600 mx-1.5">→</span>
                                <span className="text-accent-nutrition font-bold">~{Math.round(rawWeight * multiplier)} г (гот.){pctSuffix}</span>
                              </span>
                            );
                          }
                          return `${rawWeight} г${pctSuffix}`;
                        };

                        return (
                          <tr key={groupIdx} className="border-b border-white/[0.03] last:border-0">
                            <td className="py-2 pr-3 text-zinc-200">
                              {group.label}
                              {totalLabel && (
                                <span className="text-xs text-zinc-500 font-normal">
                                  {totalLabel}
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-3 text-right font-mono text-xs text-zinc-400">
                              {formatWeight(group.vitalii, vitaliiPct)}
                            </td>
                            <td className="py-2 text-right font-mono text-xs text-zinc-400">
                              {formatWeight(group.olesia, olesiaPct)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-caption italic">Без окремих продуктів для розрахунку</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
