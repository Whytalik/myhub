"use client";

import { CheckCircle2, Circle, Sun, Moon, Dumbbell, User, Gamepad2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { 
  MORNING_ROUTINE_TRAIN, 
  MORNING_ROUTINE_NO_TRAIN, 
  EVENING_ROUTINE_NO_TRAIN,
  EVENING_ROUTINE_TRAIN,
  EVENING_ROUTINE_FUN,
  type RoutineMap 
} from "@/lib/routine-items";

interface Props {
  type: "morning" | "evening";
  routine: RoutineMap | null;
  onChange: (patch: { morningRoutine?: RoutineMap | null; eveningRoutine?: RoutineMap | null }) => void;
}

export function RoutineSection({ type, routine, onChange }: Props) {
  const map: RoutineMap = routine ?? ({} as RoutineMap);
  
  // Flags stored in the routine map
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
    <div className={`bg-surface border rounded-2xl p-5 flex flex-col gap-4 h-full transition-all duration-500 ${
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
          <h3 className={`text-[13px] font-medium transition-colors uppercase tracking-wider ${hasValue ? "text-accent" : "text-text"}`}>
            {type} Routine
          </h3>
        </div>
        <span className={`text-[11px] font-mono transition-colors ${isComplete ? "text-accent font-bold" : hasValue ? "text-accent/60" : "text-muted"}`}>
          {done}/{total} · {pct}%
        </span>
      </div>

      {type === "morning" && (
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
            <span className="text-[12px] font-bold">Training Today</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isTrainingDay ? "bg-accent" : "bg-border"}`}>
            <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${isTrainingDay ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </button>
      )}

      {type === "evening" && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "normal", icon: User, label: "Normal", labelUk: "Звичайний" },
            { id: "gym",    icon: Dumbbell, label: "Gym", labelUk: "Зал" },
            { id: "fun",    icon: Gamepad2, label: "Fun", labelUk: "Розваги" }
          ].map((mode) => {
            const active = eveningMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setEveningMode(mode.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all ${
                  active 
                    ? "bg-accent/10 border-accent/40 text-accent shadow-sm" 
                    : "bg-raised/30 border-border text-muted hover:border-border-hover hover:text-secondary"
                }`}
              >
                <Icon size={14} className={active ? "mb-0.5" : "mb-1"} />
                <span className="text-[10px] font-bold leading-none">{mode.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item) => {
          const checked = !!map[item.id];
          const iconName = item.icon as string;
          // @ts-expect-error dynamic icon property from string key
          const IconComponent = (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName] || Circle;

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
                    <span className="text-[9px] font-mono font-bold text-accent shrink-0">{item.time}</span>
                    <span className="text-[11px] font-bold leading-none truncate">{item.label}</span>
                  </div>
                  <span className={`text-[9px] font-medium leading-none truncate ${checked ? "text-accent/80" : "text-secondary/70"}`}>
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
