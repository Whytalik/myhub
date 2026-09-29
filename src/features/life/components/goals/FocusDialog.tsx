"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import { FormField } from "@/components/ui/display/form-field";
import { setYearFocusAction } from "@/features/life/actions/year-focus-actions";
import type { LifeSphereData, SphereGoalData, YearFocusData } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface FocusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  spheres: LifeSphereData[];
  goals: SphereGoalData[];
  focus: YearFocusData | null;
}

export function FocusDialog({ isOpen, onClose, year, spheres, goals, focus }: FocusDialogProps) {
  const { run, isPending } = useServerAction();

  const [sphereId, setSphereId] = useState(focus?.sphereId ?? "");
  const [identity, setIdentity] = useState(focus?.identity ?? "");
  const [leverGoalId, setLeverGoalId] = useState(focus?.leverGoalId ?? "");
  const [leverReason, setLeverReason] = useState(focus?.leverReason ?? "");
  const [allowImperfect, setAllowImperfect] = useState(focus?.allowImperfect ?? "");

  const sphereGoals = goals.filter((goal) => goal.sphereId === sphereId);
  const canSubmit = !!sphereId && !isPending;

  const handleSphereChange = (nextSphereId: string) => {
    setSphereId(nextSphereId);
    setLeverGoalId("");
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    run(
      setYearFocusAction({
        year,
        sphereId,
        identity,
        leverGoalId: leverGoalId || null,
        leverReason,
        allowImperfect,
      }),
      {
        successMessage: "Focus saved",
        errorMessage: "Failed to save focus",
        onSuccess: onClose,
      },
    );
  };

  return (
    <Dialog
      key={focus?.id ?? "new"}
      isOpen={isOpen}
      onClose={onClose}
      title={`Your ONE focus for ${year}`}
      description="What's the ONE sphere such that by winning it, everything else becomes easier or unnecessary?"
      maxWidth="560px"
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
            {isPending ? "Saving..." : "Commit to this focus"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FormField label="Focus sphere" required>
          <Select value={sphereId} onChange={(e) => handleSphereChange(e.target.value)}>
            <option value="">Select a sphere…</option>
            {spheres.map((sphere) => (
              <option key={sphere.id} value={sphere.id}>
                {sphere.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Who are you becoming?"
          hint='Present tense, believable, about who you are, not what you want. e.g. "I am becoming someone who trades by the system." For things you avoid: "I don&apos;t…", not "I can&apos;t…".'
        >
          <Textarea
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="I am becoming someone who…"
            rows={2}
          />
        </FormField>

        <FormField
          label="The lever"
          hint={
            sphereId && sphereGoals.length === 0
              ? "This sphere has no goals yet. Add some on the Life Goals page to pick a lever."
              : "The one goal here that pulls the others along (often capital, a launch, or stable income)."
          }
        >
          <Select
            value={leverGoalId}
            onChange={(e) => setLeverGoalId(e.target.value)}
            disabled={sphereGoals.length === 0}
          >
            <option value="">No specific goal yet</option>
            {sphereGoals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Why this pulls everything else" hint="One or two sentences.">
          <Textarea
            value={leverReason}
            onChange={(e) => setLeverReason(e.target.value)}
            placeholder="Stable income removes the money stress that blocks health, relationships…"
            rows={3}
          />
        </FormField>

        <FormField
          label="I allow myself to be imperfect in"
          hint="Everything else runs at maintenance level this year. Naming it prevents the crash-and-rebound of changing everything at once."
        >
          <Textarea
            value={allowImperfect}
            onChange={(e) => setAllowImperfect(e.target.value)}
            placeholder="Diet stays 'good enough', no new hobbies, trips are optional…"
            rows={3}
          />
        </FormField>
      </div>
    </Dialog>
  );
}
