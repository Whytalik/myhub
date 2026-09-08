"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { trainingDaySchema, type TrainingDayFormData } from "../schemas";
import { upsertTrainingDayAction } from "../actions/training-plan-actions";
import type { TrainingDayData } from "../types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface TrainingDayFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  day?: TrainingDayData | null;
}

export function TrainingDayFormDialog({
  isOpen,
  onClose,
  planId,
  day,
}: TrainingDayFormDialogProps) {
  const isEditing = !!day;
  const { run, isPending } = useServerAction();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainingDayFormData>({
    resolver: zodResolver(trainingDaySchema),
    defaultValues: {
      planId,
      name: day?.name ?? "",
      notes: day?.notes ?? "",
    },
  });

  const onSubmit = (data: TrainingDayFormData) => {
    run(
      upsertTrainingDayAction({
        id: day?.id,
        planId,
        name: data.name.trim(),
        notes: data.notes?.trim() || null,
      }),
      {
        successMessage: isEditing ? "Day updated" : "Day created",
        errorMessage: "Failed to save day",
        onSuccess: onClose,
      },
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Training Day" : "New Training Day"}
      description="A day is a workout template (e.g. Push A) — add exercises to it next."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField label="Day name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. Push A" autoFocus />
        </FormField>

        <FormField label="Notes (optional)">
          <Input {...register("notes")} placeholder="e.g. Focus on chest, moderate volume" />
        </FormField>
      </form>
    </Dialog>
  );
}
