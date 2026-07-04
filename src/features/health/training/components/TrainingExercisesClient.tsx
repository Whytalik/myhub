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
    <div >
      <div >
        {archivedExercises.length > 0 ? (
          <button
            onClick={() => setShowArchived(!showArchived)}

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
        <div >
          <div >
            <Dumbbell size={32} />
          </div>
          <div >
            <p >No exercises in your library</p>
            <p >
              Add exercises here, then prescribe them to your training days.
            </p>
          </div>
        </div>
      ) : (
        <div >
          {displayed.map((ex) => (
            <div
              key={ex.id}

            >
              <div >
                <span >{ex.name}</span>
                <div >
                  <button
                    onClick={() => {
                      setSelected(ex);
                      setIsFormOpen(true);
                    }}

                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setToDelete(ex.id)}

                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div >
                {ex.muscleGroup && (
                  <span >
                    {ex.muscleGroup}
                  </span>
                )}
                {ex.equipment && (
                  <span >
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
