"use client";

import { Select } from "@/components/ui/inputs/select";
import { setSphereRoleAction } from "@/features/life/actions/sphere-role-actions";
import type { SphereRole } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

const STORED_ROLES: { role: "ACTIVE" | "MINIMUM" | "OFF"; label: string }[] = [
  { role: "ACTIVE", label: "Active" },
  { role: "MINIMUM", label: "Minimum" },
  { role: "OFF", label: "Off" },
];

interface SphereRolePickerProps {
  year: number;
  sphereId: string;
  role: SphereRole;
  plank?: string | null;
}

// Changes how a sphere is treated this year. The focus sphere is set through the focus.
export function SphereRolePicker({ year, sphereId, role, plank }: SphereRolePickerProps) {
  const { run, isPending } = useServerAction();

  if (role === "FOCUS") return <span className="text-label text-accent-life">Focus</span>;

  return (
    <div className="w-24 shrink-0">
      <Select
        variant="inline"
        value={role}
        disabled={isPending}
        onChange={(e) =>
          run(
            setSphereRoleAction({
              year,
              sphereId,
              role: e.target.value as "ACTIVE" | "MINIMUM" | "OFF",
              plank,
            }),
            { errorMessage: "Failed to change the sphere role" },
          )
        }
        aria-label="Sphere role this year"
      >
        {STORED_ROLES.map((option) => (
          <option key={option.role} value={option.role}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
