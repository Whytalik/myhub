"use client";

import { Utensils, CheckCircle2, AlertTriangle, XCircle, FileText } from "lucide-react";

interface Props {
  nutrition: number | null; // 5: Yes, 3: Partially, 1: No
  note: string | null;
  onChange: (patch: { nutrition?: number | null; nutritionNote?: string | null }) => void;
}

const OPTIONS = [
  { value: 5, label: "Yes", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/40" },
  { value: 3, label: "Partially", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/40" },
  { value: 1, label: "No", icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/40" },
];

export function NutritionSection({ nutrition, note, onChange }: Props) {
  const hasValue = nutrition !== null || !!note;
  const showNote = nutrition === 1 || nutrition === 3;

  return (
    <div className={`bg-surface border rounded-2xl p-6 flex flex-col gap-6 transition-all ${
      hasValue ? "border-accent/20 shadow-[0_0_15px_rgba(192,132,252,0.03)]" : "border-border"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg transition-colors ${hasValue ? "bg-accent text-bg" : "bg-accent-muted text-accent"}`}>
            <Utensils size={14} />
          </div>
          <div className="flex flex-col">
            <h3 className={`text-[13px] font-medium transition-colors ${hasValue ? "text-accent" : "text-text"}`}>Nutrition Plan</h3>
            <span className="text-[10px] text-muted">Did you stick to the plan today?</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = nutrition === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ nutrition: active ? null : opt.value })}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all gap-1.5 ${
                active
                  ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm font-bold`
                  : "bg-raised/30 border-border text-muted hover:border-border-hover hover:text-secondary"
              }`}
            >
              <Icon size={16} />
              <div className="flex flex-col items-center">
                <span className="text-[11px] leading-none">{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showNote && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 px-1 h-4">
            <FileText size={12} className="text-muted" />
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted">
              What went wrong? (Pattern detection)
            </label>
          </div>
          <textarea
            value={note ?? ""}
            onChange={(e) => onChange({ nutritionNote: e.target.value || null })}
            placeholder="One sentence: what was the trigger or reason?"
            rows={1}
            className={`bg-raised/50 border rounded-xl px-4 py-2 text-xs transition-all resize-none outline-none leading-relaxed h-10 flex items-center border-border text-secondary focus:border-accent/40`}
          />
        </div>
      )}
    </div>
  );
}
