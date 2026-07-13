"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ThoughtFields } from "./ThoughtFields";
import type { ThoughtType } from "@/features/life/logic/thought-types";
import type { LifeSphereData, ThoughtData } from "@/features/life/types";

export interface ThoughtDetailPatch {
  content: string;
  sphereId: string | null;
  type: ThoughtType | null;
  templateData: Record<string, string> | null;
}

interface ThoughtDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  thought: ThoughtData;
  spheres: LifeSphereData[];
  onSave: (patch: ThoughtDetailPatch) => void;
  canDecompose?: boolean;
  onDecompose?: () => void;
}

// Collects the edit and hands it to the parent (ThoughtsBoardClient), which
// owns the optimistic board state and the actual upsertThoughtAction call —
// same division of responsibility as every other mutation on the board.
export function ThoughtDetailDialog({
  isOpen,
  onClose,
  thought,
  spheres,
  onSave,
  canDecompose,
  onDecompose,
}: ThoughtDetailDialogProps) {
  const [content, setContent] = useState(thought.content);
  const [sphereId, setSphereId] = useState<string | null>(thought.sphereId);
  const [type, setType] = useState<ThoughtType | null>(thought.type);
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(
    thought.templateData,
  );

  const handleFieldsChange = (patch: {
    sphereId?: string | null;
    type?: ThoughtType | null;
    templateData?: Record<string, string> | null;
  }) => {
    if (patch.sphereId !== undefined) setSphereId(patch.sphereId);
    if (patch.type !== undefined) setType(patch.type);
    if (patch.templateData !== undefined) setTemplateData(patch.templateData);
  };

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onSave({ content: trimmed, sphereId, type, templateData });
    onClose();
  };

  return (
    <Dialog
      key={thought.id}
      isOpen={isOpen}
      onClose={onClose}
      title="Edit thought"
      maxWidth="480px"
    >
      <div className="flex flex-col gap-5">
        <Textarea autoFocus value={content} onChange={(e) => setContent(e.target.value)} rows={3} />

        <ThoughtFields
          spheres={spheres}
          sphereId={sphereId}
          type={type}
          templateData={templateData}
          onChange={handleFieldsChange}
        />

        <div className="flex justify-end gap-2">
          {canDecompose && onDecompose && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onDecompose();
                onClose();
              }}
              className="mr-auto text-orange-400 border-orange-500/20 hover:bg-orange-500/10"
            >
              Розбити
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={submit}
            disabled={!content.trim()}
          >
            Save
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
