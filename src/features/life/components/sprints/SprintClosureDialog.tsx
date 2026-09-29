"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Trophy, TriangleAlert, RefreshCw } from "lucide-react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { FormField } from "@/components/ui/display/form-field";
import { closeSprintAction } from "@/features/life/actions/sprint-actions";
import { SPHERE_ICONS } from "@/features/life/components/tasks/lucide-icons-map";
import type {
  PendingSprintClosure,
  ProjectClosureAction,
  SprintObjectiveOutcome,
} from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

const STEP_TITLES = ["Summary", "Objectives & projects", "After-action"] as const;

const OUTCOME_OPTIONS: {
  outcome: SprintObjectiveOutcome;
  label: string;
  activeClassName: string;
}[] = [
  {
    outcome: "ACHIEVED",
    label: "✅ Achieved",
    activeClassName: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    outcome: "PARTIAL",
    label: "🌓 Partial",
    activeClassName: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  {
    outcome: "FAILED",
    label: "❌ Failed",
    activeClassName: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  },
  {
    outcome: "CANCELLED",
    label: "🗑️ Cancelled",
    activeClassName: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
  },
];

const PROJECT_ACTION_OPTIONS: {
  action: ProjectClosureAction;
  label: string;
  activeClassName: string;
}[] = [
  {
    action: "CARRY",
    label: "➡️ Next sprint",
    activeClassName: "bg-accent/15 border-accent/40 text-accent",
  },
  {
    action: "BACKLOG",
    label: "📥 Backlog",
    activeClassName: "bg-sky-500/10 border-sky-500/30 text-sky-400",
  },
  {
    action: "DONE",
    label: "✅ Done",
    activeClassName: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    action: "CANCELLED",
    label: "🗑️ Drop",
    activeClassName: "bg-zinc-500/10 border-zinc-500/30 text-zinc-300",
  },
];

const INACTIVE_CHOICE_CLASS =
  "bg-white/[0.01] border-white/[0.06] text-zinc-400 hover:bg-white/[0.03]";

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-xl border border-white/[0.06] bg-black/10">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
        {label}
      </span>
      <span className="text-sm font-bold text-zinc-200 font-mono">{value}</span>
    </div>
  );
}

function ChoiceButton({
  label,
  isActive,
  activeClassName,
  onClick,
}: {
  label: string;
  isActive: boolean;
  activeClassName: string;
  onClick: () => void;
}) {
  const choiceClassName = `px-2 py-1.5 rounded-lg border text-[11px] font-mono transition-colors duration-150 ${
    isActive ? activeClassName : INACTIVE_CHOICE_CLASS
  }`;

  return (
    <button type="button" onClick={onClick} className={choiceClassName}>
      {label}
    </button>
  );
}

export function SprintClosureDialog({ closure }: { closure: PendingSprintClosure }) {
  const router = useRouter();
  const { run, isPending } = useServerAction();

  const [step, setStep] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<string, SprintObjectiveOutcome>>({});
  const [projectActions, setProjectActions] = useState<Record<string, ProjectClosureAction>>({});
  const [whatWorked, setWhatWorked] = useState("");
  const [challenges, setChallenges] = useState("");
  const [adjustments, setAdjustments] = useState("");

  const { sprint, summary, objectives } = closure;
  const unfinishedProjectIds = objectives.flatMap((objective) =>
    objective.unfinishedProjects.map((project) => project.id),
  );
  const isTriageComplete =
    objectives.every((objective) => outcomes[objective.id]) &&
    unfinishedProjectIds.every((projectId) => projectActions[projectId]);
  const isLastStep = step === STEP_TITLES.length - 1;
  const canContinue = step === 1 ? isTriageComplete : true;
  const averageScoreLabel =
    summary.averageScore === null ? "—" : `${summary.averageScore.toFixed(1)} / 10`;

  const handleSubmit = () => {
    if (!isTriageComplete || isPending) return;

    run(
      closeSprintAction({
        sprintId: sprint.id,
        objectives: objectives.map((objective) => ({
          objectiveId: objective.id,
          outcome: outcomes[objective.id],
          projects: objective.unfinishedProjects.map((project) => ({
            projectId: project.id,
            action: projectActions[project.id],
          })),
        })),
        afterAction: { whatWorked, challenges, adjustments },
      }),
      {
        successMessage: `Sprint ${sprint.number} closed`,
        errorMessage: "Failed to close sprint",
        onSuccess: () => router.refresh(),
      },
    );
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
      return;
    }
    setStep((previousStep) => previousStep + 1);
  };

  return (
    <Dialog
      isOpen
      dismissible={false}
      onClose={() => {}}
      title={`Sprint ${sprint.number} · ${sprint.year} is over`}
      description={`Step ${step + 1} of ${STEP_TITLES.length}: ${STEP_TITLES[step]}`}
      maxWidth="640px"
      footer={
        <>
          {step > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep((previousStep) => previousStep - 1)}
              disabled={isPending}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleNext}
            disabled={!canContinue || isPending}
          >
            {isLastStep ? (isPending ? "Closing..." : "Finish sprint") : "Continue"}
          </Button>
        </>
      }
    >
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-caption">
            A new sprint has already started. Before moving on, decide what happens with the
            unfinished work from this one.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryStat label="Objectives" value={String(summary.objectivesTotal)} />
            <SummaryStat
              label="Projects done"
              value={`${summary.projectsDone}/${summary.projectsTotal}`}
            />
            <SummaryStat label="Atoms done" value={`${summary.tasksDone}/${summary.tasksTotal}`} />
            <SummaryStat label="Avg score" value={averageScoreLabel} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          {objectives.map((objective) => {
            const ObjectiveIcon = SPHERE_ICONS[objective.sphere.icon] || Target;

            return (
              <div
                key={objective.id}
                className="flex flex-col gap-3 p-3 rounded-xl border border-white/[0.06] bg-black/10"
              >
                <div className="flex items-start gap-2">
                  <ObjectiveIcon
                    size={15}
                    className="shrink-0 mt-0.5"
                    style={{ color: objective.sphere.color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-zinc-200 break-words">
                      {objective.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-zinc-500">
                      {objective.sphere.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OUTCOME_OPTIONS.map((option) => (
                    <ChoiceButton
                      key={option.outcome}
                      label={option.label}
                      isActive={outcomes[objective.id] === option.outcome}
                      activeClassName={option.activeClassName}
                      onClick={() =>
                        setOutcomes((previous) => ({ ...previous, [objective.id]: option.outcome }))
                      }
                    />
                  ))}
                </div>

                {objective.unfinishedProjects.length > 0 && (
                  <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.04]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Unfinished projects
                    </span>
                    {objective.unfinishedProjects.map((project) => (
                      <div key={project.id} className="flex flex-col gap-2">
                        <span className="text-xs text-zinc-300 break-words">
                          📂 {project.title}
                          <span className="text-zinc-500">
                            {" "}
                            · {project.openTaskCount} open atoms
                          </span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PROJECT_ACTION_OPTIONS.map((option) => (
                            <ChoiceButton
                              key={option.action}
                              label={option.label}
                              isActive={projectActions[project.id] === option.action}
                              activeClassName={option.activeClassName}
                              onClick={() =>
                                setProjectActions((previous) => ({
                                  ...previous,
                                  [project.id]: option.action,
                                }))
                              }
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <FormField label="What worked" hint="Which habits and decisions to keep?">
            <div className="relative">
              <Trophy size={13} className="absolute left-3 top-3 text-zinc-500" />
              <Textarea
                value={whatWorked}
                onChange={(e) => setWhatWorked(e.target.value)}
                placeholder="What paid off over these 12 weeks…"
                rows={3}
                className="pl-8"
              />
            </div>
          </FormField>

          <FormField label="Challenges" hint="Where did execution break down?">
            <div className="relative">
              <TriangleAlert size={13} className="absolute left-3 top-3 text-zinc-500" />
              <Textarea
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="Blockers, resistance, what fell off…"
                rows={3}
                className="pl-8"
              />
            </div>
          </FormField>

          <FormField label="Adjustments (Kaizen)" hint="What changes in the next sprint?">
            <div className="relative">
              <RefreshCw size={13} className="absolute left-3 top-3 text-zinc-500" />
              <Textarea
                value={adjustments}
                onChange={(e) => setAdjustments(e.target.value)}
                placeholder="One or two changes to install next sprint…"
                rows={3}
                className="pl-8"
              />
            </div>
          </FormField>
        </div>
      )}
    </Dialog>
  );
}
