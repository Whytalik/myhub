"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, User, Dumbbell, Gamepad2, Sun } from "lucide-react";
import { upsertDayScheduleAction } from "../actions/schedule-actions";
import type { DayScheduleData, DayType } from "../types";

const DAY_TYPES: { id: DayType; label: string; labelShort: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[] = [
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
  {
    id: "fun",
    label: "Fun Day",
    labelShort: "FUN",
    icon: Gamepad2,
    color: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  },
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString("en", opts)} – ${sunday.toLocaleDateString("en", opts)}`;
}

interface Props {
  initialSchedules: DayScheduleData[];
  initialWeekStart: string;
}

export function WeekScheduleClient({ initialSchedules, initialWeekStart }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => new Date(initialWeekStart));
  const [schedules, setSchedules] = useState<Record<string, DayType>>(() => {
    const map: Record<string, DayType> = {};
    for (const s of initialSchedules) {
      map[formatDateStr(new Date(s.date))] = s.dayType as DayType;
    }
    return map;
  });
  const [pending, setPending] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const today = formatDateStr(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    // We don't reload schedules for other weeks from here — handled by navigating weeks
    // In a real app we'd fetch, but for now we use optimistic local state
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const setDayType = (dateStr: string, type: DayType) => {
    if (pending) return;
    setPending(dateStr + type);
    const prev = schedules[dateStr];
    setSchedules((s) => ({ ...s, [dateStr]: type }));

    startTransition(async () => {
      const res = await upsertDayScheduleAction({ date: dateStr, dayType: type });
      if (!res.success) {
        setSchedules((s) => {
          const next = { ...s };
          if (prev) next[dateStr] = prev;
          else delete next[dateStr];
          return next;
        });
      }
      setPending(null);
    });
  };

  const isCurrentWeek = formatDateStr(getMonday(new Date())) === formatDateStr(weekStart);

  return (
    <div className="flex flex-col gap-6">
      {/* Week nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevWeek}
          className="p-2 rounded-xl border border-border hover:bg-raised transition-colors text-secondary hover:text-text"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-note font-mono text-muted tracking-widest uppercase">
            {isCurrentWeek ? "Current Week" : "Week"}
          </span>
          <span className="text-body font-bold text-text">{formatWeekLabel(weekStart)}</span>
        </div>
        <button
          onClick={nextWeek}
          className="p-2 rounded-xl border border-border hover:bg-raised transition-colors text-secondary hover:text-text"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day, i) => {
          const dateStr = formatDateStr(day);
          const isToday = dateStr === today;
          const currentType = schedules[dateStr] ?? "regular";
          const dayType = DAY_TYPES.find((t) => t.id === currentType) ?? DAY_TYPES[0];
          const DayIcon = dayType.icon;

          return (
            <div
              key={dateStr}
              className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all ${
                isToday
                  ? "border-accent/40 bg-accent/[0.03] shadow-[0_0_20px_rgba(192,132,252,0.06)]"
                  : "border-border bg-surface"
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-note font-mono font-bold tracking-widest uppercase ${isToday ? "text-accent" : "text-muted"}`}>
                    {DAY_NAMES[i]}
                  </span>
                  <span className={`text-label font-mono ${isToday ? "text-accent/70" : "text-muted/60"}`}>
                    {day.getDate()}.{String(day.getMonth() + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className={`p-1.5 rounded-lg ${dayType.color}`}>
                  <DayIcon size={14} />
                </div>
              </div>

              {/* Type selector */}
              <div className="grid grid-cols-2 gap-1.5">
                {DAY_TYPES.map((type) => {
                  const active = currentType === type.id;
                  const Icon = type.icon;
                  const isPending = pending === dateStr + type.id;

                  return (
                    <button
                      key={type.id}
                      onClick={() => setDayType(dateStr, type.id)}
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
                {type.id === "regular" && "Normal morning + Normal evening"}
                {type.id === "train_am" && "Morning training + Normal evening"}
                {type.id === "train_pm" && "Normal morning + Evening gym"}
                {type.id === "fun" && "Normal morning + Fun evening"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
