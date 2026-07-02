"use client";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Yesterday */}
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Target size={14} />
          </div>
          <h3 className="text-caption font-mono font-bold uppercase tracking-widest text-text">
            Yesterday
          </h3>
        </div>
        {hasRecap && (
          <div className="bg-raised/50 border border-border/60 rounded-lg p-3 flex flex-col gap-1.5 text-xs text-muted">
            {yesterdayPlan && (
              <p>
                <span className="font-mono uppercase tracking-wider text-muted/70">Planned: </span>
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
        <textarea
          className="w-full bg-raised/50 border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-emerald-500/40 transition-colors"
          placeholder="What did I accomplish?"
          value={done ?? ""}
          onChange={(e) => onChange({ standupDone: e.target.value || null })}
        />
      </div>

      {/* Today */}
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
            <Zap size={14} />
          </div>
          <h3 className="text-caption font-mono font-bold uppercase tracking-widest text-text">
            Today
          </h3>
        </div>
        <textarea
          className="w-full bg-raised/50 border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-accent/40 transition-colors"
          placeholder="What is my main focus?"
          value={plan ?? ""}
          onChange={(e) => onChange({ standupPlan: e.target.value || null })}
        />
      </div>

      {/* Blockers */}
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
            <ShieldAlert size={14} />
          </div>
          <h3 className="text-caption font-mono font-bold uppercase tracking-widest text-text">
            Blockers
          </h3>
        </div>
        <textarea
          className="w-full bg-raised/50 border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-rose-500/40 transition-colors"
          placeholder="Any impediments?"
          value={blockers ?? ""}
          onChange={(e) => onChange({ standupBlockers: e.target.value || null })}
        />
      </div>
    </div>
  );
}
