"use client";

import React, { useState, useTransition, useCallback } from "react";
import { Plus, Trash2, ArrowUp, Calendar, Flag, FileText, Copy, RefreshCw } from "lucide-react";
import { deleteTaskAction, setTaskAsFrogAction } from "@/features/life/actions/task-actions";
import type { TaskData } from "@/features/life/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { StatusToggle } from "./StatusToggle";
import { PriorityToggle } from "./PriorityToggle";
import { ALL_ICONS, SPHERE_ICONS } from "./lucide-icons-map";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

export interface TaskCardBaseProps {
  task: TaskData;
  onEdit: (task: TaskData) => void;
  onDuplicate?: (task: TaskData) => void;
  onAddChild?: (parent: TaskData) => void;
  onDelete?: () => void;
  allTasks?: TaskData[];
  variant?: "default" | "compact";
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
  setNodeRef?: (node: HTMLElement | null) => void;
}

export function TaskCardBase({
  task,
  onEdit,
  onDuplicate,
  onAddChild,
  onDelete,
  allTasks = [],
  variant = "default",
  isDragging = false,
  className = "••••••••",
  style,
  listeners,
  attributes,
  setNodeRef
}: TaskCardBaseProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const isDone = task.status === "DONE" || task.status === "CANCELLED";
  const hasChildren = task.children.length > 0;
  const completedSubtasks = task.children.filter(c => c.status === 'DONE').length;

  const handleDelete = () => {
    startTransition(async () => {
      onDelete?.();
      const result = await deleteTaskAction(task.id);
      if (result.success) {
        toast.success("Task deleted");
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    });
  };

  const handleToggleFrog = () => {
    startTransition(async () => {
      const result = await setTaskAsFrogAction(task.id);
      if (result.success) {
        toast.success(task.isFrog ? "Жабу знято" : "🐸 Жабу встановлено!");
      } else {
        toast.error(result.error || "Failed to update frog");
      }
    });
  };

  const formatDateTime = useCallback((date: Date | null, hasTime: boolean) => {
    if (!date) return null;
    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = variant === "compact"
      ? { month: "short", day: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" };

    if (hasTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.hour12 = false;
    }
    return d.toLocaleString("en-US", options);
  }, [variant]);

  const plannedLabel = React.useMemo(() => {
    const start = formatDateTime(task.plannedDate, task.hasPlannedTime);
    if (!task.plannedEndDate) return start;

    const end = formatDateTime(task.plannedEndDate, task.hasPlannedEndTime);
    if (!start) return `Until ${end}`;
    return `${start} - ${end}`;
  }, [task.plannedDate, task.hasPlannedTime, task.plannedEndDate, task.hasPlannedEndTime, formatDateTime]);

  const dueLabel = formatDateTime(task.dueDate, task.hasDueTime);

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    task.status !== "CANCELLED" &&
    new Date(task.dueDate) < new Date();

  const formatText = (text: string) => {
    if (!text) return "••••••••";
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    let formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/`(.*?)`/g, "<code class='bg-white/10 px-1 rounded font-mono text-note'>$1</code>");
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' class='text-accent hover:underline' onclick='event.stopPropagation()'>$1</a>");
    formatted = formatted.replace(/(?<!href='|">)(https?:\/\/[^\s]+)/g, "<a href='$1' target='_blank' class='text-accent hover:underline' onclick='event.stopPropagation()'>$1</a>");

    return formatted;
  };

  const handleParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.parentId) {
      const parent = allTasks.find(t => t.id === task.parentId);
      if (parent) onEdit(parent);
    }
  };

  const isCompact = variant === "compact";

  return (
    <div
      ref={setNodeRef}

      {...listeners}
      {...attributes}
      onClick={() => {
        if (style?.transform) return;
        onEdit(task);
      }}

    >
      <div >
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleFrog(); }}

          title={task.isFrog ? "Зняти жабу" : "Зробити жабою"}
        >
          <span role="img" aria-label="frog">🐸</span>
        </button>
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(task); }}

            title="Duplicate task"
          >
            <Copy size={isCompact ? 10 : 12} />
          </button>
        )}
        {onAddChild && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(task); }}

            title="Add subtask"
          >
            <Plus size={isCompact ? 10 : 12} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}

          title="Delete task"
        >
          <Trash2 size={isCompact ? 10 : 12} />
        </button>
      </div>

      {}
      {task.parentId && (
        <div
          onClick={handleParentClick}

        >
          <ArrowUp size={isCompact ? 8 : 8} />
          {task.parentIcon && ALL_ICONS[task.parentIcon] && (() => {
             const PIcon = ALL_ICONS[task.parentIcon];
             return <PIcon size={isCompact ? 8 : 10} />;
          })()}
          <span >
            {task.isPrivate ? "��������" : (task.parentTitle || 'Parent Task')}
          </span>
        </div>
      )}

      {}
      <div >
        <div >
          {task.icon && SPHERE_ICONS[task.icon] ? (() => {
            const Icon = SPHERE_ICONS[task.icon];
            return <Icon size={isCompact ? 10 : 16} strokeWidth={2.5} />;
          })() : (
            <FileText size={isCompact ? 10 : 16} strokeWidth={2.5} />
          )}
          <h3

            dangerouslySetInnerHTML={{ __html: formatText(task.isPrivate ? "��������" : task.title) }}
            title={task.isPrivate ? "Private Task" : task.title}
          />
          {task.isFrog && (
            <span >
              <span role="img" aria-label="frog">🐸</span> Frog
            </span>
          )}
          {task.isPrivate && (
             <span >
               Private
             </span>
          )}
        </div>

        {}
        <div >
          <StatusToggle
            taskId={task.id}
            status={task.status}
            variant="badge"
            size={isCompact ? "sm" : "default"}
          />

          <PriorityToggle
            taskId={task.id}
            priority={task.priority}
            size={isCompact ? "sm" : "default"}
          />

          {task.sphere && (
             <div


             >
               {(() => {
                 const SphereIcon = SPHERE_ICONS[task.sphere.icon] || FileText;
                 return <SphereIcon size={isCompact ? 6 : 10} strokeWidth={3} />;
               })()}
               {task.sphere.name}
             </div>
          )}
        </div>

        {!isCompact && task.description && (
          <div

            dangerouslySetInnerHTML={{ __html: formatText(task.isPrivate ? "Content is hidden" : task.description) }}
          />
        )}
      </div>

      {}
      <div >
        {hasChildren && (() => {
          const pct = Math.round((completedSubtasks / task.children.length) * 100);
          return (
            <div >
              <div >
                <div />
              </div>
              <span >{pct}%</span>
            </div>
          );
        })()}

        <div >
            {plannedLabel && (
              <div title="Planned for">
                <Calendar size={isCompact ? 8 : 11} />
                <span >{plannedLabel}</span>
              </div>
            )}

            {dueLabel && (
              <div

                title="Deadline"
              >
                <Flag size={isCompact ? 8 : 11} />
                <span >{dueLabel}</span>
              </div>
            )}

            {task.carriedFromDate && (
              <div

                title={`Перенесено з ${new Date(task.carriedFromDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}`}
              >
                <RefreshCw size={isCompact ? 8 : 11} />
                <span >
                  від {new Date(task.carriedFromDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"?`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
