"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

import { Zap, Smile, FileText, Info } from "lucide-react";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  energy: number | null;
  mood: number | null;
  note: string | null;
  onChange: (patch: {
    energy?: number | null;
    mood?: number | null;
    energyNote?: string | null;
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

const ENERGY_DESCS: Record<number, string> = {
  1: "Drained",
  2: "Tired",
  3: "Okay",
  4: "Good",
  5: "Solid",
  6: "Energized",
  7: "Charged",
  8: "Powerful",
  9: "Peak",
  10: "Ultra",
};

const MOOD_DESCS: Record<number, string> = {
  1: "Awful",
  2: "Bad",
  3: "Low",
  4: "Down",
  5: "Meh",
  6: "Fine",
  7: "Good",
  8: "Happy",
  9: "Great",
  10: "Rad",
};

function ScaleHint({ type }: { type: "energy" | "mood" }) {
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
              <p className="text-panel-title">
                {type === "energy" ? "Як оцінити енергію" : "Як оцінити настрій"}
              </p>
              <div className="flex flex-col gap-1 text-caption">
                {type === "energy" ? (
                  <>
                    <p>
                      <strong className="text-zinc-300">1–2:</strong> Виснажений. Важко встати і
                      виконати мінімум.
                    </p>
                    <p>
                      <strong className="text-zinc-300">3–4:</strong> Низький. Базові справи
                      даються, але немає резерву сил.
                    </p>
                    <p>
                      <strong className="text-zinc-300">5–6:</strong> Нормальний. Функціонуєш, є
                      базова продуктивність.
                    </p>
                    <p>
                      <strong className="text-zinc-300">7–8:</strong> Підвищений. Є драйв і бажання,
                      продуктивна робота.
                    </p>
                    <p>
                      <strong className="text-zinc-300">9–10:</strong> Пік. Виняткова концентрація і
                      запас енергії.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-zinc-300">1–2:</strong> Погано. Різкий негатив або
                      пригніченість.
                    </p>
                    <p>
                      <strong className="text-zinc-300">3–4:</strong> Низький. Нейтральний стан,
                      щось пригнічує або тисне.
                    </p>
                    <p>
                      <strong className="text-zinc-300">5–6:</strong> Нейтральний. Звичайний день,
                      нічого особливого.
                    </p>
                    <p>
                      <strong className="text-zinc-300">7–8:</strong> Хороший. Позитивний фон,
                      задоволення від дня.
                    </p>
                    <p>
                      <strong className="text-zinc-300">9–10:</strong> Чудово. Відмінний настрій та
                      ентузіазм.
                    </p>
                  </>
                )}
              </div>
              <p className="text-caption italic">
                {type === "energy"
                  ? "Підказка: якщо важко визначити — оцінюй вранці до початку роботи"
                  : "Підказка: це не оцінка дня, а поточний емоційний стан"}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function EnergySection({ energy, mood, note, onChange }: Props) {
  const hasValue = energy !== null || mood !== null || !!note;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.max(36, scrollHeight) + "px";
    }
  }, [note]);

  const cardClass = `glass-card p-4 flex flex-col gap-4 border ${hasValue ? "border-accent/20" : "border-white/[0.06]"}`;
  const levelButtonClass = (isActive: boolean) =>
    `h-8 flex-1 rounded-lg text-xs font-mono font-semibold transition-colors duration-150 ${
      isActive
        ? "bg-accent text-white"
        : "bg-white/[0.03] text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
    }`;

  return (
    <div className={cardClass}>
      <div className="flex items-center gap-2">
        <span className="text-panel-title">Morning Energy & Mood</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/10 text-amber-400">
              <Zap size={14} />
            </div>
            <h3 className="text-sm font-medium text-zinc-200">Energy</h3>
            <ScaleHint type="energy" />
          </div>
          {energy !== null && <span className="text-caption">{ENERGY_DESCS[energy]}</span>}
        </div>

        <div className="flex items-center gap-1">
          {LEVELS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ energy: energy === value ? null : value })}
              className={levelButtonClass(energy !== null && value <= energy)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/10 text-blue-400">
              <Smile size={14} />
            </div>
            <h3 className="text-sm font-medium text-zinc-200">Mood</h3>
            <ScaleHint type="mood" />
          </div>
          {mood !== null && <span className="text-caption">{MOOD_DESCS[mood]}</span>}
        </div>

        <div className="flex items-center gap-1">
          {LEVELS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ mood: mood === value ? null : value })}
              className={levelButtonClass(mood !== null && value <= mood)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <FileText size={12} />
          <span className="text-label">Notes</span>
        </div>
        <Textarea
          ref={textareaRef}
          value={note ?? ""}
          onChange={(e) => onChange({ energyNote: e.target.value || null })}
          placeholder="Mood/energy notes..."
          rows={1}
        />
      </div>
    </div>
  );
}
