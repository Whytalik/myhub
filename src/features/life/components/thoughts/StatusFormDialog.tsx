"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { upsertStatusAction } from "@/features/life/actions/thought-actions";
import { thoughtStatusSchema, type ThoughtStatusFormData } from "@/features/life/schemas";
import type { ThoughtStatusData } from "@/features/life/types";
import { toast } from "sonner";

interface StatusFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status?: ThoughtStatusData | null;
}

export function StatusFormDialog({ isOpen, onClose, status }: StatusFormDialogProps) {
  const isEditing = !!status;
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ThoughtStatusFormData>({
    resolver: zodResolver(thoughtStatusSchema),
    defaultValues: {
      name: status?.name ?? "",
      color: status?.color ?? "#6fbfbf",
    },
  });

  const onSubmit = (data: ThoughtStatusFormData) => {
    startTransition(async () => {
      const result = await upsertStatusAction({
        id: status?.id,
        name: data.name.trim(),
        color: data.color,
      });
      if (result.success) {
        toast.success(isEditing ? "Status updated" : "Status created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save status");
      }
    });
  };

  return (
    <Dialog
      key={status?.id ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Rename status" : "New status"}
      description="A column on the Thoughts board"
      maxWidth="400px"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="thought-status-form"
            variant="primary"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create"}
          </Button>
        </>
      }
    >
      <form
        id="thought-status-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <FormField label="Name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. In Progress" autoFocus />
        </FormField>

        <FormField label="Color" error={errors.color?.message}>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div className="glass-input flex items-center gap-2 px-3 py-2">
                <input
                  type="color"
                  value={field.value}
                  onChange={field.onChange}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                />
                <span className="text-sm font-mono text-zinc-300 uppercase">{field.value}</span>
              </div>
            )}
          />
        </FormField>
      </form>
    </Dialog>
  );
}
