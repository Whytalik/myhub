"use client";
import { Checkbox } from "@/components/ui/inputs/checkbox";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { upsertHabitChainAction } from "@/features/life/actions/habit-chain-actions";
import { habitChainSchema, type HabitChainFormData } from "@/features/life/schemas";
import type { HabitChainData } from "@/features/life/types";
import { toast } from "sonner";

interface HabitChainFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chain?: HabitChainData | null;
}

export function HabitChainFormDialog({ isOpen, onClose, chain }: HabitChainFormDialogProps) {
  const isEditing = !!chain;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitChainFormData>({
    resolver: zodResolver(habitChainSchema),
    defaultValues: {
      name: chain?.name ?? "",
      description: chain?.description ?? "",
      archived: chain?.archived ?? false,
    },
  });

  const onSubmit = (data: HabitChainFormData) => {
    startTransition(async () => {
      const result = await upsertHabitChainAction({
        id: chain?.id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        archived: data.archived ?? false,
      });
      if (result.success) {
        toast.success(isEditing ? "Chain updated" : "Chain created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save chain");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Chain" : "New Chain"}
      description="Stack habits into a named ritual — after one, the next follows."
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
        <FormField label="Chain name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. Morning ritual" autoFocus />
        </FormField>

        <FormField label="Description (optional)" hint="What is this chain for?">
          <Input
            {...register("description")}
            placeholder="e.g. The sequence that gets me out the door on time"
          />
        </FormField>

        {isEditing && (
          <label >
            <Checkbox

              {...register("archived")}

            />
            <div >
              <span >Archive Chain</span>
              <span >
                Hide from active list without deleting
              </span>
            </div>
          </label>
        )}
      </form>
    </Dialog>
  );
}
