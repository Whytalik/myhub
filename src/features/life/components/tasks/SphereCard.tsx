"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { SPHERE_ICONS } from "./lucide-icons-map";
import { deleteSphereAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData } from "@/features/life/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/dialog";

interface SphereCardProps {
  sphere:  LifeSphereData;
  onEdit:  (sphere: LifeSphereData) => void;
}

export function SphereCard({ sphere, onEdit }: SphereCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();
  const Icon = SPHERE_ICONS[sphere.icon];

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSphereAction(sphere.id);
        toast.success("Sphere deleted");
      } catch {
        toast.error("Failed to delete sphere");
      }
    });
  };

  return (
    <div
      className="group bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3 transition-all hover:border-border/80"
      style={{ borderLeftColor: sphere.color, borderLeftWidth: "4px" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${sphere.color}18` }}
            >
              <Icon size={16} style={{ color: sphere.color }} />
            </div>
          )}
          <div>
            <p className="text-[13px] font-semibold text-text leading-none">{sphere.name}</p>
            <p className="text-[10px] font-mono text-muted mt-1">
              {sphere.taskCount} task{sphere.taskCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(sphere)}
            className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-raised transition-colors"
            title="Edit sphere"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
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

      {/* Color swatch */}
      <div className="h-1 rounded-full" style={{ backgroundColor: sphere.color, opacity: 0.4 }} />
    </div>
  );
}
