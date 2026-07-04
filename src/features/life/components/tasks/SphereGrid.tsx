"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { SphereCard } from "./SphereCard";
import { SphereFormDialog } from "./SphereFormDialog";
import type { LifeSphereData } from "@/features/life/types";

interface SphereGridProps {
  spheres: LifeSphereData[];
  onClose: () => void;
}

export function SphereGrid({ spheres, onClose }: SphereGridProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSphere, setEditingSphere] = useState<LifeSphereData | null>(null);
  const sphereCountLabel = `${spheres.length} sphere${spheres.length !== 1 ? "s" : ""}`;

  const handleEdit = (sphere: LifeSphereData) => {
    setEditingSphere(sphere);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingSphere(null);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingSphere(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption">{sphereCountLabel}</p>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleAddNew}>
            <Plus size={14} />
            Add Life Sphere
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {spheres.length === 0 ? (
        <div className="glass-card p-8 flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-body">No life spheres defined yet.</p>
          <p className="text-caption">Create spheres like Career, Health, Learning…</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {spheres.map((sphere) => (
            <SphereCard key={sphere.id} sphere={sphere} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <SphereFormDialog isOpen={dialogOpen} onClose={handleClose} sphere={editingSphere} />
    </div>
  );
}
