"use client";

import { PROFILES } from "../data";
import { calculateDayMacros } from "../nutrition-calc";
import { getProductKind, getProductName } from "../nutrition-coverage";
import { MealCard } from "./MealCard";
import { ProductBadge } from "@/components/ui/display/product-badge";
import type { DayPlan as DayPlanType } from "../types";

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

  const dayProductKeys = [
    ...new Set(day.meals.flatMap((m) => (m.macroItems ?? []).map((item) => item.food))),
  ];

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

      {day.note && <p className="text-caption italic">{day.note}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {day.meals.map((meal) => (
          <MealCard key={meal.type} meal={meal} />
        ))}
      </div>

      {dayIngredients.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-2">
          <span className="text-label">Продукти на день</span>
          <ul className="flex flex-col gap-1">
            {dayIngredients.map((ingredient, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-zinc-300">
                <span className="text-zinc-600">·</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dayProductKeys.length > 0 && (
        <div className="glass-card p-4 flex flex-col gap-2">
          <span className="text-label">Статус продуктів у системі</span>
          <ul className="flex flex-wrap gap-2">
            {dayProductKeys.map((key) => (
              <li key={key} className="flex items-center gap-1.5 text-sm text-zinc-300">
                <span>{getProductName(key)}</span>
                <ProductBadge status={getProductKind(key)} />
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
                      <span>{step}</span>
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
