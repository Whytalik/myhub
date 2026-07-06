"use client";

import { PROFILES } from "../data";
import { calculateDayMacros } from "../nutrition-calc";
import { getProductName } from "../products";
import { highlightProductMentions } from "../highlight-products";
import { MealCard } from "./MealCard";
import type { DayPlan as DayPlanType, Meal } from "../types";

function formatPortion(item: { vitalii: number; olesia: number }): string {
  if (item.vitalii > 0 && item.olesia > 0) {
    return `Віталій ${item.vitalii} г · Олеся ${item.olesia} г`;
  }
  if (item.vitalii > 0) return `Тільки Віталій — ${item.vitalii} г`;
  if (item.olesia > 0) return `Тільки Олеся — ${item.olesia} г`;
  return "";
}

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
  groups: ServingGroup[];
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

    entries.push({ labels: [meal.label], title: meal.title, groups: [...groups.values()] });
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
            <div key={profile.id} className="glass-card p-3 flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-semibold text-zinc-100">{profile.name}</span>
              <span className="font-mono text-sm text-accent-nutrition">
                {macros.kcal} ккал/день
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-caption">Б {macros.protein} г</span>
              <span className="text-zinc-600">·</span>
              <span className="text-caption">Ж {macros.fat} г</span>
              <span className="text-zinc-600">·</span>
              <span className="text-caption">В {macros.carbs} г</span>
              <span className="text-caption">(ціль {profile.kcal} ккал)</span>
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
              <span className="text-sm font-semibold text-zinc-200 text-center">
                {entry.labels.join(" + ")} · {entry.title}
              </span>
              {entry.labels.length > 1 && (
                <p className="text-caption text-center italic">
                  Разом на {entry.labels.length.toString()} прийоми — ділити приблизно порівну
                </p>
              )}
              <div className="h-px bg-white/[0.06]" />
              {entry.groups.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {entry.groups.map((group, groupIdx) => (
                    <li
                      key={groupIdx}
                      className="flex items-center justify-between gap-3 text-sm text-zinc-300"
                    >
                      <span>{group.label}</span>
                      <span className="font-mono text-xs text-zinc-400 shrink-0">
                        {formatPortion(group)}
                      </span>
                    </li>
                  ))}
                </ul>
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
          <ul className="flex flex-col gap-1">
            {dayIngredients.map((ingredient, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-zinc-300">
                <span className="text-zinc-600">·</span>
                <span>{highlightProductMentions(ingredient)}</span>
              </li>
            ))}
          </ul>
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
