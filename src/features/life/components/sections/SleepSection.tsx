"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

import { Moon, Bed, Sun, Star, FileText, Info } from "lucide-react";
import { TimePicker } from "@/components/ui/inputs/time-picker";
import { useEffect, useRef } from "react";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { createPortal } from "react-dom";

interface Props {
  bedtime: string | null;
  wakeup: string | null;
  hours: number | null;
  quality: number | null;
  note: string | null;
  onChange: (patch: {
    sleepBedtime?: string | null;
    sleepWakeup?: string | null;
    sleepHours?: number | null;
    sleepQuality?: number | null;
    sleepNote?: string | null;
  }) => void;
}

const LEVELS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
  { value: 8, label: "8" },
  { value: 9, label: "9" },
  { value: 10, label: "10" },
];

const SLEEP_DESCS: Record<number, string> = {
  1: "Terrible",
  2: "Awful",
  3: "Poor",
  4: "Low",
  5: "Meh",
  6: "Fair",
  7: "Good",
  8: "Solid",
  9: "Great",
  10: "Peak",
};

function ScaleHint() {
  const { isOpen, coords, triggerRef, contentRef, open, close } = useDynamicPositioning({
    contentWidth: 288,
    offset: 12,
  });

  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        width: 288,
        ...(coords.align === "bottom"
          ? { top: coords.top }
          : { bottom: window.innerHeight - coords.top }),
      }
    : {};

  return (
    <div>
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        onMouseEnter={open}
        onMouseLeave={close}
        className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-help"
      >
        <Info size={13} />
      </div>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            style={dropdownStyle}
            className="glass-elevated p-4 z-[9000]"
          >
            <div className="flex flex-col gap-2">
              <p className="text-panel-title">Як оцінити якість сну</p>
              <div className="flex flex-col gap-1 text-caption">
                <p>
                  <strong className="text-zinc-300">1–2:</strong> Жахливо. Майже немає сну (&gt;60
                  хв засипання), часті прокидання, відчуття повної знесиленості.
                </p>
                <p>
                  <strong className="text-zinc-300">3–4:</strong> Погано. Переривчастий або
                  недостатній сон, часті прокидання, важкий підйом.
                </p>
                <p>
                  <strong className="text-zinc-300">5–6:</strong> Нормально. 1–2 прокидання за ніч,
                  відносно відновлений після достатньої кількості годин.
                </p>
                <p>
                  <strong className="text-zinc-300">7–8:</strong> Добре. Безперервний сон,
                  прокинувся бадьорим, відчуття відновлення та готовності.
                </p>
                <p>
                  <strong className="text-zinc-300">9–10:</strong> Чудово. Абсолютно відновлений
                  сон, легке прокидання, повний запас сил на день.
                </p>
              </div>
              <p className="text-caption italic">
                Підказка: орієнтуйся на те наскільки відновленим ти почуваєшся після підйому з ліжка
              </p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function SleepSection({ bedtime, wakeup, hours, quality, note, onChange }: Props) {
  const hasValue = bedtime !== null || wakeup !== null || quality !== null || !!note;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.max(36, scrollHeight) + "px";
    }
  }, [note]);

  useEffect(() => {
    if (bedtime && wakeup) {
      const start = new Date(bedtime);
      const end = new Date(wakeup);
      if (end < start) {
        const adjustedEnd = new Date(end);
        adjustedEnd.setDate(adjustedEnd.getDate() + 1);
        const diffMs = adjustedEnd.getTime() - start.getTime();
        const calculatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
        if (calculatedHours !== hours) {
          onChange({ sleepHours: calculatedHours });
        }
      } else {
        const diffMs = end.getTime() - start.getTime();
        const calculatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
        if (calculatedHours !== hours) {
          onChange({ sleepHours: calculatedHours });
        }
      }
    }
  }, [bedtime, wakeup, hours, onChange]);

  const getTimeValue = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toTimeString().slice(0, 5);
  };

  const handleTimeChange = (field: "sleepBedtime" | "sleepWakeup", timeStr: string) => {
    if (!timeStr) {
      onChange({ [field]: null });
      return;
    }
    const [h, m] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    onChange({ [field]: date.toISOString() });
  };

  const cardClass = `glass-card p-4 flex flex-col gap-4 border ${hasValue ? "border-accent/20" : "border-white/[0.06]"}`;
  const levelButtonClass = (isActive: boolean) =>
    `h-8 flex-1 rounded-lg text-xs font-mono font-semibold transition-colors duration-150 ${
      isActive
        ? "bg-accent text-white"
        : "bg-white/[0.03] text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
    }`;

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Moon size={14} />
          </div>
          <h3 className="text-panel-title">Sleep</h3>
        </div>
        <div className="flex items-center gap-2">
          {hours !== null && <span className="text-caption">{hours} hours</span>}
          {quality !== null && <span className="text-caption">{SLEEP_DESCS[quality]}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Bed size={12} />
              <label className="text-label">Bedtime</label>
            </div>
            <TimePicker
              value={getTimeValue(bedtime)}
              onChange={(val) => handleTimeChange("sleepBedtime", val)}
              presets={[{ label: "22:00", value: "22:00" }]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Sun size={12} />
              <label className="text-label">Wakeup</label>
            </div>
            <TimePicker
              value={getTimeValue(wakeup)}
              onChange={(val) => handleTimeChange("sleepWakeup", val)}
              presets={[{ label: "08:00", value: "08:00" }]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Star size={12} />
              <label className="text-label">Quality</label>
            </div>
            <ScaleHint />
          </div>
          <div className="flex items-center gap-1">
            {LEVELS.map(({ value }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ sleepQuality: quality === value ? null : value })}
                className={levelButtonClass(quality === value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <FileText size={12} />
            <label className="text-label">Notes</label>
          </div>
          <Textarea
            ref={textareaRef}
            value={note ?? ""}
            onChange={(e) => onChange({ sleepNote: e.target.value || null })}
            placeholder="Sleep details..."
            rows={1}
          />
        </div>
      </div>
    </div>
  );
}
