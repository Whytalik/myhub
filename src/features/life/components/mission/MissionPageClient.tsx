"use client";

import { useState } from "react";
import { Compass, Plus, Target } from "lucide-react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Button } from "@/components/ui/actions/button";
import { saveMissionAction } from "@/features/life/actions/mission-actions";
import { DirectionCard } from "./DirectionCard";
import { DirectionFormDialog } from "./DirectionFormDialog";
import { useServerAction } from "@/lib/hooks/use-server-action";
import type { DirectionData, LifeSphereData } from "@/features/life/types";

interface MissionPageClientProps {
  currentContent: string;
  spheres: LifeSphereData[];
  directions: DirectionData[];
}

export function MissionPageClient({ currentContent, spheres, directions }: MissionPageClientProps) {
  const [draft, setDraft] = useState(currentContent);
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [editingDirection, setEditingDirection] = useState<DirectionData | null>(null);
  const { run, isPending } = useServerAction();

  const isDirty = draft.trim() !== currentContent.trim();
  const takenSphereIds = directions.map((direction) => direction.sphereId);
  const freeSpheres = spheres.filter((sphere) => !takenSphereIds.includes(sphere.id));
  const vectorCountLabel = `${directions.length} vector${directions.length !== 1 ? "s" : ""}`;

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || isPending) return;

    run(saveMissionAction(trimmed), {
      successMessage: "Mission saved",
      errorMessage: "Failed to save mission",
    });
  };

  const handleEditDirection = (direction: DirectionData) => {
    setEditingDirection(direction);
    setDirectionDialogOpen(true);
  };

  const handleAddDirection = () => {
    setEditingDirection(null);
    setDirectionDialogOpen(true);
  };

  const handleCloseDirectionDialog = () => {
    setDirectionDialogOpen(false);
    setEditingDirection(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent">
            <Compass size={14} />
          </div>
          <h3 className="text-panel-title">Personal Mission</h3>
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What do I stand for? What am I here to do?"
          rows={6}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isPending || !draft.trim() || !isDirty}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent">
              <Target size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="text-panel-title">Vectors</h3>
              <p className="text-caption">
                {vectorCountLabel} · one-year directions for your life spheres
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddDirection}
            disabled={freeSpheres.length === 0}
            title={freeSpheres.length === 0 ? "All spheres already have a vector" : "Add Vector"}
          >
            <Plus size={14} />
            Add Vector
          </Button>
        </div>

        {directions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 text-center py-6">
            <p className="text-body">No vectors defined yet.</p>
            <p className="text-caption">
              Give each sphere a one-year direction to turn your mission into concrete focus.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {directions.map((direction) => (
              <DirectionCard
                key={direction.id}
                direction={direction}
                onEdit={handleEditDirection}
              />
            ))}
          </div>
        )}
      </div>

      <DirectionFormDialog
        isOpen={directionDialogOpen}
        onClose={handleCloseDirectionDialog}
        direction={editingDirection}
        spheres={spheres}
        takenSphereIds={takenSphereIds}
      />
    </div>
  );
}
