"use client";

import { useRouter } from "next/navigation";
import { Crosshair } from "lucide-react";
import { Select } from "@/components/ui/inputs/select";
import { GoalProgressBar } from "@/features/life/components/goals/GoalProgressBar";
import { formatGoalProgress } from "@/features/life/logic/sphere-goals";
import type { GoalPlaybookData, SphereGoalData } from "@/features/life/types";
import { MonthPlanStep, PedalStep, WeekPlanStep, WeekScheduleStep } from "./ExecutionSteps";
import { ListEditor } from "./ListEditor";
import { PhaseTimeline } from "./PhaseTimeline";
import { PlaybookStep } from "./PlaybookStep";
import { TextStep } from "./TextStep";

interface PlaybookPageClientProps {
  goals: SphereGoalData[];
  goal: SphereGoalData;
  playbook: GoalPlaybookData;
  isFocusLever: boolean;
}

export function PlaybookPageClient({
  goals,
  goal,
  playbook,
  isFocusLever,
}: PlaybookPageClientProps) {
  const router = useRouter();
  const goalId = goal.id;
  const doneCount = playbook.stepDone.filter(Boolean).length;
  const firstOpenStep = playbook.stepDone.findIndex((isDone) => !isDone);

  const assetRows = playbook.assets.map((asset) => ({ first: asset, second: "" }));
  const obstacleRows = playbook.obstacles.map((item) => ({
    first: item.obstacle,
    second: item.solution,
  }));
  const peopleRows = playbook.people.map((person) => ({ first: person.name, second: person.help }));

  const steps = [
    {
      title: "Define the goal",
      hint: "State the main goal clearly. e.g. get a $200,000 prop firm allocation.",
      content: (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-zinc-100">{goal.title}</span>
            <span className="text-xs font-mono text-zinc-300">{formatGoalProgress(goal)}</span>
          </div>
          <GoalProgressBar goal={goal} />
          <p className="text-caption">Edit the goal itself on the Life Goals page.</p>
        </div>
      ),
    },
    {
      title: "Detail the path",
      hint: "What does the route technically look like, step by step?",
      content: (
        <TextStep
          goalId={goalId}
          field="path"
          value={playbook.path}
          placeholder="$500 for a challenge → 2-3 attempts → verification → scale the account"
        />
      ),
    },
    {
      title: "The key change",
      hint: "What must fundamentally change in your behaviour?",
      content: (
        <TextStep
          goalId={goalId}
          field="keyChange"
          value={playbook.keyChange}
          placeholder="Stop breaking risk management, no emotional entries, keep a trading journal"
        />
      ),
    },
    {
      title: "Gather assets",
      hint: "What do you already have to start?",
      content: (
        <ListEditor
          goalId={goalId}
          field="assets"
          rows={assetRows}
          firstPlaceholder="A computer, base knowledge, $500…"
        />
      ),
    },
    {
      title: "Spot the obstacles",
      hint: "What blocks you right now?",
      content: (
        <ListEditor
          goalId={goalId}
          field="obstacles"
          rows={obstacleRows}
          firstPlaceholder="Obstacle: no time because of my main job"
          secondPlaceholder="Step 6, solution: 2 hours every morning"
        />
      ),
    },
    {
      title: "Find solutions",
      hint: "Write a way through every obstacle. Unsolved ones are highlighted in step 5.",
      content: (
        <p className="text-caption">
          {playbook.obstacles.filter((item) => !item.solution).length === 0 &&
          playbook.obstacles.length > 0
            ? "Every obstacle has a solution."
            : "Fill in the solution next to each obstacle in step 5."}
        </p>
      ),
    },
    {
      title: "People",
      hint: "Who can help you?",
      content: (
        <ListEditor
          goalId={goalId}
          field="people"
          rows={peopleRows}
          firstPlaceholder="Name or role, e.g. a mentor"
          secondPlaceholder="How they help: reviews my trades"
        />
      ),
    },
    {
      title: "Plan by months",
      hint: "Split the year into blocks.",
      content: (
        <PhaseTimeline
          goalId={goalId}
          phases={playbook.phases}
          currentPhaseId={playbook.currentPhaseId}
        />
      ),
    },
    {
      title: "This month's plan",
      hint: "What has to be closed this month?",
      content: <MonthPlanStep goalId={goalId} playbook={playbook} />,
    },
    {
      title: "This week's plan",
      hint: "Actions that move the monthly goal.",
      content: <WeekPlanStep goalId={goalId} playbook={playbook} />,
    },
    {
      title: "Schedule the week",
      hint: "Put atoms in the calendar. No time, no action.",
      content: <WeekScheduleStep goalId={goalId} playbook={playbook} />,
    },
    {
      title: "The gas pedal",
      hint: "One 5-minute action you can do RIGHT NOW to start.",
      content: <PedalStep goalId={goalId} playbook={playbook} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {isFocusLever && <Crosshair size={15} className="text-accent-life shrink-0" />}
          <div className="min-w-0 flex-1 sm:w-72">
            <Select value={goalId} onChange={(e) => router.push(`?goal=${e.target.value}`)}>
              {goals.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <span className="text-xs font-mono text-zinc-300">
          {doneCount}/{playbook.stepDone.length} steps
        </span>
      </div>

      {steps.map((step, index) => (
        <PlaybookStep
          key={index}
          number={index + 1}
          title={step.title}
          hint={step.hint}
          isDone={playbook.stepDone[index]}
          defaultOpen={index === firstOpenStep}
        >
          {step.content}
        </PlaybookStep>
      ))}
    </div>
  );
}
