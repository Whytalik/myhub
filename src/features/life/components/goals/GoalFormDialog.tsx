"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { FormField } from "@/components/ui/display/form-field";
import { upsertSphereGoalAction } from "@/features/life/actions/sphere-goal-actions";
import { GOAL_TYPE_HINTS, GOAL_TYPE_LABELS } from "@/features/life/logic/sphere-goals";
import type { LifeSphereData, SphereGoalData, SphereGoalType } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface GoalFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sphere: LifeSphereData;
  year: number;
  goal: SphereGoalData | null;
  habits: { id: string; name: string }[];
}

const GOAL_TYPES = Object.keys(GOAL_TYPE_LABELS) as SphereGoalType[];

export function GoalFormDialog({
  isOpen,
  onClose,
  sphere,
  year,
  goal,
  habits,
}: GoalFormDialogProps) {
  const { run, isPending } = useServerAction();
  const isEditing = !!goal;

  const [title, setTitle] = useState(goal?.title ?? "");
  const [type, setType] = useState<SphereGoalType>(goal?.type ?? "COUNTER");
  const [unit, setUnit] = useState(goal?.unit ?? "");
  const [startValue, setStartValue] = useState(String(goal?.startValue ?? 0));
  const [targetValue, setTargetValue] = useState(goal ? String(goal.targetValue) : "");
  const [habitId, setHabitId] = useState(goal?.habitId ?? "");
  const [deadline, setDeadline] = useState(goal?.deadline ?? "");

  const isValueGoal = type === "VALUE";
  const parsedTarget = Number(targetValue);
  const parsedStart = Number(startValue);
  const isTargetValid = targetValue.trim() !== "" && Number.isFinite(parsedTarget);
  const canSubmit = !!title.trim() && isTargetValid && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    run(
      upsertSphereGoalAction({
        id: goal?.id,
        sphereId: sphere.id,
        year,
        title: title.trim(),
        type,
        unit: unit.trim() || null,
        startValue: isValueGoal ? parsedStart : 0,
        targetValue: parsedTarget,
        habitId: isValueGoal ? null : habitId || null,
        deadline: deadline || null,
      }),
      {
        successMessage: isEditing ? "Goal updated" : "Goal added",
        errorMessage: "Failed to save goal",
        onSuccess: onClose,
      },
    );
  };

  return (
    <Dialog
      key={goal?.id ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit goal" : `New goal · ${sphere.name}`}
      description={`Measurable goal for ${year}. Not "improve health" but "50 workouts".`}
      maxWidth="520px"
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isPending ? "Saving..." : isEditing ? "Save changes" : "Add goal"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FormField label="Goal" required>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Gym workouts"
          />
        </FormField>

        <FormField label="Type" hint={GOAL_TYPE_HINTS[type]}>
          <Select value={type} onChange={(e) => setType(e.target.value as SphereGoalType)}>
            {GOAL_TYPES.map((goalType) => (
              <option key={goalType} value={goalType}>
                {GOAL_TYPE_LABELS[goalType]}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          {isValueGoal && (
            <FormField label="Start">
              <Input
                type="number"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
              />
            </FormField>
          )}
          <FormField label="Target" required>
            <Input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={type === "DAYS" ? "300" : "50"}
            />
          </FormField>
          <FormField label="Unit">
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={type === "DAYS" ? "days" : "kg, books…"}
            />
          </FormField>
        </div>

        <FormField
          label="Deadline"
          hint="Optional. Set it when the goal ends outside this year, e.g. mid-next-year; pace is then measured up to this date."
        >
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </FormField>

        {!isValueGoal && (
          <FormField
            label="Track with a habit"
            hint="Progress counts the habit's completed days this year automatically."
          >
            <Select value={habitId} onChange={(e) => setHabitId(e.target.value)}>
              <option value="">Manual — I update it myself</option>
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}
      </div>
    </Dialog>
  );
}
