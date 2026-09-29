"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  createPedalTaskAction,
  linkProjectToGoalAction,
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

// Step 10: link projects to the goal and keep this week's atoms.
export function WeekPlanStep({ goalId, playbook }: StepProps) {
  const { run, isPending } = useServerAction();
  const [title, setTitle] = useState("");
  const linkedProjects = playbook.projects.filter((project) => project.isLinked);
  const [projectId, setProjectId] = useState(linkedProjects[0]?.id ?? "");
  const canAdd = !!title.trim() && !!projectId && !isPending;

  const handleAddAtom = () => {
    if (!canAdd) return;
    run(upsertTaskAction({ title: title.trim(), projectId, resistance: 2, status: "TODO" }), {
      successMessage: "Atom added",
      errorMessage: "Failed to add atom",
      onSuccess: () => setTitle(""),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-label">Projects serving this goal</span>
        <span className="text-caption">
          Projects of sprint objectives that serve this goal are linked automatically.
        </span>
        <div className="flex flex-wrap gap-1.5">
          {playbook.projects
            .filter(
              (project) => !["DONE", "CANCELLED"].includes(project.status) || project.isLinked,
            )
            .map((project) => {
              const chipClassName = `px-2.5 py-1 rounded-full border text-[11px] transition-colors duration-150 ${
                project.isLinked
                  ? "bg-accent-life/15 border-accent-life/40 text-accent-life"
                  : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"
              }`;
              return (
                <button
                  key={project.id}
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    run(linkProjectToGoalAction(goalId, project.id, !project.isLinked), {
                      errorMessage: "Failed to update project",
                    })
                  }
                  className={chipClassName}
                >
                  📂 {project.title}
                </button>
              );
            })}
          {playbook.projects.length === 0 && (
            <span className="text-caption">Create a project in the Planning Wizard first.</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label">This week ({playbook.weekAtoms.length})</span>
        {playbook.weekAtoms.length === 0 ? (
          <p className="text-caption">No open atoms yet. Add the first actions for this week.</p>
        ) : (
          playbook.weekAtoms.map((atom) => (
            <div key={atom.id} className="text-sm text-zinc-300 break-words">
              ○ {atom.title}
              <span className="text-[10px] font-mono text-zinc-500 ml-2">{atom.projectTitle}</span>
            </div>
          ))
        )}
      </div>

      {linkedProjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddAtom()}
            placeholder="A small action for this week…"
          />
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {linkedProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </Select>
          <Button variant="primary" size="sm" onClick={handleAddAtom} disabled={!canAdd}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ atom }: { atom: PlaybookAtom }) {
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

// Step 11: what has no clear time won't get done.
export function WeekScheduleStep({ playbook }: StepProps) {
  const unscheduledCount = playbook.weekAtoms.filter((atom) => !atom.hasPlannedTime).length;

  if (playbook.weekAtoms.length === 0) {
    return <p className="text-caption">Add this week&apos;s atoms in step 10 first.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <p
        className={`text-[11px] font-mono ${unscheduledCount > 0 ? "text-amber-400" : "text-emerald-400"}`}
      >
        {unscheduledCount > 0
          ? `${unscheduledCount} without a time. What has no time will not be done.`
          : "Every atom has a time slot."}
      </p>
      {playbook.weekAtoms.map((atom) => (
        <ScheduleRow key={atom.id} atom={atom} />
      ))}
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
