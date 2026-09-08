"use client";

import { useMemo, useState } from "react";
import { addDays, isWithinInterval } from "date-fns";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { FormField } from "@/components/ui/display/form-field";
import { saveSprintReviewAction } from "@/features/life/actions/sprint-actions";
import type { TaskData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { Sparkles, Trophy, TriangleAlert, RefreshCw } from "lucide-react";

interface WeeklyReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId: string;
  weekNumber: number;
  weekStart: Date;
  review: {
    score: number | null;
    wins: string | null;
    challenges: string | null;
    adjustments: string | null;
  } | null;
  tasks: TaskData[];
}

export function WeeklyReviewDialog({
  isOpen,
  onClose,
  sprintId,
  weekNumber,
  weekStart,
  review,
  tasks,
}: WeeklyReviewDialogProps) {
  const { run, isPending } = useServerAction();
  const isEditing = !!review;

  const [score, setScore] = useState<number | null>(review?.score ?? null);
  const [wins, setWins] = useState(review?.wins ?? "");
  const [challenges, setChallenges] = useState(review?.challenges ?? "");
  const [adjustments, setAdjustments] = useState(review?.adjustments ?? "");

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const executionStats = useMemo(() => {
    const weekTasks = tasks.filter((task) => {
      return (
        task.plannedDate &&
        isWithinInterval(new Date(task.plannedDate), {
          start: weekStart,
          end: weekEnd,
        })
      );
    });

    const planned = weekTasks.filter((task) => task.status !== "CANCELLED");
    const done = weekTasks.filter((task) => task.status === "DONE");
    const percent = planned.length > 0 ? (done.length / planned.length) * 100 : 0;
    const suggested = planned.length > 0 ? Math.round(percent / 10) : null;

    return {
      plannedCount: planned.length,
      doneCount: done.length,
      executionPercent: Math.round(percent),
      suggestedScore: suggested,
    };
  }, [tasks, weekStart, weekEnd]);

  const handleSave = () => {
    if (score === null || score < 1 || score > 10) return;
    if (isPending) return;

    run(
      saveSprintReviewAction(sprintId, weekNumber, weekStart.toISOString(), {
        score,
        wins: wins.trim() || undefined,
        challenges: challenges.trim() || undefined,
        adjustments: adjustments.trim() || undefined,
      }),
      {
        successMessage: isEditing ? "Weekly review updated" : "Weekly review saved",
        errorMessage: "Failed to save review",
      },
    );
  };

  const handleClearScore = () => {
    setScore(executionStats.suggestedScore);
  };

  return (
    <Dialog
      key={`${weekNumber}-${isEditing}`}
      isOpen={isOpen}
      onClose={onClose}
      title={`W${weekNumber} Weekly Review`}
      description="Assess your execution, confront the truth, and set up the next week."
      maxWidth="560px"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isPending || score === null || score < 1 || score > 10}
          >
            {isPending ? "Saving..." : isEditing ? "Update Review" : "Save Review"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Auto execution stats from weekly atoms */}
        <div className="p-3 rounded-xl border border-white/[0.06] bg-black/10 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
              Weekly Execution
            </span>
            <span className="text-xs text-zinc-300">
              {executionStats.doneCount}/{executionStats.plannedCount} atoms done (
              {executionStats.executionPercent}%)
            </span>
          </div>
          {executionStats.suggestedScore !== null && (
            <button
              type="button"
              onClick={handleClearScore}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/5 transition-colors"
              title="Use suggested execution score"
            >
              <Sparkles size={12} />
              Suggested {executionStats.suggestedScore}/10
            </button>
          )}
        </div>

        <FormField label="Execution Score (1-10)" required>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setScore(value)}
                className={`w-9 h-9 rounded-lg border text-sm font-mono font-bold transition-all duration-150 ${
                  score === value
                    ? "border-accent bg-accent text-white"
                    : "border-white/[0.06] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Weekly Wins" hint="What went well this week?">
          <div className="relative">
            <Trophy size={13} className="absolute left-3 top-3 text-zinc-500" />
            <Textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              placeholder="Highlight the wins, no matter how small…"
              rows={2}
              className="pl-8"
            />
          </div>
        </FormField>

        <FormField label="Challenges" hint="Confront the truth — where did execution break down?">
          <div className="relative">
            <TriangleAlert size={13} className="absolute left-3 top-3 text-zinc-500" />
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Level of resistance, blockers, what fell off…"
              rows={3}
              className="pl-8"
            />
          </div>
        </FormField>

        <FormField label="Adjustments (Kaizen)" hint="What changes next week?">
          <div className="relative">
            <RefreshCw size={13} className="absolute left-3 top-3 text-zinc-500" />
            <Textarea
              value={adjustments}
              onChange={(e) => setAdjustments(e.target.value)}
              placeholder="One small improvement to install next week…"
              rows={2}
              className="pl-8"
            />
          </div>
        </FormField>
      </div>
    </Dialog>
  );
}
