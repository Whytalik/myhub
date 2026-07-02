"use client";

import { useState } from "react";
import { CalendarDays, Apple } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { DayPlan } from "./DayPlan";
import { DailyProducts } from "./DailyProducts";
import { WEEK_PLAN } from "../data";

function todayIndex() {
  // JS getDay(): 0=Sun..6=Sat. WEEK_PLAN is Mon-first (index 0=Mon..6=Sun).
  return (new Date().getDay() + 6) % 7;
}

export function NutritionPageClient() {
  const [activeIndex, setActiveIndex] = useState(todayIndex);

  const day = WEEK_PLAN[activeIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Day pills navigation */}
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

      <Tabs
        tabs={[
          {
            id: "day",
            label: "На день",
            icon: <CalendarDays size={14} />,
            content: <DayPlan day={day} />,
          },
          {
            id: "products",
            label: "Продукти",
            icon: <Apple size={14} />,
            content: <DailyProducts day={day} />,
          },
        ]}
      />
    </div>
  );
}
