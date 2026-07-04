"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { toast } from "sonner";
import { Plus, Dumbbell, Edit2, Trash2 } from "lucide-react";
import type { ExerciseData } from "../types";
import { deleteExerciseAction } from "../actions/exercise-actions";
import { ExerciseFormDialog } from "./ExerciseFormDialog";

interface TrainingExercisesClientProps {
  initialExercises: ExerciseData[];
}

export function TrainingExercisesClient({ initialExercises }: TrainingExercisesClientProps) {
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

  const displayed = [...activeExercises, ...(showArchived ? archivedExercises : [])];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        {archivedExercises.length > 0 ? (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showArchived ? "Hide archived" : `Show archived (${archivedExercises.length})`}
          </button>
        ) : (
          <div />
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelected(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={16} />
          New exercise
        </Button>
      </div>

      {displayed.length === 0 ? (
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-training/10 text-accent-training">
            <Dumbbell size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-panel-title">No exercises in your library</p>
            <p className="text-caption max-w-sm">
              Add exercises here, then prescribe them to your training days.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {displayed.map((ex) => (
            <div key={ex.id} className="glass-card p-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-zinc-100 truncate">{ex.name}</span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => {
                      setSelected(ex);
                      setIsFormOpen(true);
                    }}
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setToDelete(ex.id)}
                    className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {ex.muscleGroup && (
                  <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400">
                    {ex.muscleGroup}
                  </span>
                )}
                {ex.equipment && (
                  <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400">
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
