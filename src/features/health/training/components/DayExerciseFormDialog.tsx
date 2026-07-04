"use client";

import { useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { CustomSelect } from "@/components/ui/custom-select";
import { toast } from "sonner";
import { dayExerciseSchema, type DayExerciseFormData } from "../schemas";
import { upsertDayExerciseAction } from "../actions/training-plan-actions";
import type { ExerciseData, TrainingDayExerciseData } from "../types";

interface DayExerciseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  exercises: ExerciseData[];
  dayExercise?: TrainingDayExerciseData | null;
}

export function DayExerciseFormDialog({
  isOpen,
  onClose,
  dayId,
  exercises,
  dayExercise,
}: DayExerciseFormDialogProps) {
  const isEditing = !!dayExercise;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DayExerciseFormData>({
    resolver: zodResolver(dayExerciseSchema),
    defaultValues: {
      dayId,
      exerciseId: dayExercise?.exerciseId ?? "",
      sets: dayExercise?.sets ?? 3,
      targetReps: dayExercise?.targetReps ?? undefined,
      targetWeight: dayExercise?.targetWeight ?? undefined,
      targetRpe: dayExercise?.targetRpe ?? undefined,
      restSeconds: dayExercise?.restSeconds ?? undefined,
      targetDurationSeconds: dayExercise?.targetDurationSeconds ?? undefined,
      targetDistanceMeters: dayExercise?.targetDistanceMeters ?? undefined,
      notes: dayExercise?.notes ?? "",
    },
  });

  const selectedExerciseId = useWatch({ control, name: "exerciseId" });
  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);
  const showDurationFields =
    selectedExercise?.trackingType === "duration" || selectedExercise?.trackingType === "cardio";
  const showReps =
    selectedExercise?.trackingType !== "duration" && selectedExercise?.trackingType !== "cardio";

  const onSubmit = (data: DayExerciseFormData) => {
    startTransition(async () => {
      const result = await upsertDayExerciseAction({
        id: dayExercise?.id,
        dayId,
        exerciseId: data.exerciseId,
        sets: data.sets ?? 3,
        targetReps: showReps ? (data.targetReps ?? null) : null,
        targetWeight: data.targetWeight ?? null,
        targetRpe: data.targetRpe ?? null,
        restSeconds: data.restSeconds ?? null,
        targetDurationSeconds: showDurationFields ? (data.targetDurationSeconds ?? null) : null,
        targetDistanceMeters: showDurationFields ? (data.targetDistanceMeters ?? null) : null,
        notes: data.notes?.trim() || null,
      });
      if (result.success) {
        toast.success(isEditing ? "Prescription updated" : "Exercise added to day");
        onClose();
      } else {
        toast.error(result.error || "Failed to save");
      }
    });
  };

  if (exercises.length === 0) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="No exercises yet"
        description="Add an exercise to your library first, then come back to prescribe it here."
        footer={
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        }
      >
        <div />
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Prescription" : "Add Exercise to Day"}
      description="Set the sets/reps/weight target for this exercise in this day."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Add"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Exercise" error={errors.exerciseId?.message} required>
          <Controller
            name="exerciseId"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={field.onChange}
                options={exercises.map((e) => ({ id: e.id, label: e.name }))}
                placeholder="Pick an exercise"
                disabled={isEditing}
              />
            )}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Sets">
            <Input type="number" min={1} max={20} {...register("sets", { valueAsNumber: true })} />
          </FormField>
          {showReps ? (
            <FormField label="Target reps">
              <Input
                type="number"
                min={0}
                {...register("targetReps", { valueAsNumber: true })}
                placeholder="e.g. 10"
              />
            </FormField>
          ) : (
            <FormField label="Target duration (sec)">
              <Input
                type="number"
                min={0}
                {...register("targetDurationSeconds", { valueAsNumber: true })}
                placeholder="e.g. 60"
              />
            </FormField>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={showDurationFields ? "Target distance (m)" : "Target weight (kg)"}>
            <Input
              type="number"
              step="0.5"
              min={0}
              {...register(showDurationFields ? "targetDistanceMeters" : "targetWeight", {
                valueAsNumber: true,
              })}
              placeholder={showDurationFields ? "e.g. 1000" : "e.g. 50"}
            />
          </FormField>
          <FormField label="Target RPE (1-10)">
            <Input
              type="number"
              step="0.5"
              min={1}
              max={10}
              {...register("targetRpe", { valueAsNumber: true })}
              placeholder="e.g. 8"
            />
          </FormField>
        </div>

        <FormField label="Rest between sets (sec)">
          <Input
            type="number"
            min={0}
            {...register("restSeconds", { valueAsNumber: true })}
            placeholder="e.g. 90"
          />
        </FormField>

        <FormField label="Notes (optional)">
          <Input {...register("notes")} placeholder="Technique cues, tempo..." />
        </FormField>
      </form>
    </Dialog>
  );
}
