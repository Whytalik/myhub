"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Dumbbell, Edit2, Trash2 } from "lucide-react";
import type { ExerciseData } from "../types";
import { deleteExerciseAction } from "../actions/exercise-actions";
import { ExerciseFormDialog } from "./ExerciseFormDialog";

interface TrainingExercisesClientProps {
  initialExercises: ExerciseData[];
}

export function TrainingExercisesClient({
  initialExercises,
}: TrainingExercisesClientProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<ExerciseData | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const activeExercises = initialExercises.filter((e) => !e.archived);
  const archivedExercises = initialExercises.filter((e) => e.archived);

  const confirmDelete = async () => {
    if (!toDelete) return;
    const result = await deleteExerciseAction(toDelete);
    if (result.success) toast.success("Exercise deleted");
    else toast.error(result.error || "Failed to delete exercise");
    setToDelete(null);
  };

  const displayed = [
    ...activeExercises,
    ...(showArchived ? archivedExercises : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        {archivedExercises.length > 0 ? (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-label font-mono uppercase tracking-widest text-muted hover:text-text transition-colors"
          >
            {showArchived
              ? "Hide archived"
              : `Show archived (${archivedExercises.length})`}
          </button>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          size="sm"
          className="rounded-xl px-5"
          onClick={() => {
            setSelected(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-1.5" />
          New exercise
        </Button>
      </div>

      {displayed.length === 0 ? (
        <div className="bg-surface/30 border border-dashed border-border/40 rounded-xl p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-raised flex items-center justify-center border border-border">
            <Dumbbell size={32} className="text-muted/40" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-text">No exercises in your library</p>
            <p className="text-note text-muted max-w-[280px]">
              Add exercises here, then prescribe them to your training days.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((ex) => (
            <div
              key={ex.id}
              className={`border border-border rounded-xl p-4 flex flex-col gap-2 bg-surface/30 ${ex.archived ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-note font-bold text-text">{ex.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelected(ex);
                      setIsFormOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setToDelete(ex.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ex.muscleGroup && (
                  <span className="text-label font-mono px-2 py-0.5 rounded-full bg-raised text-muted">
                    {ex.muscleGroup}
                  </span>
                )}
                {ex.equipment && (
                  <span className="text-label font-mono px-2 py-0.5 rounded-full bg-raised text-muted">
                    {ex.equipment}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ExerciseFormDialog
        key={`exercise-form-${selected?.id ?? "new"}`}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        exercise={selected}
      />

      <ConfirmationDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete exercise?"
        description="This will remove it from any training days that use it."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
