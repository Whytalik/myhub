"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import type { ThoughtData } from "@/features/life/types";

interface ThoughtCardProps {
  thought: ThoughtData;
  onEdit: (content: string) => void;
  onDelete: () => void;
}

export function ThoughtCard({ thought, onEdit, onDelete }: ThoughtCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(thought.content);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: thought.id,
    data: { type: "card", statusId: thought.statusId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    setIsEditing(false);
    if (trimmed && trimmed !== thought.content) {
      onEdit(trimmed);
    } else {
      setDraft(thought.content);
    }
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="glass-card p-3 flex flex-col gap-2">
        <Textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitEdit();
            }
            if (e.key === "Escape") {
              setDraft(thought.content);
              setIsEditing(false);
            }
          }}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-card p-3 flex flex-col gap-1 group cursor-grab active:cursor-grabbing touch-none"
    >
      <p
        className="text-body whitespace-pre-wrap break-words"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        {thought.content}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="self-end opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400"
      >
        <Trash2 size={13} />
      </Button>
    </div>
  );
}
