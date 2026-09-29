"use client";

import { useState } from "react";
import Link from "next/link";
import { Monitor, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { SPHERE_ICONS } from "@/features/life/components/tasks/lucide-icons-map";
import {
  MAX_GOALS_PER_SPHERE,
  MIN_GOALS_PER_SPHERE,
  type LifeSphereData,
  type SphereGoalData,
  type SphereRoleData,
  type YearFocusData,
} from "@/features/life/types";
import { FocusPanel } from "./FocusPanel";
import { GoalFormDialog } from "./GoalFormDialog";
import { GoalRow } from "./GoalRow";
import { SphereRolePicker } from "./SphereRolePicker";
import { SphereRolesPanel } from "./SphereRolesPanel";

interface GoalsPageClientProps {
  spheres: LifeSphereData[];
  goals: SphereGoalData[];
  habits: { id: string; name: string }[];
  year: number;
  focus: YearFocusData | null;
  roles: SphereRoleData[];
}

interface DialogState {
  sphere: LifeSphereData;
  goal: SphereGoalData | null;
}

function SphereGoalsCard({
  sphere,
  goals,
  isFocus,
  isMuted,
  leverGoalId,
  year,
  role,
  onAdd,
  onEdit,
}: {
  sphere: LifeSphereData;
  goals: SphereGoalData[];
  isFocus: boolean;
  isMuted: boolean;
  leverGoalId: string | null;
  year: number;
  role: SphereRoleData["role"];
  onAdd: () => void;
  onEdit: (goal: SphereGoalData) => void;
}) {
  const SphereIcon = SPHERE_ICONS[sphere.icon] || Target;
  const canAdd = goals.length < MAX_GOALS_PER_SPHERE;
  const needsMore = goals.length < MIN_GOALS_PER_SPHERE;
  const countClassName = `text-[11px] font-mono ${needsMore ? "text-amber-400" : "text-zinc-500"}`;

  const cardClassName = `glass-card p-4 flex flex-col gap-2 ${
    isFocus ? "border-accent-life/40 lg:col-span-2" : isMuted ? "opacity-75" : ""
  }`;

  return (
    <div className={cardClassName}>
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 min-w-0">
          <SphereIcon size={16} className="shrink-0" style={{ color: sphere.color }} />
          <span className="text-panel-title truncate">{sphere.name}</span>
          {isFocus && <span className="text-label text-accent-life">Focus</span>}
          {isMuted && <span className="text-label">Maintenance</span>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={countClassName}>
            {goals.length}/{MAX_GOALS_PER_SPHERE}
          </span>
          <SphereRolePicker year={year} sphereId={sphere.id} role={role} />
        </div>
      </div>

      {goals.length === 0 ? (
        <p className="text-caption py-3">
          No measurable goals yet. Aim for {MIN_GOALS_PER_SPHERE}–{MAX_GOALS_PER_SPHERE}.
        </p>
      ) : (
        <div className="flex flex-col">
          {goals.map((goal) => (
            <GoalRow key={goal.id} goal={goal} onEdit={onEdit} isLever={goal.id === leverGoalId} />
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

export function GoalsPageClient({
  spheres,
  goals,
  habits,
  year,
  focus,
  roles,
}: GoalsPageClientProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const goalsBySphere = (sphereId: string) => goals.filter((goal) => goal.sphereId === sphereId);
  const closeDialog = () => setDialog(null);
  const roleOf = (sphereId: string) =>
    roles.find((entry) => entry.sphereId === sphereId)?.role ?? "ACTIVE";
  const selectableSpheres = spheres.filter((sphere) => roleOf(sphere.id) !== "OFF");
  const workingSpheres = spheres.filter((sphere) => {
    const role = roleOf(sphere.id);
    return role === "FOCUS" || role === "ACTIVE";
  });
  const orderedSpheres = focus
    ? [...workingSpheres].sort(
        (first, second) =>
          Number(second.id === focus.sphereId) - Number(first.id === focus.sphereId),
      )
    : workingSpheres;

  return (
    <div className="flex flex-col gap-4">
      <FocusPanel year={year} spheres={selectableSpheres} goals={goals} focus={focus} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-caption">
          {year} · {goals.length} goal{goals.length !== 1 ? "s" : ""}. The white tick on a bar is
          where you should be by now.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/life/planning/goals/wall"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-zinc-100 border border-white/[0.08] rounded-lg px-2.5 py-1.5 transition-colors duration-150 shrink-0"
          >
            <Monitor size={13} /> Wall view
          </Link>
          <Link
            href="/life/planning/spheres"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 border border-white/[0.08] rounded-lg px-2.5 py-1.5 transition-colors duration-150 shrink-0"
          >
            Manage spheres
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orderedSpheres.map((sphere) => (
          <SphereGoalsCard
            key={sphere.id}
            sphere={sphere}
            goals={goalsBySphere(sphere.id)}
            isFocus={focus?.sphereId === sphere.id}
            isMuted={!!focus && focus.sphereId !== sphere.id}
            leverGoalId={focus?.sphereId === sphere.id ? focus.leverGoalId : null}
            year={year}
            role={roleOf(sphere.id)}
            onAdd={() => setDialog({ sphere, goal: null })}
            onEdit={(goal) => setDialog({ sphere, goal })}
          />
        ))}
      </div>

      <SphereRolesPanel year={year} spheres={spheres} roles={roles} />

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
