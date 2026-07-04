import { Info } from "lucide-react";
import type { Pattern } from "@/features/life/types";

interface Props {
  patterns: Pattern[];
}

const STRENGTH_COLOR: Record<Pattern["strength"], string> = {
  weak: "border-white/[0.08] text-zinc-400",
  moderate: "border-accent/30 text-accent",
  strong: "border-emerald-500/30 text-emerald-400",
};

export function PatternsTab({ patterns }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {patterns.length === 0 ? (
        <div className="glass-card p-6 text-caption">
          Not enough overlapping days logged yet to surface patterns. Keep journaling — patterns
          need at least ~10 comparable days.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {patterns.map((p) => {
            const cardClass = `glass-card p-3 flex items-center justify-between gap-3 border ${STRENGTH_COLOR[p.strength]}`;

            return (
              <div key={p.id} className={cardClass}>
                <p className="text-sm text-zinc-200">{p.description}</p>
                <span className="text-label shrink-0">r={p.r}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 text-caption">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>
          These are patterns to notice, not proven causes — correlation over your logged history,
          not an experiment. Small samples can mislead; treat them as prompts for curiosity, not
          conclusions.
        </p>
      </div>
    </div>
  );
}
