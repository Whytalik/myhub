"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { trainingPlanSchema, type TrainingPlanFormData } from "../schemas";
import { upsertTrainingPlanAction } from "../actions/training-plan-actions";
import type { TrainingPlanData } from "../types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface TrainingPlanFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: TrainingPlanData | null;
}

export function TrainingPlanFormDialog({ isOpen, onClose, plan }: TrainingPlanFormDialogProps) {
  const isEditing = !!plan;
  const { run, isPending } = useServerAction();

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
    run(
      upsertTrainingPlanAction({
        id: plan?.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        archived: data.archived ?? false,
      }),
      {
        successMessage: isEditing ? "Plan updated" : "Plan created",
        errorMessage: "Failed to save plan",
        onSuccess: onClose,
      },
    );
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
