import { Info } from "lucide-react";
import type { Pattern } from "@/features/life/types";

interface Props {
  patterns: Pattern[];
}

const STRENGTH_COLOR: Record<Pattern["strength"], string> = {
  weak: "border-border text-muted",
  moderate: "border-accent/30 text-accent",
  strong: "border-emerald-500/30 text-emerald-500",
};

export function PatternsTab({ patterns }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {patterns.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted text-body italic">
          Not enough overlapping days logged yet to surface patterns. Keep journaling — patterns
          need at least ~10 comparable days.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {patterns.map((p) => (
            <div
              key={p.id}
              className={`bg-surface border rounded-xl p-4 flex items-center justify-between gap-4 ${STRENGTH_COLOR[p.strength]}`}
            >
              <p className="text-body text-text">{p.description}</p>
              <span className="text-caption font-mono text-muted shrink-0">r={p.r}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 px-1 text-caption text-muted italic">
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
