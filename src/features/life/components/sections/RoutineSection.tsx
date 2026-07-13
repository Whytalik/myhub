"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Sun,
  Moon,
  Dumbbell,
  XCircle,
  AlarmClock,
  Droplets,
  ShowerHead,
  Footprints,
  PhoneOff,
  Utensils,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { getMorningRoutine, EVENING_ROUTINE, type RoutineMap } from "@/lib/life/routine-items";
import { Input } from "@/components/ui/inputs/input";

const SKIP_REASONS = ["Недосипання", "Хвороба / симптоми", "Брак часу"] as const;

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
  Lightbulb,
  CheckCircle2,
  Circle,
};

interface Props {
  type: "morning" | "evening";
  routine: RoutineMap | null;
  scheduledTrainingDayName?: string;
  gymSkipped?: boolean;
  gymSkipReason?: string | null;
  inboxCount?: number;
  onChange: (patch: {
    morningRoutine?: RoutineMap | null;
    eveningRoutine?: RoutineMap | null;
    gymSkipped?: boolean;
    gymSkipReason?: string | null;
  }) => void;
}

export function RoutineSection({
  type,
  routine,
  scheduledTrainingDayName,
  gymSkipped = false,
  gymSkipReason,
  inboxCount,
  onChange,
}: Props) {
  const [isSkipPanelOpen, setIsSkipPanelOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [skipNote, setSkipNote] = useState("");

  const map: RoutineMap = routine ?? ({} as RoutineMap);
  const isScheduled = !!scheduledTrainingDayName;
  const isTrainingScheduled = isScheduled && !gymSkipped;
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

  const openSkipPanel = () => {
    setSelectedReason(null);
    setSkipNote("");
    setIsSkipPanelOpen(true);
  };

  const confirmSkip = () => {
    if (!selectedReason) return;
    const reason = skipNote.trim() ? `${selectedReason} — ${skipNote.trim()}` : selectedReason;
    onChange({ gymSkipped: true, gymSkipReason: reason });
    setIsSkipPanelOpen(false);
  };

  const undoSkip = () => {
    onChange({ gymSkipped: false, gymSkipReason: null });
  };

  const cardClass = `glass-card p-4 flex flex-col gap-3 border ${
    isComplete ? "border-emerald-500/20" : hasValue ? "border-accent/20" : "border-white/[0.06]"
  }`;
  const iconWrapClass = `flex items-center justify-center w-7 h-7 rounded-lg ${
    type === "morning" ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
  }`;
  const progressClass = `text-caption ${isComplete ? "text-emerald-400" : ""}`;
  const chipClass = (isActive: boolean) =>
    `px-2.5 py-1 rounded-lg text-xs border transition-colors duration-150 ${
      isActive
        ? "bg-accent/15 text-accent border-accent/30"
        : "text-zinc-400 border-white/[0.08] hover:bg-white/5"
    }`;

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

      {type === "morning" && isScheduled && !gymSkipped && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-accent-training/10 text-accent-training text-xs">
            <div className="flex items-center gap-1.5">
              <Dumbbell size={12} />
              <span>Training day: {scheduledTrainingDayName}</span>
            </div>
            {!isSkipPanelOpen && (
              <button
                type="button"
                onClick={openSkipPanel}
                className="text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
              >
                Пропустити зал
              </button>
            )}
          </div>

          {isSkipPanelOpen && (
            <div className="flex flex-col gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-caption">Чому пропускаєш зал?</span>
              <div className="flex flex-wrap gap-1.5">
                {SKIP_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason((r) => (r === reason ? null : reason))}
                    className={chipClass(selectedReason === reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <Input
                value={skipNote}
                onChange={(e) => setSkipNote(e.target.value)}
                placeholder="Деталі (необов'язково)..."
                className="text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSkipPanelOpen(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={confirmSkip}
                  disabled={!selectedReason}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Підтвердити
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {type === "morning" && gymSkipped && (
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-zinc-400 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <XCircle size={12} className="shrink-0" />
            <span className="truncate">Зал пропущено: {gymSkipReason}</span>
          </div>
          <button
            type="button"
            onClick={undoSkip}
            className="shrink-0 text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors"
          >
            Повернути зал
          </button>
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
            <div key={item.id} className="flex flex-col gap-1">
              <button onClick={() => toggle(item.id)} className={itemClass}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={itemIconClass}>
                    <IconComponent size={12} />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.time && (
                        <span className="text-[10px] font-mono text-zinc-500">{item.time}</span>
                      )}
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

              {item.id === "e_kaizen" && inboxCount !== undefined && (
                <Link
                  href="/life/planning"
                  className="flex items-center justify-between gap-2 px-2.5 py-1 rounded-lg text-[11px] text-zinc-500 hover:text-accent hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <span>
                    {inboxCount > 0
                      ? `${inboxCount} thought${inboxCount === 1 ? "" : "s"} waiting in Inbox`
                      : "Inbox is empty"}
                  </span>
                  <span className="underline underline-offset-2">Sort now →</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
