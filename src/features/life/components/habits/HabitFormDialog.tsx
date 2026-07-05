"use client";
import { Checkbox } from "@/components/ui/inputs/checkbox";

import { useState, useTransition } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { FormField } from "@/components/ui/display/form-field";
import { upsertHabitAction } from "@/features/life/actions/habit-actions";
import { habitSchema, type HabitFormData } from "@/features/life/schemas";
import type { HabitData, HabitChainData, LifeSphereData, SphereLevel } from "@/features/life/types";
import { WEEKDAY_ORDER, WEEKDAY_LABELS } from "@/features/life/logic/habit-utils";
import { toast } from "sonner";
import {
  Anchor,
  Zap,
  PartyPopper,
  Bell,
  X,
  Sprout,
  ShieldOff,
  Link2,
  ChevronDown,
  ChevronUp,
  Workflow,
  Wind,
  Fingerprint,
  Gauge,
  LifeBuoy,
} from "lucide-react";
import { TimePicker } from "@/components/ui/inputs/time-picker";

const BEHAVIOR_FIELDS: {
  name:
    "ifThenPlan" | "frictionReduction" | "identityStatement" | "minimalThreshold" | "copingPlan";
  label: string;
  hint: string;
  placeholder: string;
  icon: typeof Workflow;
}[] = [
  {
    name: "ifThenPlan",
    label: "If-then plan",
    hint: "Tie the action to a concrete trigger",
    placeholder: "e.g. If it's 21:00, I go for a walk",
    icon: Workflow,
  },
  {
    name: "frictionReduction",
    label: "Friction reduction",
    hint: "Make the action the easiest option",
    placeholder: "e.g. Lay out workout clothes the night before",
    icon: Wind,
  },
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
  {
    name: "copingPlan",
    label: "Coping plan",
    hint: "The fallback for when things go wrong",
    placeholder: "e.g. If in a bad mood, 10 minutes instead of full session",
    icon: LifeBuoy,
  },
];

const LEVEL_OPTIONS: {
  value: SphereLevel;
  label: string;
  description: string;
  color: string;
  border: string;
}[] = [
  {
    value: "MINIMUM",
    label: "Min",
    description: "Floor — never skip",
    color: "text-rose-400",
    border: "border-rose-500/40 bg-rose-500/5",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Baseline steady rhythm",
    color: "text-amber-400",
    border: "border-amber-500/40 bg-amber-500/5",
  },
  {
    value: "DESIRED",
    label: "Desired",
    description: "Optimal, full effort",
    color: "text-emerald-400",
    border: "border-emerald-500/40 bg-emerald-500/5",
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
  const [showBehaviorTools, setShowBehaviorTools] = useState(
    !!(
      habit?.ifThenPlan ||
      habit?.frictionReduction ||
      habit?.identityStatement ||
      habit?.minimalThreshold ||
      habit?.copingPlan
    ),
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
      name: habit?.name ?? "",
      type: (habit?.type as "positive" | "avoidance") ?? "positive",
      anchor: habit?.anchor ?? "",
      action: habit?.action ?? "",
      celebration: habit?.celebration ?? "",
      reminderTime: habit?.reminderTime ?? "",
      archived: habit?.archived ?? false,
      scheduledWeekdays: habit?.scheduledWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
      sphereId: habit?.sphereId ?? null,
      sphereLevel: (habit?.sphereLevel as SphereLevel) ?? null,
      subcategory: habit?.subcategory ?? "",
      chainId: habit?.chainId ?? null,
      ifThenPlan: habit?.ifThenPlan ?? "",
      frictionReduction: habit?.frictionReduction ?? "",
      identityStatement: habit?.identityStatement ?? "",
      minimalThreshold: habit?.minimalThreshold ?? "",
      copingPlan: habit?.copingPlan ?? "",
    },
  });

  const reminderTime = useWatch({ control, name: "reminderTime" });
  const habitType = useWatch({ control, name: "type" });
  const selectedSphereId = useWatch({ control, name: "sphereId" });
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
        scheduledWeekdays: data.scheduledWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
        sphereId: data.sphereId ?? null,
        sphereLevel: (data.sphereLevel as SphereLevel) ?? null,
        subcategory: data.subcategory?.trim() || null,
        chainId: data.chainId ?? null,
        ifThenPlan: data.ifThenPlan?.trim() || null,
        frictionReduction: data.frictionReduction?.trim() || null,
        identityStatement: data.identityStatement?.trim() || null,
        minimalThreshold: data.minimalThreshold?.trim() || null,
        copingPlan: data.copingPlan?.trim() || null,
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
    : "Define your habit using the Tiny Habits methodology: After I [Anchor], I will [Action].";
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Habit" : "New Habit"}
      description={dialogDescription}
      maxWidth="720px"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
          {!isEditing && (
            <div className="sm:col-span-2 flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
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

          <div className="sm:col-span-2">
            <FormField label="Habit name" error={errors.name?.message} required>
              <Input
                {...register("name")}
                placeholder={isAvoidance ? "e.g. No liquid calories" : "e.g. Morning pushups"}
                autoFocus
              />
            </FormField>
          </div>

          {spheres.length > 0 && (
            <Controller
              name="sphereId"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-label">Life Sphere (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {spheres.map((s) => {
                      const isSelected = field.value === s.id;
                      const chipClass = `${chipBaseClass} ${isSelected ? activeChipClass : inactiveChipClass}`;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const next = field.value === s.id ? null : s.id;
                            field.onChange(next);
                            if (!next) setValue("sphereLevel", null);
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

          <FormField label="Subcategory (optional)" hint="e.g. body, mind, deep work">
            <Input {...register("subcategory")} placeholder="e.g. body, mind, reading..." />
          </FormField>

          {selectedSphereId && (
            <div className="sm:col-span-2">
              <Controller
                name="sphereLevel"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-label">Sphere Standard Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVEL_OPTIONS.map((opt) => {
                        const isSelected = field.value === opt.value;
                        const optionClass = `flex flex-col items-start gap-0.5 p-2.5 rounded-lg border text-left transition-colors duration-150 ${
                          isSelected ? opt.border : "border-white/[0.08] hover:bg-white/5"
                        }`;
                        const labelClass = `text-xs font-semibold ${isSelected ? opt.color : "text-zinc-300"}`;

                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              field.onChange(field.value === opt.value ? null : opt.value)
                            }
                            className={optionClass}
                          >
                            <span className={labelClass}>{opt.label}</span>
                            <span className="text-[10px] text-zinc-500">{opt.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              />
            </div>
          )}

          {chains.length > 0 && (
            <Controller
              name="chainId"
              control={control}
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <label className="text-label flex items-center gap-1.5">
                    <Link2 size={12} />
                    Habit Chain (optional)
                  </label>
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

          <div className="sm:col-span-2">
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
                      <label className="text-label">Частота</label>
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
          </div>

          {isEditing && (
            <label className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer">
              <Checkbox {...register("archived")} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-zinc-200">Archive Habit</span>
                <span className="text-caption">Hide from active list without deleting</span>
              </div>
            </label>
          )}

          {isAvoidance ? (
            <>
              <FormField
                label="Trigger (optional)"
                hint="When do you usually slip?"
                error={errors.anchor?.message}
              >
                <div className={iconInputWrapClass}>
                  <Anchor size={14} className="text-zinc-500 shrink-0" />
                  <Input
                    {...register("anchor")}
                    placeholder="e.g. After lunch when I'm tired..."
                    variant="inline"
                    className="flex-1"
                  />
                </div>
              </FormField>

              <FormField
                label="Replacement (optional)"
                hint="What will you do instead?"
                error={errors.action?.message}
              >
                <div className={iconInputWrapClass}>
                  <Zap size={14} className="text-zinc-500 shrink-0" />
                  <Input
                    {...register("action")}
                    placeholder="e.g. I will drink sparkling water..."
                    variant="inline"
                    className="flex-1"
                  />
                </div>
              </FormField>
            </>
          ) : (
            <>
              <FormField label="The Anchor (Trigger)" error={errors.anchor?.message} required>
                <div className={iconInputWrapClass}>
                  <Anchor size={14} className="text-zinc-500 shrink-0" />
                  <Input
                    {...register("anchor")}
                    placeholder="After I [wash my face]..."
                    variant="inline"
                    className="flex-1"
                  />
                </div>
              </FormField>

              <FormField label="The Action (New habit)" error={errors.action?.message} required>
                <div className={iconInputWrapClass}>
                  <Zap size={14} className="text-zinc-500 shrink-0" />
                  <Input
                    {...register("action")}
                    placeholder="I will [do 5 pushups]..."
                    variant="inline"
                    className="flex-1"
                  />
                </div>
              </FormField>
            </>
          )}

          <FormField label="Celebration" hint="Optional — what reward follows?">
            <div className={iconInputWrapClass}>
              <PartyPopper size={14} className="text-zinc-500 shrink-0" />
              <Input
                {...register("celebration")}
                placeholder={
                  isAvoidance
                    ? "And then I will [say 'Still clean!']"
                    : "And then I will [say 'Good job!']"
                }
                variant="inline"
                className="flex-1"
              />
            </div>
          </FormField>

          <FormField label="Daily Reminder" hint="Optional">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-zinc-500 shrink-0" />
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => setValue("reminderTime", "")}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Controller
                name="reminderTime"
                control={control}
                render={({ field }) => (
                  <TimePicker value={field.value ?? ""} onChange={field.onChange} />
                )}
              />
              {!reminderTime && (
                <div className="text-caption">
                  <span>Auto (3x day)</span>
                </div>
              )}
            </div>
          </FormField>

          <div className="sm:col-span-2 flex flex-col gap-3 pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => setShowBehaviorTools((prev) => !prev)}
              className="flex items-center justify-between text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
            >
              Behavior design (optional)
              {showBehaviorTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showBehaviorTools && (
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
        </div>
      </form>
    </Dialog>
  );
}
