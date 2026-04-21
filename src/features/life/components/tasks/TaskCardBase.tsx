"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, ArrowUp, Calendar, Flag, FileText, Copy } from "lucide-react";
import { deleteTaskAction } from "@/features/life/actions/task-actions";
import type { TaskData } from "@/features/life/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { StatusToggle } from "./StatusToggle";
import { PriorityToggle } from "./PriorityToggle";
import { ALL_ICONS, SPHERE_ICONS } from "./lucide-icons-map";

export interface TaskCardBaseProps {
  task:         TaskData;
  onEdit:       (task: TaskData) => void;
  onDuplicate?: (task: TaskData) => void;
  onAddChild?:  (parent: TaskData) => void;
  allTasks?:     TaskData[];
  variant?:     "default" | "compact";
  isDragging?:  boolean;
  className?:   string;
  style?:       React.CSSProperties;
  listeners?:   any;
  attributes?:  any;
  setNodeRef?:  (node: HTMLElement | null) => void;
}

export function TaskCardBase({ 
  task, 
  onEdit, 
  onDuplicate, 
  onAddChild, 
  allTasks = [], 
  variant = "default",
  isDragging = false,
  className = "",
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
      try {
        await deleteTaskAction(task.id);
        toast.success("Task deleted");
      } catch {
        toast.error("Failed to delete task");
      }
    });
  };

  const formatDateTime = (date: Date | null, hasTime: boolean) => {
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
  };

  const plannedLabel = formatDateTime(task.plannedDate, task.hasPlannedTime);
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
    formatted = formatted.replace(/`(.*?)`/g, "<code class='bg-white/10 px-1 rounded font-mono text-[11px]'>$1</code>");
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
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Prevent click if we're dragging (dnd-kit specific check)
        if (style?.transform) return;
        onEdit(task);
      }}
      className={`
        group relative flex flex-col transition-all cursor-grab active:cursor-grabbing
        ${isCompact ? 'gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-lg md:rounded-xl border w-full mb-1.5 md:mb-2 last:mb-0' : 'gap-3 p-4 pt-5 rounded-2xl border h-full'}
        ${isDragging ? 'shadow-2xl ring-2 ring-accent border-accent bg-[#1a1a1a] z-[1000] scale-[1.02]' : isDone ? 'bg-surface/30 border-border/40 opacity-70' : 'bg-surface border-border shadow-md hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5'}
        ${className}
      `}
    >
      {/* Floating Actions */}
      <div className={`absolute ${isCompact ? 'top-1 right-1' : 'top-3 right-3'} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(task); }}
            className={`${isCompact ? 'p-1' : 'p-1.5'} rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors bg-surface/80 backdrop-blur-sm border border-border/50`}
            title="Duplicate task"
          >
            <Copy size={isCompact ? 10 : 12} />
          </button>
        )}
        {onAddChild && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(task); }}
            className={`${isCompact ? 'p-1' : 'p-1.5'} rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors bg-surface/80 backdrop-blur-sm border border-border/50`}
            title="Add subtask"
          >
            <Plus size={isCompact ? 10 : 12} />
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
          className={`${isCompact ? 'p-1' : 'p-1.5'} rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors bg-surface/80 backdrop-blur-sm border border-border/50`}
          title="Delete task"
        >
          <Trash2 size={isCompact ? 10 : 12} />
        </button>
      </div>

      {/* 1. TOP ROW: Breadcrumb only */}
      {task.parentId && (
        <div 
          onClick={handleParentClick}
          className={`flex items-center gap-1.5 font-bold text-muted/40 tracking-widest uppercase whitespace-nowrap overflow-hidden hover:text-accent transition-colors cursor-pointer group/parent mb-0.5 ${isCompact ? 'text-[8px] md:text-[10px] pr-10' : 'text-[9px] pr-20'}`}
        >
          <ArrowUp size={isCompact ? 8 : 8} className="shrink-0 group-hover/parent:-translate-y-0.5 transition-transform" />
          {task.parentIcon && ALL_ICONS[task.parentIcon] && (() => {
             const PIcon = ALL_ICONS[task.parentIcon];
             return <PIcon size={isCompact ? 8 : 10} className="shrink-0 opacity-40" />;
          })()}
          <span className="truncate underline decoration-dotted underline-offset-2">{task.parentTitle || 'Parent Task'}</span>
        </div>
      )}

      {/* 2. MAIN CONTENT */}
      <div className={`flex flex-col ${isCompact ? 'gap-1 md:gap-1.5' : 'gap-2.5 flex-1'}`}>
        <div className={`flex items-start gap-2.5 min-w-0 ${isCompact ? 'gap-1' : ''}`}>
          {task.icon && SPHERE_ICONS[task.icon] ? (() => {
            const Icon = SPHERE_ICONS[task.icon];
            return <Icon size={isCompact ? 10 : 16} className="text-accent/40 shrink-0 mt-0.5" strokeWidth={2.5} />;
          })() : (
            <FileText size={isCompact ? 10 : 16} className="text-accent/40 shrink-0 mt-0.5" strokeWidth={2.5} />
          )}
          <h3 
            className={`font-bold tracking-tight leading-tight transition-colors ${isCompact ? 'text-[10px] md:text-xs' : 'text-[16px]'} ${isDone ? 'text-muted/50 line-through' : 'text-text'}`}
            dangerouslySetInnerHTML={{ __html: formatText(task.title) }}
            title={task.title}
          />
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-1 flex-wrap min-w-0">
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
               className={`flex items-center gap-1 px-1 py-0.5 rounded border font-mono font-bold uppercase tracking-wider whitespace-nowrap ${isCompact ? 'text-[7px] md:text-[8px]' : 'px-2 rounded-xl text-[9px]'}`}
               style={{ backgroundColor: `${task.sphere.color}15`, borderColor: `${task.sphere.color}40`, color: task.sphere.color }}
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
            className={`text-[12px] leading-relaxed text-[#d1d1d1] font-medium whitespace-pre-wrap mt-1 ${isDone ? 'text-muted/40' : ''}`}
            dangerouslySetInnerHTML={{ __html: formatText(task.description) }}
          />
        )}
      </div>

      {/* 3. BOTTOM ROW */}
      <div className={`mt-2 flex flex-col ${isCompact ? 'gap-1 md:gap-1.5' : 'gap-2.5'}`}>
        {hasChildren && (() => {
          const pct = Math.round((completedSubtasks / task.children.length) * 100);
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[8px] font-mono text-muted/50 shrink-0 tabular-nums">{pct}%</span>
            </div>
          );
        })()}
        
        <div className={`pt-1 md:pt-1.5 border-t border-white/[0.03] flex items-center gap-3 flex-wrap ${isCompact ? '' : 'pt-2.5 gap-5'}`}>
            {plannedLabel && (
              <div className={`flex items-center gap-1 text-mono text-muted leading-none ${isCompact ? 'text-[8px] md:text-[10px]' : 'text-[10px] gap-1.5'}`} title="Planned for">
                <Calendar size={isCompact ? 8 : 11} className="text-accent/40" />
                <span className="text-text font-black leading-none">{plannedLabel}</span>
              </div>
            )}

            {dueLabel && (
              <div 
                className={`flex items-center gap-1 text-mono leading-none ${isOverdue ? "text-rose-400 font-bold" : "text-muted"} ${isCompact ? 'text-[8px] md:text-[10px]' : 'text-[10px] gap-1.5'}`} 
                title="Deadline"
              >
                <Flag size={isCompact ? 8 : 11} className={`${isOverdue ? "text-rose-500 fill-rose-500/10 animate-pulse" : "text-rose-500/60"} shrink-0`} />
                <span className={`${isOverdue ? "text-rose-500" : "text-rose-400"} leading-none font-black`}>{dueLabel}</span>
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
