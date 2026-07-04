"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { trainingDaySchema, type TrainingDayFormData } from "../schemas";
import { upsertTrainingDayAction } from "../actions/training-plan-actions";
import type { TrainingDayData } from "../types";

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
  const [isPending, startTransition] = useTransition();

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
    startTransition(async () => {
      const result = await upsertTrainingDayAction({
        id: day?.id,
        planId,
        name: data.name.trim(),
        notes: data.notes?.trim() || null,
      });
      if (result.success) {
        toast.success(isEditing ? "Day updated" : "Day created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save day");
      }
    });
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
