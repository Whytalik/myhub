"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, ArrowUp, Calendar, Flag, FileText, Copy } from "lucide-react";
import { deleteTaskAction } from "@/features/life/actions/task-actions";
import type { TaskData } from "@/features/life/types";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { StatusToggle, STATUS_CONFIG } from "./StatusToggle";
import { PriorityBadge } from "./PriorityBadge";
import { SPHERE_ICONS } from "./lucide-icons-map";

interface TaskRowProps {
  task:         TaskData;
  onAddChild:   (parent: TaskData) => void;
  onEdit:       (task: TaskData) => void;
  onDuplicate:  (task: TaskData) => void;
  allTasks:     TaskData[];
}

export function TaskRow({ task, onAddChild, onEdit, onDuplicate, allTasks }: TaskRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

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
    const options: Intl.DateTimeFormatOptions = { 
      month: "long", 
      day: "numeric",
      year: "numeric"
    };
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

  const isDone = task.status === "DONE" || task.status === "CANCELLED";

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

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div
        onClick={() => onEdit(task)}
        className={`
          group relative flex flex-col gap-3 p-4 pt-5 rounded-2xl border transition-all h-full cursor-pointer
          ${isDone ? "bg-surface/30 border-border/40 opacity-70" : "bg-surface border-border shadow-md hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"}
        `}
      >
        {/* Floating Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              if (typeof onDuplicate === 'function') onDuplicate(task); 
            }}
            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors bg-surface/80 backdrop-blur-sm border border-border/50"
            title="Duplicate task"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-raised transition-colors bg-surface/80 backdrop-blur-sm border border-border/50"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddChild(task); }}
            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors bg-surface/80 backdrop-blur-sm border border-border/50"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsDeleteDialogOpen(true); }}
            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors bg-surface/80 backdrop-blur-sm border border-border/50"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* 1. TOP ROW: Breadcrumb only (conditionally rendered to save space) */}
        {task.parentId && (
          <div 
            onClick={handleParentClick}
            className="flex items-center gap-1.5 text-[9px] font-bold text-muted/40 tracking-widest uppercase whitespace-nowrap overflow-hidden pr-20 hover:text-accent transition-colors cursor-pointer group/parent"
          >
            <ArrowUp size={8} className="shrink-0 group-hover/parent:-translate-y-0.5 transition-transform" />
            {task.parentIcon && SPHERE_ICONS[task.parentIcon] && (() => {
               const PIcon = SPHERE_ICONS[task.parentIcon];
               return <PIcon size={10} className="shrink-0 opacity-40" />;
            })()}
            <span className="truncate underline decoration-dotted underline-offset-2">{task.parentTitle || 'Parent Task'}</span>
          </div>
        )}

        {/* 2. MAIN CONTENT: Title & Metadata below it */}
        <div className="flex flex-col gap-2.5 flex-1">
          <div className="flex items-center gap-2.5 min-w-0">
            {task.icon && SPHERE_ICONS[task.icon] ? (() => {
              const Icon = SPHERE_ICONS[task.icon];
              return <Icon size={16} className="text-accent/40 shrink-0" strokeWidth={2.5} />;
            })() : (
              <FileText size={16} className="text-accent/40 shrink-0" strokeWidth={2.5} />
            )}
            <h3 
              className={`text-[16px] font-bold tracking-tight leading-tight transition-colors ${isDone ? 'text-muted/50 line-through' : 'text-text'}`}
              dangerouslySetInnerHTML={{ __html: formatText(task.title) }}
              title={task.title}
            />
          </div>

          {/* Metadata Row under Title */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div className="flex items-center justify-center h-5" onClick={(e) => e.stopPropagation()}>
              <StatusToggle taskId={task.id} status={task.status} />
            </div>
            {(() => {
              const statusCfg = STATUS_CONFIG[task.status];
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ backgroundColor: `${statusCfg.color}15`, borderColor: `${statusCfg.color}40`, color: statusCfg.color }}
                >
                  <StatusIcon size={10} strokeWidth={3} />
                  {statusCfg.label}
                </div>
              );
            })()}
            <PriorityBadge priority={task.priority} />
            {task.sphere && (
               <div 
                 className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl border text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                 style={{ backgroundColor: `${task.sphere.color}15`, borderColor: `${task.sphere.color}40`, color: task.sphere.color }}
               >
                 {(() => {
                   const SphereIcon = SPHERE_ICONS[task.sphere.icon] || FileText;
                   return <SphereIcon size={10} strokeWidth={3} />;
                 })()}
                 {task.sphere.name}
               </div>
            )}
          </div>

          {task.description && (
            <div 
              className={`text-[12px] leading-relaxed text-[#d1d1d1] font-medium whitespace-pre-wrap mt-1 ${isDone ? 'text-muted/40' : ''}`}
              dangerouslySetInnerHTML={{ __html: formatText(task.description) }}
            />
          )}
        </div>

        {/* 3. BOTTOM ROW: Progress + Dates */}
        <div className="mt-2 flex flex-col gap-2.5">
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
          <div className="pt-2.5 border-t border-white/[0.03] flex items-center gap-5 flex-wrap">
              {plannedLabel && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted leading-none" title="Planned for">
                  <Calendar size={11} className="text-accent/40" />
                  <span className="text-text font-black leading-none">{plannedLabel}</span>
                </div>
              )}

              {dueLabel && (
                <div 
                  className={`flex items-center gap-1.5 text-[10px] font-mono leading-none ${isOverdue ? "text-rose-400 font-bold" : "text-muted"}`} 
                  title="Deadline"
                >
                  <Flag size={11} className={`${isOverdue ? "text-rose-500 fill-rose-500/10 animate-pulse" : "text-rose-500/60"} shrink-0`} />
                  <span className={`${isOverdue ? "text-rose-500" : "text-rose-400"} leading-none font-black`}>{dueLabel}</span>
                </div>
              )}
          </div>
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
