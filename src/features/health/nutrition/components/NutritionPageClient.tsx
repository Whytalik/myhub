"use client";

import { useState } from "react";
import { DayPlan } from "./DayPlan";
import { WEEK_PLAN } from "../data";

function todayIndex() {

  return (new Date().getDay() + 6) % 7;
}

export function NutritionPageClient() {
  const [activeIndex, setActiveIndex] = useState(todayIndex);

  const day = WEEK_PLAN[activeIndex];

  return (
    <div >
      {}
      <div >
        {WEEK_PLAN.map((d, i) => {
          const isActive = i === activeIndex;
          const isToday = i === todayIndex();
          return (
            <button
              key={d.weekday}
              onClick={() => setActiveIndex(i)}

            >
              {d.labelShort}
              {isToday && !isActive && (
                <span />
              )}
            </button>
          );
        })}
      </div>

      <DayPlan day={day} />
    </div>
  );
}
