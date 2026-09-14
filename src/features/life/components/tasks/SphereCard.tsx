"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SPHERE_ICONS } from "./lucide-icons-map";
import { deleteSphereAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData } from "@/features/life/types";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface SphereCardProps {
  sphere: LifeSphereData;
  onEdit: (sphere: LifeSphereData) => void;
}

export function SphereCard({ sphere, onEdit }: SphereCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { run } = useServerAction();
  const Icon = SPHERE_ICONS[sphere.icon];
  const taskCountLabel = `${sphere.taskCount} task${sphere.taskCount !== 1 ? "s" : ""}`;

  const handleDelete = () => {
    run(deleteSphereAction(sphere.id), {
      successMessage: "Sphere deleted",
      errorMessage: "Failed to delete sphere",
    });
  };

  return (
    <div className="glass-card p-3 flex items-center justify-between gap-2 hover:border-white/[0.12] transition-colors duration-150 group">
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/10 text-accent shrink-0">
            <Icon size={14} />
          </div>
        )}
        <div className="min-w-0 flex items-baseline gap-1.5">
          <p className="text-body font-medium truncate">{sphere.name}</p>
          <p className="text-caption shrink-0">{taskCountLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(sphere)} title="Edit sphere">
          <Pencil size={13} />
        </Button>
        <Button
          variant="ghost-danger"
          size="icon-sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          title="Delete sphere"
        >
          <Trash2 size={13} />
        </Button>
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
