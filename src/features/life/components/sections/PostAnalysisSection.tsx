"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { HintTooltip } from "@/components/ui/overlays/tooltip";
import { ChevronDown, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";

interface Props {
  postAnalysisTrigger: string | null;
  postAnalysisMyReaction: string | null;
  postAnalysisBetterResponse: string | null;
  mood: number | null;
  energy: number | null;
  onChange: (patch: {
    postAnalysisTrigger?: string | null;
    postAnalysisMyReaction?: string | null;
    postAnalysisBetterResponse?: string | null;
  }) => void;
}

const PROMPTS = [
  {
    key: "postAnalysisTrigger" as const,
    icon: AlertTriangle,
    label: "Trigger",
    placeholder: "What knocked you off track today?",
    hint: "Professional traders log the specific moment their plan broke down. Name the exact trigger — not 'bad day', but 'client email at 3pm' or 'saw competitor launch'. Specificity is what makes post-analysis work.",
  },
  {
    key: "postAnalysisMyReaction" as const,
    icon: CheckCircle2,
    label: "My Reaction",
    placeholder: "How did you actually respond?",
    hint: "Write what you did, not what you wish you'd done. Traders call this the 'execution report' — describing the automatic reaction without judgment is the first step to changing it.",
  },
  {
    key: "postAnalysisBetterResponse" as const,
    icon: Lightbulb,
    label: "Better Response",
    placeholder: "What would work better next time?",
    hint: "Name one concrete action that sidesteps the trigger. Not 'be calmer' but 'close Slack during deep work' or 'wait 10 minutes before replying'. Make it specific enough to recognize the moment it applies.",
  },
];

export function PostAnalysisSection({
  postAnalysisTrigger,
  postAnalysisMyReaction,
  postAnalysisBetterResponse,
  mood,
  energy,
  onChange,
}: Props) {
  const values = { postAnalysisTrigger, postAnalysisMyReaction, postAnalysisBetterResponse };

  // Auto-expand if low mood/energy OR if any field has content
  const hasLowMoodOrEnergy = (mood !== null && mood < 4) || (energy !== null && energy < 4);
  const hasAnyContent = !!(
    postAnalysisTrigger ||
    postAnalysisMyReaction ||
    postAnalysisBetterResponse
  );
  const [isExpanded, setIsExpanded] = useState(hasLowMoodOrEnergy || hasAnyContent);

  const filledCount = [
    postAnalysisTrigger,
    postAnalysisMyReaction,
    postAnalysisBetterResponse,
  ].filter(Boolean).length;

  return (
    <div className="glass-card overflow-hidden border border-white/[0.04]">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            size={16}
            className={`text-zinc-500 transition-transform duration-150 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
          />
          <span className="text-label">Post-Analysis (5-min review)</span>
          {hasLowMoodOrEnergy && !hasAnyContent && (
            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              ⚠️ Low mood/energy detected
            </span>
          )}
          {filledCount > 0 && (
            <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {filledCount}/3
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">Optional</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-white/[0.04] p-4 bg-black/10 flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <strong className="text-zinc-400">Trade review for life:</strong> Log significant
            emotional reactions. Not every frustration needs analysis — but when something knocks
            you off your plan, a 5-minute post-mortem beats ruminating all evening.
          </p>

          <div className="flex flex-col gap-4">
            {PROMPTS.map(({ key, icon: Icon, label, placeholder, hint }) => {
              const hasValue = !!values[key];
              const labelClass = `text-label ${hasValue ? "text-accent" : ""}`;

              return (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Icon size={13} />
                    <label className={labelClass}>{label}</label>
                    <HintTooltip hint={hint} />
                  </div>
                  <Textarea
                    value={values[key] ?? ""}
                    onChange={(e) => onChange({ [key]: e.target.value || null })}
                    placeholder={placeholder}
                    rows={2}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
