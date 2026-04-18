"use client";

import { WeekPlan, DayPlan, DayPlanEntry, Dish } from "@/app/generated/prisma/client";

interface WeekPlanWithDays extends WeekPlan {
  dayPlans: (DayPlan & {
    entries: (DayPlanEntry & { dish: Dish })[];
  })[];
}

interface WeekPlanViewProps {
  plan: WeekPlanWithDays;
}

export function WeekPlanView({ plan }: WeekPlanViewProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col border-b border-border pb-6">
        <h2 className="text-4xl font-heading text-text leading-none tracking-tight">
          {plan.name || "Untitled Week Plan"}
        </h2>
        <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mt-2">
          Starts {new Date(plan.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plan.dayPlans.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((day) => (
          <div key={day.id} className="bg-surface border border-border p-5 rounded-lg hover:border-accent/30 transition-colors">
            <div className="flex justify-between items-baseline mb-4">
              <span className="font-heading text-xl text-text uppercase">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {day.entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex justify-between text-xs border-b border-border/20 pb-1 last:border-0">
                  <span className="text-secondary truncate">{entry.dish.name}</span>
                  <span className="text-[10px] font-mono text-muted shrink-0">{entry.mealSlot[0]}</span>
                </div>
              ))}
              {day.entries.length > 3 && (
                <span className="text-[9px] font-mono text-muted">+{day.entries.length - 3} more</span>
              )}
              {day.entries.length === 0 && (
                <span className="text-[10px] text-muted italic">No dishes planned</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
