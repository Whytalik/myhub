import Link from "next/link";
import { Check } from "lucide-react";
import type { SetupProgress } from "@/features/life/types";

interface SetupChecklistProps {
  progress: SetupProgress;
}

export function SetupChecklist({ progress }: SetupChecklistProps) {
  const steps = [
    {
      label: "Set 3–5 measurable goals per sphere",
      href: "/life/planning/goals",
      isDone: progress.hasGoals,
    },
    {
      label: "Choose your ONE focus sphere and its lever",
      href: "/life/planning/goals",
      isDone: progress.hasFocus,
    },
    {
      label: "Build the 12-step playbook for the lever",
      href: "/life/planning/playbook",
      isDone: progress.hasPlaybook,
    },
    {
      label: "Link sprint objectives to yearly goals",
      href: "/life/planning/wizard",
      isDone: progress.hasLinkedObjectives,
    },
  ];
  const doneCount = steps.filter((step) => step.isDone).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-panel-title">Getting started</span>
        <span className="text-[11px] font-mono text-zinc-500">
          {doneCount}/{steps.length}
        </span>
      </div>
      <ol className="flex flex-col gap-1">
        {steps.map((step, index) => {
          const badgeClassName = `flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono shrink-0 ${
            step.isDone ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-zinc-500"
          }`;
          const labelClassName = `text-sm ${step.isDone ? "text-zinc-500 line-through" : "text-zinc-200 hover:text-accent-life"}`;
          return (
            <li key={step.label} className="flex items-center gap-2.5">
              <span className={badgeClassName}>
                {step.isDone ? <Check size={11} /> : index + 1}
              </span>
              <Link href={step.href} className={labelClassName}>
                {step.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
