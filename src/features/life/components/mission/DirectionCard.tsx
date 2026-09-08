"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { deleteDirectionAction } from "@/features/life/actions/direction-actions";
import type { DirectionData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface DirectionCardProps {
  direction: DirectionData;
  onEdit: (direction: DirectionData) => void;
}

export function DirectionCard({ direction, onEdit }: DirectionCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { run } = useServerAction();

  const handleDelete = () => {
    run(deleteDirectionAction(direction.sphereId), {
      successMessage: "Vector deleted",
      errorMessage: "Failed to delete vector",
    });
  };

  return (
    <div className="glass-card p-4 flex flex-col gap-3 hover:border-white/[0.12] transition-colors duration-150">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: direction.sphereColor }}
          />
          <p className="text-panel-title truncate">{direction.sphereName}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(direction)}
            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-colors"
            title="Edit vector"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-white/5 rounded-md transition-colors"
            title="Delete vector"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-body text-zinc-200">{direction.statement}</p>

      {direction.actions.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {direction.actions.map((action, index) => (
            <li key={index} className="flex items-baseline gap-2 text-sm text-zinc-300">
              {action.label && (
                <span className="text-accent font-medium shrink-0">{action.label}</span>
              )}
              <span>{action.text}</span>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Vector"
        description={`Are you sure you want to delete the vector for "${direction.sphereName}"? Sprint objectives in this sphere won't be affected.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
