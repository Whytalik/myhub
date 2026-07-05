"use client";

import { useState, useTransition } from "react";
import { Dumbbell } from "lucide-react";
import { Select } from "@/components/ui/inputs/select";
import { upsertDayScheduleAction } from "../actions/schedule-actions";
import type { DayScheduleData } from "../types";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NONE_VALUE = "__none__";

function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

interface Props {
  initialTemplates: DayScheduleData[];
  trainingDays: { id: string; name: string }[];
}

export function WeekScheduleClient({ initialTemplates, trainingDays }: Props) {
  const [assignments, setAssignments] = useState<Record<number, string | null>>(() => {
    const map: Record<number, string | null> = {};
    for (const t of initialTemplates) {
      map[t.dayOfWeek] = t.trainingDayId;
    }
    return map;
  });
  const [pending, setPending] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const today = todayDayOfWeek();

  const setTrainingDay = (dayOfWeek: number, trainingDayId: string | null) => {
    setPending(dayOfWeek);
    const prev = assignments[dayOfWeek] ?? null;
    setAssignments((s) => ({ ...s, [dayOfWeek]: trainingDayId }));

    startTransition(async () => {
      const res = await upsertDayScheduleAction({ dayOfWeek, trainingDayId });
      if (!res.success) {
        setAssignments((s) => ({ ...s, [dayOfWeek]: prev }));
      }
      setPending(null);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {trainingDays.length === 0 && (
        <div className="glass-card p-4 flex items-center gap-2.5">
          <Dumbbell size={16} className="text-zinc-500 shrink-0" />
          <p className="text-caption">
            No training days yet — add some in Training Space to assign them here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DAY_NAMES.map((name, dayOfWeek) => {
          const isToday = dayOfWeek === today;
          const trainingDayId = assignments[dayOfWeek] ?? null;
          const isPending = pending === dayOfWeek;
          const cardClass = `glass-card p-4 flex flex-col gap-3 border ${isToday ? "border-accent/30" : "border-white/[0.06]"} ${isPending ? "opacity-60" : ""}`;
          const iconWrapClass = `flex items-center justify-center w-7 h-7 rounded-lg border ${
            trainingDayId
              ? "border-accent-training/40 bg-accent-training/10 text-accent-training"
              : "border-white/[0.08] bg-white/[0.03] text-zinc-400"
          }`;

          return (
            <div key={dayOfWeek} className={cardClass}>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${isToday ? "text-accent" : "text-zinc-200"}`}
                >
                  {name}
                </span>
                <div className={iconWrapClass}>
                  <Dumbbell size={14} />
                </div>
              </div>

              <Select
                disabled={isPending || trainingDays.length === 0}
                value={trainingDayId ?? NONE_VALUE}
                onChange={(e) =>
                  setTrainingDay(dayOfWeek, e.target.value === NONE_VALUE ? null : e.target.value)
                }
              >
                <option value={NONE_VALUE}>No training</option>
                {trainingDays.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
