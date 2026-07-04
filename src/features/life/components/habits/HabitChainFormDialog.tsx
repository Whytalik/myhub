"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
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
          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface/50 cursor-pointer hover:bg-raised transition-colors">
            <input
              type="checkbox"
              {...register("archived")}
              className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-bg"
            />
            <div className="flex flex-col">
              <span className="text-note font-bold text-text">Archive Chain</span>
              <span className="text-label text-muted font-mono uppercase tracking-tight">
                Hide from active list without deleting
              </span>
            </div>
          </label>
        )}
      </form>
    </Dialog>
  );
}
