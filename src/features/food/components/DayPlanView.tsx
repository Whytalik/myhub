"use client";

import { DayPlan, DayPlanEntry, Dish } from "@/app/generated/prisma/client";
import { MealSlot, PlanAdherence } from "@/app/generated/prisma";
import { updateDayPlanAdherenceAction } from "../actions/day-plan-actions";
import { CheckCircle2, XCircle, Circle } from "lucide-react";
import { useTransition } from "react";

interface DayPlanWithEntries extends DayPlan {
  entries: (DayPlanEntry & { dish: Dish })[];
}

interface DayPlanViewProps {
  plan: DayPlanWithEntries;
}

export function DayPlanView({ plan }: DayPlanViewProps) {
  const slots: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
  const [isPending, startTransition] = useTransition();

  const handleAdherenceChange = (adherence: PlanAdherence) => {
    startTransition(async () => {
      await updateDayPlanAdherenceAction(plan.id, adherence);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex flex-col">
          <span className="text-2xl font-heading text-text tracking-tight">
            {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Day Plan</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAdherenceChange("FOLLOWED")}
            disabled={isPending}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              plan.adherence === "FOLLOWED"
                ? "bg-green-500/10 border-green-500/40 text-green-500"
                : "bg-raised/30 border-border text-secondary hover:border-border-hover"
            }`}
          >
            <CheckCircle2 size={14} />
            <span>Followed</span>
          </button>
          <button
            onClick={() => handleAdherenceChange("DEVIATED")}
            disabled={isPending}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              plan.adherence === "DEVIATED"
                ? "bg-rose-500/10 border-rose-500/40 text-rose-500"
                : "bg-raised/30 border-border text-secondary hover:border-border-hover"
            }`}
          >
            <XCircle size={14} />
            <span>Deviated</span>
          </button>
          {plan.adherence !== "PLANNED" && (
            <button
              onClick={() => handleAdherenceChange("PLANNED")}
              disabled={isPending}
              className="p-2 text-muted hover:text-text transition-colors"
              title="Reset to Planned"
            >
              <Circle size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {slots.map((slot) => {
          const slotEntries = plan.entries.filter((e) => e.mealSlot === slot);
          return (
            <div key={slot} className="group border-b border-border/30 last:border-0 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-24 shrink-0 pt-1">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-[0.15em] border border-border px-1.5 py-0.5 rounded">
                    {slot}
                  </span>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {slotEntries.length > 0 ? (
                    slotEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between group/entry">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text">{entry.dish.name}</span>
                          <span className="text-[10px] text-secondary font-mono">
                            {entry.servings} serving{entry.servings !== 1 ? 's' : ''} • {entry.priority}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted font-sans italic pt-0.5">Empty</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
