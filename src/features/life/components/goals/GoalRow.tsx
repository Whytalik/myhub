"use client";

import { useState } from "react";
import Link from "next/link";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import {
  setSphereGoalValueAction,
  deleteSphereGoalAction,
} from "@/features/life/actions/sphere-goal-actions";
import {
  GOAL_PACE_LABELS,
  GOAL_PACE_TEXT_CLASS,
  GOAL_TYPE_LABELS,
  formatGoalNumber,
  formatGoalProgress,
  getGoalPace,
} from "@/features/life/logic/sphere-goals";
import type { SphereGoalData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { GoalProgressBar } from "./GoalProgressBar";

interface GoalRowProps {
  goal: SphereGoalData;
  onEdit: (goal: SphereGoalData) => void;
  isLever?: boolean;
}

export function GoalRow({ goal, onEdit, isLever = false }: GoalRowProps) {
  const { run, isPending } = useServerAction();
  const [draftValue, setDraftValue] = useState(formatGoalNumber(goal.currentValue));

  const pace = getGoalPace(goal);
  const paceClassName = `text-[10px] font-mono uppercase ${GOAL_PACE_TEXT_CLASS[pace]}`;
  const canIncrement = !goal.isAutoTracked && goal.type !== "VALUE";
  const parsedDraft = Number(draftValue);
  const isDraftChanged =
    draftValue.trim() !== "" && Number.isFinite(parsedDraft) && parsedDraft !== goal.currentValue;

  const saveValue = (value: number) => {
    if (isPending) return;
    run(setSphereGoalValueAction(goal.id, value), { errorMessage: "Failed to update goal" });
  };

  const handleIncrement = () => {
    const next = goal.currentValue + 1;
    setDraftValue(formatGoalNumber(next));
    saveValue(next);
  };

  const handleDelete = () => {
    run(deleteSphereGoalAction(goal.id), {
      successMessage: "Goal deleted",
      errorMessage: "Failed to delete goal",
    });
  };

  return (
    <div className="flex flex-col gap-1.5 py-2.5 border-b border-white/[0.04] last:border-b-0 group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col">
          <span className="text-sm text-zinc-200 break-words">
            {isLever && <span className="text-label text-accent-life mr-2">Lever</span>}
            {goal.title}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">
            {GOAL_TYPE_LABELS[goal.type]}
            {goal.habitName ? ` · ${goal.habitName}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-mono text-zinc-300 mr-1">{formatGoalProgress(goal)}</span>
          <Link
            href={`/life/planning/playbook?goal=${goal.id}`}
            title="12-step playbook"
            className="p-1.5 rounded-md text-zinc-500 hover:text-accent-life hover:bg-white/5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-colors"
          >
            <ListChecks size={12} />
          </Link>
          <Button
            variant="ghost-accent"
            size="icon-sm"
            onClick={() => onEdit(goal)}
            title="Edit goal"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Pencil size={12} />
          </Button>
          <Button
            variant="ghost-danger"
            size="icon-sm"
            onClick={handleDelete}
            disabled={isPending}
            title="Delete goal"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      <GoalProgressBar goal={goal} />

      <div className="flex items-center justify-between gap-3 min-h-7">
        <span className={paceClassName}>{GOAL_PACE_LABELS[pace]}</span>
        {goal.isAutoTracked ? (
          <span className="text-[10px] font-mono text-zinc-500">Auto · from habit</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isDraftChanged) saveValue(parsedDraft);
              }}
              className="h-7 w-20 text-xs"
              aria-label="Current value"
            />
            {isDraftChanged && (
              <Button variant="outline" size="sm" onClick={() => saveValue(parsedDraft)}>
                Save
              </Button>
            )}
            {canIncrement && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleIncrement}
                disabled={isPending}
                title="+1"
              >
                <Plus size={12} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
