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
    color: "border-white/[0.08] bg-white/[0.03] text-zinc-400",
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DAY_NAMES.map((name, dayOfWeek) => {
          const isToday = dayOfWeek === today;
          const currentType = templates[dayOfWeek] ?? "regular";
          const dayType = DAY_TYPES.find((t) => t.id === currentType) ?? DAY_TYPES[0];
          const DayIcon = dayType.icon;
          const cardClass = `glass-card p-4 flex flex-col gap-3 border ${isToday ? "border-accent/30" : "border-white/[0.06]"}`;

          return (
            <div key={dayOfWeek} className={cardClass}>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${isToday ? "text-accent" : "text-zinc-200"}`}
                >
                  {name}
                </span>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg border ${dayType.color}`}
                >
                  <DayIcon size={14} />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {DAY_TYPES.map((type) => {
                  const active = currentType === type.id;
                  const Icon = type.icon;
                  const isPending = pending === `${dayOfWeek}-${type.id}`;
                  const isDisabled = DISABLED_DAY_TYPES.includes(type.id) && !active;
                  const buttonClass = `flex-1 flex items-center justify-center gap-1 h-8 rounded-lg border text-[10px] font-mono font-semibold transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                    active ? type.color : "border-white/[0.08] text-zinc-500 hover:bg-white/5"
                  } ${isPending ? "opacity-60" : ""}`;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setDayType(dayOfWeek, type.id)}
                      disabled={!!pending || isDisabled}
                      title={isDisabled ? "No distinct routine yet — coming soon" : undefined}
                      className={buttonClass}
                    >
                      <Icon size={12} />
                      <span>{type.labelShort}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-caption">{dayType.label}</span>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-4 flex flex-col gap-2">
        {DAY_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.id} className="flex items-center gap-2.5">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-md border ${type.color}`}
              >
                <Icon size={11} />
              </div>
              <span className="text-sm font-medium text-zinc-200">{type.label}</span>
              <span className="text-zinc-600">—</span>
              <span className="text-caption">
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
