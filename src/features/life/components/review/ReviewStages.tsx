"use client";

import { useState } from "react";
import Link from "next/link";
import { addDays, format } from "date-fns";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { setSphereGoalValueAction } from "@/features/life/actions/sphere-goal-actions";
import { updateTaskStatusAction, upsertTaskAction } from "@/features/life/actions/task-actions";
import { GoalProgressBar } from "@/features/life/components/goals/GoalProgressBar";
import { ScheduleRow } from "@/features/life/components/playbook/ExecutionSteps";
import { formatGoalNumber, formatGoalProgress } from "@/features/life/logic/sphere-goals";
import {
  WEEKLY_EXECUTION_TARGET,
  type LifeSphereData,
  type MissedReason,
  type SphereGoalData,
  type WeeklyReviewAtom,
  type WeeklyReviewData,
} from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

const DAILY_ATOM_SOFT_CAP = 10;

const MISSED_REASON_OPTIONS: { reason: MissedReason; label: string }[] = [
  { reason: "NO_TIME", label: "No time" },
  { reason: "RESISTANCE", label: "Resistance" },
  { reason: "UNCLEAR", label: "Unclear" },
  { reason: "BLOCKED", label: "Blocked" },
  { reason: "NOT_IMPORTANT", label: "Not important" },
];

const chipClassName = (isActive: boolean) =>
  `px-2 py-1 rounded-lg border text-[11px] font-mono transition-colors duration-150 ${
    isActive
      ? "bg-accent-life/15 border-accent-life/40 text-accent-life"
      : "bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:bg-white/[0.05]"
  }`;

interface StageProps {
  data: WeeklyReviewData;
  spheres: LifeSphereData[];
}

// 1. Scoreboard: how the week actually went, computed from real data.
export function ScoreboardStage({ data, spheres }: StageProps) {
  const { execution, journal } = data;
  const sphereName = (sphereId: string | null) =>
    spheres.find((sphere) => sphere.id === sphereId)?.name ?? "No sphere";
  const percent = execution.percent;
  const percentClassName = `text-3xl font-mono font-bold ${
    percent === null
      ? "text-zinc-500"
      : percent >= WEEKLY_EXECUTION_TARGET
        ? "text-emerald-400"
        : percent >= 60
          ? "text-amber-400"
          : "text-rose-400"
  }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <span className={percentClassName}>{percent === null ? "—" : `${percent}%`}</span>
        <div className="flex flex-col pb-1">
          <span className="text-sm text-zinc-200">
            {execution.done}/{execution.planned} planned atoms done
          </span>
          <span className="text-caption">Target {WEEKLY_EXECUTION_TARGET}%</span>
        </div>
      </div>

      {execution.bySphere.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-label">By sphere</span>
          {execution.bySphere.map((row) => (
            <div key={row.sphereId ?? "none"} className="flex items-center gap-3 text-sm">
              <span className="text-zinc-300 w-40 truncate">{sphereName(row.sphereId)}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent-life"
                  style={{ width: `${row.planned ? (row.done / row.planned) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 w-12 text-right">
                {row.done}/{row.planned}
              </span>
            </div>
          ))}
        </div>
      )}

      {data.leverGoal && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/[0.06] bg-black/10">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-zinc-100">
              <span className="text-label mr-2">Lever</span>
              {data.leverGoal.title}
            </span>
            <span className="text-xs font-mono text-zinc-300">
              {formatGoalProgress(data.leverGoal)}
            </span>
          </div>
          <GoalProgressBar goal={data.leverGoal} />
          {execution.focusSphereId && (
            <span className="text-caption">
              Focus sphere this week: {execution.focusDone}/{execution.focusPlanned} atoms done.
            </span>
          )}
        </div>
      )}

      {data.pedalTask && (
        <p className="text-caption">
          Pedal: {data.pedalTask.status === "DONE" ? "✅" : "⏳"} {data.pedalTask.title}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Energy", value: journal.avgEnergy, suffix: "/10" },
          { label: "Mood", value: journal.avgMood, suffix: "/10" },
          { label: "Sleep", value: journal.avgSleepHours, suffix: " h" },
          { label: "Journal days", value: journal.entryCount, suffix: "/7" },
        ].map((stat) => (
          <div key={stat.label} className="p-2.5 rounded-xl border border-white/[0.06] bg-black/10">
            <span className="text-label block">{stat.label}</span>
            <span className="text-sm font-mono text-zinc-200">
              {stat.value === null ? "—" : `${formatGoalNumber(stat.value)}${stat.suffix}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriageRow({ atom, nextWeekStart }: { atom: WeeklyReviewAtom; nextWeekStart: string }) {
  const { run, isPending } = useServerAction();
  const [isResolved, setIsResolved] = useState(false);
  if (isResolved) return null;

  const resolve = (action: Promise<{ success: boolean; error?: string }>, message: string) =>
    run(action, {
      successMessage: message,
      errorMessage: "Failed",
      onSuccess: () => setIsResolved(true),
    });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-xl border border-white/[0.06] bg-black/10">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-zinc-200 break-words">{atom.title}</span>
        <span className="text-[10px] font-mono text-zinc-500 block">
          {atom.projectTitle ?? ""}
          {atom.plannedDate ? ` · was ${format(new Date(atom.plannedDate), "MMM d")}` : ""}
        </span>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() =>
            resolve(
              upsertTaskAction({ id: atom.id, plannedDate: nextWeekStart, hasPlannedTime: false }),
              "Moved to next week",
            )
          }
        >
          Next week
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() =>
            resolve(
              upsertTaskAction({ id: atom.id, plannedDate: null, status: "BACKLOG" }),
              "Back to the backlog",
            )
          }
        >
          Backlog
        </Button>
        <Button
          variant="ghost-danger"
          size="sm"
          disabled={isPending}
          onClick={() => resolve(updateTaskStatusAction(atom.id, "CANCELLED"), "Dropped")}
        >
          Drop
        </Button>
      </div>
    </div>
  );
}

// 2. Get Clear: empty the inbox and decide what to do with everything overdue.
export function ClearStage({ data }: StageProps) {
  const nextWeekStart = data.nextWeekStart;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.06] bg-black/10">
        <span className="text-sm text-zinc-200">
          {data.inboxCount === 0
            ? "Inbox is empty. Nice."
            : `${data.inboxCount} thought${data.inboxCount === 1 ? "" : "s"} waiting in the inbox`}
        </span>
        {data.inboxCount > 0 && (
          <Link href="/life/planning/wizard" className="text-xs text-accent-life hover:underline">
            Process in the Planning Wizard →
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label">Overdue atoms ({data.overdue.length})</span>
        {data.overdue.length === 0 ? (
          <p className="text-caption">Nothing left over from before this week.</p>
        ) : (
          data.overdue.map((atom) => (
            <TriageRow key={atom.id} atom={atom} nextWeekStart={nextWeekStart} />
          ))
        )}
      </div>
    </div>
  );
}

interface ReflectStageProps extends StageProps {
  wins: string;
  setWins: (value: string) => void;
  challenges: string;
  setChallenges: (value: string) => void;
  adjustments: string;
  setAdjustments: (value: string) => void;
  missedReasons: Record<string, MissedReason>;
  setMissedReasons: (value: Record<string, MissedReason>) => void;
}

// 3. Reflect: articulate what worked, why things slipped and the one change.
export function ReflectStage({
  data,
  wins,
  setWins,
  challenges,
  setChallenges,
  adjustments,
  setAdjustments,
  missedReasons,
  setMissedReasons,
}: ReflectStageProps) {
  const notes = data.journal.entries.filter(
    (entry) => entry.winToday || entry.frictionToday || entry.improveTomorrow || entry.gratitude,
  );

  return (
    <div className="flex flex-col gap-4">
      {notes.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto p-3 rounded-xl border border-white/[0.06] bg-black/10">
          <span className="text-label">From your journal</span>
          {notes.map((entry) => (
            <p key={entry.date} className="text-caption">
              <span className="font-mono text-zinc-500 mr-2">
                {format(new Date(entry.date), "EEE")}
              </span>
              {[
                entry.winToday && `✅ ${entry.winToday}`,
                entry.frictionToday && `⚠️ ${entry.frictionToday}`,
                entry.improveTomorrow && `🔧 ${entry.improveTomorrow}`,
              ]
                .filter(Boolean)
                .join("  ")}
            </p>
          ))}
        </div>
      )}

      {data.identity && (
        <p className="text-sm text-zinc-200 p-3 rounded-xl border border-accent-life/30 bg-black/10">
          “{data.identity.statement}”
          <span className="block text-caption mt-1">
            {data.identity.votesWeek} votes this week, {data.identity.votesTotal} in total. Did you
            act like this person? Where did you not?
          </span>
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-label">What worked</span>
        <Textarea
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          rows={2}
          placeholder="Wins, however small…"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label">What did not happen, and why</span>
        {data.missed.length === 0 && (
          <p className="text-caption">Every planned atom was finished.</p>
        )}
        {data.missed.map((atom) => (
          <div key={atom.id} className="flex flex-col gap-1.5">
            <span className="text-sm text-zinc-300 break-words">○ {atom.title}</span>
            <div className="flex flex-wrap gap-1.5">
              {MISSED_REASON_OPTIONS.map((option) => (
                <button
                  key={option.reason}
                  type="button"
                  onClick={() => setMissedReasons({ ...missedReasons, [atom.id]: option.reason })}
                  className={chipClassName(missedReasons[atom.id] === option.reason)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <Textarea
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          rows={3}
          placeholder="The honest pattern behind it: what broke down and why?"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label">One change for next week (Kaizen)</span>
        <Textarea
          value={adjustments}
          onChange={(e) => setAdjustments(e.target.value)}
          rows={2}
          placeholder="One small improvement to install."
        />
      </div>
    </div>
  );
}

function GoalValueRow({ goal }: { goal: SphereGoalData }) {
  const { run, isPending } = useServerAction();
  const [draft, setDraft] = useState(formatGoalNumber(goal.currentValue));
  const parsed = Number(draft);
  const isChanged = draft.trim() !== "" && Number.isFinite(parsed) && parsed !== goal.currentValue;

  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-sm text-zinc-200 break-words">{goal.title}</span>
      <span className="text-[11px] font-mono text-zinc-500 shrink-0">
        {formatGoalNumber(goal.targetValue)}
        {goal.unit ? ` ${goal.unit}` : ""}
      </span>
      <Input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="h-8 w-24 text-xs"
        aria-label={`Current value of ${goal.title}`}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={!isChanged || isPending}
        onClick={() =>
          run(setSphereGoalValueAction(goal.id, parsed), {
            successMessage: "Updated",
            errorMessage: "Failed to update",
          })
        }
      >
        Save
      </Button>
    </div>
  );
}

// 4. Focus check: keep the numbers of manually tracked goals honest.
export function FocusStage({ data }: StageProps) {
  const { execution } = data;
  return (
    <div className="flex flex-col gap-4">
      {execution.focusSphereId ? (
        <p className="text-sm text-zinc-200">
          {execution.focusPlanned === 0
            ? "No atoms of your focus sphere were planned this week. Is the focus really the priority?"
            : `${execution.focusDone} of ${execution.focusPlanned} planned atoms in your focus sphere were done.`}
        </p>
      ) : (
        <p className="text-caption">
          No focus sphere is set for the year. Choose one on the Life Goals page.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-label">Update goals you track by hand</span>
        {data.manualGoals.length === 0 ? (
          <p className="text-caption">No manually tracked goals.</p>
        ) : (
          data.manualGoals.map((goal) => <GoalValueRow key={goal.id} goal={goal} />)
        )}
      </div>

      {data.goals.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-label">This sprint&apos;s share of the yearly goals</span>
          {data.goals.map((goal) => (
            <div key={goal.goalId} className="flex items-center gap-3 text-sm">
              <span className="flex-1 text-zinc-300 break-words">{goal.title}</span>
              <span className="text-[11px] font-mono text-zinc-400">
                {Math.round(goal.sprintPercent)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PlanStageProps extends StageProps {
  priorities: string[];
  setPriorities: (value: string[]) => void;
}

// 5. Plan next week: three priorities and a time for every atom.
export function PlanStage({ data, priorities, setPriorities }: PlanStageProps) {
  const nextWeekStart = new Date(data.nextWeekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(nextWeekStart, index));
  const atomsOnDay = (day: Date) =>
    data.nextWeekAtoms.filter(
      (atom) =>
        atom.plannedDate &&
        format(new Date(atom.plannedDate), "yyyy-MM-dd") === format(day, "yyyy-MM-dd"),
    ).length;
  const unscheduled = data.nextWeekAtoms.filter((atom) => !atom.hasPlannedTime);

  const setPriority = (index: number, value: string) => {
    const next = [...priorities];
    while (next.length < 3) next.push("");
    next[index] = value;
    setPriorities(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {data.previousKaizen && (
        <p className="text-caption p-3 rounded-xl border border-white/[0.06] bg-black/10">
          <span className="text-label mr-2">Last week&apos;s change</span>
          {data.previousKaizen}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-label">Top 3 priorities for next week</span>
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            value={priorities[index] ?? ""}
            onChange={(e) => setPriority(index, e.target.value)}
            placeholder={`Priority ${index + 1}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = atomsOnDay(day);
          const dayClassName = `flex flex-col items-center py-1.5 rounded-lg text-[10px] font-mono ${
            count > DAILY_ATOM_SOFT_CAP
              ? "bg-rose-500/15 text-rose-400"
              : count > 0
                ? "bg-accent-life/15 text-accent-life"
                : "bg-white/[0.03] text-zinc-600"
          }`;
          return (
            <div key={day.toISOString()} className={dayClassName} title={`${count} atoms`}>
              <span>{format(day, "EEE")}</span>
              <span>{count}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label">
          Give every atom a time ({unscheduled.length} without one)
        </span>
        {data.nextWeekAtoms.length === 0 ? (
          <p className="text-caption">
            No open atoms for next week yet. Plan them in the Planning Wizard.
          </p>
        ) : (
          data.nextWeekAtoms.map((atom) => <ScheduleRow key={atom.id} atom={atom} />)
        )}
      </div>
    </div>
  );
}
