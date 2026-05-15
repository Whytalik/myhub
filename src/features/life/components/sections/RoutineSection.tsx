"use client";

import { CheckCircle2, Circle, Sun, Moon, Dumbbell, User, Gamepad2, AlarmClock, Droplets, Brain, Move, ClipboardCheck, Zap, Briefcase, Footprints, ThermometerSnowflake, LogOut, GraduationCap, Utensils, Sparkles, ShowerHead, ListTodo, Car, CalendarDays } from "lucide-react";
import {
  MORNING_ROUTINE_TRAIN,
  MORNING_ROUTINE_NO_TRAIN,
  EVENING_ROUTINE_NO_TRAIN,
  EVENING_ROUTINE_TRAIN,
  EVENING_ROUTINE_FUN,
  type RoutineMap
} from "@/lib/routine-items";
import type { DayType } from "@/features/life/types";
import { dayTypeToRoutine } from "@/features/life/types";

const ROUTINE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  AlarmClock,
  Droplets,
  Brain,
  Move,
  ClipboardCheck,
  Sun,
  Zap,
  Briefcase,
  Footprints,
  Dumbbell,
  ThermometerSnowflake,
  LogOut,
  GraduationCap,
  Utensils,
  Sparkles,
  ShowerHead,
  ListTodo,
  Moon,
  Car,
  Gamepad2,
  CheckCircle2,
  Circle,
  User,
};

interface Props {
  type: "morning" | "evening";
  routine: RoutineMap | null;
  scheduledDayType?: DayType;
  onChange: (patch: { morningRoutine?: RoutineMap | null; eveningRoutine?: RoutineMap | null }) => void;
}

export function RoutineSection({ type, routine, scheduledDayType, onChange }: Props) {
  const map: RoutineMap = routine ?? ({} as RoutineMap);
  
  const isTrainingDay = type === "morning" ? (map["_isTrainingDay"] ?? false) : false;
  const eveningMode = type === "evening" ? ((map["_eveningMode"] as unknown as string) ?? "normal") : "normal";

  const items = type === "morning"
    ? (isTrainingDay ? MORNING_ROUTINE_TRAIN : MORNING_ROUTINE_NO_TRAIN)
    : (eveningMode === "gym" ? EVENING_ROUTINE_TRAIN : eveningMode === "fun" ? EVENING_ROUTINE_FUN : EVENING_ROUTINE_NO_TRAIN);

  const done = items.filter((item) => map[item.id]).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isComplete = total > 0 && done === total;
  const hasValue = done > 0;

  const toggle = (id: string) => {
    const next = { ...map, [id]: !map[id] };
    onChange({ [`${type}Routine`]: next });
  };

  const toggleTraining = () => {
    const next = { ...map, _isTrainingDay: !isTrainingDay };
    onChange({ morningRoutine: next });
  };

  const setEveningMode = (mode: string) => {
    const next = { ...map, _eveningMode: mode } as unknown as RoutineMap;
    onChange({ eveningRoutine: next });
  };

  return (
    <div className={`bg-surface border rounded-xl p-5 flex flex-col gap-4 h-full transition-all duration-500 ${
      isComplete 
        ? "border-accent/40 shadow-[0_0_25px_rgba(192,132,252,0.08)] bg-accent/[0.02]" 
        : hasValue 
          ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]" 
          : "border-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg transition-all duration-500 ${
            isComplete ? "bg-accent text-bg scale-110" : hasValue ? "bg-accent/20 text-accent" : "bg-accent-muted text-accent"
          }`}>
            {type === "morning" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <h3 className={`text-body font-medium transition-colors uppercase tracking-wider ${hasValue ? "text-accent" : "text-text"}`}>
            {type} Routine
          </h3>
        </div>
        <span className={`text-note font-mono transition-colors ${isComplete ? "text-accent font-bold" : hasValue ? "text-accent/60" : "text-muted"}`}>
          {done}/{total} · {pct}%
        </span>
      </div>

      {type === "morning" && (() => {
        const planned = scheduledDayType ? dayTypeToRoutine(scheduledDayType).isTrainingDay : null;
        const isOverridden = planned !== null && isTrainingDay !== planned;
        if (planned !== null) {
          return (
            <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
              isOverridden
                ? "border-amber-500/30 bg-amber-500/[0.04]"
                : isTrainingDay
                ? "border-accent/25 bg-accent/[0.04]"
                : "border-border bg-raised/20"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-1 rounded-md transition-colors ${
                  isOverridden ? "bg-amber-500/15" : isTrainingDay ? "bg-accent/15" : "bg-raised border border-border/50"
                }`}>
                  <Dumbbell size={12} className={isOverridden ? "text-amber-500" : isTrainingDay ? "text-accent" : "text-muted"} />
                </div>
                <span className={`text-base font-bold transition-colors ${
                  isOverridden ? "text-amber-500" : isTrainingDay ? "text-text" : "text-secondary"
                }`}>
                  {isTrainingDay ? "Training Day" : "Rest Day"}
                </span>
                {isOverridden ? (
                  <span className="text-label font-mono text-amber-500/60 uppercase tracking-wider">
                    · was {planned ? "training" : "rest"}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-label font-mono text-muted/50 uppercase tracking-wider">
                    <CalendarDays size={10} />plan
                  </span>
                )}
              </div>
              <button onClick={toggleTraining} className="flex items-center gap-1.5 group">
                <span className="text-label font-mono text-muted/40 group-hover:text-muted/70 uppercase tracking-wider transition-colors">
                  {isOverridden ? "reset" : "override"}
                </span>
                <div className={`w-6 h-3 rounded-full p-0.5 transition-colors ${isTrainingDay ? "bg-accent/70" : "bg-border"}`}>
                  <div className={`w-2 h-2 bg-white rounded-full shadow-sm transition-transform duration-200 ${isTrainingDay ? "translate-x-3" : "translate-x-0"}`} />
                </div>
              </button>
            </div>
          );
        }
        return (
          <button
            onClick={toggleTraining}
            className={`flex items-center justify-between px-4 py-2 rounded-xl border transition-all h-9 ${
              isTrainingDay
                ? "bg-accent/10 border-accent/40 text-accent"
                : "bg-raised/30 border-border text-secondary hover:border-border-hover"
            }`}
          >
            <div className="flex items-center gap-3">
              <Dumbbell size={14} className={isTrainingDay ? "text-accent" : "text-muted"} />
              <span className="text-base font-bold">Training Today</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isTrainingDay ? "bg-accent" : "bg-border"}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${isTrainingDay ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          </button>
        );
      })()}

      {type === "evening" && (() => {
        const plannedMode = scheduledDayType ? dayTypeToRoutine(scheduledDayType).eveningMode : null;
        const isOverridden = plannedMode !== null && eveningMode !== plannedMode;
        const EVENING_MODES = [
          { id: "normal", icon: User,     label: "Normal" },
          { id: "gym",    icon: Dumbbell, label: "Gym" },
          { id: "fun",    icon: Gamepad2, label: "Fun" },
        ] as const;
        if (plannedMode !== null) {
          const PlannedIcon = EVENING_MODES.find(m => m.id === plannedMode)?.icon ?? User;
          return (
            <div className="flex flex-col gap-2">
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                isOverridden
                  ? "border-amber-500/30 bg-amber-500/[0.04]"
                  : plannedMode !== "normal"
                  ? "border-accent/25 bg-accent/[0.04]"
                  : "border-border bg-raised/20"
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-md transition-colors ${
                    isOverridden ? "bg-amber-500/15" : plannedMode !== "normal" ? "bg-accent/15" : "bg-raised border border-border/50"
                  }`}>
                    <PlannedIcon size={12} className={isOverridden ? "text-amber-500" : plannedMode !== "normal" ? "text-accent" : "text-muted"} />
                  </div>
                  <span className={`text-base font-bold capitalize transition-colors ${
                    isOverridden ? "text-amber-500" : plannedMode !== "normal" ? "text-text" : "text-secondary"
                  }`}>
                    {eveningMode} evening
                  </span>
                  {isOverridden ? (
                    <span className="text-label font-mono text-amber-500/60 uppercase tracking-wider">
                      · was {plannedMode}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-label font-mono text-muted/50 uppercase tracking-wider">
                      <CalendarDays size={10} />plan
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5">
                {EVENING_MODES.map(({ id, icon: Icon, label }) => {
                  const active = eveningMode === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setEveningMode(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-note font-bold transition-all ${
                        active
                          ? "bg-accent/10 border-accent/30 text-accent"
                          : "bg-raised/20 border-border text-muted/70 hover:border-border-hover hover:text-secondary"
                      }`}
                    >
                      <Icon size={11} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "normal", icon: User,     label: "Normal" },
              { id: "gym",    icon: Dumbbell, label: "Gym" },
              { id: "fun",    icon: Gamepad2, label: "Fun" },
            ].map(({ id, icon: Icon, label }) => {
              const active = eveningMode === id;
              return (
                <button
                  key={id}
                  onClick={() => setEveningMode(id)}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${
                    active
                      ? "bg-accent/10 border-accent/40 text-accent shadow-sm"
                      : "bg-raised/30 border-border text-muted hover:border-border-hover hover:text-secondary"
                  }`}
                >
                  <Icon size={14} className="mb-0.5" />
                  <span className="text-caption font-bold leading-none">{label}</span>
                </button>
              );
            })}
          </div>
        );
      })()}

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
                <div className={`p-1 rounded-lg shrink-0 ${checked ? "bg-accent/20" : "bg-raised"}`}>
                  <IconComponent size={12} className={checked ? "text-accent" : "text-muted"} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-label font-mono font-bold text-accent shrink-0">{item.time}</span>
                    <span className="text-note font-bold leading-none truncate">{item.label}</span>
                  </div>
                  <span className={`text-label font-medium leading-none truncate ${checked ? "text-accent/80" : "text-secondary/70"}`}>
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
