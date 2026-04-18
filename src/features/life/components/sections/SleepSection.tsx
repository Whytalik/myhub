"use client";

import { Moon, Bed, Sun, Star, FileText, Info } from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";
import { useEffect } from "react";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { createPortal } from "react-dom";

interface Props {
  bedtime: string | null; // ISO string
  wakeup: string | null;  // ISO string
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
  { value: 1,  label: "1" },
  { value: 2,  label: "2" },
  { value: 3,  label: "3" },
  { value: 4,  label: "4" },
  { value: 5,  label: "5" },
  { value: 6,  label: "6" },
  { value: 7,  label: "7" },
  { value: 8,  label: "8" },
  { value: 9,  label: "9" },
  { value: 10, label: "10" },
];

const SLEEP_DESCS: Record<number, string> = {
  1: "Terrible", 2: "Awful", 3: "Poor", 4: "Low", 5: "Meh",
  6: "Fair", 7: "Good", 8: "Solid", 9: "Great", 10: "Peak"
};

export function SleepSection({ bedtime, wakeup, hours, quality, note, onChange }: Props) {
  const hasValue = bedtime !== null || wakeup !== null || quality !== null || !!note;

  // Calculate hours whenever bedtime or wakeup changes
  useEffect(() => {
    if (bedtime && wakeup) {
      const start = new Date(bedtime);
      const end = new Date(wakeup);
      if (end < start) end.setDate(end.getDate() + 1);
      const diffMs = end.getTime() - start.getTime();
      const calculatedHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
      if (calculatedHours !== hours) {
        onChange({ sleepHours: calculatedHours });
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
    const { isOpen, coords, triggerRef, open, close } = useDynamicPositioning({
      contentHeight: 250,
      contentWidth: 288,
      offset: 12
    });

    return (
      <div className="flex items-center">
        <div 
          ref={triggerRef as any}
          onMouseEnter={open}
          onMouseLeave={close}
          className="cursor-help flex items-center"
        >
          <Info size={13} className="text-muted hover:text-accent transition-colors" />
        </div>
        
        {isOpen && coords && typeof document !== "undefined" && createPortal(
          <div 
            className={`fixed z-[9999] w-72 p-4 bg-surface border border-border rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200 ${
              coords.align === 'top' ? 'origin-bottom' : 'origin-top'
            }`}
            style={{ 
              top: coords.align === 'top' ? 'auto' : coords.top,
              bottom: coords.align === 'top' ? (window.innerHeight - coords.top) : 'auto',
              left: coords.left
            }}
          >
            <div className="flex flex-col gap-3 text-[11px] leading-relaxed">
              <p className="font-bold text-text border-b border-border pb-2">
                Як оцінити якість сну?
              </p>
              <div className="flex flex-col gap-2 text-secondary">
                <p><strong>1–2:</strong> Криза. Дуже довге засинання (&gt;60 хв), часті пробудження, відчуття повної розбитості.</p>
                <p><strong>3–4:</strong> Погано. Переривчастий або поверхневий сон, важке пробудження, втома зранку.</p>
                <p><strong>5–6:</strong> Норма. 1–2 коротких пробудження, відчуття відпочинку без особливої бадьорості.</p>
                <p><strong>7–8:</strong> Добре. Швидке засинання, безперервний сон, відчуття свіжості та енергії.</p>
                <p><strong>9–10:</strong> Ідеально. Глибокий відновлювальний сон, повна відсутність пробуджень, пікова ясність.</p>
              </div>
              <p className="italic text-muted pt-2 border-t border-border">
                Підказка: Чи відчуваєте ви себе відновленим без кофеїну в першу годину після сну?
              </p>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  return (
    <div className={`bg-surface border rounded-2xl p-6 flex flex-col gap-6 transition-all ${
      hasValue ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]" : "border-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg transition-colors ${hasValue ? "bg-accent text-bg" : "bg-accent-muted text-accent"}`}>
            <Moon size={14} />
          </div>
          <h3 className={`text-[13px] font-medium transition-colors ${hasValue ? "text-accent" : "text-text"}`}>Sleep</h3>
        </div>
        <div className="flex items-center gap-4">
          {hours !== null && (
            <span className="text-[11px] font-mono text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-lg">
              {hours} hours
            </span>
          )}
          {quality !== null && (
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              {SLEEP_DESCS[quality]}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {/* Bedtime */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 h-4">
            <Bed size={12} className="text-muted" />
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Bedtime</label>
          </div>
          <TimePicker 
            value={getTimeValue(bedtime)} 
            onChange={(val) => handleTimeChange('sleepBedtime', val)}
          />
        </div>

        {/* Quality */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 px-1 h-4">
            <div className="flex items-center gap-2">
              <Star size={12} className="text-muted" />
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Quality</label>
            </div>
            <ScaleHint />
          </div>
          <div className="flex gap-1 h-9">
            {LEVELS.map(({ value }) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ sleepQuality: quality === value ? null : value })}
                className={`flex-1 rounded-lg border text-[10px] font-mono transition-all ${
                  quality === value
                    ? "bg-accent border-accent text-bg font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                    : quality !== null && value <= quality
                    ? "bg-accent-muted/40 border-accent/20 text-accent/60"
                    : "bg-raised border-border text-muted hover:border-accent/40 hover:text-text"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Wakeup */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 h-4">
            <Sun size={12} className="text-muted" />
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Wakeup</label>
          </div>
          <TimePicker 
            value={getTimeValue(wakeup)} 
            onChange={(val) => handleTimeChange('sleepWakeup', val)}
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1 h-4">
            <FileText size={12} className="text-muted" />
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Notes</label>
          </div>
          <textarea
            value={note ?? ""}
            onChange={(e) => onChange({ sleepNote: e.target.value || null })}
            placeholder="Sleep details..."
            rows={1}
            className={`bg-raised/50 border rounded-xl px-4 py-2 text-xs transition-all resize-none outline-none leading-relaxed h-9 flex items-center ${
              note 
                ? "border-accent/50 text-text bg-accent/[0.02]" 
                : "border-border text-secondary placeholder:text-muted/50 focus:border-accent/40"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
