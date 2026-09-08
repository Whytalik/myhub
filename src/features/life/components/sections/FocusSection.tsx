"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

import { Zap } from "lucide-react";

interface Props {
  plan: string | null;
  onChange: (data: { standupPlan?: string | null }) => void;
  compact?: boolean;
}

export function FocusSection({ plan, onChange, compact = false }: Props) {
  const sectionIconClass =
    "flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent";

  if (compact) {
    return (
      <div className="glass-elevated p-3 flex items-center gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className={sectionIconClass}>
            <Zap size={14} />
          </div>
          <span className="text-label hidden sm:block">Today&apos;s Focus</span>
        </div>
        <Textarea
          placeholder="What is my main focus?"
          value={plan ?? ""}
          onChange={(e) => onChange({ standupPlan: e.target.value || null })}
          rows={1}
          className="min-h-[36px] py-1.5"
        />
      </div>
    );
  }

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className={sectionIconClass}>
          <Zap size={14} />
        </div>
        <h3 className="text-panel-title">Today&apos;s Focus</h3>
      </div>
      <Textarea
        placeholder="What is my main focus?"
        value={plan ?? ""}
        onChange={(e) => onChange({ standupPlan: e.target.value || null })}
        rows={2}
      />
    </div>
  );
}
