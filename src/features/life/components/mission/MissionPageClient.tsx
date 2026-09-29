"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Button } from "@/components/ui/actions/button";
import { saveMissionAction } from "@/features/life/actions/mission-actions";
import { useServerAction } from "@/lib/hooks/use-server-action";

interface MissionPageClientProps {
  currentContent: string;
}

export function MissionPageClient({ currentContent }: MissionPageClientProps) {
  const [draft, setDraft] = useState(currentContent);
  const { run, isPending } = useServerAction();

  const isDirty = draft.trim() !== currentContent.trim();

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || isPending) return;

    run(saveMissionAction(trimmed), {
      successMessage: "Mission saved",
      errorMessage: "Failed to save mission",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-accent/10 text-accent">
            <Compass size={14} />
          </div>
          <h3 className="text-panel-title">Personal Mission</h3>
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What do I stand for? What am I here to do?"
          rows={6}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isPending || !draft.trim() || !isDirty}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
