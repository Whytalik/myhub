"use client";

import React, { useState, useTransition, useCallback, useEffect, useMemo } from "react";
import { Plus, Trash2, ArrowUp, Calendar, Flag, FileText, Copy, RefreshCw, Folder } from "lucide-react";
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
  className = "",
  style,
  listeners,
  attributes,
  setNodeRef,
}: TaskCardBaseProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const isActiveNow = useMemo(() => {
    if (task.status === "DONE" || !task.plannedDate) return false;
    const start = new Date(task.plannedDate);
    const end = task.plannedEndDate
      ? new Date(task.plannedEndDate)
      : new Date(start.getTime() + 3600000);
    return now >= start && now <= end;
  }, [task.status, task.plannedDate, task.plannedEndDate, now]);

  const hasChildren = task.children.length > 0;
  const completedSubtasks = task.children.filter((c) => c.status === "DONE").length;
  const isCompact = variant === "compact";

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

  const formatDateTime = useCallback(
    (date: Date | null, hasTime: boolean) => {
      if (!date) return null;
      const d = new Date(date);
      const options: Intl.DateTimeFormatOptions =
        variant === "compact"
          ? { month: "short", day: "numeric" }
          : { month: "long", day: "numeric", year: "numeric" };

      if (hasTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
        options.hour12 = false;
      }
      return d.toLocaleString("en-US", options);
    },
    [variant],
  );

  const plannedLabel = React.useMemo(() => {
    const start = formatDateTime(task.plannedDate, task.hasPlannedTime);
    if (!task.plannedEndDate) return start;

    const end = formatDateTime(task.plannedEndDate, task.hasPlannedEndTime);
    if (!start) return `Until ${end}`;
    return `${start} - ${end}`;
  }, [
    task.plannedDate,
    task.hasPlannedTime,
    task.plannedEndDate,
    task.hasPlannedEndTime,
    formatDateTime,
  ]);

  const dueLabel = formatDateTime(task.dueDate, task.hasDueTime);

  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    task.status !== "CANCELLED" &&
    new Date(task.dueDate) < new Date();

  const formatText = (text: string) => {
    if (!text) return "";
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    let formatted = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formatted = formatted.replace(
      /`(.*?)`/g,
      "<code class='bg-white/10 px-1 rounded font-mono text-xs'>$1</code>",
    );
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      "<a href='$2' target='_blank' class='text-accent hover:underline' onclick='event.stopPropagation()'>$1</a>",
    );
    formatted = formatted.replace(
      /(?<!href='|">)(https?:\/\/[^\s]+)/g,
      "<a href='$1' target='_blank' class='text-accent hover:underline' onclick='event.stopPropagation()'>$1</a>",
    );

    return formatted;
  };

  const handleParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.parentId) {
      const parent = allTasks.find((t) => t.id === task.parentId);
      if (parent) onEdit(parent);
    }
  };

  const cardClass = `group relative glass-card flex flex-col transition-all duration-300 hover:border-white/[0.12] cursor-pointer ${
    isCompact ? "p-2.5 gap-1.5" : "p-3.5 gap-2"
  } ${isDragging ? "opacity-50 shadow-2xl" : ""} ${
    isActiveNow
      ? "border-accent ring-1 ring-accent/20 bg-accent/[0.01] shadow-[0_0_15px_rgba(37,99,235,0.08)]"
      : ""
  } ${className}`;
  const actionBarClass =
    "absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-elevated/95 border border-stroke px-1 py-0.5 rounded-lg shadow-md pointer-events-auto z-10";
  const actionButtonClass =
    "p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors";
  const deleteButtonClass =
    "p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-white/5 transition-colors";
  const parentLinkClass =
    "flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors w-fit";
  const titleClass = isCompact
    ? "text-sm font-medium text-zinc-100 whitespace-pre-wrap break-words"
    : "text-panel-title whitespace-pre-wrap break-words";
  const titleText = task.title;
  const titleHtml = { __html: formatText(titleText) };
  const parentLabel = task.parentTitle || "Parent Task";
  const descriptionText = task.description;
  const iconSize = isCompact ? 10 : 16;
  const actionIconSize = isCompact ? 10 : 12;
  const dateIconSize = isCompact ? 8 : 11;
  const parentArrowSize = 8;
  const sphereIconSize = isCompact ? 6 : 10;
  const dueLabelClass = `flex items-center gap-1 ${isOverdue ? "text-rose-400" : "text-zinc-500"}`;
  const carriedFromLabel = task.carriedFromDate
    ? `Перенесено з ${new Date(task.carriedFromDate).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}`
    : "";
  const carriedFromText = task.carriedFromDate
    ? `від ${new Date(task.carriedFromDate).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}`
    : "";
  const subtaskProgressPct = hasChildren
    ? Math.round((completedSubtasks / task.children.length) * 100)
    : 0;

  return (
    <div
      ref={setNodeRef}
      className={cardClass}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (style?.transform) return;
        onEdit(task);
      }}
      style={style}
    >
      <div className={actionBarClass}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFrog();
          }}
          className={actionButtonClass}
          title={task.isFrog ? "Зняти жабу" : "Зробити жабою"}
        >
          <span role="img" aria-label="frog">
            🐸
          </span>
        </button>
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(task);
            }}
            className={actionButtonClass}
            title="Duplicate task"
          >
            <Copy size={actionIconSize} />
          </button>
        )}
        {onAddChild && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(task);
            }}
            className={actionButtonClass}
            title="Add subtask"
          >
            <Plus size={actionIconSize} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteDialogOpen(true);
          }}
          className={deleteButtonClass}
          title="Delete task"
        >
          <Trash2 size={actionIconSize} />
        </button>
      </div>

      {task.parentId && (
        <div onClick={handleParentClick} className={parentLinkClass}>
          <ArrowUp size={parentArrowSize} />
          {task.parentIcon &&
            ALL_ICONS[task.parentIcon] &&
            (() => {
              const PIcon = ALL_ICONS[task.parentIcon];
              return <PIcon size={dateIconSize} />;
            })()}
          <span className="truncate">{parentLabel}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {task.icon && SPHERE_ICONS[task.icon] ? (
            (() => {
              const Icon = SPHERE_ICONS[task.icon];
              return <Icon size={iconSize} strokeWidth={2.5} className="text-zinc-400 shrink-0" />;
            })()
          ) : (
            <FileText size={iconSize} strokeWidth={2.5} className="text-zinc-500 shrink-0" />
          )}
          <h3 className={titleClass} dangerouslySetInnerHTML={titleHtml} title={titleText} />
          {isActiveNow && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-mono font-semibold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Зараз
            </span>
          )}
          {task.isFrog && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-mono font-semibold uppercase tracking-wide">
              <span role="img" aria-label="frog">
                🐸
              </span>{" "}
              Frog
            </span>
          )}
        </div>

        {task.project && (
          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
            <Folder size={10} className="text-amber-500/70 shrink-0" />
            <span className="text-amber-400/90 font-medium truncate max-w-full" title={task.project.title}>
              {task.project.title}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
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
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400 text-[10px] font-mono uppercase tracking-wide">
              {(() => {
                const SphereIcon = SPHERE_ICONS[task.sphere.icon] || FileText;
                return <SphereIcon size={sphereIconSize} strokeWidth={3} />;
              })()}
              {task.sphere.name}
            </div>
          )}
        </div>

        {!isCompact && descriptionText && (
          <div
            className="text-caption line-clamp-2"
            dangerouslySetInnerHTML={{ __html: formatText(descriptionText) }}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        {hasChildren && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${subtaskProgressPct}%` }}
              />
            </div>
            <span className="text-label">{subtaskProgressPct}%</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-500">
          {plannedLabel && (
            <div className="flex items-center gap-1" title="Planned for">
              <Calendar size={dateIconSize} />
              <span>{plannedLabel}</span>
            </div>
          )}

          {dueLabel && (
            <div className={dueLabelClass} title="Deadline">
              <Flag size={dateIconSize} />
              <span>{dueLabel}</span>
            </div>
          )}

          {task.carriedFromDate && (
            <div className="flex items-center gap-1" title={carriedFromLabel}>
              <RefreshCw size={dateIconSize} />
              <span>{carriedFromText}</span>
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
