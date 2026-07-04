"use client";

import { useState, useTransition } from "react";
import { User, Dumbbell, Sun } from "lucide-react";
import { upsertDayScheduleAction } from "../actions/schedule-actions";
import type { DayScheduleData, DayType } from "../types";

const DISABLED_DAY_TYPES: DayType[] = ["train_am", "train_pm"];

const DAY_TYPES: {
  id: DayType;
  label: string;
  labelShort: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
}[] = [
  {
    id: "regular",
    label: "Regular",
    labelShort: "REG",
    icon: User,
    color: "border-border bg-raised/50 text-secondary",
  },
  {
    id: "train_am",
    label: "Train AM",
    labelShort: "AM",
    icon: Sun,
    color: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  },
  {
    id: "train_pm",
    label: "Train PM",
    labelShort: "PM",
    icon: Dumbbell,
    color: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
    <div >
      {}
      <div >
        {DAY_NAMES.map((name, dayOfWeek) => {
          const isToday = dayOfWeek === today;
          const currentType = templates[dayOfWeek] ?? "regular";
          const dayType = DAY_TYPES.find((t) => t.id === currentType) ?? DAY_TYPES[0];
          const DayIcon = dayType.icon;

          return (
            <div
              key={dayOfWeek}

            >
              {}
              <div >
                <span

                >
                  {name}
                </span>
                <div >
                  <DayIcon size={14} />
                </div>
              </div>

              {}
              <div >
                {DAY_TYPES.map((type) => {
                  const active = currentType === type.id;
                  const Icon = type.icon;
                  const isPending = pending === `${dayOfWeek}-${type.id}`;
                  const isDisabled = DISABLED_DAY_TYPES.includes(type.id) && !active;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setDayType(dayOfWeek, type.id)}
                      disabled={!!pending || isDisabled}
                      title={isDisabled ? "No distinct routine yet — coming soon" : undefined}

                    >
                      <Icon size={12} />
                      <span >{type.labelShort}</span>
                    </button>
                  );
                })}
              </div>

              {}
              <span

              >
                {dayType.label}
              </span>
            </div>
          );
        })}
      </div>

      {}
      <div >
        {DAY_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.id} >
              <div >
                <Icon size={11} />
              </div>
              <span >{type.label}</span>
              <span >—</span>
              <span >
                {type.id === "regular" && "Standard routine"}
                {(type.id === "train_am" || type.id === "train_pm") &&
                  "Standard routine — custom variant coming soon"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
