"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Feather,
  Gauge,
  ListChecks,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import type { DailyVector } from "@/features/life/types";

interface Props {
  vector: DailyVector | null;
  onChange: (patch: { dailyVector: DailyVector }) => void;
}

const EMPTY_VECTOR: DailyVector = {
  toImprove: null,
  toDo: null,
  toIncreaseEfficiency: null,
  toReduceEffort: null,
  toAutomate: null,
  toDelegate: null,
  toFix: null,
};

const PROMPTS: {
  key: keyof DailyVector;
  icon: typeof TrendingUp;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "toImprove",
    icon: TrendingUp,
    label: "Improve",
    placeholder: "What do I need to improve?",
  },
  { key: "toDo", icon: ListChecks, label: "Do", placeholder: "What do I need to do?" },
  {
    key: "toIncreaseEfficiency",
    icon: Gauge,
    label: "Efficiency",
    placeholder: "How do I increase efficiency?",
  },
  {
    key: "toReduceEffort",
    icon: Feather,
    label: "Reduce Effort",
    placeholder: "How do I reduce effort?",
  },
  { key: "toAutomate", icon: Bot, label: "Automate", placeholder: "What do I need to automate?" },
  { key: "toDelegate", icon: Users, label: "Delegate", placeholder: "What do I need to delegate?" },
  { key: "toFix", icon: Wrench, label: "Fix", placeholder: "What do I need to fix?" },
];

export function DailyVectorSection({ vector, onChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const values = vector ?? EMPTY_VECTOR;
  const filledCount = PROMPTS.filter((p) => !!values[p.key]).length;

  const handleFieldChange = (key: keyof DailyVector, value: string) => {
    onChange({ dailyVector: { ...values, [key]: value || null } });
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-label flex items-center gap-1.5">
          Daily Vector
          {filledCount > 0 && <span className="text-accent">({filledCount}/7)</span>}
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        {isExpanded ? (
          <ChevronUp size={14} className="text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-zinc-500 shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROMPTS.map(({ key, icon: Icon, label, placeholder }) => {
            const hasValue = !!values[key];
            const labelClass = `text-label ${hasValue ? "text-accent" : ""}`;

            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Icon size={13} />
                  <label className={labelClass}>{label}</label>
                </div>
                <Textarea
                  value={values[key] ?? ""}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  placeholder={placeholder}
                  rows={2}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
