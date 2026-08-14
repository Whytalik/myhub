"use client";

import { useState } from "react";
import { DayPlan } from "./DayPlan";
import { getActiveSetPlan } from "../week";
import { addDays, cyclePositionOf, dateForCyclePosition, resolveDayView } from "../cycle";

interface NutritionPageClientProps {
  seasonOverride?: string;
}

export function NutritionPageClient({ seasonOverride }: NutritionPageClientProps) {
  const today = new Date();
  const todayPos = cyclePositionOf(today);

  const [activeSetIndex, setActiveSetIndex] = useState(todayPos.setIndex);
  const [activeSubDay, setActiveSubDay] = useState<1 | 2>(todayPos.subDay);
  const plan = getActiveSetPlan(undefined, seasonOverride);

  const entry = plan[activeSetIndex];
  const isTodaysSet = activeSetIndex === todayPos.setIndex && activeSubDay === todayPos.subDay;
  const date = isTodaysSet ? today : dateForCyclePosition(today, activeSetIndex, activeSubDay);
  const day = resolveDayView(entry, activeSubDay, date);
  const hasDay2 = entry.day2Meals !== undefined;

  const tomorrowPos = cyclePositionOf(addDays(date, 1));
  const tomorrowEntry = plan[tomorrowPos.setIndex];
  const tomorrowThaw =
    (tomorrowPos.subDay === 2
      ? (tomorrowEntry.day2ThawInstructions ?? tomorrowEntry.thawInstructions)
      : tomorrowEntry.thawInstructions) ?? [];

  function selectSet(i: number) {
    setActiveSetIndex(i);
    setActiveSubDay(i === todayPos.setIndex ? todayPos.subDay : 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit overflow-x-auto">
        {plan.map((d, i) => {
          const isActive = i === activeSetIndex;
          const isToday = i === todayPos.setIndex;
          const dayButtonClass = `relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 shrink-0 ${
            isActive
              ? "bg-accent-nutrition text-white"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
          }`;

          return (
            <button key={d.setId} onClick={() => selectSet(i)} className={dayButtonClass}>
              {d.labelShort}
              {isToday && !isActive && (
                <span className="w-1 h-1 rounded-full bg-accent-nutrition" />
              )}
            </button>
          );
        })}
      </div>

      {hasDay2 && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
          {([1, 2] as const).map((subDay) => {
            const isActive = subDay === activeSubDay;
            return (
              <button
                key={subDay}
                onClick={() => setActiveSubDay(subDay)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? "bg-accent-nutrition text-white"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}
              >
                День {subDay}
              </button>
            );
          })}
        </div>
      )}

      <DayPlan day={day} tomorrowThaw={tomorrowThaw} />
    </div>
  );
}
