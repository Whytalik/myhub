"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, CheckCircle2, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { getThoughtTypeConfig } from "@/features/life/logic/thought-types";
import { ThoughtDetailDialog, type ThoughtDetailPatch } from "./ThoughtDetailDialog";
import type { LifeSphereData, ThoughtData } from "@/features/life/types";

const TYPE_ICONS: Record<string, LucideIcon> = { AlertTriangle, Sparkles, CheckCircle2 };

interface ThoughtCardProps {
  thought: ThoughtData;
  spheres: LifeSphereData[];
  onEdit: (patch: ThoughtDetailPatch) => void;
  onDelete: () => void;
}

export function ThoughtCard({ thought, spheres, onEdit, onDelete }: ThoughtCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: thought.id,
    data: { type: "card", statusId: thought.statusId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const typeConfig = getThoughtTypeConfig(thought.type);
  const TypeIcon = typeConfig ? TYPE_ICONS[typeConfig.icon] : null;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="glass-card p-3 flex flex-col gap-2 group cursor-grab active:cursor-grabbing touch-none"
      >
        <p
          className="text-body whitespace-pre-wrap break-words"
          onClick={(e) => {
            e.stopPropagation();
            setDetailOpen(true);
          }}
        >
          {thought.content}
        </p>

        {(thought.sphere || typeConfig) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {thought.sphere && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-zinc-400">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: thought.sphere.color }}
                />
                {thought.sphere.name}
              </span>
            )}
            {typeConfig && TypeIcon && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] text-[10px] text-zinc-400">
                <TypeIcon size={10} />
                {typeConfig.label}
              </span>
            )}
          </div>
        )}

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

      <ThoughtDetailDialog
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        thought={thought}
        spheres={spheres}
        onSave={onEdit}
      />
    </>
  );
}
