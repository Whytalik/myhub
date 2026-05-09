"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SPHERE_ICON_NAMES, ALL_ICONS } from "./lucide-icons-map";
import { upsertSphereAction } from "@/features/life/actions/task-actions";
import { IconPickerDialog } from "./IconPickerDialog";
import { sphereSchema, type SphereFormData } from "@/features/life/schemas";
import type { LifeSphereData } from "@/features/life/types";
import { toast } from "sonner";
import { Pencil, Palette } from "lucide-react";
import { useState } from "react";

interface SphereFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sphere?: LifeSphereData | null;
}

export function SphereFormDialog({ isOpen, onClose, sphere }: SphereFormDialogProps) {
  const isEditing = !!sphere;
  const [isPending, startTransition] = useTransition();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<SphereFormData>({
    resolver: zodResolver(sphereSchema),
    defaultValues: {
      name: sphere?.name ?? "",
      color: sphere?.color ?? "#6fbfbf",
      icon: sphere?.icon ?? SPHERE_ICON_NAMES[0],
    },
  });

  const color = watch("color");
  const icon = watch("icon");
  const name = watch("name");

  const onSubmit = (data: SphereFormData) => {
    startTransition(async () => {
      const result = await upsertSphereAction({
        id: sphere?.id,
        name: data.name.trim(),
        color: data.color,
        icon: data.icon,
      });
      if (result.success) {
        toast.success(isEditing ? "Sphere updated" : "Sphere created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save sphere");
      }
    });
  };

  return (
    <Dialog
      key={sphere?.id ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Sphere" : "New Life Sphere"}
      description="Define an area of your life"
      maxWidth="450px"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="sphere-form"
            variant="primary"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Sphere"}
          </Button>
        </>
      }
    >
      <form id="sphere-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField label="Name" error={errors.name?.message} required>
          <Input
            {...register("name")}
            placeholder="e.g. Work, Health, Personal..."
            autoFocus
            className="text-sm font-bold h-9 px-4 rounded-xl"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Color" error={errors.color?.message}>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3 p-3 bg-surface/50 border border-border rounded-xl">
                  <input
                    type="color"
                    value={field.value}
                    onChange={field.onChange}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-note font-mono text-secondary uppercase">{field.value}</span>
                </div>
              )}
            />
          </FormField>

          <FormField label="Icon" error={errors.icon?.message}>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(true)}
                    className="flex items-center gap-3 p-3 bg-surface/50 border border-border rounded-xl hover:border-accent transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                      {ALL_ICONS[field.value] ? (() => {
                        const Icon = ALL_ICONS[field.value];
                        return <Icon size={18} style={{ color }} />;
                      })() : <Palette size={18} className="text-muted" />}
                    </div>
                    <Pencil size={12} className="text-muted group-hover:text-accent transition-colors" />
                  </button>
                  <IconPickerDialog
                    isOpen={iconPickerOpen}
                    onClose={() => setIconPickerOpen(false)}
                    value={field.value}
                    onChange={(val) => { if (val) field.onChange(val); }}
                    color={color}
                    title="Sphere Icon"
                  />
                </>
              )}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-caption font-mono uppercase tracking-wider text-muted px-1 text-center">Preview</label>
          <div
            className="flex items-center gap-4 p-5 rounded-2xl border transition-all"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-black/20"
              style={{ backgroundColor: `${color}25` }}
            >
              {ALL_ICONS[icon] && (() => {
                const Icon = ALL_ICONS[icon];
                return <Icon size={24} style={{ color }} />;
              })()}
            </div>
            <div>
              <p className="text-[17px] font-black text-text leading-tight tracking-tight">
                {name || "Sphere name"}
              </p>
              <p className="text-caption font-mono text-muted uppercase tracking-[0.2em] mt-1">Life Area</p>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
