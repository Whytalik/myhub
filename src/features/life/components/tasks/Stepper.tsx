import * as React from "react";
import { Pencil, LayoutGrid, Calendar, Link2Off, Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Core", icon: <Pencil size={14} /> },
  { number: 2, label: "Category", icon: <LayoutGrid size={14} /> },
  { number: 3, label: "Planning", icon: <Calendar size={14} /> },
  { number: 4, label: "Context", icon: <Link2Off size={14} /> },
];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const circleClass = `flex items-center justify-center w-8 h-8 rounded-full border shrink-0 transition-colors duration-150 ${
          isActive
            ? "bg-accent text-white border-accent"
            : isCompleted
              ? "bg-accent/15 text-accent border-accent/30"
              : "bg-white/[0.02] text-zinc-500 border-white/[0.08]"
        }`;
        const labelClass = `text-[11px] font-medium whitespace-nowrap ${isActive ? "text-zinc-100" : "text-zinc-500"}`;
        const lineClass = `flex-1 h-px ${isCompleted ? "bg-accent/40" : "bg-white/[0.06]"}`;

        return (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              <div className={circleClass}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.icon}
              </div>
              <span className={labelClass}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && <div className={lineClass} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
