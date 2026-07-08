"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { upsertHabitAction } from "@/features/life/actions/habit-actions";
import { habitSchema, type HabitFormData } from "@/features/life/schemas";
import type { HabitData, HabitChainData, LifeSphereData } from "@/features/life/types";
import { WEEKDAY_ORDER, WEEKDAY_LABELS } from "@/features/life/logic/habit-utils";
import { toast } from "sonner";
import {
  Anchor,
  Zap,
  PartyPopper,
  Sprout,
  ShieldOff,
  Link2,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Gauge,
  Settings2,
} from "lucide-react";

const BEHAVIOR_FIELDS: {
  name: "identityStatement" | "minimalThreshold";
  label: string;
  hint: string;
  placeholder: string;
  icon: typeof Fingerprint;
}[] = [
  {
    name: "identityStatement",
    label: "Identity statement",
    hint: "Frame it as who you are, not what you want",
    placeholder: "e.g. I am someone who trains",
    icon: Fingerprint,
  },
  {
    name: "minimalThreshold",
    label: "Minimal threshold",
    hint: "The smallest version that still counts",
    placeholder: "e.g. Just one page",
    icon: Gauge,
  },
];

interface HabitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: HabitData | null;
  spheres?: LifeSphereData[];
  chains?: HabitChainData[];
}

export function HabitFormDialog({
  isOpen,
  onClose,
  habit,
  spheres = [],
  chains = [],
}: HabitFormDialogProps) {
  const isEditing = !!habit;
  const [isPending, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(
    !!(habit?.sphereId || habit?.chainId),
  );
  const [showBehaviorDesign, setShowBehaviorDesign] = useState(
    !!(habit?.identityStatement || habit?.minimalThreshold),
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      type: (habit?.type as "positive" | "avoidance") ?? "positive",
      anchor: habit?.anchor ?? "",
      action: habit?.action ?? "",
      celebration: habit?.celebration ?? "",
      archived: habit?.archived ?? false,
      scheduledWeekdays: habit?.scheduledWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
      sphereId: habit?.sphereId ?? null,
      chainId: habit?.chainId ?? null,
      identityStatement: habit?.identityStatement ?? "",
      minimalThreshold: habit?.minimalThreshold ?? "",
    },
  });

  const habitType = useWatch({ control, name: "type" });
  const selectedSphereId = useWatch({ control, name: "sphereId" });
  const isAvoidance = habitType === "avoidance";

  const onSubmit = (data: HabitFormData) => {
    startTransition(async () => {
      const result = await upsertHabitAction({
        id: habit?.id,
        type: data.type,
        anchor: data.anchor?.trim() || "",
        action: data.action?.trim() || "",
        celebration: data.celebration?.trim() || null,
        archived: data.archived ?? false,
        scheduledWeekdays: data.scheduledWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
        sphereId: data.sphereId ?? null,
        chainId: data.chainId ?? null,
        identityStatement: data.identityStatement?.trim() || null,
        minimalThreshold: data.minimalThreshold?.trim() || null,
      });
      if (result.success) {
        toast.success(isEditing ? "Habit updated" : "Habit created");
        onClose();
      } else {
        toast.error(result.error || "Failed to save habit");
      }
    });
  };

  const dialogDescription = isAvoidance
    ? "Define what you want to avoid. Track daily resistance to build the streak."
    : "Define your habit: After [Anchor], I will [Action].";
  const typeButtonBaseClass =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150";
  const buildButtonClass = `${typeButtonBaseClass} ${
    habitType === "positive"
      ? "bg-emerald-500 text-white"
      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
  }`;
  const breakButtonClass = `${typeButtonBaseClass} ${
    habitType === "avoidance"
      ? "bg-amber-500 text-white"
      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
  }`;
  const chipBaseClass =
    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150";
  const inactiveChipClass =
    "text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/5";
  const activeChipClass = "bg-accent/15 text-accent border-accent/30";
  const iconInputWrapClass = "glass-input flex items-center gap-2 px-3";
  const advancedActive = showAdvanced || showBehaviorDesign;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Habit" : "New Habit"}
      description={dialogDescription}
      maxWidth="600px"
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
        {/* Type toggle */}
        {!isEditing && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
            <button
              type="button"
              onClick={() => setValue("type", "positive")}
              className={buildButtonClass}
            >
              <Sprout size={14} />
              Build
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "avoidance")}
              className={breakButtonClass}
            >
              <ShieldOff size={14} />
              Break
            </button>
          </div>
        )}

        {/* Recipe card */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <span className="text-label">{isAvoidance ? "Avoidance plan" : "Tiny Habits Recipe"}</span>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">{isAvoidance ? "🚫 Trigger" : "🔗 After"}</span>
            <div className={iconInputWrapClass}>
              <Anchor size={14} className="text-zinc-500 shrink-0" />
              <Input
                {...register("anchor")}
                placeholder={isAvoidance ? "After lunch when I'm tired..." : "After [wash my face]..."}
                variant="inline"
                className="flex-1"
                autoFocus
              />
            </div>
            {errors.anchor && (
              <span className="text-xs text-rose-400">{errors.anchor.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">
              {isAvoidance ? "🔄 Instead, I will" : "⚡ I will"}
            </span>
            <div className={iconInputWrapClass}>
              <Zap size={14} className="text-zinc-500 shrink-0" />
              <Input
                {...register("action")}
                placeholder={isAvoidance ? "Drink sparkling water..." : "I will [do 5 pushups]..."}
                variant="inline"
                className="flex-1"
              />
            </div>
            {errors.action && (
              <span className="text-xs text-rose-400">{errors.action.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-400">🎉 Celebrate</span>
            <div className={iconInputWrapClass}>
              <PartyPopper size={14} className="text-zinc-500 shrink-0" />
              <Input
                {...register("celebration")}
                placeholder={isAvoidance ? "Say 'Still clean!'" : "Say 'Good job!'"}
                variant="inline"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Frequency */}
        <Controller
          name="scheduledWeekdays"
          control={control}
          render={({ field }) => {
            const selected: number[] = field.value ?? [];
            const isEveryDay = selected.length === 7;
            const frequencyLabel = isEveryDay
              ? "Щодня"
              : selected.length === 0
                ? "Оберіть хоча б один день"
                : `${selected.length}× на тиждень`;

            const toggleDay = (day: number) => {
              const next = selected.includes(day)
                ? selected.filter((d) => d !== day)
                : [...selected, day];
              field.onChange(next);
            };

            return (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-label">Частота</span>
                  <div className="flex items-center gap-2">
                    <span className="text-caption">{frequencyLabel}</span>
                    {!isEveryDay && (
                      <button
                        type="button"
                        onClick={() => field.onChange([0, 1, 2, 3, 4, 5, 6])}
                        className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
                      >
                        Щодня
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {WEEKDAY_ORDER.map((day) => {
                    const isSelected = selected.includes(day);
                    const dayButtonClass = `flex-1 h-8 rounded-lg text-xs font-mono font-semibold transition-colors duration-150 ${
                      isSelected
                        ? "bg-accent text-white"
                        : "bg-white/[0.03] text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                    }`;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={dayButtonClass}
                      >
                        {WEEKDAY_LABELS[day]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }}
        />

        {/* Advanced section */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="flex items-center justify-between text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings2 size={14} className="text-zinc-500" />
              Advanced
            </div>
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showAdvanced && (
            <div className="flex flex-col gap-4">
              {spheres.length > 0 && (
                <Controller
                  name="sphereId"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-label">Life Sphere</span>
                      <div className="flex flex-wrap gap-2">
                        {spheres.map((s) => {
                          const isSelected = field.value === s.id;
                          const chipClass = `${chipBaseClass} ${isSelected ? activeChipClass : inactiveChipClass}`;

                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                field.onChange(field.value === s.id ? null : s.id);
                              }}
                              className={chipClass}
                            >
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                />
              )}

              {chains.length > 0 && (
                <Controller
                  name="chainId"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-label flex items-center gap-1.5">
                        <Link2 size={12} />
                        Habit Chain
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {chains.map((c) => {
                          const isSelected = field.value === c.id;
                          const chipClass = `${chipBaseClass} ${isSelected ? activeChipClass : inactiveChipClass}`;

                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => field.onChange(field.value === c.id ? null : c.id)}
                              className={chipClass}
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                />
              )}

            </div>
          )}
        </div>

        {/* Behavior design */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => setShowBehaviorDesign((prev) => !prev)}
            className="flex items-center justify-between text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Fingerprint size={14} className="text-zinc-500" />
              Behavior design
            </div>
            {showBehaviorDesign ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showBehaviorDesign && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              {BEHAVIOR_FIELDS.map(({ name, label, hint, placeholder, icon: Icon }) => (
                <FormField key={name} label={label} hint={hint}>
                  <div className={iconInputWrapClass}>
                    <Icon size={14} className="text-zinc-500 shrink-0" />
                    <Input
                      {...register(name)}
                      placeholder={placeholder}
                      variant="inline"
                      className="flex-1"
                    />
                  </div>
                </FormField>
              ))}
            </div>
          )}
        </div>

        {/* Edit-only archive */}
        {isEditing && (
          <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer">
            <input type="checkbox" {...register("archived")} className="accent-accent" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-zinc-200">Archive Habit</span>
              <span className="text-caption">Hide from active list without deleting</span>
            </div>
          </label>
        )}
      </form>
    </Dialog>
  );
}
