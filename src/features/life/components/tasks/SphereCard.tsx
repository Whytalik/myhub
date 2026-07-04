"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SPHERE_ICONS } from "./lucide-icons-map";
import { deleteSphereAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData } from "@/features/life/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";

interface SphereCardProps {
  sphere: LifeSphereData;
  onEdit: (sphere: LifeSphereData) => void;
}

export function SphereCard({ sphere, onEdit }: SphereCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();
  const Icon = SPHERE_ICONS[sphere.icon];

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSphereAction(sphere.id);
      if (result.success) {
        toast.success("Sphere deleted");
      } else {
        toast.error(result.error || "Failed to delete sphere");
      }
    });
  };

  return (
    <div

    >
      {}
      <div >
        <div >
          {Icon && (
            <div

            >
              <Icon size={16} />
            </div>
          )}
          <div>
            <p >{sphere.name}</p>
            <p >
              {sphere.taskCount} task{sphere.taskCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div >
          <button
            onClick={() => onEdit(sphere)}

            title="Edit sphere"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}

            title="Delete sphere"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Sphere"
        description={`Are you sure you want to delete "${sphere.name}"? Tasks assigned to it will lose their sphere association, but they won't be deleted.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {}
      <div />
    </div>
  );
}
