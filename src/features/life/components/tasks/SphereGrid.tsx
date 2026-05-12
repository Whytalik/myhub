"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SphereCard } from "./SphereCard";
import { SphereFormDialog } from "./SphereFormDialog";
import type { LifeSphereData } from "@/features/life/types";

interface SphereGridProps {
  spheres: LifeSphereData[];
  onClose: () => void;
}

export function SphereGrid({ spheres, onClose }: SphereGridProps) {
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
    <div className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-note font-mono text-muted uppercase tracking-wider">
          {spheres.length} sphere{spheres.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditingSphere(null); setDialogOpen(true); }}
          >
            <Plus size={14} className="mr-1" />
            Add Life Sphere
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-raised transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {spheres.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted text-base italic">No life spheres defined yet.</p>
          <p className="text-muted/60 text-note font-mono mt-1">
            Create spheres like Career, Health, Learning…
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
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
