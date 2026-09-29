"use client";

import { useState } from "react";
import { Input } from "@/components/ui/inputs/input";
import { setSphereRoleAction } from "@/features/life/actions/sphere-role-actions";
import type { LifeSphereData, SphereRoleData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";
import { SphereRolePicker } from "./SphereRolePicker";

interface SphereRolesPanelProps {
  year: number;
  spheres: LifeSphereData[];
  roles: SphereRoleData[];
}

function PlankEditor({
  year,
  sphereId,
  plank,
}: {
  year: number;
  sphereId: string;
  plank: string | null;
}) {
  const { run } = useServerAction();
  const [draft, setDraft] = useState(plank ?? "");

  const save = () => {
    if (draft.trim() === (plank ?? "")) return;
    run(setSphereRoleAction({ year, sphereId, role: "MINIMUM", plank: draft }), {
      errorMessage: "Failed to save the plank",
    });
  };

  return (
    <Input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === "Enter" && save()}
      placeholder="What you keep even in the worst week"
      className="h-8 text-xs"
    />
  );
}

// Spheres that are kept at a minimum or switched off this year: no goals, just a plank.
export function SphereRolesPanel({ year, spheres, roles }: SphereRolesPanelProps) {
  const roleBySphere = new Map(roles.map((entry) => [entry.sphereId, entry]));
  const rows = spheres.flatMap((sphere) => {
    const entry = roleBySphere.get(sphere.id);
    return entry && (entry.role === "MINIMUM" || entry.role === "OFF") ? [{ sphere, entry }] : [];
  });
  if (rows.length === 0) return null;

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div>
        <span className="text-panel-title">Minimum and off this year</span>
        <p className="text-caption mt-0.5">
          No goals here, just the plank you keep. Switch a sphere back to Active to give it goals.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(({ sphere, entry }) => (
          <div key={sphere.id} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm text-zinc-200 truncate">{sphere.name}</span>
            <div className="flex-1 min-w-0">
              {entry.role === "MINIMUM" ? (
                <PlankEditor year={year} sphereId={sphere.id} plank={entry.plank} />
              ) : (
                <span className="text-caption">Hidden this year</span>
              )}
            </div>
            <SphereRolePicker
              year={year}
              sphereId={sphere.id}
              role={entry.role}
              plank={entry.plank}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
