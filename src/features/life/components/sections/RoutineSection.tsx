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
import { MORNING_ROUTINE, EVENING_ROUTINE, type RoutineMap } from "@/lib/life/routine-items";
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

    >
      <div >
        <div >
          <div

          >
            {type === "morning" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <h3

          >
            {type} Routine
          </h3>
        </div>
        <span

        >
          {done}/{total} · {pct}%
        </span>
      </div>

      {isTrainingScheduled && (
        <div >
          <Dumbbell size={12} />
          <span >
            Training day scheduled — custom routine coming soon
          </span>
        </div>
      )}

      <div >
        {items.map((item) => {
          const checked = !!map[item.id];
          const iconName = item.icon as string;
          const IconComponent = ROUTINE_ICONS[iconName] || Circle;

          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}

            >
              <div >
                <div

                >
                  <IconComponent size={12} />
                </div>
                <div >
                  <div >
                    <span >
                      {item.time}
                    </span>
                    <span >{item.label}</span>
                  </div>
                  <span

                  >
                    {item.labelUk}
                  </span>
                </div>
              </div>
              {checked ? (
                <CheckCircle2 size={14} />
              ) : (
                <Circle size={14} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
