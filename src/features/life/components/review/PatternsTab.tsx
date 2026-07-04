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
    <div >
      {patterns.length === 0 ? (
        <div >
          Not enough overlapping days logged yet to surface patterns. Keep journaling — patterns
          need at least ~10 comparable days.
        </div>
      ) : (
        <div >
          {patterns.map((p) => (
            <div
              key={p.id}

            >
              <p >{p.description}</p>
              <span >r={p.r}</span>
            </div>
          ))}
        </div>
      )}

      <div >
        <Info size={14} />
        <p>
          These are patterns to notice, not proven causes — correlation over your logged history,
          not an experiment. Small samples can mislead; treat them as prompts for curiosity, not
          conclusions.
        </p>
      </div>
    </div>
  );
}
