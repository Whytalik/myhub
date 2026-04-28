"use client";

import { DayPlan, DayPlanEntry, Dish, DishIngredient, Product } from "@/app/generated/prisma/client";
import { MealSlot, PlanAdherence } from "@/app/generated/prisma";
import { updateDayPlanAdherenceAction } from "../actions/day-plan-actions";
import { CheckCircle2, XCircle, Utensils, Clock, ChevronRight } from "lucide-react";
import { useTransition, useMemo } from "react";
import { calculateEntryStats, calculatePlanSummary, EntryWithDish } from "../logic/recalculator";

interface FullDayPlan extends DayPlan {
  entries: (DayPlanEntry & {
    dish: Dish & {
      ingredients: (DishIngredient & {
        product: Product;
      })[];
    };
  })[];
}

interface DayPlanViewProps {
  plan: FullDayPlan;
}

export function DayPlanView({ plan }: DayPlanViewProps) {
  const [isPending, startTransition] = useTransition();

  const summary = useMemo(() => 
    calculatePlanSummary(plan.entries as unknown as EntryWithDish[]), 
  [plan.entries]);

  const handleAdherenceChange = (adherence: PlanAdherence) => {
    startTransition(async () => {
      await updateDayPlanAdherenceAction(plan.id, adherence);
    });
  };

  const slots: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

  const groupedEntries = plan.entries.reduce((acc, entry) => {
    if (!acc[entry.mealSlot]) acc[entry.mealSlot] = [];
    acc[entry.mealSlot].push(entry);
    return acc;
  }, {} as Record<MealSlot, typeof plan.entries>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Overall Stats */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-heading text-text tracking-tighter leading-none italic">
              {new Date(plan.date).toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted tracking-[0.2em]">
              <Clock size={12} className="text-accent" />
              {plan.adherence}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-raised/40 px-6 py-4 rounded-2xl border border-border/50 backdrop-blur-sm">
             <p className="text-[10px] font-mono text-muted tracking-widest mb-1">Total Calories</p>
             <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-accent leading-none tabular-nums">{Math.round(summary.calories)}</span>
                <span className="text-[10px] font-mono text-muted/50 mb-1">kcal</span>
             </div>
          </div>

          <div className="flex items-center gap-2 bg-raised/20 p-1 rounded-2xl border border-border/30">
            <button
              onClick={() => handleAdherenceChange("FOLLOWED")}
              disabled={isPending}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all ${
                plan.adherence === "FOLLOWED"
                  ? "bg-green-500 text-bg shadow-lg shadow-green-500/20"
                  : "text-muted hover:text-text hover:bg-raised"
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Followed</span>
            </button>
            <button
              onClick={() => handleAdherenceChange("DEVIATED")}
              disabled={isPending}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold tracking-wider transition-all ${
                plan.adherence === "DEVIATED"
                  ? "bg-rose-500 text-bg shadow-lg shadow-rose-500/20"
                  : "text-muted hover:text-text hover:bg-raised"
              }`}
            >
              <XCircle size={14} />
              <span>Deviated</span>
            </button>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Protein", val: summary.protein, color: "bg-rose-500" },
           { label: "Fat", val: summary.fat, color: "bg-blue-500" },
           { label: "Carbs", val: summary.carbs, color: "bg-emerald-500" },
           { label: "Fiber", val: summary.fiber, color: "bg-amber-500" }
         ].map(stat => (
           <div key={stat.label} className="bg-raised/20 p-4 rounded-2xl border border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${stat.color}`} />
                <span className="text-[9px] font-mono text-muted tracking-[0.2em] font-bold">{stat.label}</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-xl font-black text-text tabular-nums">{Math.round(stat.val)}</span>
                <span className="text-[9px] font-mono text-muted mb-1">g</span>
              </div>
           </div>
         ))}
      </div>

      {/* Meal Slots */}
      <div className="flex flex-col gap-6">
        {slots.map(slot => {
          const slotEntries = groupedEntries[slot] || [];
          return (
            <div key={slot} className={`rounded-3xl border transition-all ${slotEntries.length > 0 ? 'bg-raised/10 border-border/40 p-2' : 'border-dashed border-border/20 py-4 opacity-30'}`}>
              <div className="px-6 py-2 flex items-center justify-between mb-1">
                 <span className="text-[10px] font-black text-muted tracking-[0.3em]">{slot}</span>
                 {slotEntries.length > 0 && (
                   <span className="text-[10px] font-mono text-muted/40">{slotEntries.length} items</span>
                 )}
              </div>

              {slotEntries.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {slotEntries.map(entry => {
                    const stats = calculateEntryStats(entry as unknown as EntryWithDish);
                    return (
                      <div key={entry.id} className="flex items-center justify-between px-6 py-4 rounded-2xl hover:bg-surface transition-all group/item">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-bg border border-border flex items-center justify-center text-muted/30 group-hover/item:text-accent group-hover/item:border-accent/30 transition-all">
                              <Utensils size={20} />
                            </div>
                            <div>
                               <h4 className="font-bold text-text text-base leading-tight mb-1">{entry.dish.name}</h4>
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-mono text-muted tracking-wider bg-raised/50 px-2 py-0.5 rounded">
                                    {entry.servings} serving{entry.servings !== 1 ? 's' : ''}
                                  </span>
                                  <span className="text-[10px] font-mono text-accent font-black tracking-widest">
                                    {Math.round(stats.calories)} kcal
                                  </span>
                               </div>
                            </div>
                         </div>
                         <ChevronRight size={16} className="text-muted/10 group-hover/item:text-accent group-hover/item:translate-x-1 transition-all" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-2 text-[10px] font-mono text-muted italic tracking-widest">Empty slot</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
