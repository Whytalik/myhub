"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { PlaybookStep } from "@/features/life/components/playbook/PlaybookStep";
import { saveWeeklyReviewAction } from "@/features/life/actions/weekly-review-actions";
import type { LifeSphereData, MissedReason, WeeklyReviewData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { ClearStage, FocusStage, PlanStage, ReflectStage, ScoreboardStage } from "./ReviewStages";

const TARGET_MINUTES = 35;

interface WeeklyReviewClientProps {
  data: WeeklyReviewData;
  spheres: LifeSphereData[];
}

export function WeeklyReviewClient({ data, spheres }: WeeklyReviewClientProps) {
  const router = useRouter();
  const { run, isPending } = useServerAction();
  const saved = data.review;

  const [wins, setWins] = useState(saved?.wins ?? "");
  const [challenges, setChallenges] = useState(saved?.challenges ?? "");
  const [adjustments, setAdjustments] = useState(saved?.adjustments ?? "");
  const [missedReasons, setMissedReasons] = useState<Record<string, MissedReason>>(
    saved?.extras.missedReasons ?? {},
  );
  const [priorities, setPriorities] = useState<string[]>(saved?.extras.priorities ?? []);
  const suggestedScore =
    data.execution.percent === null ? null : Math.max(1, Math.round(data.execution.percent / 10));
  const [score, setScore] = useState<number | null>(saved?.score ?? suggestedScore);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsedSeconds((previous) => previous + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(elapsedSeconds / 60);
  const timerLabel = `${String(minutes).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const timerClassName = `text-xs font-mono ${minutes >= TARGET_MINUTES ? "text-amber-400" : "text-zinc-400"}`;
  const weekLabel = `${format(new Date(data.weekStart), "MMM d")} – ${format(new Date(data.weekEnd), "MMM d")}`;
  const canSave = score !== null && !isPending;

  const handleSave = () => {
    if (score === null) return;
    run(
      saveWeeklyReviewAction({
        weekStart: data.weekStart,
        score,
        wins,
        challenges,
        adjustments,
        extras: { executionPercent: data.execution.percent, missedReasons, priorities },
      }),
      {
        successMessage: "Weekly review saved",
        errorMessage: "Failed to save the review",
        onSuccess: () => router.refresh(),
      },
    );
  };

  const stageProps = { data, spheres };
  const stages = [
    {
      title: "Scoreboard",
      hint: "How the week really went, from your data.",
      isDone: data.execution.planned > 0,
      content: <ScoreboardStage {...stageProps} />,
    },
    {
      title: "Get clear",
      hint: "Empty the inbox, decide what to do with everything overdue.",
      isDone: data.inboxCount === 0 && data.overdue.length === 0,
      content: <ClearStage {...stageProps} />,
    },
    {
      title: "Reflect",
      hint: "What worked, why things slipped, one change.",
      isDone: wins.trim() !== "" && adjustments.trim() !== "",
      content: (
        <ReflectStage
          {...stageProps}
          wins={wins}
          setWins={setWins}
          challenges={challenges}
          setChallenges={setChallenges}
          adjustments={adjustments}
          setAdjustments={setAdjustments}
          missedReasons={missedReasons}
          setMissedReasons={setMissedReasons}
        />
      ),
    },
    {
      title: "Focus check",
      hint: "Is the week moving your lever? Keep the numbers honest.",
      isDone: data.execution.focusSphereId !== null && data.execution.focusPlanned > 0,
      content: <FocusStage {...stageProps} />,
    },
    {
      title: "Plan next week",
      hint: "Three priorities, and a time for every atom.",
      isDone: priorities.filter((item) => item.trim()).length > 0,
      content: <PlanStage {...stageProps} priorities={priorities} setPriorities={setPriorities} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-panel-title">
            Sprint {data.sprint.number} · W{data.weekNumber}
          </span>
          <span className="text-caption">{weekLabel}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Timer size={14} className="text-zinc-500" />
          <span className={timerClassName}>
            {timerLabel} / {TARGET_MINUTES}:00
          </span>
        </div>
      </div>

      {saved?.score != null && (
        <p className="text-[11px] font-mono text-emerald-400">
          Review saved for this week (score {saved.score}/10). You can still edit and save again.
        </p>
      )}

      {stages.map((stage, index) => (
        <PlaybookStep
          key={stage.title}
          number={index + 1}
          title={stage.title}
          hint={stage.hint}
          isDone={stage.isDone}
          defaultOpen={index === 0}
        >
          {stage.content}
        </PlaybookStep>
      ))}

      <PlaybookStep
        number={stages.length + 1}
        title="Close the week"
        hint="Rate the execution, then commit."
        isDone={saved?.score != null}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => {
              const scoreClassName = `w-9 h-9 rounded-lg border text-sm font-mono font-bold transition-all duration-150 ${
                score === value
                  ? "border-accent bg-accent text-white"
                  : "border-white/[0.06] text-zinc-400 hover:border-white/15 hover:text-zinc-200"
              }`;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  className={scoreClassName}
                >
                  {value}
                </button>
              );
            })}
          </div>
          {suggestedScore !== null && (
            <span className="text-caption">
              Suggested from execution: {suggestedScore}/10. Adjust it if the number lies.
            </span>
          )}
          <Button variant="primary" onClick={handleSave} disabled={!canSave} className="self-start">
            {isPending ? "Saving..." : saved?.score != null ? "Update review" : "Finish the review"}
          </Button>
        </div>
      </PlaybookStep>
    </div>
  );
}
