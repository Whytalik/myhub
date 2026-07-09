"use client";

import { type ConfidenceLog } from "../../types";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { MessageSquare, Shield, Brain, Wind, PenLine } from "lucide-react";

const LADDER_LABELS: Record<number, string> = {
  1: "1 — Zero stakes (stranger interaction)",
  2: "2 — Own opinion, low stakes",
  3: "3 — Attention of a few people",
  4: "4 — Against majority / closer circle",
  5: "5 — Close people, high stakes",
};

interface Props {
  log: ConfidenceLog | null;
  onChange: (patch: { confidenceLog: ConfidenceLog | null }) => void;
}

export function ConfidenceSection({ log, onChange }: Props) {
  const patch = (update: Partial<ConfidenceLog>) => {
    onChange({ confidenceLog: { ...emptyLog(), ...log, ...update } });
  };

  const hasValue = log !== null && Object.values(log).some((v) => v !== null);

  return (
    <div className={`glass-card p-4 flex flex-col gap-4 border ${hasValue ? "border-accent/20" : "border-white/[0.06]"}`}>
      <div className="flex items-center gap-2">
        <MessageSquare size={14} className="text-accent" />
        <h3 className="text-panel-title">Confidence & Communication</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Brain size={13} />
            <label className="text-label">Ladder Level Attempted</label>
          </div>
          <select
            value={log?.ladderLevel ?? ""}
            onChange={(e) => patch({ ladderLevel: e.target.value ? Number(e.target.value) : null })}
            className="glass-input w-full px-3 py-2 text-sm text-zinc-200 focus:glass-input-focus transition-all duration-150 appearance-none cursor-pointer"
          >
            <option value="">— None —</option>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <option key={lvl} value={lvl}>
                {LADDER_LABELS[lvl]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <PenLine size={13} />
            <label className="text-label">Init Attempts Today</label>
          </div>
          <Input
            type="number"
            min={0}
            max={50}
            value={log?.initAttempts ?? ""}
            onChange={(e) => patch({ initAttempts: e.target.value ? Number(e.target.value) : null })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={log?.usedBoundaryPhrase === true}
            onChange={(e) => patch({ usedBoundaryPhrase: e.target.checked || null })}
            className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.03] accent-accent"
          />
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-zinc-500" />
            <span className="text-caption">Used boundary phrase</span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={log?.floodingUsedPause === true}
            onChange={(e) => patch({ floodingUsedPause: e.target.checked || null })}
            className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.03] accent-accent"
          />
          <div className="flex items-center gap-1.5">
            <Wind size={13} className="text-zinc-500" />
            <span className="text-caption">Used code pause (flooding)</span>
          </div>
        </label>
      </div>

      {log?.usedBoundaryPhrase && (
        <Input
          value={log?.boundaryPhraseText ?? ""}
          onChange={(e) => patch({ boundaryPhraseText: e.target.value || null })}
          placeholder="Which phrase did you use?"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          value={log?.stuporThought ?? ""}
          onChange={(e) => patch({ stuporThought: e.target.value || null })}
          placeholder="Stupor: what I thought would happen..."
          rows={2}
        />
        <Textarea
          value={log?.stuporReality ?? ""}
          onChange={(e) => patch({ stuporReality: e.target.value || null })}
          placeholder="...and what actually happened"
          rows={2}
        />
      </div>

      <Textarea
        value={log?.note ?? ""}
        onChange={(e) => patch({ note: e.target.value || null })}
        placeholder="Free note about today's confidence work"
        rows={2}
      />
    </div>
  );
}

function emptyLog(): ConfidenceLog {
  return {
    ladderLevel: null,
    initAttempts: null,
    usedBoundaryPhrase: null,
    boundaryPhraseText: null,
    stuporSituation: null,
    stuporThought: null,
    stuporReality: null,
    floodingUsedPause: null,
    note: null,
  };
}
