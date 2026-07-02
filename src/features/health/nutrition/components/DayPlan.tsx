"use client";

import { PROFILES } from "../data";
import { MealCard } from "./MealCard";
import type { DayPlan as DayPlanType } from "../types";

export function DayPlan({ day }: { day: DayPlanType }) {
  const vitalii = PROFILES.find((p) => p.id === "vitalii");

  return (
    <div className="flex flex-col gap-5">
      {/* Macro strip */}
      {vitalii && (
        <div className="flex items-center gap-4 flex-wrap text-caption text-text-secondary">
          <span className="font-medium text-text-primary">{vitalii.kcal} ккал/день</span>
          <span className="text-text-muted">·</span>
          <span>Б {vitalii.macros.protein} г</span>
          <span className="text-text-muted">·</span>
          <span>Ж {vitalii.macros.fat} г</span>
          <span className="text-text-muted">·</span>
          <span>В {vitalii.macros.carbs} г</span>
        </div>
      )}

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

      {/* Preparation Algorithm */}
      {day.prepSteps && day.prepSteps.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
          <span className="text-caption font-semibold text-text-primary uppercase tracking-wider font-mono">
            Алгоритм приготування
          </span>
          <div className="flex flex-col gap-4">
            {day.prepSteps.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-caption font-semibold text-accent">
                  {section.title}
                </span>
                <ul className="flex flex-col gap-2 pl-1">
                  {section.steps.map((step, stepIdx) => (
                    <li
                      key={stepIdx}
                      className="text-caption text-text-secondary leading-relaxed flex gap-2"
                    >
                      <span className="text-accent shrink-0 font-mono font-bold">{stepIdx + 1}.</span>
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
