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

  return (
    <div >
      {}
      <div >
        <div >
          <div >
            <Target size={14} />
          </div>
          <h3 >
            Yesterday
          </h3>
        </div>
        {hasRecap && (
          <div >
            {yesterdayPlan && (
              <p>
                <span >Planned: </span>
                {yesterdayPlan}
              </p>
            )}
            {yesterdayCompletedTasks.length > 0 && (
              <ul >
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
        />
      </div>

      {}
      <div >
        <div >
          <div >
            <Zap size={14} />
          </div>
          <h3 >
            Today
          </h3>
        </div>
        <Textarea

          placeholder="What is my main focus?"
          value={plan ?? ""}
          onChange={(e) => onChange({ standupPlan: e.target.value || null })}
        />
      </div>

      {}
      <div >
        <div >
          <div >
            <ShieldAlert size={14} />
          </div>
          <h3 >
            Blockers
          </h3>
        </div>
        <Textarea

          placeholder="Any impediments?"
          value={blockers ?? ""}
          onChange={(e) => onChange({ standupBlockers: e.target.value || null })}
        />
      </div>
    </div>
  );
}
