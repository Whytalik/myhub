"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { SPHERE_ICONS } from "@/features/life/components/tasks/lucide-icons-map";
import {
  MAX_GOALS_PER_SPHERE,
  MIN_GOALS_PER_SPHERE,
  type LifeSphereData,
  type SphereGoalData,
} from "@/features/life/types";
import { GoalFormDialog } from "./GoalFormDialog";
import { GoalRow } from "./GoalRow";

interface GoalsPageClientProps {
  spheres: LifeSphereData[];
  goals: SphereGoalData[];
  habits: { id: string; name: string }[];
  year: number;
}

interface DialogState {
  sphere: LifeSphereData;
  goal: SphereGoalData | null;
}

function SphereGoalsCard({
  sphere,
  goals,
  onAdd,
  onEdit,
}: {
  sphere: LifeSphereData;
  goals: SphereGoalData[];
  onAdd: () => void;
  onEdit: (goal: SphereGoalData) => void;
}) {
  const SphereIcon = SPHERE_ICONS[sphere.icon] || Target;
  const canAdd = goals.length < MAX_GOALS_PER_SPHERE;
  const needsMore = goals.length < MIN_GOALS_PER_SPHERE;
  const countClassName = `text-[11px] font-mono ${needsMore ? "text-amber-400" : "text-zinc-500"}`;

  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          <SphereIcon size={16} className="shrink-0" style={{ color: sphere.color }} />
          <span className="text-panel-title truncate">{sphere.name}</span>
        </div>
        <span className={countClassName}>
          {goals.length}/{MAX_GOALS_PER_SPHERE}
        </span>
      </div>

      {goals.length === 0 ? (
        <p className="text-caption py-3">
          No measurable goals yet. Aim for {MIN_GOALS_PER_SPHERE}–{MAX_GOALS_PER_SPHERE}.
        </p>
      ) : (
        <div className="flex flex-col">
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} onEdit={onEdit} />
          ))}
        </div>
      )}

      {canAdd && (
        <Button variant="ghost" size="sm" onClick={onAdd} className="self-start">
          <Plus size={14} /> Add goal
        </Button>
      )}
    </div>
  );
}

export function GoalsPageClient({ spheres, goals, habits, year }: GoalsPageClientProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const goalsBySphere = (sphereId: string) => goals.filter((goal) => goal.sphereId === sphereId);
  const closeDialog = () => setDialog(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption">
        {year} · {goals.length} goal{goals.length !== 1 ? "s" : ""}. The white tick on a bar is
        where you should be by now.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {spheres.map((sphere) => (
          <SphereGoalsCard
            key={sphere.id}
            sphere={sphere}
            goals={goalsBySphere(sphere.id)}
            onAdd={() => setDialog({ sphere, goal: null })}
            onEdit={(goal) => setDialog({ sphere, goal })}
          />
        ))}
      </div>

      {dialog && (
        <GoalFormDialog
          isOpen
          onClose={closeDialog}
          sphere={dialog.sphere}
          year={year}
          goal={dialog.goal}
          habits={habits}
        />
      )}
    </div>
  );
}
