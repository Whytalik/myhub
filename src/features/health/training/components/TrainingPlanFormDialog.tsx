"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { trainingPlanSchema, type TrainingPlanFormData } from "../schemas";
import { upsertTrainingPlanAction } from "../actions/training-plan-actions";
import type { TrainingPlanData } from "../types";

interface TrainingPlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: TrainingPlanData | null;
}

export function TrainingPlanFormDialog({ isOpen, onClose, plan }: TrainingPlanFormDialogProps) {
  const isEditing = !!plan;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainingPlanFormData>({
    resolver: zodResolver(trainingPlanSchema),
    defaultValues: {
      name: plan?.name ?? "",
      description: plan?.description ?? "",
      archived: plan?.archived ?? false,
    },
  });

  const onSubmit = (data: TrainingPlanFormData) => {
    startTransition(async () => {
      const result = await upsertTrainingPlanAction({
        id: plan?.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        archived: data.archived ?? false,
      });
      if (result.success) {
        toast.success(isEditing ? "Plan updated" : "Plan created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save plan");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Plan" : "New Training Plan"}
      description="A plan groups training days together (e.g. Push / Pull / Legs)."
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
        <FormField label="Plan name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. Push Pull Legs" autoFocus />
        </FormField>

        <FormField label="Description (optional)">
          <Input {...register("description")} placeholder="e.g. 6-day split, hypertrophy focus" />
        </FormField>
      </form>
    </Dialog>
  );
}
