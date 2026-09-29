"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import {
  deleteGoalPhaseAction,
  toggleGoalPhaseDoneAction,
  upsertGoalPhaseAction,
} from "@/features/life/actions/goal-playbook-actions";
import type { GoalPhaseData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface PhaseTimelineProps {
  goalId: string;
  phases: GoalPhaseData[];
  currentPhaseId: string | null;
}

interface PhaseDraft {
  id?: string;
  title: string;
  startMonth: number;
  endMonth: number;
  outcome: string;
}

const EMPTY_DRAFT: PhaseDraft = { title: "", startMonth: 1, endMonth: 2, outcome: "" };

function MonthSelect({ value, onChange }: { value: number; onChange: (month: number) => void }) {
  return (
    <Select value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
      {MONTH_LABELS.map((label, index) => (
        <option key={label} value={index + 1}>
          {label}
        </option>
      ))}
    </Select>
  );
}

export function PhaseTimeline({ goalId, phases, currentPhaseId }: PhaseTimelineProps) {
  const { run, isPending } = useServerAction();
  const [draft, setDraft] = useState<PhaseDraft | null>(null);
  const currentMonth = new Date().getMonth() + 1;

  const canSave = !!draft && !!draft.title.trim() && draft.startMonth <= draft.endMonth;

  const handleSave = () => {
    if (!draft || !canSave) return;
    run(
      upsertGoalPhaseAction(goalId, {
        id: draft.id,
        title: draft.title,
        startMonth: draft.startMonth,
        endMonth: draft.endMonth,
        outcome: draft.outcome,
      }),
      { errorMessage: "Failed to save phase", onSuccess: () => setDraft(null) },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-12 gap-px">
        {MONTH_LABELS.map((label, index) => {
          const month = index + 1;
          const phase = phases.find((item) => item.startMonth <= month && month <= item.endMonth);
          const cellClassName = `flex flex-col items-center gap-0.5 py-1.5 rounded text-[9px] font-mono ${
            phase?.done
              ? "bg-emerald-500/15 text-emerald-400"
              : phase
                ? "bg-accent-life/15 text-accent-life"
                : "bg-white/[0.03] text-zinc-600"
          } ${month === currentMonth ? "ring-1 ring-white/40" : ""}`;
          return (
            <div key={label} className={cellClassName} title={phase?.title}>
              {label}
            </div>
          );
        })}
      </div>

      {phases.map((phase) => {
        const isCurrent = phase.id === currentPhaseId;
        return (
          <div
            key={phase.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-black/10"
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-zinc-200 break-words">
                {phase.title}
                {isCurrent && <span className="text-label text-accent-life ml-2">Now</span>}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {MONTH_LABELS[phase.startMonth - 1]}
                {phase.endMonth !== phase.startMonth ? `–${MONTH_LABELS[phase.endMonth - 1]}` : ""}
              </span>
              {phase.outcome && <span className="text-caption mt-1">{phase.outcome}</span>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => run(toggleGoalPhaseDoneAction(phase.id), { errorMessage: "Failed" })}
                disabled={isPending}
                title={phase.done ? "Mark as not done" : "Mark as done"}
                className={phase.done ? "text-emerald-400" : ""}
              >
                <Check size={13} />
              </Button>
              <Button
                variant="ghost-accent"
                size="icon-sm"
                onClick={() =>
                  setDraft({
                    id: phase.id,
                    title: phase.title,
                    startMonth: phase.startMonth,
                    endMonth: phase.endMonth,
                    outcome: phase.outcome ?? "",
                  })
                }
                title="Edit"
              >
                <Pencil size={13} />
              </Button>
              <Button
                variant="ghost-danger"
                size="icon-sm"
                onClick={() =>
                  run(deleteGoalPhaseAction(phase.id), { errorMessage: "Failed to delete phase" })
                }
                disabled={isPending}
                title="Delete"
              >
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        );
      })}

      {draft ? (
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-accent-life/30 bg-black/10">
          <Input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Phase, e.g. Backtest 100 trades"
          />
          <div className="grid grid-cols-2 gap-2">
            <MonthSelect
              value={draft.startMonth}
              onChange={(month) => setDraft({ ...draft, startMonth: month })}
            />
            <MonthSelect
              value={draft.endMonth}
              onChange={(month) => setDraft({ ...draft, endMonth: month })}
            />
          </div>
          <Input
            value={draft.outcome}
            onChange={(e) => setDraft({ ...draft, outcome: e.target.value })}
            placeholder="What must be done by the end of this phase?"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDraft(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!canSave || isPending}
            >
              {isPending ? "Saving..." : "Save phase"}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setDraft({ ...EMPTY_DRAFT, startMonth: currentMonth, endMonth: currentMonth })
          }
          className="self-start"
        >
          <Plus size={14} /> Add phase
        </Button>
      )}
    </div>
  );
}
