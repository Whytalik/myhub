"use client";

import {
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  Dumbbell,
  AlarmClock,
  Droplets,
  ShowerHead,
  Footprints,
  PhoneOff,
} from "lucide-react";
import { MORNING_ROUTINE, EVENING_ROUTINE, type RoutineMap } from "@/lib/routine-items";
import type { DayType } from "@/features/life/types";

const ROUTINE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  AlarmClock,
  Droplets,
  ShowerHead,
  Sun,
  Footprints,
  PhoneOff,
  Moon,
  CheckCircle2,
  Circle,
};

interface Props {
  type: "morning" | "evening";
  routine: RoutineMap | null;
  scheduledDayType?: DayType;
  onChange: (patch: {
    morningRoutine?: RoutineMap | null;
    eveningRoutine?: RoutineMap | null;
  }) => void;
}

export function RoutineSection({ type, routine, scheduledDayType, onChange }: Props) {
  const map: RoutineMap = routine ?? ({} as RoutineMap);
  const items = type === "morning" ? MORNING_ROUTINE : EVENING_ROUTINE;

  const done = items.filter((item) => map[item.id]).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = total > 0 && done === total;
  const hasValue = done > 0;

  const isTrainingScheduled =
    (type === "morning" && scheduledDayType === "train_am") ||
    (type === "evening" && scheduledDayType === "train_pm");

  const toggle = (id: string) => {
    const next = { ...map, [id]: !map[id] };
    onChange({ [`${type}Routine`]: next });
  };

  return (
    <div
      className={`bg-surface border rounded-xl p-5 flex flex-col gap-4 h-full transition-all duration-500 ${
        isComplete
          ? "border-accent/40 shadow-[0_0_25px_rgba(192,132,252,0.08)] bg-accent/[0.02]"
          : hasValue
            ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]"
            : "border-border"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg transition-all duration-500 ${
              isComplete
                ? "bg-accent text-bg scale-110"
                : hasValue
                  ? "bg-accent/20 text-accent"
                  : "bg-accent-muted text-accent"
            }`}
          >
            {type === "morning" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <h3
            className={`text-body font-medium transition-colors uppercase tracking-wider ${hasValue ? "text-accent" : "text-text"}`}
          >
            {type} Routine
          </h3>
        </div>
        <span
          className={`text-note font-mono transition-colors ${isComplete ? "text-accent font-bold" : hasValue ? "text-accent/60" : "text-muted"}`}
        >
          {done}/{total} · {pct}%
        </span>
      </div>

      {isTrainingScheduled && (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-raised/20 opacity-60">
          <Dumbbell size={12} className="text-muted" />
          <span className="text-note text-muted">
            Training day scheduled — custom routine coming soon
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => {
          const checked = !!map[item.id];
          const iconName = item.icon as string;
          const IconComponent = ROUTINE_ICONS[iconName] || Circle;

          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-left transition-all h-10 ${
                checked
                  ? "bg-accent-muted border-accent/30 text-accent"
                  : "bg-raised/50 border-border text-secondary hover:border-accent/30 hover:text-text"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1 rounded-lg shrink-0 ${checked ? "bg-accent/20" : "bg-raised"}`}
                >
                  <IconComponent size={12} className={checked ? "text-accent" : "text-muted"} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-label font-mono font-bold text-accent shrink-0">
                      {item.time}
                    </span>
                    <span className="text-note font-bold leading-none truncate">{item.label}</span>
                  </div>
                  <span
                    className={`text-label font-medium leading-none truncate ${checked ? "text-accent/80" : "text-secondary/70"}`}
                  >
                    {item.labelUk}
                  </span>
                </div>
              </div>
              {checked ? (
                <CheckCircle2 size={14} className="text-accent shrink-0" />
              ) : (
                <Circle size={14} className="text-muted shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
