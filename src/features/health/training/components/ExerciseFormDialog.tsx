"use client";
import { Checkbox } from "@/components/ui/inputs/checkbox";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { CustomSelect } from "@/components/ui/inputs/custom-select";
import { toast } from "sonner";
import { exerciseSchema, type ExerciseFormData } from "../schemas";
import { upsertExerciseAction } from "../actions/exercise-actions";
import type { ExerciseData, TrackingType } from "../types";

const TRACKING_OPTIONS: { id: TrackingType; label: string }[] = [
  { id: "weight_reps", label: "Weight × reps" },
  { id: "bodyweight", label: "Bodyweight reps" },
  { id: "duration", label: "Duration (hold/plank)" },
  { id: "cardio", label: "Cardio (time/distance)" },
];

interface ExerciseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exercise?: ExerciseData | null;
}

export function ExerciseFormDialog({ isOpen, onClose, exercise }: ExerciseFormDialogProps) {
  const isEditing = !!exercise;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name ?? "",
      muscleGroup: exercise?.muscleGroup ?? "",
      equipment: exercise?.equipment ?? "",
      trackingType: exercise?.trackingType ?? "weight_reps",
      notes: exercise?.notes ?? "",
      archived: exercise?.archived ?? false,
    },
  });

  const onSubmit = (data: ExerciseFormData) => {
    startTransition(async () => {
      const result = await upsertExerciseAction({
        id: exercise?.id,
        name: data.name.trim(),
        muscleGroup: data.muscleGroup?.trim() || null,
        equipment: data.equipment?.trim() || null,
        trackingType: data.trackingType ?? "weight_reps",
        notes: data.notes?.trim() || null,
        archived: data.archived ?? false,
      });
      if (result.success) {
        toast.success(isEditing ? "Exercise updated" : "Exercise created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save exercise");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Exercise" : "New Exercise"}
      description="Add a reusable exercise to your library."
      footer={
        <div >
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} >
        <FormField label="Exercise name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. Barbell squat" autoFocus />
        </FormField>

        <FormField label="Tracking type">
          <Controller
            name="trackingType"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value ?? "weight_reps"}
                onChange={field.onChange}
                options={TRACKING_OPTIONS}
              />
            )}
          />
        </FormField>

        <FormField label="Muscle group (optional)">
          <Input {...register("muscleGroup")} placeholder="e.g. Quads, Chest, Back" />
        </FormField>

        <FormField label="Equipment (optional)">
          <Input {...register("equipment")} placeholder="e.g. Barbell, Dumbbell, Bodyweight" />
        </FormField>

        <FormField label="Notes (optional)">
          <Input {...register("notes")} placeholder="Cues, technique reminders..." />
        </FormField>

        {isEditing && (
          <label >
            <Checkbox

              {...register("archived")}

            />
            <div >
              <span >Archive Exercise</span>
              <span >
                Hide from the library without deleting
              </span>
            </div>
          </label>
        )}
      </form>
    </Dialog>
  );
}
