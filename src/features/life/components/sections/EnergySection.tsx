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
    energyNote?: string | null
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
  1: "Drained", 2: "Tired", 3: "Okay", 4: "Good", 5: "Solid",
  6: "Energized", 7: "Charged", 8: "Powerful", 9: "Peak", 10: "Ultra"
};

const MOOD_DESCS: Record<number, string> = {
  1: "Awful", 2: "Bad", 3: "Low", 4: "Down", 5: "Meh",
  6: "Fine", 7: "Good", 8: "Happy", 9: "Great", 10: "Rad"
};

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

  const ScaleHint = ({ type }: { type: "energy" | "mood" }) => {
    const { isOpen, coords, triggerRef, contentRef, open, close } = useDynamicPositioning({
      contentWidth: 288,
      offset: 12
    });

    return (
      <div >
        <div
          ref={triggerRef as React.RefObject<HTMLDivElement>}
          onMouseEnter={open}
          onMouseLeave={close}

        >
          <Info size={13} />
        </div>

        {isOpen && coords && typeof document !== "undefined" && createPortal(
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}


          >
            <div >
              <p >
                {type === "energy" ? "Як оцінити енергію" : "Як оцінити настрій"}
              </p>
              <div >
                {type === "energy" ? (
                  <>
                    <p><strong>1–2:</strong> Виснажений. Важко встати і виконати мінімум.</p>
                    <p><strong>3–4:</strong> Низький. Базові справи даються, але немає резерву сил.</p>
                    <p><strong>5–6:</strong> Нормальний. Функціонуєш, є базова продуктивність.</p>
                    <p><strong>7–8:</strong> Підвищений. Є драйв і бажання, продуктивна робота.</p>
                    <p><strong>9–10:</strong> Пік. Виняткова концентрація і запас енергії.</p>
                  </>
                ) : (
                  <>
                    <p><strong>1–2:</strong> Погано. Різкий негатив або пригніченість.</p>
                    <p><strong>3–4:</strong> Низький. Нейтральний стан, щось пригнічує або тисне.</p>
                    <p><strong>5–6:</strong> Нейтральний. Звичайний день, нічого особливого.</p>
                    <p><strong>7–8:</strong> Хороший. Позитивний фон, задоволення від дня.</p>
                    <p><strong>9–10:</strong> Чудово. Відмінний настрій та ентузіазм.</p>
                  </>
                )}
              </div>
              <p >
                {type === "energy"
                  ? "Підказка: якщо важко визначити — оцінюй вранці до початку роботи"
                  : "Підказка: це не оцінка дня, а поточний емоційний стан"}
              </p>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  return (
    <div >
      <div >
        <span >Morning Energy & Mood</span>
      </div>
      {}
      <div >
        <div >
          <div >
            <div >
              <Zap size={14} />
            </div>
            <h3 >Energy</h3>
            <ScaleHint type="energy" />
          </div>
          {energy !== null && (
            <span >
              {ENERGY_DESCS[energy]}
            </span>
          )}
        </div>

        <div >
          {LEVELS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ energy: energy === value ? null : value })}

            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {}
      <div >
        <div >
          <div >
            <div >
              <Smile size={14} />
            </div>
            <h3 >Mood</h3>
            <ScaleHint type="mood" />
          </div>
          {mood !== null && (
            <span >
              {MOOD_DESCS[mood]}
            </span>
          )}
        </div>

        <div >
          {LEVELS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ mood: mood === value ? null : value })}

            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div >
        <div >
          <FileText size={12} />
          <span >Notes</span>
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
