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
import type { HabitData, LifeSphereData, SphereLevel } from "@/features/life/types";
import { toast } from "sonner";
import { Anchor, Zap, PartyPopper, Bell, X, Sprout, ShieldOff } from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";

const LEVEL_OPTIONS: { value: SphereLevel; label: string; description: string; color: string; border: string }[] = [
  { value: "MINIMUM",  label: "Min",     description: "Floor — never skip",     color: "text-rose-500",    border: "border-rose-500/40 bg-rose-500/5" },
  { value: "MEDIUM",   label: "Medium",  description: "Baseline steady rhythm", color: "text-amber-500",   border: "border-amber-500/40 bg-amber-500/5" },
  { value: "DESIRED",  label: "Desired", description: "Optimal, full effort",   color: "text-emerald-500", border: "border-emerald-500/40 bg-emerald-500/5" },
];

interface HabitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: HabitData | null;
  spheres?: LifeSphereData[];
}

export function HabitFormDialog({ isOpen, onClose, habit, spheres = [] }: HabitFormDialogProps) {
  const isEditing = !!habit;
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: habit?.name ?? "",
      type: (habit?.type as "positive" | "avoidance") ?? "positive",
      anchor: habit?.anchor ?? "",
      action: habit?.action ?? "",
      celebration: habit?.celebration ?? "",
      reminderTime: habit?.reminderTime ?? "",
      archived: habit?.archived ?? false,
      sphereId: habit?.sphereId ?? null,
      sphereLevel: (habit?.sphereLevel as SphereLevel) ?? null,
    },
  });

  const reminderTime = watch("reminderTime");
  const habitType = watch("type");
  const selectedSphereId = watch("sphereId");
  const selectedLevel = watch("sphereLevel");
  const isAvoidance = habitType === "avoidance";

  const onSubmit = (data: HabitFormData) => {
    startTransition(async () => {
      const result = await upsertHabitAction({
        id: habit?.id,
        name: data.name.trim(),
        type: data.type,
        anchor: data.anchor?.trim() || "",
        action: data.action?.trim() || "",
        celebration: data.celebration?.trim() || null,
        reminderTime: data.reminderTime || null,
        archived: data.archived ?? false,
        sphereId: data.sphereId ?? null,
        sphereLevel: (data.sphereLevel as SphereLevel) ?? null,
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
      description={
        isAvoidance
          ? "Define what you want to avoid. Track daily resistance to build the streak."
          : "Define your habit using the Tiny Habits methodology: After I [Anchor], I will [Action]."
      }
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
        {/* Type toggle */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-raised rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setValue("type", "positive")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-note font-mono font-bold tracking-wide transition-all ${
                !isAvoidance
                  ? "bg-surface border border-emerald-500/30 text-emerald-600 shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Sprout size={14} />
              Build
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "avoidance")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-note font-mono font-bold tracking-wide transition-all ${
                isAvoidance
                  ? "bg-surface border border-amber-500/30 text-amber-600 shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <ShieldOff size={14} />
              Break
            </button>
          </div>
        )}

        <FormField label="Habit name" error={errors.name?.message} required>
          <Input
            {...register("name")}
            placeholder={isAvoidance ? "e.g. No liquid calories" : "e.g. Morning pushups"}
            autoFocus
          />
        </FormField>

        {/* Sphere selector */}
        {spheres.length > 0 && (
          <Controller
            name="sphereId"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-caption font-mono uppercase text-muted tracking-widest">Life Sphere (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {spheres.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const next = field.value === s.id ? null : s.id;
                        field.onChange(next);
                        if (!next) setValue("sphereLevel", null);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        field.value === s.id
                          ? "border-transparent text-white"
                          : "border-border text-muted bg-surface hover:opacity-80"
                      }`}
                      style={field.value === s.id ? { backgroundColor: s.color } : {}}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        )}

        {/* Sphere level selector — only when sphere is selected */}
        {selectedSphereId && (
          <Controller
            name="sphereLevel"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-caption font-mono uppercase text-muted tracking-widest">Sphere Standard Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {LEVEL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(field.value === opt.value ? null : opt.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                        selectedLevel === opt.value
                          ? opt.border
                          : "border-border bg-surface hover:bg-raised"
                      }`}
                    >
                      <span className={`text-note font-bold font-mono ${selectedLevel === opt.value ? opt.color : "text-text"}`}>
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-muted leading-tight">{opt.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        )}

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
          {isAvoidance ? (
            <>
              <FormField label="Trigger (optional)" hint="When do you usually slip?" error={errors.anchor?.message}>
                <div className="flex items-center gap-2 mb-1">
                  <Anchor size={14} className="text-accent" />
                </div>
                <Input {...register("anchor")} placeholder="e.g. After lunch when I'm tired..." />
              </FormField>

              <FormField label="Replacement (optional)" hint="What will you do instead?" error={errors.action?.message}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-amber-500" />
                </div>
                <Input {...register("action")} placeholder="e.g. I will drink sparkling water..." />
              </FormField>
            </>
          ) : (
            <>
              <FormField label="The Anchor (Trigger)" error={errors.anchor?.message} required>
                <div className="flex items-center gap-2 mb-1">
                  <Anchor size={14} className="text-accent" />
                </div>
                <Input {...register("anchor")} placeholder="After I [wash my face]..." />
              </FormField>

              <FormField label="The Action (New habit)" error={errors.action?.message} required>
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-amber-500" />
                </div>
                <Input {...register("action")} placeholder="I will [do 5 pushups]..." />
              </FormField>
            </>
          )}

          <FormField label="Celebration" hint="Optional — what reward follows?">
            <div className="flex items-center gap-2 mb-1">
              <PartyPopper size={14} className="text-emerald-500" />
            </div>
            <Input
              {...register("celebration")}
              placeholder={isAvoidance ? "And then I will [say 'Still clean!']" : "And then I will [say 'Good job!']"}
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
                  <TimePicker value={field.value ?? ""} onChange={field.onChange} className="w-full" />
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
