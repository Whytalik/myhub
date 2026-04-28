"use client";

import { WeekPlan, DayPlan, DayPlanEntry, Dish, DishIngredient, Product } from "@/app/generated/prisma/client";
import { useMemo } from "react";
import { calculatePlanSummary, EntryWithDish } from "../logic/recalculator";
import { Calendar, ChevronRight, Flame } from "lucide-react";

interface WeekPlanWithDays extends WeekPlan {
  dayPlans: (DayPlan & {
    entries: (DayPlanEntry & { 
      dish: Dish & {
        ingredients: (DishIngredient & {
          product: Product;
        })[];
      };
    })[];
  })[];
}

interface WeekPlanViewProps {
  plan: WeekPlanWithDays;
}

export function WeekPlanView({ plan }: WeekPlanViewProps) {
  const sortedDays = useMemo(() => 
    [...plan.dayPlans].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
  [plan.dayPlans]);

  return (
    <div className="flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/50 pb-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Calendar size={32} />
           </div>
           <div>
              <h2 className="text-5xl font-heading text-text leading-none tracking-tighter italic mb-2">
                {plan.name || "Week Plan"}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-mono text-muted tracking-[0.25em]">
                <span className="text-accent">●</span>
                STARTS {new Date(plan.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
           </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedDays.map((day) => {
          const summary = calculatePlanSummary(day.entries as unknown as EntryWithDish[]);
          return (
            <div key={day.id} className="group bg-surface border border-border/40 p-1 rounded-[2rem] hover:border-accent/30 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 flex flex-col h-full">
              <div className="bg-raised/40 rounded-[1.8rem] p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-mono text-muted tracking-[0.2em] block mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </span>
                    <span className="font-heading text-2xl text-text leading-none italic">
                      {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="bg-bg/50 px-3 py-1.5 rounded-full border border-border/50 flex items-center gap-2">
                    <Flame size={12} className="text-accent" />
                    <span className="text-[11px] font-black text-accent tabular-nums">{Math.round(summary.calories)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                  {day.entries.length > 0 ? (
                    day.entries.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-border/40" />
                        <span className="text-[11px] font-bold text-secondary truncate">{entry.dish.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center border border-dashed border-border/20 rounded-2xl">
                       <span className="text-[9px] font-mono text-muted italic tracking-widest">No meals</span>
                    </div>
                  )}
                  {day.entries.length > 4 && (
                    <div className="text-[9px] font-mono text-muted/50 pl-4">+{day.entries.length - 4} more dishes</div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border/20 flex justify-between items-center">
                   <div className="flex gap-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-muted">Protein</span>
                        <span className="text-[10px] font-black text-rose-400">{Math.round(summary.protein)}g</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-muted">Carbs</span>
                        <span className="text-[10px] font-black text-emerald-400">{Math.round(summary.carbs)}g</span>
                      </div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-muted/20 group-hover:text-accent group-hover:border-accent/40 transition-all">
                      <ChevronRight size={14} />
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
