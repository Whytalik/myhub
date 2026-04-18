"use client";

import { Zap, Smile, FileText, Info } from "lucide-react";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
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

  const ScaleHint = ({ type }: { type: "energy" | "mood" }) => {
    const { isOpen, coords, triggerRef, open, close } = useDynamicPositioning({
      contentHeight: 250,
      contentWidth: 288, // w-72 = 18rem = 288px
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
                {type === "energy" ? "Як оцінити енергію?" : "Як оцінити настрій?"}
              </p>
              <div className="flex flex-col gap-2 text-secondary">
                {type === "energy" ? (
                  <>
                    <p><strong>1–2:</strong> Виснаження. Немає сил на базові справи.</p>
                    <p><strong>3–4:</strong> Втома. Робиш справи лише через зусилля волі.</p>
                    <p><strong>5–6:</strong> Стабільність. Достатньо сил для звичайного темпу.</p>
                    <p><strong>7–8:</strong> Бадьорість. Є запас енергії, хочеться діяти.</p>
                    <p><strong>9–10:</strong> Пік. Максимальна продуктивність і драйв.</p>
                  </>
                ) : (
                  <>
                    <p><strong>1–2:</strong> Криза. Сильна тривога або роздратування.</p>
                    <p><strong>3–4:</strong> Апатія. Низький фон, хочеться, щоб день минув.</p>
                    <p><strong>5–6:</strong> Спокій. Рівний настрій, без яскравих емоцій.</p>
                    <p><strong>7–8:</strong> Радість. Позитивне сприйняття світу, відкритість.</p>
                    <p><strong>9–10:</strong> Захват. Відчуття щастя та задоволення.</p>
                  </>
                )}
              </div>
              <p className="italic text-muted pt-2 border-t border-border">
                {type === "energy" 
                  ? "Підказка: Якби зараз треба було щось зробити — чи є сили?" 
                  : "Підказка: Як я ставлюся до того, що відбувається навколо?"}
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
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Morning Energy & Mood</span>
      </div>
      {/* Energy Row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg transition-colors ${energy !== null ? "bg-accent text-bg" : "bg-accent-muted text-accent"}`}>
              <Zap size={14} />
            </div>
            <h3 className={`text-[13px] font-medium transition-colors ${energy !== null ? "text-accent" : "text-text"}`}>Energy</h3>
            <ScaleHint type="energy" />
          </div>
          {energy !== null && (
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              {ENERGY_DESCS[energy]}
            </span>
          )}
        </div>

        <div className="flex gap-1 h-9">
          {LEVELS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ energy: energy === value ? null : value })}
              className={`flex-1 rounded-lg border text-[10px] font-mono transition-all ${
                energy === value
                  ? "bg-accent border-accent text-bg font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                  : energy !== null && value <= energy
                  ? "bg-accent-muted/40 border-accent/20 text-accent/60"
                  : "bg-raised border-border text-muted hover:border-accent/40 hover:text-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg transition-colors ${mood !== null ? "bg-accent text-bg" : "bg-accent-muted text-accent"}`}>
              <Smile size={14} />
            </div>
            <h3 className={`text-[13px] font-medium transition-colors ${mood !== null ? "text-accent" : "text-text"}`}>Mood</h3>
            <ScaleHint type="mood" />
          </div>
          {mood !== null && (
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
              {MOOD_DESCS[mood]}
            </span>
          )}
        </div>

        <div className="flex gap-1 h-9">
          {LEVELS.map(({ value }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ mood: mood === value ? null : value })}
              className={`flex-1 rounded-lg border text-[10px] font-mono transition-all ${
                mood === value
                  ? "bg-accent border-accent text-bg font-bold shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                  : mood !== null && value <= mood
                  ? "bg-accent-muted/40 border-accent/20 text-accent/60"
                  : "bg-raised border-border text-muted hover:border-accent/40 hover:text-text"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 h-4">
          <FileText size={12} className="text-muted" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted">Notes</span>
        </div>
        <textarea
          value={note ?? ""}
          onChange={(e) => onChange({ energyNote: e.target.value || null })}
          placeholder="Mood/energy notes..."
          rows={1}
          className={`bg-raised/50 border rounded-xl px-4 py-2 text-xs transition-all resize-none outline-none leading-relaxed h-9 flex items-center ${
            note
              ? "border-accent/50 text-text bg-accent/[0.02]"
              : "border-border text-secondary placeholder:text-muted/50 focus:border-accent/40"
          }`}
        />
      </div>
    </div>
  );
}
