"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SphereCard } from "./SphereCard";
import { SphereFormDialog } from "./SphereFormDialog";
import type { LifeSphereData } from "@/features/life/types";

interface SphereGridProps {
  spheres: LifeSphereData[];
}

export function SphereGrid({ spheres }: SphereGridProps) {
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editingSphere, setEditingSphere] = useState<LifeSphereData | null>(null);

  const handleEdit = (sphere: LifeSphereData) => {
    setEditingSphere(sphere);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingSphere(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono text-muted uppercase tracking-wider">
          {spheres.length} sphere{spheres.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => { setEditingSphere(null); setDialogOpen(true); }}
        >
          <Plus size={14} className="mr-1" />
          Add Life Sphere
        </Button>
      </div>

      {spheres.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted text-sm italic">No life spheres defined yet.</p>
          <p className="text-muted/60 text-[11px] font-mono mt-1">
            Create spheres like Career, Health, Learning…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {spheres.map((sphere) => (
            <SphereCard key={sphere.id} sphere={sphere} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <SphereFormDialog
        isOpen={dialogOpen}
        onClose={handleClose}
        sphere={editingSphere}
      />
    </div>
  );
}
