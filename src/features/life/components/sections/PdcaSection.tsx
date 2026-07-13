"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ChevronDown, ChevronUp, ClipboardList, Eye, Lightbulb, ArrowRight } from "lucide-react";
import type { PdcaLog } from "@/features/life/types";

interface Props {
  pdcaLog: PdcaLog | null;
  standupPlan: string | null;
  onChange: (patch: { pdcaLog: PdcaLog }) => void;
}

const EMPTY_PDCA: PdcaLog = {
  plan: null,
  do: null,
  check: null,
  act: null,
};

const STEPS: {
  key: keyof PdcaLog;
  icon: typeof ClipboardList;
  label: string;
  sublabel: string;
  placeholder: string;
  accent: string;
}[] = [
  {
    key: "plan",
    icon: ClipboardList,
    label: "Plan",
    sublabel: "What did I plan to do today?",
    placeholder: "What were your intentions this morning?",
    accent: "text-blue-400",
  },
  {
    key: "do",
    icon: Eye,
    label: "Do",
    sublabel: "What did I actually do?",
    placeholder: "What got done? Be honest.",
    accent: "text-emerald-400",
  },
  {
    key: "check",
    icon: Lightbulb,
    label: "Check",
    sublabel: "What worked? What didn't?",
    placeholder: "Analyze the gap between plan and reality.",
    accent: "text-amber-400",
  },
  {
    key: "act",
    icon: ArrowRight,
    label: "Act",
    sublabel: "What will I change tomorrow?",
    placeholder: "One concrete adjustment for next time.",
    accent: "text-purple-400",
  },
];

export function PdcaSection({ pdcaLog, standupPlan, onChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const values = pdcaLog ?? EMPTY_PDCA;
  const filledCount = STEPS.filter((s) => !!values[s.key]).length;

  const handleFieldChange = (key: keyof PdcaLog, value: string) => {
    onChange({ pdcaLog: { ...values, [key]: value || null } });
  };

  const handleAutoFillPlan = () => {
    if (standupPlan && !values.plan) {
      onChange({ pdcaLog: { ...values, plan: standupPlan } });
    }
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => {
          setIsExpanded((v) => !v);
          if (!isExpanded) handleAutoFillPlan();
        }}
        className="flex items-center gap-3 w-full text-left"
      >
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-label flex items-center gap-1.5">
          PDCA Cycle
          {filledCount > 0 && <span className="text-accent">({filledCount}/4)</span>}
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
        {isExpanded ? (
          <ChevronUp size={14} className="text-zinc-500 shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-zinc-500 shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="flex flex-col gap-4">
          {STEPS.map(({ key, icon: Icon, label, sublabel, placeholder, accent }, idx) => {
            const hasValue = !!values[key];
            const labelClass = `text-label ${hasValue ? accent : "text-zinc-400"}`;

            return (
              <div key={key} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-600 w-4">{idx + 1}.</span>
                  <Icon size={13} className={accent} />
                  <div className="flex flex-col">
                    <label className={labelClass}>{label}</label>
                    <span className="text-[10px] text-zinc-500">{sublabel}</span>
                  </div>
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
