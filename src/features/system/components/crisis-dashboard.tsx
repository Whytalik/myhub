"use client";

import { useState, useTransition } from "react";
import { SystemStatus } from "@/app/generated/prisma";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateRecoveryRoutineAction, exitCrisisModeAction, updateSystemStatusAction } from "../actions/recovery-actions";
import { Battery, Zap, Brain, Sun, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CrisisDashboardProps {
  status: SystemStatus;
  routine: Record<string, boolean>;
  score: number;
}

// Fixed enum values to avoid type errors
const ORDERED_PHASES: SystemStatus[] = [
  SystemStatus.CRISIS_SURVIVAL,
  SystemStatus.CRISIS_STABILIZATION,
  SystemStatus.CRISIS_RE_ENTRY,
];

const PHASE_CONFIG = {
  [SystemStatus.CRISIS_SURVIVAL]: {
    title: "Phase 0: Survival Mode",
    description: "Goal: biological maintenance. No work expected.",
    icon: Battery,
    color: "text-red-500",
    tasks: [
      { id: "water", label: "Water (1.5-2L minimum)" },
      { id: "sleep", label: "Sleep (8 hours in bed)" },
      { id: "hygiene", label: "Hygiene (shower, teeth)" },
      { id: "food", label: "At least one warm meal" },
    ],
  },
  [SystemStatus.CRISIS_STABILIZATION]: {
    title: "Phase 1: Stabilization",
    description: "Goal: restoring rhythm and minimal control.",
    icon: Zap,
    color: "text-yellow-500",
    tasks: [
      { id: "water", label: "Water (1.5-2L)" },
      { id: "sleep", label: "Sleep (8 hours)" },
      { id: "hygiene", label: "Hygiene" },
      { id: "food", label: "Nutritious meal" },
      { id: "wakeup", label: "Wake up by 10:00" },
      { id: "bedtime", label: "Bedtime by 23:00" },
      { id: "cleaning", label: "Light cleaning (1 room)" },
      { id: "walk", label: "15 min walk" },
      { id: "journal", label: "Journal entry (3-5 sentences)" },
      { id: "task", label: "1 useful micro-task" },
    ],
  },
  [SystemStatus.CRISIS_RE_ENTRY]: {
    title: "Phase 2: Re-entry",
    description: "Goal: gradual return to production.",
    icon: Brain,
    color: "text-blue-500",
    tasks: [
      { id: "routine", label: "Baseline routine (Phase 1)" },
      { id: "workout", label: "Light workout (20 min)" },
      { id: "work", label: "One deep work block (2-3 hours)" },
      { id: "bedtime", label: "Bedtime by 23:00" },
      { id: "cleaning", label: "Maintain cleanliness" },
    ],
  },
};

export function CrisisDashboard({ status, routine, score }: CrisisDashboardProps) {
  const router = useRouter();
  const [localRoutine, setLocalRoutine] = useState(routine);
  const [isPending, startTransition] = useTransition();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "primary" | "danger";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Type safe access to config
  const config = PHASE_CONFIG[status as keyof typeof PHASE_CONFIG];

  if (!config) return null;

  const handleToggle = (taskId: string, checked: boolean) => {
    const newRoutine = { ...localRoutine, [taskId]: checked };
    setLocalRoutine(newRoutine);
    startTransition(async () => {
      await updateRecoveryRoutineAction(newRoutine);
    });
  };

  const handleExit = () => {
    setConfirmModal({
      isOpen: true,
      title: "Exit Recovery?",
      description: "Are you sure you want to manually exit recovery mode and return to full operation?",
      variant: "danger",
      onConfirm: async () => {
        await exitCrisisModeAction();
        router.refresh();
      },
    });
  };

  const currentIdx = ORDERED_PHASES.indexOf(status);
  
  const handleNextPhase = () => {
    const isLast = currentIdx === ORDERED_PHASES.length - 1;
    setConfirmModal({
      isOpen: true,
      title: isLast ? "Complete Recovery?" : "Next Phase?",
      description: isLast 
        ? "Are you sure you are ready to complete the recovery protocol and return to normal mode?"
        : "Are you sure you are ready to move to the next recovery phase?",
      onConfirm: async () => {
        if (!isLast) {
          await updateSystemStatusAction(ORDERED_PHASES[currentIdx + 1]);
        } else {
          await exitCrisisModeAction();
        }
        router.refresh();
      },
    });
  };

  const handlePrevPhase = () => {
    setConfirmModal({
      isOpen: true,
      title: "Move Back?",
      description: "Are you sure you want to move back to the previous recovery phase?",
      onConfirm: async () => {
        if (currentIdx > 0) {
          await updateSystemStatusAction(ORDERED_PHASES[currentIdx - 1]);
          router.refresh();
        }
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-4 pb-12">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-surface-hover mb-2 border border-border">
          <config.icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <h1 className="text-note font-bold tracking-tight text-text">{config.title}</h1>
        <p className="text-secondary font-mono text-body">{config.description}</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-note font-medium text-text uppercase tracking-wider flex items-center gap-2">
            <Sun className="h-4 w-4 text-accent" />
            Daily Checklist
          </h2>
          <div className="text-note font-mono font-medium text-accent">
            Progress: {Math.round(score)}%
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-surface-hover rounded-full mb-8 overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ease-out ${score >= 80 ? 'bg-success' : 'bg-accent'}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="grid gap-2">
          {config.tasks.map((task) => {
            const checked = localRoutine[task.id] || false;
            return (
              <button 
                key={task.id} 
                onClick={() => handleToggle(task.id, !checked)}
                disabled={isPending}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all text-left ${
                  checked ? 'bg-accent/5 border-accent/20' : 'bg-surface-hover/50 border-border hover:border-accent/20'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-accent border-accent' : 'border-border'}`}>
                  {checked && <CheckCircle2 className="h-3.5 w-3.5 text-bg" />}
                </div>
                <span className={`text-body font-medium flex-1 ${checked ? 'text-secondary line-through opacity-50' : 'text-text'}`}>
                  {task.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-accent/5 border border-accent/15 text-secondary text-sm leading-relaxed">
          <h4 className="font-medium text-accent uppercase tracking-wider mb-2 flex items-center gap-2 text-caption">
            <Zap className="h-3 w-3" />
            Protocol Logic
          </h4>
          Maintain 80%+ completion for 3 days to move forward. 
          If today is &lt; 80%, you will regress one phase tomorrow. 
          Focus on consistency, not perfection.
        </div>
        
        <div className="p-4 rounded-xl bg-surface-hover/50 border border-border flex flex-col justify-center gap-3">
          <div className="flex gap-2">
            <Button 
              onClick={handlePrevPhase}
              disabled={currentIdx === 0}
              variant="secondary"
              className="flex-1 h-10 rounded-lg text-note font-mono tracking-wider font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              BACK
            </Button>
            <Button 
              onClick={handleNextPhase}
              className="flex-1 h-10 rounded-lg text-note font-mono tracking-wider font-medium"
            >
              {currentIdx === ORDERED_PHASES.length - 1 ? "FINISH" : "NEXT"}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
          <button 
            onClick={handleExit}
            className="w-full text-caption font-mono tracking-wider text-muted hover:text-danger transition-colors uppercase pt-1"
          >
            Manual Exit Mode
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />
    </div>
  );
}
