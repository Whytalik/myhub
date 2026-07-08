"use client";

import { useState } from "react";
import { DayPlan } from "./DayPlan";
import { getActiveWeekPlan } from "../week";

function todayIndex() {
  return (new Date().getDay() + 6) % 7;
}

interface NutritionPageClientProps {
  seasonOverride?: string;
}

export function NutritionPageClient({ seasonOverride }: NutritionPageClientProps) {
  const [activeIndex, setActiveIndex] = useState(todayIndex);
  const plan = getActiveWeekPlan(undefined, seasonOverride);

  const day = plan[activeIndex];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit overflow-x-auto">
        {plan.map((d, i) => {
          const isActive = i === activeIndex;
          const isToday = i === todayIndex();
          const dayButtonClass = `relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 shrink-0 ${
            isActive
              ? "bg-accent-nutrition text-white"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
          }`;

          return (
            <button key={d.weekday} onClick={() => setActiveIndex(i)} className={dayButtonClass}>
              {d.labelShort}
              {isToday && !isActive && (
                <span className="w-1 h-1 rounded-full bg-accent-nutrition" />
              )}
            </button>
          );
        })}
      </div>

      <DayPlan day={day} />
    </div>
  );
}
