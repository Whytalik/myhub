"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { IconPickerDialog } from "./IconPickerDialog";
import { upsertTaskAction } from "@/features/life/actions/task-actions";
import { STATUS_CONFIG } from "./StatusToggle";
import { PRIORITY_CONFIG } from "./PriorityBadge";
import { ALL_ICONS, SPHERE_ICONS } from "./lucide-icons-map";
import type { TaskData, LifeSphereData, TaskStatus, TaskPriority } from "@/features/life/types";
import { toast } from "sonner";
import {
  AlertCircle, CalendarClock, Flag, Pencil, FileText,
  Clock, Link2Off, Eye, ChevronRight
} from "lucide-react";

interface TaskFormDialogProps {
  isOpen:       boolean;
  onClose:      () => void;
  task?:        TaskData | null;
  parentTask?:  TaskData | null;
  spheres:      LifeSphereData[];
  allTasks?:    TaskData[];
  onViewTask?:  (task: TaskData) => void;
  isDuplicate?: boolean;
}

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1">
      {children} <span className="text-rose-500 font-bold">*</span>
    </label>
  );
}

// ─── Main Dialog ─────────────────────────────────────────────────────────────

export function TaskFormDialog({
  isOpen,
  onClose,
  task,
  parentTask,
  spheres,
  allTasks = [],
  onViewTask,
  isDuplicate = false,
}: TaskFormDialogProps) {
  const isEditing = !!task && !isDuplicate;
  const [isViewOnly, setIsViewOnly] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showErrors, setShowErrors]   = useState(false);

  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon]               = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [status, setStatus]           = useState<TaskStatus>("TODO");
  const [priority, setPriority]       = useState<TaskPriority>("MEDIUM");
  const [sphereId, setSphereId]       = useState("");
  const [parentId, setParentId]       = useState<string | null>(null);

  const [plannedDate, setPlannedDate] = useState("");
  const [plannedTime, setPlannedTime] = useState("");
  const [hasPlannedTime, setHasPlannedTime] = useState(false);

  const [useDeadline, setUseDeadline] = useState(false);
  const [dueDate, setDueDate]         = useState("");
  const [dueTime, setDueTime]         = useState("");
  const [hasDueTime, setHasDueTime]   = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsViewOnly(!!task && !isDuplicate);
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setIcon(task?.icon ?? parentTask?.icon ?? null);
      setStatus(isDuplicate ? "TODO" : (task?.status ?? "TODO"));
      setPriority(task?.priority ?? parentTask?.priority ?? "MEDIUM");
      setSphereId(task?.sphereId ?? parentTask?.sphereId ?? (spheres[0]?.id ?? ""));
      setParentId(task?.parentId ?? parentTask?.id ?? null);

      setPlannedDate(task?.plannedDate ? new Date(task.plannedDate).toISOString().split("T")[0] : "");
      setPlannedTime(task?.plannedDate && task.hasPlannedTime ? new Date(task.plannedDate).toTimeString().slice(0, 5) : "");
      setHasPlannedTime(task?.hasPlannedTime ?? false);

      const hasDue = !!task?.dueDate;
      setUseDeadline(hasDue);
      setDueDate(hasDue ? new Date(task!.dueDate!).toISOString().split("T")[0] : "");
      setDueTime(hasDue && task!.hasDueTime ? new Date(task!.dueDate!).toTimeString().slice(0, 5) : "");
      setHasDueTime(task?.hasDueTime ?? false);
    }
  }, [isOpen, task, parentTask, spheres, isDuplicate]);

  const handleClose = () => {
    if (!isEditing && !isDuplicate) {
      setTitle("");
      setDescription("");
      setIcon(null);
      setStatus("TODO");
      setPriority("MEDIUM");
      setSphereId(spheres[0]?.id ?? "");
      setParentId(null);
      setPlannedDate("");
      setPlannedTime("");
      setHasPlannedTime(false);
      setUseDeadline(false);
      setDueDate("");
      setDueTime("");
      setHasDueTime(false);
      setShowErrors(false);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !sphereId) {
      setShowErrors(true);
      if (!title.trim()) toast.error("Title is required");
      else if (!sphereId) toast.error("Life Sphere is required");
      return;
    }

    let finalPlannedDate: string | null = null;
    if (plannedDate) {
      finalPlannedDate = `${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00`;
    }

    let finalDueDate: string | null = null;
    if (useDeadline && dueDate) {
      finalDueDate = `${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00`;
      if (finalPlannedDate && new Date(finalDueDate) < new Date(finalPlannedDate)) {
        toast.error("Deadline cannot be earlier than the Planned Day");
        return;
      }
    }

    startTransition(async () => {
      try {
        await upsertTaskAction({
          id:          isDuplicate ? undefined : task?.id,
          title:       title.trim(),
          description: description.trim() || null,
          icon,
          status:      status,
          priority,
          plannedDate: finalPlannedDate,
          hasPlannedTime,
          dueDate:     finalDueDate,
          hasDueTime,
          parentId,
          sphereId,
        });
        toast.success(isEditing ? "Task updated" : isDuplicate ? "Task duplicated" : "Task created");
        handleClose();
      } catch (err) {
        toast.error("Failed to save task");
        console.error(err);
      }
    });
  };

  const handleUnlinkSubtask = async (subtask: TaskData) => {
    startTransition(async () => {
      try {
        await upsertTaskAction({
          id: subtask.id,
          parentId: null, // Clear parent
        });
        toast.success("Subtask unlinked");
      } catch {
        toast.error("Failed to unlink subtask");
      }
    });
  };

  const handleTogglePlannedTime = (checked: boolean) => {
    setHasPlannedTime(checked);
    if (checked && !plannedTime) setPlannedTime("12:00");
  };

  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };

  const dialogTitle = isViewOnly && task
    ? "View Task"
    : isDuplicate ? "Duplicate Task" : isEditing ? "Edit Task" : parentTask ? "Add Subtask" : "New Task";

  const dialogDescription = isViewOnly && task
    ? "View task details and update status"
    : isDuplicate ? "Create a copy of this task" : isEditing ? "Update task details" : parentTask ? `Under: ${parentTask.title}` : "Create a new task";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={dialogTitle}
      description={dialogDescription}
      maxWidth="1300px"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            {!isViewOnly && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Required Fields</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsViewOnly(!isViewOnly)} 
                disabled={isPending}
              >
                {isViewOnly ? "Edit Details" : "Cancel Edit"}
              </Button>
            )}
            {!isEditing && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isPending}>
                Cancel
              </Button>
            )}
            {(!isViewOnly || !isEditing) && (
              <Button
                type="submit"
                form="task-form"
                variant="primary"
                size="sm"
                disabled={isPending || (!isViewOnly && showErrors && !title.trim())}
                className="min-w-[120px]"
              >
                {isPending ? "Saving…" : isDuplicate ? "Duplicate & Create" : isEditing ? "Save Changes" : "Create Task"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        {/* Title & Status Badge for View Mode */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <RequiredLabel>Title</RequiredLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              disabled={isViewOnly}
              className={`text-[15px] font-medium h-11 px-4 rounded-xl transition-all ${showErrors && !title.trim() ? "border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20" : ""}`}
              autoFocus
              required
            />
            {isViewOnly && task && (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {/* Status Badge */}
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                  style={{ 
                    color: STATUS_CONFIG[status].color, 
                    borderColor: `${STATUS_CONFIG[status].color}30`, 
                    backgroundColor: `${STATUS_CONFIG[status].color}10` 
                  }}
                >
                  {(() => {
                    const Icon = STATUS_CONFIG[status].icon;
                    return <Icon size={12} strokeWidth={3} />;
                  })()}
                  {STATUS_CONFIG[status].label}
                </div>

                {/* Priority Badge */}
                {(() => {
                   const pCfg = PRIORITY_CONFIG[priority];
                   const PIcon = pCfg.icon;
                   return (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: pCfg.color, borderColor: `${pCfg.color}30`, backgroundColor: `${pCfg.color}10` }}
                      >
                        <PIcon size={12} strokeWidth={3} />
                        {pCfg.label}
                      </div>
                   );
                })()}

                {/* Sphere Badge */}
                {(() => {
                   const sphere = spheres.find(s => s.id === sphereId);
                   if (!sphere) return null;
                   const SphereIcon = ALL_ICONS[sphere.icon] || FileText;
                   return (
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: sphere.color, borderColor: `${sphere.color}30`, backgroundColor: `${sphere.color}10` }}
                      >
                        <SphereIcon size={12} strokeWidth={3} />
                        {sphere.name}
                      </div>
                   );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Column 1: Metadata */}
          <div className="flex flex-col gap-5">
            {/* Hierarchy Selector */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Hierarchy</label>
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                disabled={isViewOnly}
                placeholder="No Parent Task"
                options={[
                  { id: "none", label: "None (Top Level)", icon: Link2Off, color: "#666" },
                  ...(() => {
                    const getDescendants = (id: string): string[] => {
                      const children = allTasks.filter(t => t.parentId === id);
                      return [...children.map(c => c.id), ...children.flatMap(c => getDescendants(c.id))];
                    };
                    const forbidden = task ? [task.id, ...getDescendants(task.id)] : [];
                    return allTasks
                      .filter(t => !forbidden.includes(t.id))
                      .map(t => ({
                        id: t.id,
                        label: t.title,
                        icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText,
                        color: t.sphere?.color || "#888",
                      }));
                  })()
                ]}
              />
            </div>

            {/* Icon Picker */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Symbol</label>
              <div className={`flex items-center gap-4 p-4 bg-surface/50 border border-border rounded-2xl group transition-all ${!isViewOnly ? "hover:border-accent/40" : ""}`}>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  {icon && ALL_ICONS[icon] ? (() => {
                    const Icon = ALL_ICONS[icon];
                    return <Icon size={24} className="text-accent" />;
                  })() : (
                    <FileText size={22} className="text-muted/40" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-bold text-text truncate max-w-[140px]">{icon || "No icon selected"}</span>
                  {!isViewOnly && (
                    <button
                      type="button"
                      onClick={() => setIconPickerOpen(true)}
                      className="text-[10px] font-black uppercase tracking-[0.1em] text-accent hover:underline flex items-center gap-1.5"
                    >
                      <Pencil size={10} /> Change Symbol
                    </button>
                  )}
                </div>
              </div>
              {!isViewOnly && (
                <IconPickerDialog
                  isOpen={iconPickerOpen}
                  onClose={() => setIconPickerOpen(false)}
                  value={icon}
                  onChange={setIcon}
                  color={spheres.find(s => s.id === sphereId)?.color}
                  title="Task Symbol"
                />
              )}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2.5">
              <RequiredLabel>Status</RequiredLabel>
              <CustomSelect
                value={status}
                onChange={(val) => setStatus(val as TaskStatus)}
                disabled={isViewOnly}
                options={Object.keys(STATUS_CONFIG).map((s) => ({
                  id: s,
                  label: STATUS_CONFIG[s as TaskStatus].label,
                  icon: STATUS_CONFIG[s as TaskStatus].icon,
                  color: STATUS_CONFIG[s as TaskStatus].color,
                }))}
              />
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-2.5">
              <RequiredLabel>Priority</RequiredLabel>
              <CustomSelect
                value={priority}
                onChange={(val) => setPriority(val as TaskPriority)}
                disabled={isViewOnly}
                options={Object.keys(PRIORITY_CONFIG).map((p) => ({
                  id: p,
                  label: PRIORITY_CONFIG[p as TaskPriority].label,
                  icon: PRIORITY_CONFIG[p as TaskPriority].icon,
                  color: PRIORITY_CONFIG[p as TaskPriority].color,
                }))}
              />
            </div>

            {/* Sphere */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <RequiredLabel>Life Sphere</RequiredLabel>
                {showErrors && !sphereId && (
                  <span className="text-[9px] font-mono text-rose-500 uppercase tracking-tighter flex items-center gap-1">
                    <AlertCircle size={10} /> Selection required
                  </span>
                )}
              </div>
              <CustomSelect
                value={sphereId}
                onChange={setSphereId}
                disabled={isViewOnly}
                placeholder="Select a sphere"
                options={spheres.map((s) => ({
                  id: s.id,
                  label: s.name,
                  icon: ALL_ICONS[s.icon],
                  color: s.color,
                }))}
                style={sphereId ? {
                  color: spheres.find(s => s.id === sphereId)?.color,
                  borderColor: `${spheres.find(s => s.id === sphereId)?.color}40`,
                } : undefined}
              />
            </div>
          </div>

          {/* Column 2: Planning only */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Planning</label>
            <div className="flex flex-col gap-4 p-5 bg-raised/20 rounded-3xl border border-border/40">
              <div className="flex flex-col gap-6 items-start">
                {/* Planned Date */}
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-accent">
                      <CalendarClock size={14} />
                      <label className="text-[10px] font-mono uppercase tracking-wider text-muted">Planned Day</label>
                    </div>
                    <label className={`flex items-center gap-1.5 text-[9px] font-mono text-secondary cursor-pointer group ${isViewOnly ? "pointer-events-none opacity-50" : ""}`}>
                      <input
                        type="checkbox"
                        checked={hasPlannedTime}
                        disabled={isViewOnly}
                        onChange={(e) => handleTogglePlannedTime(e.target.checked)}
                        className="accent-accent w-3.5 h-3.5"
                      />
                      <span className="group-hover:text-text transition-colors">Time</span>
                    </label>
                  </div>
                  <DatePicker value={plannedDate} onChange={setPlannedDate} disabled={isViewOnly} placeholder="Optional" />
                  {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} disabled={isViewOnly} className="mt-1 animate-in fade-in slide-in-from-top-1" />}
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-3 w-full border-t border-border/30 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted">
                      <Flag size={14} />
                      <label className="text-[10px] font-mono uppercase tracking-wider">Due Date</label>
                    </div>
                    <div className="flex items-center gap-3">
                      {useDeadline && (
                        <label className={`flex items-center gap-1.5 text-[9px] font-mono text-secondary cursor-pointer group ${isViewOnly ? "pointer-events-none opacity-50" : ""}`}>
                          <input
                            type="checkbox"
                            checked={hasDueTime}
                            disabled={isViewOnly}
                            onChange={(e) => handleToggleDueTime(e.target.checked)}
                            className="accent-accent w-3.5 h-3.5"
                          />
                          <span className="group-hover:text-text transition-colors">Time</span>
                        </label>
                      )}
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => setUseDeadline(!useDeadline)}
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border disabled:opacity-50 ${useDeadline ? "bg-rose-500/10 text-rose-500 border-rose-500/30" : "bg-surface text-muted border-border"}`}
                      >
                        {useDeadline ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>
                  {useDeadline ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-1">
                      <DatePicker value={dueDate} onChange={setDueDate} disabled={isViewOnly} />
                      {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} disabled={isViewOnly} className="mt-1 animate-in fade-in slide-in-from-top-1" />}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-border/20 rounded-2xl min-h-[80px]">
                      <span className="text-[10px] font-mono text-muted/30 uppercase tracking-widest text-center px-4">Optional Deadline</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Description & Subtasks Section */}
          <div className="flex flex-col gap-6 h-full">
            {/* Description */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isViewOnly}
                placeholder="Notes, steps, or details (Markdown supported)..."
                rows={3}
                className="w-full min-h-[80px] resize-none bg-surface/50 border border-border rounded-2xl px-5 py-4 text-[12px] text-text placeholder:text-muted outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Subtasks */}
            <div className="flex flex-col gap-2.5">
              {task && task.children && task.children.length > 0 ? (
                <>
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1 flex items-center gap-2">
                    Subtasks <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px]">{task.children.length}</span>
                  </label>
                  <div className="flex flex-col gap-1 bg-surface/30 border border-border/40 rounded-2xl p-2 max-h-[280px] overflow-y-auto scrollbar-hide">
                    {task.children.map(child => (
                        <div key={child.id} className="group/item flex items-center justify-between p-2 hover:bg-raised/50 rounded-xl transition-all border border-transparent hover:border-border/30">
                          <div className="flex items-center gap-2.5 min-w-0">
                              {child.icon && SPHERE_ICONS[child.icon] ? (() => {
                                const Icon = SPHERE_ICONS[child.icon];
                                return <Icon size={12} className="text-accent/60 shrink-0" />;
                              })() : <FileText size={12} className="text-muted/40 shrink-0" />}
                              <span className={`text-[12px] font-medium truncate ${child.status === 'DONE' ? 'line-through text-muted/50' : 'text-text'}`}>
                                {child.title}
                              </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              {onViewTask && (
                                <button
                                  type="button"
                                  onClick={() => onViewTask(child)}
                                  className="p-1 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all"
                                  title="View subtask"
                                >
                                    <Eye size={12} />
                                </button>
                              )}
                              {!isViewOnly && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkSubtask(child)}
                                  className="p-1 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-400/10 transition-all"
                                  title="Unlink from parent"
                                >
                                    <Link2Off size={12} />
                                </button>
                              )}
                              <ChevronRight size={11} className="text-muted/20" />
                          </div>
                        </div>
                    ))}
                  </div>
                </>
              ) : isEditing && (
                <div className="flex flex-col gap-2.5 opacity-40">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Subtasks</label>
                  <div className="flex flex-col items-center justify-center border border-dashed border-border/20 rounded-2xl min-h-[100px] text-center p-4">
                    <span className="text-[10px] font-mono text-muted uppercase tracking-widest">No subtasks</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
}
