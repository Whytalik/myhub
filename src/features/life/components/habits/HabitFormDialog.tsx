"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { upsertHabitAction } from "@/features/life/actions/habit-actions";
import { habitSchema, type HabitFormData } from "@/features/life/schemas";
import type { HabitData } from "@/features/life/types";
import { toast } from "sonner";
import { Anchor, Zap, PartyPopper, Bell, X } from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";

interface HabitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: HabitData | null;
}

export function HabitFormDialog({ isOpen, onClose, habit }: HabitFormDialogProps) {
  const isEditing = !!habit;
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name ?? "",
      anchor: habit?.anchor ?? "",
      action: habit?.action ?? "",
      celebration: habit?.celebration ?? "",
      reminderTime: habit?.reminderTime ?? "",
      archived: habit?.archived ?? false,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const reminderTime = watch("reminderTime");

  const onSubmit = (data: HabitFormData) => {
    startTransition(async () => {
      const result = await upsertHabitAction({
        id: habit?.id,
        name: data.name.trim(),
        anchor: data.anchor.trim(),
        action: data.action.trim(),
        celebration: data.celebration?.trim() || null,
        reminderTime: data.reminderTime || null,
        archived: data.archived ?? false,
      });
      if (result.success) {
        toast.success(isEditing ? "Habit updated" : "Habit created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save habit");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Habit" : "New Habit"}
      description="Define your habit using the Tiny Habits methodology: After I [Anchor], I will [Action]."
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
        <FormField label="Habit name" error={errors.name?.message} required>
          <Input
            {...register("name")}
            placeholder="e.g. Morning pushups"
            autoFocus
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
              <span className="text-note font-bold text-text">Archive Habit</span>
              <span className="text-label text-muted font-mono uppercase tracking-tight">Hide from active list without deleting</span>
            </div>
          </label>
        )}

        <div className="grid grid-cols-1 gap-4">
          <FormField
            label="The Anchor (Trigger)"
            error={errors.anchor?.message}
            required
          >
            <div className="flex items-center gap-2 mb-1">
              <Anchor size={14} className="text-accent" />
            </div>
            <Input
              {...register("anchor")}
              placeholder="After I [wash my face]..."
            />
          </FormField>

          <FormField
            label="The Action (New habit)"
            error={errors.action?.message}
            required
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-amber-500" />
            </div>
            <Input
              {...register("action")}
              placeholder="I will [do 5 pushups]..."
            />
          </FormField>

          <FormField label="Celebration" hint="Optional — what reward follows?">
            <div className="flex items-center gap-2 mb-1">
              <PartyPopper size={14} className="text-emerald-500" />
            </div>
            <Input
              {...register("celebration")}
              placeholder="And then I will [say 'Good job!']"
            />
          </FormField>

          <FormField label="Daily Reminder" hint="Optional">
            <div className="flex items-center justify-between mb-1">
              <Bell size={14} className="text-blue-500" />
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => setValue("reminderTime", "")}
                  className="text-label font-mono text-muted hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Controller
                name="reminderTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="w-full"
                  />
                )}
              />
              {!reminderTime && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <span className="text-label text-muted font-mono uppercase">Auto (3x day)</span>
                </div>
              )}
            </div>
          </FormField>
        </div>
      </form>
    </Dialog>
  );
}
