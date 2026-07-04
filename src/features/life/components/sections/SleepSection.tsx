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
    sleepNote?: string | null
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
  1: "Terrible", 2: "Awful", 3: "Poor", 4: "Low", 5: "Meh",
  6: "Fair", 7: "Good", 8: "Solid", 9: "Great", 10: "Peak"
};

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

  const handleTimeChange = (field: 'sleepBedtime' | 'sleepWakeup', timeStr: string) => {
    if (!timeStr) {
      onChange({ [field]: null });
      return;
    }
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    onChange({ [field]: date.toISOString() });
  };

  const ScaleHint = () => {
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
                Як оцінити якість сну
              </p>
              <div >
                <p><strong>1–2:</strong> Жахливо. Майже немає сну (&gt;60 хв засипання), часті прокидання, відчуття повної знесиленості.</p>
                <p><strong>3–4:</strong> Погано. Переривчастий або недостатній сон, часті прокидання, важкий підйом.</p>
                <p><strong>5–6:</strong> Нормально. 1–2 прокидання за ніч, відносно відновлений після достатньої кількості годин.</p>
                <p><strong>7–8:</strong> Добре. Безперервний сон, прокинувся бадьорим, відчуття відновлення та готовності.</p>
                <p><strong>9–10:</strong> Чудово. Абсолютно відновлений сон, легке прокидання, повний запас сил на день.</p>
              </div>
              <p >
                Підказка: орієнтуйся на те наскільки відновленим ти почуваєшся після підйому з ліжка
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
        <div >
          <div >
            <Moon size={14} />
          </div>
          <h3 >Sleep</h3>
        </div>
        <div >
          {hours !== null && (
            <span >
              {hours} hours
            </span>
          )}
          {quality !== null && (
            <span >
              {SLEEP_DESCS[quality]}
            </span>
          )}
        </div>
      </div>

      <div >
        {}
        <div >
          <div >
            <div >
              <Bed size={12} />
              <label >Bedtime</label>
            </div>
            <TimePicker
              value={getTimeValue(bedtime)}
              onChange={(val) => handleTimeChange('sleepBedtime', val)}
              presets={[{ label: "22:00", value: "22:00" }]}
            />
          </div>
          <div >
            <div >
              <Sun size={12} />
              <label >Wakeup</label>
            </div>
            <TimePicker
              value={getTimeValue(wakeup)}
              onChange={(val) => handleTimeChange('sleepWakeup', val)}
              presets={[{ label: "08:00", value: "08:00" }]}
            />
          </div>
        </div>

        {}
        <div >
          <div >
            <div >
              <Star size={12} />
              <label >Quality</label>
            </div>
            <ScaleHint />
          </div>
          <div >
            {LEVELS.map(({ value }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ sleepQuality: quality === value ? null : value })}

              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {}
        <div >
          <div >
            <FileText size={12} />
            <label >Notes</label>
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
