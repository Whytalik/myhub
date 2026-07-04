"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
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

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SphereFormData>({
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
          <Button type="submit" form="sphere-form" variant="primary" size="sm" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Sphere"}
          </Button>
        </>
      }
    >
      <form id="sphere-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField label="Name" error={errors.name?.message} required>
          <Input {...register("name")} placeholder="e.g. Work, Health, Personal..." autoFocus />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
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

          <FormField label="Icon" error={errors.icon?.message}>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(true)}
                    className="glass-input flex items-center justify-between gap-2 w-full px-3 py-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-center text-zinc-300">
                      {ALL_ICONS[field.value] ? (
                        (() => {
                          const Icon = ALL_ICONS[field.value];
                          return <Icon size={18} />;
                        })()
                      ) : (
                        <Palette size={18} />
                      )}
                    </div>
                    <Pencil size={12} className="text-zinc-500" />
                  </button>
                  <IconPickerDialog
                    isOpen={iconPickerOpen}
                    onClose={() => setIconPickerOpen(false)}
                    value={field.value}
                    onChange={(val) => {
                      if (val) field.onChange(val);
                    }}
                    color={color}
                    title="Sphere Icon"
                  />
                </>
              )}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-label">Preview</label>
          <div className="glass-card p-3 flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
              style={{ backgroundColor: `${color}1a`, color }}
            >
              {ALL_ICONS[icon] &&
                (() => {
                  const Icon = ALL_ICONS[icon];
                  return <Icon size={24} />;
                })()}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-100">{name || "Sphere name"}</p>
              <p className="text-caption">Life Area</p>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
