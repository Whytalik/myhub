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
    color: "text-rose-500",
    border: "border-rose-500/40 bg-rose-500/5",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Baseline steady rhythm",
    color: "text-amber-500",
    border: "border-amber-500/40 bg-amber-500/5",
  },
  {
    value: "DESIRED",
    label: "Desired",
    description: "Optimal, full effort",
    color: "text-emerald-500",
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
      targetDaysPerWeek: habit?.targetDaysPerWeek ?? 7,
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
  const selectedLevel = useWatch({ control, name: "sphereLevel" });
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
        targetDaysPerWeek: data.targetDaysPerWeek ?? 7,
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
        {}
        {!isEditing && (
          <div >
            <button
              type="button"
              onClick={() => setValue("type", "positive")}

            >
              <Sprout size={14} />
              Build
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "avoidance")}

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

        {}
        {spheres.length > 0 && (
          <Controller
            name="sphereId"
            control={control}
            render={({ field }) => (
              <div >
                <label >
                  Life Sphere (optional)
                </label>
                <div >
                  {spheres.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        const next = field.value === s.id ? null : s.id;
                        field.onChange(next);
                        if (!next) setValue("sphereLevel", null);
                      }}

                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        )}

        {}
        {selectedSphereId && (
          <Controller
            name="sphereLevel"
            control={control}
            render={({ field }) => (
              <div >
                <label >
                  Sphere Standard Level
                </label>
                <div >
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(field.value === opt.value ? null : opt.value)}

                    >
                      <span

                      >
                        {opt.label}
                      </span>
                      <span >
                        {opt.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        )}

        {}
        <FormField label="Subcategory (optional)" hint="e.g. body, mind, deep work">
          <Input {...register("subcategory")} placeholder="e.g. body, mind, reading..." />
        </FormField>

        {}
        {chains.length > 0 && (
          <Controller
            name="chainId"
            control={control}
            render={({ field }) => (
              <div >
                <label >
                  <Link2 size={12} />
                  Habit Chain (optional)
                </label>
                <div >
                  {chains.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => field.onChange(field.value === c.id ? null : c.id)}

                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          />
        )}

        {}
        <Controller
          name="targetDaysPerWeek"
          control={control}
          render={({ field }) => (
            <div >
              <div >
                <label >
                  Частота
                </label>
                <span >
                  {field.value === 7 ? "Щодня" : `${field.value}× на тиждень`}
                </span>
              </div>
              <div >
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => field.onChange(n)}

                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        {isEditing && (
          <label >
            <Checkbox

              {...register("archived")}

            />
            <div >
              <span >Archive Habit</span>
              <span >
                Hide from active list without deleting
              </span>
            </div>
          </label>
        )}

        <div >
          {isAvoidance ? (
            <>
              <FormField
                label="Trigger (optional)"
                hint="When do you usually slip?"
                error={errors.anchor?.message}
              >
                <div >
                  <Anchor size={14} />
                </div>
                <Input {...register("anchor")} placeholder="e.g. After lunch when I'm tired..." />
              </FormField>

              <FormField
                label="Replacement (optional)"
                hint="What will you do instead?"
                error={errors.action?.message}
              >
                <div >
                  <Zap size={14} />
                </div>
                <Input {...register("action")} placeholder="e.g. I will drink sparkling water..." />
              </FormField>
            </>
          ) : (
            <>
              <FormField label="The Anchor (Trigger)" error={errors.anchor?.message} required>
                <div >
                  <Anchor size={14} />
                </div>
                <Input {...register("anchor")} placeholder="After I [wash my face]..." />
              </FormField>

              <FormField label="The Action (New habit)" error={errors.action?.message} required>
                <div >
                  <Zap size={14} />
                </div>
                <Input {...register("action")} placeholder="I will [do 5 pushups]..." />
              </FormField>
            </>
          )}

          <FormField label="Celebration" hint="Optional — what reward follows?">
            <div >
              <PartyPopper size={14} />
            </div>
            <Input
              {...register("celebration")}
              placeholder={
                isAvoidance
                  ? "And then I will [say 'Still clean!']"
                  : "And then I will [say 'Good job!']"
              }
            />
          </FormField>

          <FormField label="Daily Reminder" hint="Optional">
            <div >
              <Bell size={14} />
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => setValue("reminderTime", "")}

                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
            <div >
              <Controller
                name="reminderTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    value={field.value ?? ""}
                    onChange={field.onChange}

                  />
                )}
              />
              {!reminderTime && (
                <div >
                  <span >Auto (3x day)</span>
                </div>
              )}
            </div>
          </FormField>
        </div>

        {}
        <div >
          <button
            type="button"
            onClick={() => setShowBehaviorTools((prev) => !prev)}

          >
            Behavior design (optional)
            {showBehaviorTools ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showBehaviorTools && (
            <div >
              {BEHAVIOR_FIELDS.map(({ name, label, hint, placeholder, icon: Icon }) => (
                <FormField key={name} label={label} hint={hint}>
                  <div >
                    <Icon size={14} />
                  </div>
                  <Input {...register(name)} placeholder={placeholder} />
                </FormField>
              ))}
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
}
