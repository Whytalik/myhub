"use client";

import { useState } from "react";
import { WEEK_PLAN, PROFILES } from "../data";
import { MealCard } from "./MealCard";

function todayIndex() {
  // JS getDay(): 0=Sun..6=Sat. WEEK_PLAN is Mon-first (index 0=Mon..6=Sun).
  return (new Date().getDay() + 6) % 7;
}

export function DayPlan() {
  const [activeIndex, setActiveIndex] = useState(todayIndex);
  const day = WEEK_PLAN[activeIndex];
  const vitalii = PROFILES.find((p) => p.id === "vitalii");

  return (
    <div className="flex flex-col gap-5">
      {/* Day pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {WEEK_PLAN.map((d, i) => {
          const isActive = i === activeIndex;
          const isToday = i === todayIndex();
          return (
            <button
              key={d.weekday}
              onClick={() => setActiveIndex(i)}
              className={`relative flex items-center justify-center h-10 w-14 shrink-0 rounded-lg text-note font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent text-bg font-semibold shadow-sm"
                  : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border-strong"
              }`}
            >
              {d.labelShort}
              {isToday && !isActive && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

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

      {day.olesiaAdditions && day.olesiaAdditions.length > 0 && (
        <div className="bg-surface/50 border border-border-dim rounded-xl p-4 flex flex-col gap-2">
          <span className="text-caption font-mono uppercase tracking-wider text-text-muted">
            Добавки для Олесі
          </span>
          <ul className="flex flex-col gap-1">
            {day.olesiaAdditions.map((addition, i) => (
              <li key={i} className="text-caption text-text-secondary leading-relaxed flex gap-2">
                <span className="text-text-muted shrink-0">·</span>
                <span>{addition}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
