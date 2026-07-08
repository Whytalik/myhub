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
   Utensils,
 } from "lucide-react";
 import { getMorningRoutine, EVENING_ROUTINE, type RoutineMap } from "@/lib/life/routine-items";
 
 const ROUTINE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
   AlarmClock,
   Droplets,
   ShowerHead,
   Sun,
   Footprints,
   PhoneOff,
   Moon,
   Dumbbell,
   Utensils,
   CheckCircle2,
   Circle,
 };
 
 interface Props {
   type: "morning" | "evening";
   routine: RoutineMap | null;
   scheduledTrainingDayName?: string;
   onChange: (patch: {
     morningRoutine?: RoutineMap | null;
     eveningRoutine?: RoutineMap | null;
   }) => void;
 }
 
 export function RoutineSection({ type, routine, scheduledTrainingDayName, onChange }: Props) {
   const map: RoutineMap = routine ?? ({} as RoutineMap);
   const isTrainingScheduled = !!scheduledTrainingDayName;
   const items = type === "morning" ? getMorningRoutine(isTrainingScheduled) : EVENING_ROUTINE;
 
   const done = items.filter((item) => map[item.id]).length;
   const total = items.length;
   const pct = total > 0 ? Math.round((done / total) * 100) : 0;
   const isComplete = total > 0 && done === total;
   const hasValue = done > 0;
 
   const toggle = (id: string) => {
     const next = { ...map, [id]: !map[id] };
     onChange({ [`${type}Routine`]: next });
   };

  const cardClass = `glass-card p-4 flex flex-col gap-3 border ${
    isComplete ? "border-emerald-500/20" : hasValue ? "border-accent/20" : "border-white/[0.06]"
  }`;
  const iconWrapClass = `flex items-center justify-center w-7 h-7 rounded-lg ${
    type === "morning" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
  }`;
  const progressClass = `text-caption ${isComplete ? "text-emerald-400" : ""}`;

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={iconWrapClass}>
            {type === "morning" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <h3 className="text-panel-title capitalize">{type} Routine</h3>
        </div>
        <span className={progressClass}>
          {done}/{total} · {pct}%
        </span>
      </div>

      {isTrainingScheduled && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent-training/10 text-accent-training text-xs">
          <Dumbbell size={12} />
          <span>Training day: {scheduledTrainingDayName}</span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const checked = !!map[item.id];
          const iconName = item.icon as string;
          const IconComponent = ROUTINE_ICONS[iconName] || Circle;
          const itemClass = `flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg transition-colors duration-150 ${
            checked ? "bg-emerald-500/5 text-emerald-400" : "hover:bg-white/[0.03] text-zinc-300"
          }`;
          const itemIconClass = `flex items-center justify-center w-6 h-6 rounded-md shrink-0 ${
            checked ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-zinc-500"
          }`;

          return (
            <button key={item.id} onClick={() => toggle(item.id)} className={itemClass}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={itemIconClass}>
                  <IconComponent size={12} />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-zinc-500">{item.time}</span>
                    <span className="text-sm truncate">{item.label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate">{item.labelUk}</span>
                </div>
              </div>
              {checked ? (
                <CheckCircle2 size={14} />
              ) : (
                <Circle size={14} className="text-zinc-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
