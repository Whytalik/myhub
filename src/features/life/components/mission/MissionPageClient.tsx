"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Compass, History } from "lucide-react";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Button } from "@/components/ui/actions/button";
import { saveMissionAction } from "@/features/life/actions/mission-actions";

interface MissionVersionData {
  id: string;
  content: string;
  createdAt: Date;
}

interface MissionPageClientProps {
  currentContent: string;
  history: MissionVersionData[];
}

function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MissionPageClient({ currentContent, history }: MissionPageClientProps) {
  const [draft, setDraft] = useState(currentContent);
  const [versions, setVersions] = useState(history);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isDirty = draft.trim() !== (versions[0]?.content ?? "").trim();

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || isPending) return;

    startTransition(async () => {
      const result = await saveMissionAction(trimmed);
      if (result.success) {
        setVersions((prev) => [result.data, ...prev]);
        toast.success("Mission saved");
      } else {
        toast.error(result.error || "Failed to save mission");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
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

      <div className="glass-card p-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setIsHistoryOpen((v) => !v)}
          className="flex items-center gap-2.5 w-full text-left"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 text-zinc-400">
            <History size={14} />
          </div>
          <h3 className="text-panel-title flex-1">History ({versions.length})</h3>
          {isHistoryOpen ? (
            <ChevronUp size={14} className="text-zinc-500" />
          ) : (
            <ChevronDown size={14} className="text-zinc-500" />
          )}
        </button>

        {isHistoryOpen &&
          (versions.length === 0 ? (
            <p className="text-caption">No versions saved yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="flex flex-col gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-label">
                      {index === 0 ? "Current" : formatTimestamp(version.createdAt)}
                    </span>
                  </div>
                  <p className="text-caption whitespace-pre-wrap break-words">{version.content}</p>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
