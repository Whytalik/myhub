"use client";

import Link from "next/link";
import { Crosshair } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { updateTaskStatusAction } from "@/features/life/actions/task-actions";
import { announceIdentityVote } from "./identity-vote";
import { formatGoalProgress } from "@/features/life/logic/sphere-goals";
import type { FocusSummary } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { GoalProgressBar } from "./GoalProgressBar";

export function FocusJournalCard({ summary }: { summary: FocusSummary }) {
  const { run, isPending } = useServerAction();
  const { sphere, leverGoal, pedalTask, identity, votes, minimumAction } = summary;
  // No vote yesterday or so far today: fall back to the minimum, never miss twice.
  const isAtRisk = !!votes && votes.yesterday === 0 && votes.today === 0;
  const leverHref = leverGoal
    ? `/life/planning/playbook?goal=${leverGoal.id}`
    : "/life/planning/goals";

  return (
    <div className="glass-card p-3 flex flex-col gap-2 border-accent-life/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Crosshair size={14} className="text-accent-life shrink-0" />
          <span className="text-label">Focus of the year</span>
          <span className="text-sm font-semibold text-zinc-100 truncate">{sphere.name}</span>
        </div>
        <Link href={leverHref} className="text-[11px] text-accent-life hover:underline shrink-0">
          {leverGoal ? "Playbook →" : "Choose a lever →"}
        </Link>
      </div>

      {identity && (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-zinc-100 whitespace-pre-wrap">“{identity}”</p>
          {votes && (
            <span className="text-[11px] font-mono text-zinc-400">
              {votes.total} votes for this identity · {votes.week} this week · {votes.today} today
            </span>
          )}
        </div>
      )}

      {isAtRisk && (
        <p className="text-xs text-amber-400">
          No vote since the day before yesterday. Cast one now
          {minimumAction ? `: ${minimumAction}` : " with the smallest version"}. Never miss twice.
        </p>
      )}

      {leverGoal && (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs text-zinc-200 break-words">{leverGoal.title}</span>
            <span className="text-[11px] font-mono text-zinc-400 shrink-0">
              {formatGoalProgress(leverGoal)}
            </span>
          </div>
          <GoalProgressBar goal={leverGoal} />
        </div>
      )}

      {pedalTask && pedalTask.status !== "DONE" && (
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.06]">
          <span className="text-xs text-zinc-300 break-words">🐸 {pedalTask.title}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() =>
              run(updateTaskStatusAction(pedalTask.id, "DONE"), {
                successMessage: "Pedal pressed",
                errorMessage: "Failed to update task",
                onSuccess: () => void announceIdentityVote({ taskId: pedalTask.id }),
              })
            }
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
