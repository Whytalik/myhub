"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { savePlaybookAction } from "@/features/life/actions/goal-playbook-actions";
import type { SavePlaybookInput } from "@/features/life/types";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface TextStepProps {
  goalId: string;
  field: "path" | "keyChange";
  value: string;
  placeholder: string;
}

export function TextStep({ goalId, field, value, placeholder }: TextStepProps) {
  const { run, isPending } = useServerAction();
  const [draft, setDraft] = useState(value);
  const isDirty = draft.trim() !== value;

  const handleSave = () => {
    const input: SavePlaybookInput = { [field]: draft };
    run(savePlaybookAction(goalId, input), {
      successMessage: "Saved",
      errorMessage: "Failed to save",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={4}
      />
      {isDirty && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="self-start"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      )}
    </div>
  );
}
