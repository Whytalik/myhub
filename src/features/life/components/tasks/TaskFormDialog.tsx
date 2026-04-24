"use client";

import { useState, useTransition } from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { IconPickerDialog } from "./IconPickerDialog";
import { upsertTaskAction, deleteTaskAction } from "@/features/life/actions/task-actions";
import { STATUS_CONFIG } from "./StatusToggle";
import { PRIORITY_CONFIG } from "./PriorityBadge";
import { ALL_ICONS, SPHERE_ICONS } from "./lucide-icons-map";
import type { TaskData, LifeSphereData, TaskStatus, TaskPriority } from "@/features/life/types";
import { toast } from "sonner";
import {
  CalendarClock, Flag, Pencil, FileText,
  Link2Off, Eye, Lock,
  Trash2, Calendar, LayoutGrid
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

// ─── Unified Form (New Task / Creation) ─────────────────────────────────────

interface UnifiedTaskFormProps {
  spheres: LifeSphereData[];
  allTasks: TaskData[];
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  icon: string | null;
  setIcon: (v: string | null) => void;
  iconPickerOpen: boolean;
  setIconPickerOpen: (v: boolean) => void;
  status: TaskStatus;
  setStatus: (v: TaskStatus) => void;
  priority: TaskPriority;
  setPriority: (v: TaskPriority) => void;
  sphereId: string;
  setSphereId: (v: string) => void;
  parentId: string | null;
  setParentId: (v: string | null) => void;
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
  plannedDate: string;
  setPlannedDate: (v: string) => void;
  plannedTime: string;
  setPlannedTime: (v: string) => void;
  hasPlannedTime: boolean;
  setHasPlannedTime: (v: boolean) => void;
  useDeadline: boolean;
  setUseDeadline: (v: boolean) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  dueTime: string;
  setDueTime: (v: string) => void;
  hasDueTime: boolean;
  setHasDueTime: (v: boolean) => void;
  onSubmit: () => void;
  isPending: boolean;
  showErrors: boolean;
}

function UnifiedTaskForm({
  spheres, allTasks,
  title, setTitle, description, setDescription,
  icon, setIcon, iconPickerOpen, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId, setSphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  onSubmit, isPending, showErrors,
}: UnifiedTaskFormProps) {
  const handleTogglePlannedTime = (checked: boolean) => {
    setHasPlannedTime(checked);
    if (checked && !plannedTime) setPlannedTime("12:00");
  };

  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };

  const sphere = spheres.find(s => s.id === sphereId);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="flex flex-col">
      <div className="p-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8">
        {/* Left Side: Core Info */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">
              Title <span className="text-rose-500 font-bold">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={`text-[18px] font-bold h-12 px-5 rounded-xl border-border/60 bg-surface/30 focus:bg-surface focus:ring-2 focus:ring-accent/20 ${showErrors && !title.trim() ? "border-rose-500 bg-rose-500/5 ring-rose-500/10" : ""}`}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details or markdown notes..."
              className="w-full min-h-[140px] resize-none bg-surface/30 border border-border/60 rounded-2xl px-5 py-4 text-[13px] text-text placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-accent/20 focus:bg-surface transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Symbol</label>
            <button
              type="button"
              onClick={() => setIconPickerOpen(true)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-surface/30 hover:border-accent/40 hover:bg-surface transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/10 group-hover:scale-110 transition-transform">
                {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={18} className="text-accent" />; })() : <FileText size={16} className="text-muted/40" />}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[13px] font-bold text-text">{icon || "Default Icon"}</span>
                <span className="text-[10px] text-muted font-mono tracking-wider uppercase">Pick a symbol</span>
              </div>
              <Pencil size={12} className="ml-auto text-muted group-hover:text-accent transition-colors" />
            </button>
            <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={sphere?.color} title="Task Symbol" />
          </div>
        </div>

        {/* Right Side: Settings & Planning */}
        <div className="flex flex-col gap-6 bg-raised/20 p-5 rounded-2xl border border-border/40 h-fit">
          <div className="flex flex-col gap-4">
             <div className="flex flex-col gap-2">
                <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Life Sphere</label>
                <CustomSelect
                  value={sphereId}
                  onChange={setSphereId}
                  options={spheres.map((s) => ({
                    id: s.id, label: s.name, icon: ALL_ICONS[s.icon], color: s.color,
                  }))}
                />
             </div>
             <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Status</label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val as TaskStatus)}
                    options={(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => ({
                      id: s, label: STATUS_CONFIG[s as TaskStatus].label, icon: STATUS_CONFIG[s as TaskStatus].icon, color: STATUS_CONFIG[s as TaskStatus].color,
                    }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Priority</label>
                  <CustomSelect
                    value={priority}
                    onChange={(val) => setPriority(val as TaskPriority)}
                    options={Object.keys(PRIORITY_CONFIG).map((p) => ({
                      id: p, label: PRIORITY_CONFIG[p as TaskPriority].label, icon: PRIORITY_CONFIG[p as TaskPriority].icon, color: PRIORITY_CONFIG[p as TaskPriority].color,
                    }))}
                  />
                </div>
             </div>
          </div>

          <div className="h-px bg-border/40" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Planning</label>
              <div className="flex flex-col gap-3 p-3 bg-surface/50 rounded-xl border border-border/40">
                <div className="flex items-center gap-2 text-accent">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Planned Day</span>
                </div>
                <DatePicker value={plannedDate} onChange={setPlannedDate} placeholder="Select day" />
                <label className="flex items-center gap-2 text-[10px] font-mono text-muted cursor-pointer hover:text-text transition-colors">
                  <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
                  <span>Set specific time</span>
                </label>
                {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} />}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-3 p-3 bg-rose-500/5 rounded-xl border border-rose-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Flag size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Due Date</span>
                  </div>
                  <button type="button" onClick={() => setUseDeadline(!useDeadline)} className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border transition-all ${useDeadline ? "bg-rose-500 text-white border-rose-500" : "bg-surface text-muted border-border"}`}>
                    {useDeadline ? "Active" : "Add"}
                  </button>
                </div>
                {useDeadline && (
                  <div className="flex flex-col gap-3">
                    <DatePicker value={dueDate} onChange={setDueDate} />
                    <label className="flex items-center gap-2 text-[10px] font-mono text-muted cursor-pointer">
                      <input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-rose-500 w-3.5 h-3.5" />
                      <span>Specific time</span>
                    </label>
                    {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} />}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Context</label>
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                placeholder="No parent"
                options={[
                  { id: "none", label: "Top Level", icon: Link2Off, color: "#666" },
                  ...allTasks.map((t: TaskData) => ({
                    id: t.id, label: t.title, icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText, color: t.sphere?.color || "#888",
                  }))
                ]}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/5 border-amber-500/30" : "bg-surface/30 border-border/60 hover:bg-surface"}`}
            >
              <Lock size={14} className={isPrivate ? "text-amber-500" : "text-muted/40"} />
              <span className={`text-[12px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>{isPrivate ? "Private" : "Public"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 bg-raised/10 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Required Fields</span>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => onSubmit()}>Cancel</Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending}
            className="min-w-[160px] shadow-lg shadow-accent/20"
          >
            {isPending ? "Saving..." : "Create Task"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Task Detail (Edit / Wide Mode) ──────────────────────────────────────────

interface TaskDetailProps {
  task: TaskData;
  spheres: LifeSphereData[];
  allTasks: TaskData[];
  onViewTask?: (t: TaskData) => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  icon: string | null;
  setIcon: (v: string | null) => void;
  iconPickerOpen: boolean;
  setIconPickerOpen: (v: boolean) => void;
  status: TaskStatus;
  setStatus: (v: TaskStatus) => void;
  priority: TaskPriority;
  setPriority: (v: TaskPriority) => void;
  sphereId: string;
  parentId: string | null;
  setParentId: (v: string | null) => void;
  isPrivate: boolean;
  setIsPrivate: (v: boolean) => void;
  plannedDate: string;
  setPlannedDate: (v: string) => void;
  plannedTime: string;
  setPlannedTime: (v: string) => void;
  hasPlannedTime: boolean;
  setHasPlannedTime: (v: boolean) => void;
  useDeadline: boolean;
  setUseDeadline: (v: boolean) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  dueTime: string;
  setDueTime: (v: string) => void;
  hasDueTime: boolean;
  setHasDueTime: (v: boolean) => void;
  hasChanges: boolean;
  onSave: () => void;
  onClose: () => void;
}

function TaskDetail({
  task, spheres, allTasks, onViewTask,
  title, setTitle, description, setDescription,
  icon, setIcon, iconPickerOpen, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  hasChanges, onSave, onClose,
}: TaskDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleTogglePlannedTime = (checked: boolean) => {
    setHasPlannedTime(checked);
    if (checked && !plannedTime) setPlannedTime("12:00");
  };
  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };
  const handleUnlinkSubtask = async (subtask: TaskData) => {
    try {
      await upsertTaskAction({ id: subtask.id, parentId: null });
      toast.success("Subtask unlinked");
    } catch { toast.error("Failed to unlink subtask"); }
  };
  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTaskAction(task.id);
        toast.success("Task deleted");
        onClose();
      } catch { toast.error("Failed to delete task"); }
    });
  };

  const sphere = spheres.find(s => s.id === sphereId);
  const statusCfg = STATUS_CONFIG[status];
  const priorityCfg = PRIORITY_CONFIG[priority];

  return (
    <div className="flex flex-col max-h-[90dvh]">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-6 border-b border-border/30 bg-raised/10">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0 cursor-pointer hover:bg-accent/20 transition-all" onClick={() => setIconPickerOpen(true)}>
          {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={24} className="text-accent" />; })() : <FileText size={22} className="text-muted/40" />}
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-[22px] font-bold text-text placeholder:text-muted/40 outline-none border-none p-0"
            placeholder="Task title"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-all"
              style={{ backgroundColor: sphere ? `${sphere.color}15` : "transparent", borderColor: sphere ? `${sphere.color}40` : "var(--border)", color: sphere?.color || "var(--muted)" }}
            >
              {sphere && ALL_ICONS[sphere.icon] && (() => { const I = ALL_ICONS[sphere.icon]; return <I size={10} strokeWidth={3} />; })()}
              {sphere?.name || "Sphere"}
            </button>
            <div className="w-px h-3 bg-border/50 mx-1" />
            <button
              onClick={() => setStatus(status === "DONE" ? "TODO" : status === "TODO" ? "IN_PROGRESS" : "DONE")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-all"
              style={{ backgroundColor: `${statusCfg.color}15`, borderColor: `${statusCfg.color}40`, color: statusCfg.color }}
            >
              <statusCfg.icon size={10} />
              {statusCfg.label}
            </button>
            <button
              onClick={() => setPriority(priority === "URGENT" ? "LOW" : "URGENT")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border transition-all"
              style={{ backgroundColor: `${priorityCfg.color}15`, borderColor: `${priorityCfg.color}40`, color: priorityCfg.color }}
            >
              <priorityCfg.icon size={10} />
              {priorityCfg.label}
            </button>
          </div>
        </div>
        <button onClick={() => setDeleteDialogOpen(true)} className="p-3 rounded-xl text-muted/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          {/* Main Column */}
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted/60 px-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes, steps, or details..."
                className="w-full min-h-[200px] resize-none bg-surface/30 border border-border/40 rounded-2xl px-5 py-4 text-[14px] text-text placeholder:text-muted/40 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </section>

            <section className="flex flex-col gap-4">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted/60 px-1 flex items-center justify-between">
                <span>Subtasks</span>
                {task.children?.length > 0 && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px]">{task.children.length}</span>}
              </label>
              {task.children?.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 bg-raised/10 border border-border/30 rounded-2xl p-2">
                  {task.children.map((child: TaskData) => (
                    <div key={child.id} className="group/item flex items-center justify-between p-3 hover:bg-surface/50 rounded-xl transition-all border border-transparent hover:border-border/30">
                      <div className="flex items-center gap-3 min-w-0">
                        {child.icon && SPHERE_ICONS[child.icon] ? (() => { const I = SPHERE_ICONS[child.icon]; return <I size={14} className="text-accent/50" />; })() : <FileText size={14} className="text-muted/30" />}
                        <span className={`text-[13px] font-medium truncate ${child.status === 'DONE' ? 'line-through text-muted/40' : 'text-text'}`}>{child.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {onViewTask && <button onClick={() => onViewTask(child)} className="p-1.5 rounded-lg text-muted hover:text-accent transition-all"><Eye size={14} /></button>}
                        <button onClick={() => handleUnlinkSubtask(child)} className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-all"><Link2Off size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/20 rounded-2xl bg-surface/10">
                  <LayoutGrid size={24} className="text-muted/10 mb-2" />
                  <span className="text-[10px] font-mono text-muted/30 uppercase tracking-widest">No active subtasks</span>
                </div>
              )}
            </section>
          </div>

          {/* Settings Column */}
          <div className="flex flex-col gap-6">
            <div className="p-5 rounded-2xl bg-raised/20 border border-border/40 flex flex-col gap-6">
              <section className="flex flex-col gap-4">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Planning</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <CalendarClock size={16} className="text-accent/50" />
                    <DatePicker value={plannedDate} onChange={setPlannedDate} />
                  </div>
                  <label className="flex items-center gap-2 ml-7 text-[10px] font-mono text-muted cursor-pointer">
                    <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
                    <span>Exact time</span>
                  </label>
                  {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} className="ml-7" />}
                </div>

                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-3">
                    <Flag size={16} className="text-rose-400/50" />
                    {useDeadline ? <DatePicker value={dueDate} onChange={setDueDate} /> : <button onClick={() => setUseDeadline(true)} className="text-[11px] text-muted italic hover:text-rose-400 transition-colors">Set deadline...</button>}
                  </div>
                  {useDeadline && (
                    <>
                      <label className="flex items-center gap-2 ml-7 text-[10px] font-mono text-muted cursor-pointer">
                        <input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-rose-500 w-3.5 h-3.5" />
                        <span>Exact time</span>
                      </label>
                      {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} className="ml-7" />}
                    </>
                  )}
                </div>
              </section>

              <div className="h-px bg-border/30" />

              <section className="flex flex-col gap-4">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Organization</label>
                <CustomSelect
                  value={parentId || "none"}
                  onChange={(val) => setParentId(val === "none" ? null : val)}
                  options={[{ id: "none", label: "Top Level", icon: Link2Off }, ...allTasks.filter((t: TaskData) => t.id !== task.id).map((t: TaskData) => ({ id: t.id, label: t.title, icon: LayoutGrid }))]}
                />
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/5 border-amber-500/20" : "bg-surface/30 border-border/40"}`}
                >
                  <Lock size={14} className={isPrivate ? "text-amber-500" : "text-muted/30"} />
                  <span className={`text-[12px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>{isPrivate ? "Private Entry" : "Public Entry"}</span>
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-8 py-4 bg-raised/20 border-t border-border/30">
        <div className="flex items-center gap-2">
          {hasChanges && <><div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" /><span className="text-[10px] font-mono text-muted uppercase tracking-wider">Unsaved changes</span></>}
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && <button onClick={onClose} className="px-4 py-2 text-[11px] font-mono text-muted hover:text-text transition-colors uppercase tracking-widest">Discard</button>}
          <Button onClick={onSave} disabled={!hasChanges} variant="primary" size="lg" className="min-w-[140px] shadow-lg shadow-accent/20">Save Changes</Button>
        </div>
      </div>

      <ConfirmationDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Task" description={`Permanently delete "${task.title}"?`} confirmLabel="Delete" variant="danger" />
      <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={sphere?.color} title="Task Symbol" />
    </div>
  );
}

// ─── Main Dialog Wrapper ───────────────────────────────────────────────────

export function TaskFormDialog({
  isOpen, onClose, task, parentTask, spheres, allTasks = [], onViewTask, isDuplicate = false,
}: TaskFormDialogProps) {
  const isEditing = !!task?.id && !isDuplicate;
  const [isPending, startTransition] = useTransition();
  const [showErrors, setShowErrors] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const getInitialValue = (key: string) => {
    if (key === 'icon') return task?.icon ?? parentTask?.icon ?? null;
    if (key === 'status') return isDuplicate ? "TODO" : (task?.status ?? "TODO");
    if (key === 'priority') return task?.priority ?? parentTask?.priority ?? "MEDIUM";
    if (key === 'sphereId') return task?.sphereId ?? parentTask?.sphereId ?? (spheres[0]?.id ?? "");
    if (key === 'parentId') return task?.parentId ?? parentTask?.id ?? null;
    return null;
  };

  const [title, setTitle] = useState(() => task?.title ?? "");
  const [description, setDescription] = useState(() => task?.description ?? "");
  const [icon, setIcon] = useState<string | null>(() => getInitialValue('icon'));
  const [status, setStatus] = useState<TaskStatus>(() => getInitialValue('status') as TaskStatus);
  const [priority, setPriority] = useState<TaskPriority>(() => getInitialValue('priority') as TaskPriority);
  const [sphereId, setSphereId] = useState(() => getInitialValue('sphereId') as string);
  const [parentId, setParentId] = useState<string | null>(() => getInitialValue('parentId'));
  const [isPrivate, setIsPrivate] = useState(() => task?.isPrivate ?? false);
  
  const [plannedDate, setPlannedDate] = useState(() => task?.plannedDate ? new Date(task.plannedDate).toISOString().split("T")[0] : "");
  const [plannedTime, setPlannedTime] = useState(() => task?.plannedDate && task?.hasPlannedTime ? new Date(task.plannedDate).toTimeString().slice(0, 5) : "");
  const [hasPlannedTime, setHasPlannedTime] = useState(() => task?.hasPlannedTime ?? false);
  
  const [useDeadline, setUseDeadline] = useState(() => !!task?.dueDate);
  const [dueDate, setDueDate] = useState(() => useDeadline && task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  const [dueTime, setDueTime] = useState(() => useDeadline && task?.hasDueTime ? new Date(task.dueDate!).toTimeString().slice(0, 5) : "");
  const [hasDueTime, setHasDueTime] = useState(() => task?.hasDueTime ?? false);

  const resetForm = () => {
    setTitle(""); setDescription(""); setIcon(null); setStatus("TODO"); setPriority("MEDIUM");
    setSphereId(spheres[0]?.id ?? ""); setParentId(null); setIsPrivate(false);
    setPlannedDate(""); setPlannedTime(""); setHasPlannedTime(false);
    setUseDeadline(false); setDueDate(""); setDueTime(""); setHasDueTime(false);
    setShowErrors(false);
  };

  const hasChanges = isEditing ? (
    title !== (task?.title ?? "") || description !== (task?.description ?? "") ||
    icon !== (task?.icon ?? null) || status !== (task?.status ?? "TODO") ||
    priority !== (task?.priority ?? "MEDIUM") || sphereId !== (task?.sphereId ?? "") ||
    parentId !== (task?.parentId ?? null) || isPrivate !== (task?.isPrivate ?? false) ||
    plannedDate !== (task?.plannedDate ? new Date(task.plannedDate).toISOString().split("T")[0] : "") ||
    plannedTime !== (task?.plannedDate && task?.hasPlannedTime ? new Date(task.plannedDate).toTimeString().slice(0, 5) : "") ||
    hasPlannedTime !== (task?.hasPlannedTime ?? false) ||
    useDeadline !== (!!task?.dueDate) ||
    dueDate !== (task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "") ||
    dueTime !== (task?.dueDate && task?.hasDueTime ? new Date(task.dueDate).toTimeString().slice(0, 5) : "") ||
    hasDueTime !== (task?.hasDueTime ?? false)
  ) : false;

  const handleClose = () => { if (!isEditing) resetForm(); onClose(); };

  const doSubmit = () => {
    if (!title.trim() || !sphereId) {
      setShowErrors(true);
      toast.error(title.trim() ? "Sphere is required" : "Title is required");
      return;
    }

    const finalPlannedDate = plannedDate ? `${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00` : null;
    const finalDueDate = (useDeadline && dueDate) ? `${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00` : null;

    startTransition(async () => {
      try {
        await upsertTaskAction({
          id: isDuplicate ? undefined : task?.id, title: title.trim(), description: description.trim() || null,
          icon, status, priority, plannedDate: finalPlannedDate, hasPlannedTime,
          dueDate: finalDueDate, hasDueTime, parentId, sphereId, isPrivate,
        });
        toast.success(isEditing ? "Updated" : "Created");
        handleClose();
      } catch { toast.error("Error saving task"); }
    });
  };

  return (
    <Dialog
      isOpen={isOpen} onClose={handleClose}
      title={isEditing ? "" : isDuplicate ? "Duplicate Task" : "New Life Task"}
      description={isEditing ? "" : "Define your next objective"}
      maxWidth={isEditing ? "1000px" : "850px"}
    >
      {isEditing && task ? (
        <TaskDetail
          task={task} spheres={spheres} allTasks={allTasks} onViewTask={onViewTask}
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          icon={icon} setIcon={setIcon} iconPickerOpen={iconPickerOpen} setIconPickerOpen={setIconPickerOpen}
          status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}
          sphereId={sphereId} parentId={parentId} setParentId={setParentId}
          isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          plannedDate={plannedDate} setPlannedDate={setPlannedDate} plannedTime={plannedTime} setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime} setHasPlannedTime={setHasPlannedTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          hasChanges={hasChanges} onSave={doSubmit} onClose={handleClose}
        />
      ) : (
        <UnifiedTaskForm
          spheres={spheres} allTasks={allTasks}
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          icon={icon} setIcon={setIcon} iconPickerOpen={iconPickerOpen} setIconPickerOpen={setIconPickerOpen}
          status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}
          sphereId={sphereId} setSphereId={setSphereId} parentId={parentId} setParentId={setParentId}
          isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          plannedDate={plannedDate} setPlannedDate={setPlannedDate} plannedTime={plannedTime} setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime} setHasPlannedTime={setHasPlannedTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          onSubmit={doSubmit} isPending={isPending} showErrors={showErrors}
        />
      )}
    </Dialog>
  );
}
