"use client";

import { useState, useTransition } from "react";
import { User, Dumbbell, Gamepad2, Sun } from "lucide-react";
import { upsertDayScheduleAction } from "../actions/schedule-actions";
import type { DayScheduleData, DayType } from "../types";

const DAY_TYPES: {
  id: DayType;
  label: string;
  labelShort: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}[] = [
  { id: "regular",  label: "Regular",  labelShort: "REG", icon: User,     color: "border-border bg-raised/50 text-secondary" },
  { id: "train_am", label: "Train AM", labelShort: "AM",  icon: Sun,      color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
  { id: "train_pm", label: "Train PM", labelShort: "PM",  icon: Dumbbell, color: "border-blue-500/40 bg-blue-500/10 text-blue-400" },
  { id: "fun",      label: "Fun Day",  labelShort: "FUN", icon: Gamepad2, color: "border-purple-500/40 bg-purple-500/10 text-purple-400" },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// JS getDay(): 0=Sun..6=Sat → Mon=0..Sun=6
function todayDayOfWeek(): number {
  return (new Date().getDay() + 6) % 7;
}

interface Props {
  initialTemplates: DayScheduleData[];
}

export function WeekScheduleClient({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<Record<number, DayType>>(() => {
    const map: Record<number, DayType> = {};
    for (const t of initialTemplates) {
      map[t.dayOfWeek] = t.dayType;
    }
    return map;
  });
  const [pending, setPending] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const today = todayDayOfWeek();

  const setDayType = (dayOfWeek: number, type: DayType) => {
    if (pending) return;
    const key = `${dayOfWeek}-${type}`;
    setPending(key);
    const prev = templates[dayOfWeek];
    setTemplates((s) => ({ ...s, [dayOfWeek]: type }));

    startTransition(async () => {
      const res = await upsertDayScheduleAction({ dayOfWeek, dayType: type });
      if (!res.success) {
        setTemplates((s) => ({ ...s, [dayOfWeek]: prev ?? "regular" }));
      }
      setPending(null);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Day cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {DAY_NAMES.map((name, dayOfWeek) => {
          const isToday = dayOfWeek === today;
          const currentType = templates[dayOfWeek] ?? "regular";
          const dayType = DAY_TYPES.find((t) => t.id === currentType) ?? DAY_TYPES[0];
          const DayIcon = dayType.icon;

          return (
            <div
              key={dayOfWeek}
              className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all ${
                isToday
                  ? "border-accent/40 bg-accent/[0.03] shadow-[0_0_20px_rgba(192,132,252,0.06)]"
                  : "border-border bg-surface"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <span className={`text-note font-mono font-bold tracking-widest uppercase ${isToday ? "text-accent" : "text-muted"}`}>
                  {name}
                </span>
                <div className={`p-1.5 rounded-lg ${dayType.color}`}>
                  <DayIcon size={14} />
                </div>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-2 gap-1.5">
                {DAY_TYPES.map((type) => {
                  const active = currentType === type.id;
                  const Icon = type.icon;
                  const isPending = pending === `${dayOfWeek}-${type.id}`;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setDayType(dayOfWeek, type.id)}
                      disabled={!!pending}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-all ${
                        active
                          ? type.color
                          : "border-border/60 bg-raised/30 text-muted hover:border-border hover:text-secondary"
                      } ${isPending ? "opacity-60" : ""}`}
                    >
                      <Icon size={12} />
                      <span className="text-label font-bold leading-none">{type.labelShort}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active label */}
              <span className={`text-label font-mono text-center leading-none ${isToday ? "text-accent/60" : "text-muted/60"}`}>
                {dayType.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-2 border-t border-border">
        {DAY_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.id} className="flex items-center gap-2">
              <div className={`p-1 rounded-md border ${type.color}`}>
                <Icon size={11} />
              </div>
              <span className="text-note text-secondary">{type.label}</span>
              <span className="text-note text-muted">—</span>
              <span className="text-note text-muted/70">
                {type.id === "regular"  && "Normal morning + Normal evening"}
                {type.id === "train_am" && "Morning training + Normal evening"}
                {type.id === "train_pm" && "Normal morning + Evening gym"}
                {type.id === "fun"      && "Normal morning + Fun evening"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
