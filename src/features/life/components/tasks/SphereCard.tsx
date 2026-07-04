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
  const taskCountLabel = `${sphere.taskCount} task${sphere.taskCount !== 1 ? "s" : ""}`;

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
    <div className="glass-card p-4 flex items-center justify-between gap-3 hover:border-white/[0.12] transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/10 text-accent shrink-0">
            <Icon size={16} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-panel-title truncate">{sphere.name}</p>
          <p className="text-caption">{taskCountLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(sphere)}
          className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
          title="Edit sphere"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => setIsDeleteDialogOpen(true)}
          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors"
          title="Delete sphere"
        >
          <Trash2 size={13} />
        </button>
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
    </div>
  );
}
