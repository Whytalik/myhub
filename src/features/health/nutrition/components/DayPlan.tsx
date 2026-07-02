"use client";

import { PROFILES } from "../data";
import { calculateDayMacros } from "../nutrition-calc";
import { MealCard } from "./MealCard";
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

  return (
    <div className="flex flex-col gap-5">
      {/* Macro strip — calculated from this day's actual meals, target shown for reference */}
      <div className="flex flex-col gap-1.5">
        {PROFILES.map((profile) => {
          const macros = actual[profile.id as keyof typeof actual];
          return (
            <div
              key={profile.id}
              className="flex items-center gap-4 flex-wrap text-caption text-text-secondary"
            >
              <span className="font-semibold text-text-primary w-16 shrink-0">{profile.name}</span>
              <span className="font-medium text-text-primary">{macros.kcal} ккал/день</span>
              <span className="text-text-muted">·</span>
              <span>Б {macros.protein} г</span>
              <span className="text-text-muted">·</span>
              <span>Ж {macros.fat} г</span>
              <span className="text-text-muted">·</span>
              <span>В {macros.carbs} г</span>
              <span className="text-text-muted/60">(ціль {profile.kcal} ккал)</span>
            </div>
          );
        })}
      </div>

      {day.note && (
        <p className="text-caption text-text-secondary leading-relaxed pl-3 border-l-2 border-border-strong">
          {day.note}
        </p>
      )}

      {/* Meals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {day.meals.map((meal) => (
          <MealCard key={meal.type} meal={meal} />
        ))}
      </div>

      {/* Products for the Day */}
      {dayIngredients.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
          <span className="text-caption font-semibold text-text-primary uppercase tracking-wider font-mono">
            Продукти на день
          </span>
          <ul className="flex flex-col gap-1.5 pl-1">
            {dayIngredients.map((ingredient, i) => (
              <li key={i} className="text-caption text-text-secondary leading-relaxed flex gap-2">
                <span className="text-accent shrink-0 font-bold font-mono">·</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Preparation Algorithm */}
      {day.prepSteps && day.prepSteps.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <span className="text-caption font-semibold text-text-primary uppercase tracking-wider font-mono">
            Алгоритм приготування
          </span>
          <div className="flex flex-col gap-4">
            {day.prepSteps.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-caption font-semibold text-accent">{section.title}</span>
                <ul className="flex flex-col gap-2 pl-1">
                  {section.steps.map((step, stepIdx) => (
                    <li
                      key={stepIdx}
                      className="text-caption text-text-secondary leading-relaxed flex gap-2"
                    >
                      <span className="text-accent shrink-0 font-mono font-bold">
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
