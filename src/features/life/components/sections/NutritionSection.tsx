"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

import { Utensils, CheckCircle2, AlertTriangle, XCircle, FileText } from "lucide-react";

interface Props {
  nutrition: number | null;
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
    <div >
      <div >
        <div >
          <div >
            <Utensils size={14} />
          </div>
          <div >
            <h3 >Nutrition Plan</h3>
            <span >Did you stick to the plan today?</span>
          </div>
        </div>
      </div>

      <div >
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = nutrition === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ nutrition: active ? null : opt.value })}

            >
              <Icon size={16} />
              <div >
                <span >{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showNote && (
        <div >
          <div >
            <FileText size={12} />
            <label >
              What went wrong? (Pattern detection)
            </label>
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
