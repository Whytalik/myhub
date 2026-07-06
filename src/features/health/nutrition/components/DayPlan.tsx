"use client";

import { PROFILES } from "../data";
import { calculateDayMacros } from "../nutrition-calc";
import { getProductName } from "../products";
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
      } else {
        groups.set(label, { label, vitalii: item.vitalii, olesia: item.olesia });
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

export function DayPlan({ day }: { day: DayPlanType }) {
  const actual = {
    vitalii: calculateDayMacros(day, "vitalii"),
    olesia: calculateDayMacros(day, "olesia"),
  };

  const dayIngredients = day.meals
    .flatMap((m) => m.ingredients)
    .filter((ing) => {
      const lower = ing.toLowerCase();
      return !lower.includes("друга порція") && !lower.includes("обідньої страви");
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROFILES.map((profile) => {
          const macros = actual[profile.id as keyof typeof actual];

          return (
            <div key={profile.id} className="glass-card p-3 flex flex-col gap-2">
              <span className="text-sm font-semibold text-zinc-100">{profile.name}</span>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-label text-left py-1.5 pr-2"></th>
                    <th className="text-label text-right py-1.5 px-2">Ккал</th>
                    <th className="text-label text-right py-1.5 px-2">Б</th>
                    <th className="text-label text-right py-1.5 px-2">Ж</th>
                    <th className="text-label text-right py-1.5">В</th>
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
                  <tr>
                    <td className="py-1.5 pr-2 text-caption">Факт</td>
                    <td className="py-1.5 px-2 text-right font-mono text-accent-nutrition">
                      {macros.kcal}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-zinc-100">
                      {macros.protein}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-zinc-100">{macros.fat}</td>
                    <td className="py-1.5 text-right font-mono text-zinc-100">{macros.carbs}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {day.note && <p className="text-caption italic">{highlightProductMentions(day.note)}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {day.meals.map((meal) => (
          <MealCard key={meal.type} meal={meal} />
        ))}
      </div>

      <div className="glass-card p-4 flex flex-col gap-4">
        <span className="text-label">Сервування — порції на сьогодні</span>
        <div className="flex flex-col gap-4">
          {buildServingEntries(day.meals).map((entry, idx) => (
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-label text-left py-2 pr-3">Продукт</th>
                        <th className="text-label text-right py-2 pr-3">Віталій</th>
                        <th className="text-label text-right py-2">Олеся</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.groups.map((group, groupIdx) => (
                        <tr key={groupIdx} className="border-b border-white/[0.03] last:border-0">
                          <td className="py-2 pr-3 text-zinc-200">{group.label}</td>
                          <td className="py-2 pr-3 text-right font-mono text-xs text-zinc-400">
                            {group.vitalii > 0 ? `${group.vitalii} г` : "—"}
                          </td>
                          <td className="py-2 text-right font-mono text-xs text-zinc-400">
                            {group.olesia > 0 ? `${group.olesia} г` : "—"}
                          </td>
                        </tr>
                      ))}
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

      {dayIngredients.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-2">
          <span className="text-label">Продукти на день</span>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {dayIngredients.map((ingredient, i) => (
                  <tr key={i} className="border-b border-white/[0.03] last:border-0">
                    <td className="py-2 text-zinc-300">{highlightProductMentions(ingredient)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {day.prepSteps && day.prepSteps.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-3">
          <span className="text-label">Алгоритм приготування</span>
          <div className="flex flex-col gap-3">
            {day.prepSteps.map((section, idx) => (
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
    </div>
  );
}
