"use client";
import { useState } from "react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { HintTooltip } from "@/components/ui/overlays/tooltip";
import {
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Search,
  RefreshCw,
} from "lucide-react";

interface Props {
  frictionToday: string | null;
  improveTomorrow: string | null;
  postAnalysisTrigger: string | null;
  postAnalysisMyReaction: string | null;
  postAnalysisBetterResponse: string | null;
  mood: number | null;
  energy: number | null;
  onChange: (patch: {
    frictionToday?: string | null;
    improveTomorrow?: string | null;
    postAnalysisTrigger?: string | null;
    postAnalysisMyReaction?: string | null;
    postAnalysisBetterResponse?: string | null;
  }) => void;
}

const PROMPTS = [
  {
    key: "frictionToday" as const,
    icon: Search,
    label: "Kaizen: Friction Today",
    placeholder: "What took more time or energy than it should have?",
    hint: "Log one thing that took more time or energy than it deserved. Treat it as data, not self-blame — you're collecting friction points so tomorrow's fix has a real target.",
  },
  {
    key: "improveTomorrow" as const,
    icon: RefreshCw,
    label: "Kaizen: Fix for Tomorrow",
    placeholder: "One small tweak to make it easier next time",
    hint: "Pick one tiny tweak that removes today's friction — so small it's impossible to skip. Kaizen compounds through 1% adjustments, not grand overhauls.",
  },
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
  frictionToday,
  improveTomorrow,
  postAnalysisTrigger,
  postAnalysisMyReaction,
  postAnalysisBetterResponse,
  mood,
  energy,
  onChange,
}: Props) {
  const values = {
    frictionToday,
    improveTomorrow,
    postAnalysisTrigger,
    postAnalysisMyReaction,
    postAnalysisBetterResponse,
  };

  const hasLowMoodOrEnergy = (mood !== null && mood < 4) || (energy !== null && energy < 4);
  const hasAnyContent = Object.values(values).some(Boolean);
  const [isExpanded, setIsExpanded] = useState(hasLowMoodOrEnergy || hasAnyContent);

  const filledCount = Object.values(values).filter(Boolean).length;

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
          <span className="text-label">Детальний аналіз</span>
          {hasLowMoodOrEnergy && !hasAnyContent && (
            <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              ⚠️ Low mood/energy detected
            </span>
          )}
          {filledCount > 0 && (
            <span className="text-[9px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {filledCount}/5
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">Optional</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-white/[0.04] p-4 bg-black/10 flex flex-col gap-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <strong className="text-zinc-400">Kaizen + trade review:</strong> Friction and
            post-analysis are for days when something meaningfully knocked you off your plan or
            drained your energy. Situational, not daily — a 5-minute post-mortem beats ruminating
            all evening.
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
