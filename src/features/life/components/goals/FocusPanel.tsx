"use client";

import { useState } from "react";
import Link from "next/link";
import { Crosshair, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { clearYearFocusAction } from "@/features/life/actions/year-focus-actions";
import { formatGoalProgress } from "@/features/life/logic/sphere-goals";
import type { LifeSphereData, SphereGoalData, YearFocusData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { FocusDialog } from "./FocusDialog";
import { GoalProgressBar } from "./GoalProgressBar";

// Research on New Year resolutions (Norcross) shows roughly 40% still hold at six months;
// people finish only a minority of a long list, so the list is expected to shrink.
const EXPECTED_COMPLETION_SHARE = 0.35;

interface FocusPanelProps {
  year: number;
  spheres: LifeSphereData[];
  goals: SphereGoalData[];
  focus: YearFocusData | null;
}

export function FocusPanel({ year, spheres, goals, focus }: FocusPanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { run, isPending } = useServerAction();

  const focusSphere = focus ? spheres.find((sphere) => sphere.id === focus.sphereId) : null;
  const leverGoal = focus?.leverGoalId ? goals.find((goal) => goal.id === focus.leverGoalId) : null;
  const expectedFinished = Math.max(1, Math.round(goals.length * EXPECTED_COMPLETION_SHARE));

  const handleClear = () => {
    run(clearYearFocusAction(year), {
      successMessage: "Focus cleared",
      errorMessage: "Failed to clear focus",
    });
  };

  return (
    <div className="glass-card p-5 flex flex-col gap-3 border-accent-life/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Crosshair size={16} className="text-accent-life shrink-0" />
          <h2 className="text-panel-title">
            {focusSphere
              ? `Focus of ${year}: ${focusSphere.name}`
              : `Pick your ONE focus for ${year}`}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {focus ? (
            <>
              <Button
                variant="ghost-accent"
                size="icon-sm"
                onClick={() => setIsDialogOpen(true)}
                title="Edit focus"
              >
                <Pencil size={13} />
              </Button>
              <Button
                variant="ghost-danger"
                size="icon-sm"
                onClick={handleClear}
                disabled={isPending}
                title="Clear focus"
              >
                <X size={13} />
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(true)}>
              Choose focus
            </Button>
          )}
        </div>
      </div>

      {focus ? (
        <div className="flex flex-col gap-3">
          {focus.identity && (
            <p className="text-base font-medium text-zinc-100 whitespace-pre-wrap">
              “{focus.identity}”
            </p>
          )}
          {leverGoal && (
            <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/[0.06] bg-black/10">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-zinc-100 break-words">
                  <span className="text-label mr-2">Lever</span>
                  {leverGoal.title}
                </span>
                <span className="text-xs font-mono text-zinc-300 shrink-0">
                  {formatGoalProgress(leverGoal)}
                </span>
              </div>
              <GoalProgressBar goal={leverGoal} />
              <Link
                href={`/life/planning/playbook?goal=${leverGoal.id}`}
                className="text-[11px] text-accent-life hover:underline self-start"
              >
                Open the 12-step playbook →
              </Link>
            </div>
          )}
          {focus.leverReason && (
            <p className="text-caption whitespace-pre-wrap">
              <span className="text-label mr-2">Why</span>
              {focus.leverReason}
            </p>
          )}
          {focus.allowImperfect && (
            <p className="text-caption whitespace-pre-wrap">
              <span className="text-label mr-2">Imperfect on purpose</span>
              {focus.allowImperfect}
            </p>
          )}
        </div>
      ) : (
        <p className="text-caption">
          Trying to change everything at once is the classic way to burn out and rebound. Choose one
          sphere to win this year and let the rest run at maintenance level.
        </p>
      )}

      {goals.length > 0 && (
        <p className="text-[11px] font-mono text-zinc-500">
          Reality check: with {goals.length} goals, expect to finish about {expectedFinished}. Make
          sure the focus is among them.
        </p>
      )}

      {isDialogOpen && (
        <FocusDialog
          isOpen
          onClose={() => setIsDialogOpen(false)}
          year={year}
          spheres={spheres}
          goals={goals}
          focus={focus}
        />
      )}
    </div>
  );
}
