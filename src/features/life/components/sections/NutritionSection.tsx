"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

import { Utensils, CheckCircle2, AlertTriangle, XCircle, FileText } from "lucide-react";

interface Props {
  nutrition: number | null;
  note: string | null;
  onChange: (patch: { nutrition?: number | null; nutritionNote?: string | null }) => void;
}

const OPTIONS = [
  {
    value: 5,
    label: "Yes",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/40",
  },
  {
    value: 3,
    label: "Partially",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
  },
  {
    value: 1,
    label: "No",
    icon: XCircle,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/40",
  },
];

export function NutritionSection({ nutrition, note, onChange }: Props) {
  const hasValue = nutrition !== null || !!note;
  const showNote = nutrition === 1 || nutrition === 3;
  const cardClass = `glass-card p-4 flex flex-col gap-4 border ${hasValue ? "border-accent/20" : "border-white/[0.06]"}`;

  return (
    <div className={cardClass}>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-nutrition/10 text-accent-nutrition">
          <Utensils size={14} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-panel-title">Nutrition Plan</h3>
          <span className="text-caption">Did you stick to the plan today?</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = nutrition === opt.value;
          const optionClass = `flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors duration-150 ${
            active
              ? `${opt.bg} ${opt.border} ${opt.color}`
              : "border-white/[0.08] text-zinc-400 hover:bg-white/5"
          }`;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ nutrition: active ? null : opt.value })}
              className={optionClass}
            >
              <Icon size={16} />
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {showNote && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <FileText size={12} />
            <label className="text-label">What went wrong? (Pattern detection)</label>
          </div>
          <Textarea
            value={note ?? ""}
            onChange={(e) => onChange({ nutritionNote: e.target.value || null })}
            placeholder="One sentence: what was the trigger or reason?"
            rows={1}
          />
        </div>
      )}
    </div>
  );
}
