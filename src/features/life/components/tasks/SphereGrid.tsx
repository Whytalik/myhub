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

  const handleEdit = (sphere: LifeSphereData) => {
    setEditingSphere(sphere);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingSphere(null);
  };

  return (
    <div >
      {}
      <div >
        <p >
          {spheres.length} sphere{spheres.length !== 1 ? "s" : ""}
        </p>
        <div >
          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditingSphere(null); setDialogOpen(true); }}
          >
            <Plus size={14} />
            Add Life Sphere
          </Button>
          <button
            onClick={onClose}

          >
            <X size={16} />
          </button>
        </div>
      </div>

      {spheres.length === 0 ? (
        <div >
          <p >No life spheres defined yet.</p>
          <p >
            Create spheres like Career, Health, Learning…
          </p>
        </div>
      ) : (
        <div >
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
