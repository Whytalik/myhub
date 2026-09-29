"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  createPedalTaskAction,
  savePlaybookAction,
} from "@/features/life/actions/goal-playbook-actions";
import { updateTaskStatusAction, upsertTaskAction } from "@/features/life/actions/task-actions";
import type { GoalPlaybookData, PlaybookAtom } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface StepProps {
  goalId: string;
  playbook: GoalPlaybookData;
}

// Step 9: what has to be closed this month.
export function MonthPlanStep({ playbook }: StepProps) {
  const currentPhase = playbook.phases.find((phase) => phase.id === playbook.currentPhaseId);
  const { done, total } = playbook.monthAtoms;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  if (!currentPhase) {
    return (
      <p className="text-caption">
        No phase covers the current month. Add one in step 8 and its outcome shows up here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-zinc-100">{currentPhase.title}</span>
      <span className="text-caption">
        {currentPhase.outcome || "Add an outcome to this phase in step 8."}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full rounded-full bg-accent-life" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {done}/{total} atoms this month
        </span>
      </div>
    </div>
  );
}

// Step 10: the week's atoms are planned in the Planning Wizard; this is a read-only view.
export function WeekPlanStep({ playbook }: StepProps) {
  const linkedProjects = playbook.projects.filter((project) => project.isLinked);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-200">
        {playbook.weekAtoms.length} open atom{playbook.weekAtoms.length === 1 ? "" : "s"} this week
        in {linkedProjects.length} project{linkedProjects.length === 1 ? "" : "s"} serving this
        goal.
      </p>
      <p className="text-caption">
        Projects join a goal through the sprint objective that serves it. Plan the week&apos;s atoms
        in the{" "}
        <Link href="/life/planning/wizard" className="text-accent-life hover:underline">
          Planning Wizard
        </Link>
        .
      </p>
    </div>
  );
}

export type ScheduleAtom = Pick<
  PlaybookAtom,
  "id" | "title" | "plannedDate" | "hasPlannedTime" | "plannedEndDate"
>;

export function ScheduleRow({ atom }: { atom: ScheduleAtom }) {
  const { run, isPending } = useServerAction();
  const plannedStart = atom.plannedDate ? new Date(atom.plannedDate) : null;
  const plannedEnd = atom.plannedEndDate ? new Date(atom.plannedEndDate) : null;

  const [date, setDate] = useState(plannedStart ? format(plannedStart, "yyyy-MM-dd") : "");
  const [start, setStart] = useState(
    atom.hasPlannedTime && plannedStart ? format(plannedStart, "HH:mm") : "",
  );
  const [end, setEnd] = useState(
    plannedEnd && atom.hasPlannedTime ? format(plannedEnd, "HH:mm") : "",
  );

  const canSave = !!date && !!start && !!end && start < end && !isPending;
  const isScheduled = atom.hasPlannedTime;
  const statusClassName = `text-[10px] font-mono ${isScheduled ? "text-emerald-400" : "text-amber-400"}`;

  const handleSave = () => {
    if (!canSave) return;
    run(
      upsertTaskAction({
        id: atom.id,
        plannedDate: new Date(`${date}T${start}`).toISOString(),
        hasPlannedTime: true,
        plannedEndDate: new Date(`${date}T${end}`).toISOString(),
        hasPlannedEndTime: true,
      }),
      { successMessage: "Scheduled", errorMessage: "Failed to schedule" },
    );
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/[0.06] bg-black/10">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-zinc-200 break-words">{atom.title}</span>
        <span className={statusClassName}>{isScheduled ? "Scheduled" : "No time yet"}</span>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        <Button variant="outline" size="sm" onClick={handleSave} disabled={!canSave}>
          Set
        </Button>
      </div>
    </div>
  );
}

// Step 11: scheduling happens in the Weekly Review; this is a read-only view.
export function WeekScheduleStep({ playbook }: StepProps) {
  const unscheduledCount = playbook.weekAtoms.filter((atom) => !atom.hasPlannedTime).length;
  const summaryClassName = `text-sm ${unscheduledCount > 0 ? "text-amber-400" : "text-emerald-400"}`;

  if (playbook.weekAtoms.length === 0) {
    return <p className="text-caption">No atoms to schedule yet. Add them in step 10.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className={summaryClassName}>
        {unscheduledCount > 0
          ? `${unscheduledCount} without a time. What has no time will not be done.`
          : "Every atom has a time slot."}
      </p>
      <p className="text-caption">
        Give atoms a day and time in the{" "}
        <Link href="/life/planning/review" className="text-accent-life hover:underline">
          Weekly Review
        </Link>{" "}
        (stage &quot;Plan next week&quot;).
      </p>
    </div>
  );
}

// Step 12: the single 5-minute action to start right now.
export function PedalStep({ goalId, playbook }: StepProps) {
  const { run, isPending } = useServerAction();
  const [draft, setDraft] = useState(playbook.pedalAction);
  const isDirty = draft.trim() !== playbook.pedalAction;
  const pedalTask = playbook.pedalTask;

  const handleSave = () => {
    run(savePlaybookAction(goalId, { pedalAction: draft }), { errorMessage: "Failed to save" });
  };

  const handleStart = () => {
    run(createPedalTaskAction(goalId), {
      errorMessage: "Failed to create the task",
      onSuccess: (result) =>
        toast.success(
          result.isFrog
            ? "Added to today as your frog 🐸"
            : "Added to today. Your current frog stays the frog.",
        ),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="One action that takes 5 minutes: pay for the course, register on the platform, message the mentor…"
        rows={2}
      />
      <div className="flex flex-wrap gap-2 items-center">
        {isDirty && (
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isPending}>
            Save
          </Button>
        )}
        {!pedalTask && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            disabled={isPending || isDirty || !draft.trim()}
          >
            Do it now
          </Button>
        )}
        {pedalTask && (
          <>
            <span className="text-sm text-zinc-300">
              {pedalTask.status === "DONE" ? "✅" : "🐸"} {pedalTask.title}
            </span>
            {pedalTask.status !== "DONE" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  run(updateTaskStatusAction(pedalTask.id, "DONE"), {
                    successMessage: "Pedal pressed. Momentum started.",
                    errorMessage: "Failed to update task",
                  })
                }
                disabled={isPending}
              >
                Mark done
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
