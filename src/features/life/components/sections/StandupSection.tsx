"use client";
import { Textarea } from "@/components/ui/inputs/textarea";

import { Target, ShieldAlert, Zap } from "lucide-react";

interface Props {
  done: string | null;
  plan: string | null;
  blockers: string | null;
  yesterdayPlan: string | null;
  yesterdayCompletedTasks: string[];
  onChange: (data: {
    standupDone?: string | null;
    standupPlan?: string | null;
    standupBlockers?: string | null;
  }) => void;
}

export function StandupSection({
  done,
  plan,
  blockers,
  yesterdayPlan,
  yesterdayCompletedTasks,
  onChange,
}: Props) {
  const hasRecap = Boolean(yesterdayPlan) || yesterdayCompletedTasks.length > 0;
  const sectionIconClass =
    "flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent";

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className={sectionIconClass}>
            <Target size={14} />
          </div>
          <h3 className="text-panel-title">Yesterday</h3>
        </div>
        {hasRecap && (
          <div className="text-caption flex flex-col gap-1 bg-white/[0.02] rounded-lg p-2.5">
            {yesterdayPlan && (
              <p>
                <span className="text-zinc-400 font-medium">Planned: </span>
                {yesterdayPlan}
              </p>
            )}
            {yesterdayCompletedTasks.length > 0 && (
              <ul className="list-disc list-inside">
                {yesterdayCompletedTasks.map((title) => (
                  <li key={title}>{title}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <Textarea
          placeholder="What did I accomplish?"
          value={done ?? ""}
          onChange={(e) => onChange({ standupDone: e.target.value || null })}
          rows={2}
        />
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className={sectionIconClass}>
            <Zap size={14} />
          </div>
          <h3 className="text-panel-title">Today</h3>
        </div>
        <Textarea
          placeholder="What is my main focus?"
          value={plan ?? ""}
          onChange={(e) => onChange({ standupPlan: e.target.value || null })}
          rows={2}
        />
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className={sectionIconClass}>
            <ShieldAlert size={14} />
          </div>
          <h3 className="text-panel-title">Blockers</h3>
        </div>
        <Textarea
          placeholder="Any impediments?"
          value={blockers ?? ""}
          onChange={(e) => onChange({ standupBlockers: e.target.value || null })}
          rows={2}
        />
      </div>
    </div>
  );
}
