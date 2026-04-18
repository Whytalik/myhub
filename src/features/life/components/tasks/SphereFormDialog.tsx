"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SPHERE_ICON_NAMES, ALL_ICONS } from "./lucide-icons-map";
import { upsertSphereAction } from "@/features/life/actions/task-actions";
import { IconPickerDialog } from "./IconPickerDialog";
import type { LifeSphereData } from "@/features/life/types";
import { toast } from "sonner";
import { Pencil, Palette } from "lucide-react";

interface SphereFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sphere?: LifeSphereData | null;
}

export function SphereFormDialog({
  isOpen,
  onClose,
  sphere,
}: SphereFormDialogProps) {
  const isEditing = !!sphere;
  const [isPending, startTransition] = useTransition();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [name, setName]   = useState(sphere?.name ?? "");
  const [color, setColor] = useState(sphere?.color ?? "#6fbfbf");
  const [icon, setIcon]   = useState(sphere?.icon ?? SPHERE_ICON_NAMES[0]);

  // Reset form when dialog opens with new data
  const handleClose = () => {
    if (!isEditing) {
      setName("");
      setColor("#6fbfbf");
      setIcon(SPHERE_ICON_NAMES[0]);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      try {
        await upsertSphereAction({
          id: sphere?.id,
          name: name.trim(),
          color,
          icon,
        });
        toast.success(isEditing ? "Sphere updated" : "Sphere created");
        handleClose();
      } catch {
        toast.error("Failed to save sphere");
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Sphere" : "New Life Sphere"}
      description="Define an area of your life"
      maxWidth="450px"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="sphere-form"
            variant="primary"
            size="sm"
            disabled={isPending || !name.trim()}
          >
            {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Sphere"}
          </Button>
        </>
      }
    >
      <form id="sphere-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work, Health, Personal..."
            autoFocus
            required
            className="text-lg font-bold h-12 px-4 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
           {/* Color */}
           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Color</label>
             <div className="flex items-center gap-3 p-3 bg-surface/50 border border-border rounded-xl">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                />
                <span className="text-[11px] font-mono text-secondary uppercase">{color}</span>
             </div>
           </div>

           {/* Icon Trigger */}
           <div className="flex flex-col gap-1.5">
             <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Icon</label>
             <button
               type="button"
               onClick={() => setIconPickerOpen(true)}
               className="flex items-center gap-3 p-3 bg-surface/50 border border-border rounded-xl hover:border-accent transition-all group"
             >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                   {ALL_ICONS[icon] ? (() => {
                     const Icon = ALL_ICONS[icon];
                     return <Icon size={18} style={{ color }} />;
                   })() : <Palette size={18} className="text-muted" />}
                </div>
                <Pencil size={12} className="text-muted group-hover:text-accent transition-colors" />
             </button>
           </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-2">
           <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1 text-center">Preview</label>
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
              <p className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mt-1">Life Area</p>
            </div>
          </div>
        </div>

        <IconPickerDialog 
          isOpen={iconPickerOpen}
          onClose={() => setIconPickerOpen(false)}
          value={icon}
          onChange={(val) => { if (val) setIcon(val); }}
          color={color}
          title="Sphere Icon"
        />
      </form>
    </Dialog>
  );
}
