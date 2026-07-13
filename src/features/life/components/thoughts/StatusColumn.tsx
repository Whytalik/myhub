"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useDroppable } from "@dnd-kit/core";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { ThoughtCard } from "./ThoughtCard";
import { StatusFormDialog } from "./StatusFormDialog";
import type { ThoughtStatusData } from "@/features/life/types";

interface StatusColumnProps {
  status: ThoughtStatusData;
  onAddThought: (statusId: string, content: string) => void;
  onEditThought: (thoughtId: string, content: string) => void;
  onDeleteThought: (thoughtId: string) => void;
  onDeleteStatus: (statusId: string) => void;
}

export function StatusColumn({
  status,
  onAddThought,
  onEditThought,
  onDeleteThought,
  onDeleteStatus,
}: StatusColumnProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const { isOpen, coords, triggerRef, contentRef, close, toggle } =
    useDynamicPositioning<HTMLButtonElement>({ contentWidth: 150, offset: 6 });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
    data: { type: "column" },
  });

  const { setNodeRef: setDropZoneRef, isOver } = useDroppable({
    id: `column-body-${status.id}`,
    data: { type: "column-body", statusId: status.id },
  });

  const columnStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        top: coords.align === "bottom" ? coords.top : undefined,
        bottom: coords.align === "top" ? window.innerHeight - coords.top : undefined,
        width: 150,
      }
    : {};

  const submitNewThought = () => {
    const trimmed = draft.trim();
    if (trimmed) onAddThought(status.id, trimmed);
    setDraft("");
    setIsAdding(false);
  };

  const menu =
    isOpen &&
    coords &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={contentRef as React.RefObject<HTMLDivElement>}
        style={dropdownStyle}
        className="glass-elevated p-1.5 flex flex-col gap-0.5 z-[9000]"
      >
        <button
          type="button"
          onClick={() => {
            close();
            setRenameOpen(true);
          }}
          className="text-left px-2.5 py-1.5 rounded-lg text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors duration-150"
        >
          Rename
        </button>
        <button
          type="button"
          onClick={() => {
            close();
            setConfirmDeleteOpen(true);
          }}
          className="text-left px-2.5 py-1.5 rounded-lg text-sm text-red-400 hover:bg-white/5 transition-colors duration-150"
        >
          Delete
        </button>
      </div>,
      document.body,
    );

  const dropZoneClass = `flex flex-col gap-2 min-h-12 rounded-xl transition-colors duration-150 ${
    isOver ? "bg-accent/5" : ""
  }`;

  return (
    <div
      ref={setNodeRef}
      style={columnStyle}
      className="glass-card p-3 flex flex-col gap-3 w-72 shrink-0 self-start"
    >
      <div className="flex items-center justify-between gap-2">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 min-w-0 flex-1 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical size={14} className="text-zinc-600 shrink-0" />
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-panel-title truncate">{status.name}</span>
          <span className="text-label">{status.thoughts.length}</span>
        </div>
        <Button type="button" ref={triggerRef} variant="ghost" size="icon" onClick={toggle}>
          <MoreVertical size={16} />
        </Button>
        {menu}
      </div>

      <SortableContext
        items={status.thoughts.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setDropZoneRef} className={dropZoneClass}>
          {status.thoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              onEdit={(content) => onEditThought(thought.id, content)}
              onDelete={() => onDeleteThought(thought.id)}
            />
          ))}
        </div>
      </SortableContext>

      {isAdding ? (
        <Textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={submitNewThought}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitNewThought();
            }
            if (e.key === "Escape") {
              setDraft("");
              setIsAdding(false);
            }
          }}
          rows={2}
          placeholder="Write a thought..."
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="justify-start"
        >
          <Plus size={14} /> Add thought
        </Button>
      )}

      <StatusFormDialog isOpen={renameOpen} onClose={() => setRenameOpen(false)} status={status} />
      <ConfirmationDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={() => onDeleteStatus(status.id)}
        title="Delete status"
        description={
          status.thoughts.length > 0
            ? `This will also delete ${status.thoughts.length} thought(s) in this column.`
            : "This status will be removed."
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
