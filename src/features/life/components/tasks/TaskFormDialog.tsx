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
  AlertCircle, CalendarClock, Flag, Pencil, FileText,
  Link2Off, Eye, ChevronRight, Lock,
  ChevronLeft, Check, ArrowRight, Trash2
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

// ─── Wizard (New Task) ──────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "What", icon: FileText },
  { id: 2, label: "Details", icon: AlertCircle },
  { id: 3, label: "When", icon: CalendarClock },
];

function WizardStep({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-raised/30 border-b border-border/30">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isActive = s.id === current;
        const isDone = s.id < current;
        return (
          <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 relative group">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive ? "bg-accent text-bg shadow-[0_0_15px_rgba(var(--color-accent-rgb),0.3)] scale-110" : 
                isDone ? "bg-accent/20 text-accent" : "bg-surface border border-border/50 text-muted/40"
              }`}>
                {isDone ? <Check size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={isActive ? 3 : 2} />}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors ${
                isActive ? "text-accent font-bold" : isDone ? "text-accent/70" : "text-muted/40"
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-[1px] mx-2 -mt-4">
                <div className={`h-full transition-all duration-500 ${isDone ? "bg-accent" : "bg-border/30"}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WizardForm({
  spheres, allTasks, parentTask,
  title, setTitle, description, setDescription,
  icon, setIcon, iconPickerOpen, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId, setSphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  step, onNext, onBack, onSubmit, isPending, showErrors,
}: {
  spheres: LifeSphereData[]; allTasks: TaskData[]; parentTask: TaskData | null;
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  icon: string | null; setIcon: (v: string | null) => void;
  iconPickerOpen: boolean; setIconPickerOpen: (v: boolean) => void;
  status: TaskStatus; setStatus: (v: TaskStatus) => void;
  priority: TaskPriority; setPriority: (v: TaskPriority) => void;
  sphereId: string; setSphereId: (v: string) => void;
  parentId: string | null; setParentId: (v: string | null) => void;
  isPrivate: boolean; setIsPrivate: (v: boolean) => void;
  plannedDate: string; setPlannedDate: (v: string) => void;
  plannedTime: string; setPlannedTime: (v: string) => void;
  hasPlannedTime: boolean; setHasPlannedTime: (v: boolean) => void;
  useDeadline: boolean; setUseDeadline: (v: boolean) => void;
  dueDate: string; setDueDate: (v: string) => void;
  dueTime: string; setDueTime: (v: string) => void;
  hasDueTime: boolean; setHasDueTime: (v: boolean) => void;
  step: number; onNext: () => void; onBack: () => void;
  onSubmit: () => void; isPending: boolean; showErrors: boolean;
}) {
  const handleTogglePlannedTime = (checked: boolean) => {
    setHasPlannedTime(checked);
    if (checked && !plannedTime) setPlannedTime("12:00");
  };

  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (step < 3) {
        e.preventDefault();
        onNext();
      } else {
        // Form submission is handled by the last button or native form submit
      }
    }
  };

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); if (step === 3) onSubmit(); else onNext(); }} 
      className="flex flex-col min-h-[420px]"
      onKeyDown={handleKeyDown}
    >
      <WizardStep current={step} />

      <div className="flex-1 overflow-y-auto py-6 px-6">
        {/* Step 1: What */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">
                Title <span className="text-rose-500 font-bold">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className={`text-[16px] font-medium h-12 px-5 rounded-xl transition-all border-border/60 bg-surface/30 focus:bg-surface focus:ring-2 focus:ring-accent/20 ${showErrors && !title.trim() ? "border-rose-500 bg-rose-500/5 ring-rose-500/10" : ""}`}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details or markdown notes..."
                rows={5}
                className="w-full min-h-[120px] resize-none bg-surface/30 border border-border/60 rounded-2xl px-5 py-4 text-[13px] text-text placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-accent/20 focus:bg-surface focus:border-accent/40 transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Status</label>
                <CustomSelect
                  value={status}
                  onChange={(val) => setStatus(val as TaskStatus)}
                  options={(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => ({
                    id: s, label: STATUS_CONFIG[s].label, icon: STATUS_CONFIG[s].icon, color: STATUS_CONFIG[s].color,
                  }))}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Priority</label>
                <CustomSelect
                  value={priority}
                  onChange={(val) => setPriority(val as TaskPriority)}
                  options={Object.keys(PRIORITY_CONFIG).map((p) => ({
                    id: p, label: PRIORITY_CONFIG[p as TaskPriority].label, icon: PRIORITY_CONFIG[p as TaskPriority].icon, color: PRIORITY_CONFIG[p as TaskPriority].color,
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">
                  Life Sphere <span className="text-rose-500 font-bold">*</span>
                </label>
                {showErrors && !sphereId && (
                  <span className="text-[9px] font-mono text-rose-500 flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded">
                    <AlertCircle size={10} /> Required
                  </span>
                )}
              </div>
              <CustomSelect
                value={sphereId}
                onChange={setSphereId}
                placeholder="Select a sphere"
                options={spheres.map((s) => ({
                  id: s.id, label: s.name, icon: ALL_ICONS[s.icon], color: s.color,
                }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Task Symbol</label>
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
                  <span className="text-[10px] text-muted font-mono tracking-wider uppercase">Click to change</span>
                </div>
                <Pencil size={12} className="ml-auto text-muted group-hover:text-accent transition-colors" />
              </button>
              <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={spheres.find(s => s.id === sphereId)?.color} title="Task Symbol" />
            </div>
          </div>
        )}

        {/* Step 3: When */}
        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted px-1">Context & Hierarchy</label>
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                placeholder="No Parent Task"
                options={[
                  { id: "none", label: "None (Top Level)", icon: Link2Off, color: "#666" },
                  ...allTasks.map(t => ({
                    id: t.id, label: t.title, icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText, color: t.sphere?.color || "#888",
                  }))
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 p-5 bg-raised/20 rounded-2xl border border-border/40">
                <div className="flex items-center gap-2 text-accent">
                  <CalendarClock size={14} />
                  <label className="text-[10px] font-mono uppercase tracking-[0.1em] font-bold">Planned Day</label>
                </div>
                <DatePicker value={plannedDate} onChange={setPlannedDate} placeholder="Optional" />
                <label className="flex items-center gap-2 text-[10px] font-mono text-secondary cursor-pointer hover:text-text transition-colors">
                  <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-4 h-4 rounded-md" />
                  <span>Specific time</span>
                </label>
                {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} className="animate-in fade-in slide-in-from-top-1" />}
              </div>

              <div className="flex flex-col gap-4 p-5 bg-raised/20 rounded-2xl border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400">
                    <Flag size={14} />
                    <label className="text-[10px] font-mono uppercase tracking-[0.1em] font-bold">Due Date</label>
                  </div>
                  <button type="button" onClick={() => setUseDeadline(!useDeadline)} className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border transition-all ${useDeadline ? "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20" : "bg-surface text-muted border-border"}`}>
                    {useDeadline ? "Active" : "Set"}
                  </button>
                </div>
                {useDeadline ? (
                  <div className="flex flex-col gap-3 animate-in fade-in zoom-in-95">
                    <DatePicker value={dueDate} onChange={setDueDate} />
                    <label className="flex items-center gap-2 text-[10px] font-mono text-secondary cursor-pointer hover:text-text transition-colors">
                      <input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-rose-500 w-4 h-4 rounded-md" />
                      <span>Specific time</span>
                    </label>
                    {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} className="animate-in fade-in slide-in-from-top-1" />}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border border-dashed border-border/30 rounded-xl min-h-[80px]">
                    <span className="text-[10px] font-mono text-muted/20 uppercase tracking-widest">No Deadline</span>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setIsPrivate(!isPrivate)} 
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isPrivate ? "bg-amber-500/5 border-amber-500/30 text-amber-500" : "bg-surface/30 border-border/60 text-muted hover:text-text hover:bg-surface"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPrivate ? "bg-amber-500/20" : "bg-raised/50"}`}>
                <Lock size={16} className={isPrivate ? "text-amber-500" : "text-muted/40"} />
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-[13px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>{isPrivate ? "Private Task" : "Public Task"}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">{isPrivate ? "Encrypted Entry" : "Visible in Dashboard"}</span>
              </div>
              <div className={`ml-auto w-4 h-4 rounded-full border-2 transition-all ${isPrivate ? "bg-amber-500 border-amber-500" : "border-border/60"}`} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 bg-raised/10 border-t border-border/30 backdrop-blur-sm">
        {step > 1 ? (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={onBack} 
            className="flex items-center gap-2 group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
            Back
          </Button>
        ) : <div />}
        
        {step < 3 ? (
          <Button 
            type="button" 
            variant="primary" 
            size="lg"
            onClick={onNext} 
            className="min-w-[140px] flex items-center gap-2 shadow-lg shadow-accent/10"
          >
            Next Step
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onSubmit}
            disabled={isPending}
            className="min-w-[160px] flex items-center gap-2 shadow-lg shadow-accent/20"
          >
            {isPending ? "Creating…" : "Initialize Task"}
            <Check size={16} strokeWidth={3} />
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Task Detail (Edit Mode) ────────────────────────────────────────────────

function TaskDetail({
  task, spheres, allTasks, onViewTask,
  title, setTitle, description, setDescription,
  icon, setIcon, iconPickerOpen, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId, setSphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  hasChanges, onSave, onClose,
}: {
  task: TaskData; spheres: LifeSphereData[]; allTasks: TaskData[]; onViewTask?: (t: TaskData) => void;
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  icon: string | null; setIcon: (v: string | null) => void;
  iconPickerOpen: boolean; setIconPickerOpen: (v: boolean) => void;
  status: TaskStatus; setStatus: (v: TaskStatus) => void;
  priority: TaskPriority; setPriority: (v: TaskPriority) => void;
  sphereId: string; setSphereId: (v: string) => void;
  parentId: string | null; setParentId: (v: string | null) => void;
  isPrivate: boolean; setIsPrivate: (v: boolean) => void;
  plannedDate: string; setPlannedDate: (v: string) => void;
  plannedTime: string; setPlannedTime: (v: string) => void;
  hasPlannedTime: boolean; setHasPlannedTime: (v: boolean) => void;
  useDeadline: boolean; setUseDeadline: (v: boolean) => void;
  dueDate: string; setDueDate: (v: string) => void;
  dueTime: string; setDueTime: (v: string) => void;
  hasDueTime: boolean; setHasDueTime: (v: boolean) => void;
  hasChanges: boolean; onSave: () => void; onClose: () => void;
}) {
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
    <div className="flex flex-col max-h-[85dvh]">
      {/* Header */}
      <div className="flex items-start gap-3 px-6 pt-6 pb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0 mt-0.5">
          {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={20} className="text-accent" />; })() : <FileText size={18} className="text-muted/40" />}
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-[17px] font-bold text-text placeholder:text-muted/40 outline-none border-none p-0"
            placeholder="Task title"
          />
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <button
              onClick={() => setSphereId("")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors hover:opacity-80"
              style={{ backgroundColor: sphere ? `${sphere.color}15` : "transparent", borderColor: sphere ? `${sphere.color}40` : "var(--border)", color: sphere?.color || "var(--muted)" }}
            >
              {sphere && ALL_ICONS[sphere.icon] && (() => { const I = ALL_ICONS[sphere.icon]; return <I size={10} strokeWidth={3} />; })()}
              {sphere?.name || "Sphere"}
            </button>
            <div className="w-px h-3 bg-border/50" />
            <button
              onClick={() => setStatus(status === "DONE" ? "TODO" : status === "TODO" ? "IN_PROGRESS" : status === "IN_PROGRESS" ? "BACKLOG" : "DONE")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors hover:opacity-80"
              style={{ backgroundColor: `${statusCfg.color}15`, borderColor: `${statusCfg.color}40`, color: statusCfg.color }}
            >
              <statusCfg.icon size={10} />
              {statusCfg.label}
            </button>
            <div className="w-px h-3 bg-border/50" />
            <button
              onClick={() => setPriority(priority === "URGENT" ? "LOW" : priority === "LOW" ? "MEDIUM" : priority === "MEDIUM" ? "HIGH" : "URGENT")}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors hover:opacity-80"
              style={{ backgroundColor: `${priorityCfg.color}15`, borderColor: `${priorityCfg.color}40`, color: priorityCfg.color }}
            >
              <priorityCfg.icon size={10} />
              {priorityCfg.label}
            </button>
          </div>
        </div>
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="p-2 rounded-lg text-muted/30 hover:text-red-400 hover:bg-red-400/10 transition-all"
          title="Delete task"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Description */}
        <div className="flex flex-col gap-2 mb-5">
          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted/60 px-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes, steps, or details..."
            rows={3}
            className="w-full min-h-[70px] resize-none bg-surface/30 border border-border/40 rounded-xl px-4 py-3 text-[12px] text-text placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/40 transition-all"
          />
        </div>

        {/* Symbol */}
        <div className="flex flex-col gap-2 mb-5">
          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted/60 px-1">Symbol</label>
          <button
            type="button"
            onClick={() => setIconPickerOpen(true)}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-surface/30 hover:border-accent/40 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={16} className="text-accent" />; })() : <FileText size={14} className="text-muted/40" />}
            </div>
            <span className="text-[12px] font-bold text-text">{icon || "Pick a symbol"}</span>
            <Pencil size={12} className="ml-auto text-muted/40" />
          </button>
          <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={sphere?.color} title="Task Symbol" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30 my-5" />

        {/* Planning */}
        <div className="flex flex-col gap-4 mb-5">
          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted/60 px-1">Planning</label>

          <div className="flex items-center gap-3">
            <CalendarClock size={14} className="text-accent/50 shrink-0" />
            <div className="flex-1">
              <DatePicker value={plannedDate} onChange={setPlannedDate} placeholder="Planned day" />
            </div>
            <label className="flex items-center gap-1.5 text-[9px] font-mono text-muted cursor-pointer shrink-0">
              <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
              <span>Time</span>
            </label>
          </div>
          {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} className="ml-7" />}

          <div className="flex items-center gap-3">
            <Flag size={14} className="text-rose-400/50 shrink-0" />
            <div className="flex-1">
              {useDeadline ? (
                <DatePicker value={dueDate} onChange={setDueDate} placeholder="Due date" />
              ) : (
                <button onClick={() => setUseDeadline(true)} className="w-full text-left text-[11px] text-muted/40 italic px-4 py-2 rounded-xl border border-dashed border-border/30 hover:text-muted hover:border-border/50 transition-all">
                  Set due date...
                </button>
              )}
            </div>
            {useDeadline && (
              <>
                <label className="flex items-center gap-1.5 text-[9px] font-mono text-muted cursor-pointer shrink-0">
                  <input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-rose-500 w-3.5 h-3.5" />
                  <span>Time</span>
                </label>
                <button onClick={() => setUseDeadline(false)} className="p-1 text-muted/30 hover:text-red-400 transition-colors" title="Remove deadline">
                  <Link2Off size={12} />
                </button>
              </>
            )}
          </div>
          {hasDueTime && useDeadline && <TimePicker value={dueTime} onChange={setDueTime} className="ml-7" />}

          <div className="flex items-center gap-3">
            <Link2Off size={14} className="text-muted/30 shrink-0" />
            <div className="flex-1">
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                placeholder="No parent task"
                options={[
                  { id: "none", label: "None (Top Level)", icon: Link2Off, color: "#666" },
                  ...allTasks.filter(t => t.id !== task.id).map(t => ({
                    id: t.id, label: t.title, icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText, color: t.sphere?.color || "#888",
                  }))
                ]}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/5 border-amber-500/20" : "bg-surface/30 border-border/40 hover:bg-surface/50"}`}
          >
            <Lock size={14} className={isPrivate ? "text-amber-500" : "text-muted/30"} />
            <span className={`text-[12px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>
              {isPrivate ? "Private" : "Public"}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/30 my-5" />

        {/* Subtasks */}
        <div className="flex flex-col gap-2 mb-2">
          <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted/60 px-1 flex items-center gap-2">
            Subtasks {task.children && task.children.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px]">{task.children.length}</span>
            )}
          </label>
          {task.children && task.children.length > 0 ? (
            <div className="flex flex-col gap-1 bg-surface/20 border border-border/30 rounded-xl p-1.5 max-h-[200px] overflow-y-auto scrollbar-hide">
              {task.children.map(child => (
                <div key={child.id} className="group/item flex items-center justify-between p-2 hover:bg-raised/50 rounded-lg transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    {child.icon && SPHERE_ICONS[child.icon] ? (() => { const I = SPHERE_ICONS[child.icon]; return <I size={12} className="text-accent/50 shrink-0" />; })() : <FileText size={12} className="text-muted/30 shrink-0" />}
                    <span className={`text-[12px] font-medium truncate ${child.status === 'DONE' ? 'line-through text-muted/40' : 'text-text'}`}>{child.title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    {onViewTask && (
                      <button type="button" onClick={() => onViewTask(child)} className="p-1 rounded text-muted hover:text-accent transition-all" title="Edit">
                        <Eye size={12} />
                      </button>
                    )}
                    <button type="button" onClick={() => handleUnlinkSubtask(child)} className="p-1 rounded text-muted hover:text-red-400 transition-all" title="Unlink">
                      <Link2Off size={12} />
                    </button>
                    <ChevronRight size={11} className="text-muted/20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center border border-dashed border-border/20 rounded-xl min-h-[60px]">
              <span className="text-[10px] font-mono text-muted/30 uppercase">No subtasks</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 bg-raised/20 border-t border-border/30">
        {hasChanges ? (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Unsaved changes</span>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button onClick={onClose} className="px-3 py-1.5 text-[10px] font-mono text-muted hover:text-text transition-colors uppercase tracking-wider">
              Discard
            </button>
          )}
          <button
            onClick={onSave}
            disabled={!hasChanges}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              hasChanges ? "bg-accent text-bg hover:bg-accent/90" : "bg-raised text-muted/30 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        description={`Delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

// ─── Main Dialog ─────────────────────────────────────────────────────────────

export function TaskFormDialog({
  isOpen, onClose, task, parentTask, spheres, allTasks = [], onViewTask, isDuplicate = false,
}: TaskFormDialogProps) {
  const isEditing = !!task?.id && !isDuplicate;
  const [isPending, startTransition] = useTransition();
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(1);
  const [isDeletePending, startDeleteTransition] = useTransition();

  const getInitialIcon = () => task?.icon ?? parentTask?.icon ?? null;
  const getInitialStatus = () => isDuplicate ? "TODO" : (task?.status ?? "TODO");
  const getInitialPriority = () => task?.priority ?? parentTask?.priority ?? "MEDIUM";
  const getInitialSphereId = () => task?.sphereId ?? parentTask?.sphereId ?? (spheres[0]?.id ?? "");
  const getInitialParentId = () => task?.parentId ?? parentTask?.id ?? null;
  const getInitialPlannedDate = () => task?.plannedDate ? new Date(task.plannedDate).toISOString().split("T")[0] : "";
  const getInitialPlannedTime = () => task?.plannedDate && task?.hasPlannedTime ? new Date(task.plannedDate).toTimeString().slice(0, 5) : "";
  const getInitialHasPlannedTime = () => task?.hasPlannedTime ?? false;
  const getInitialHasDue = () => !!task?.dueDate;
  const getInitialDueDate = () => getInitialHasDue() && task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "";
  const getInitialDueTime = () => getInitialHasDue() && task?.hasDueTime ? new Date(task.dueDate!).toTimeString().slice(0, 5) : "";
  const getInitialHasDueTime = () => task?.hasDueTime ?? false;

  const [title, setTitle] = useState(() => task?.title ?? "");
  const [description, setDescription] = useState(() => task?.description ?? "");
  const [icon, setIcon] = useState<string | null>(getInitialIcon);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [status, setStatus] = useState<TaskStatus>(getInitialStatus);
  const [priority, setPriority] = useState<TaskPriority>(getInitialPriority);
  const [sphereId, setSphereId] = useState(getInitialSphereId);
  const [parentId, setParentId] = useState<string | null>(getInitialParentId);
  const [isPrivate, setIsPrivate] = useState(() => task?.isPrivate ?? false);
  const [plannedDate, setPlannedDate] = useState(getInitialPlannedDate);
  const [plannedTime, setPlannedTime] = useState(getInitialPlannedTime);
  const [hasPlannedTime, setHasPlannedTime] = useState(getInitialHasPlannedTime);
  const [useDeadline, setUseDeadline] = useState(getInitialHasDue);
  const [dueDate, setDueDate] = useState(getInitialDueDate);
  const [dueTime, setDueTime] = useState(getInitialDueTime);
  const [hasDueTime, setHasDueTime] = useState(getInitialHasDueTime);

  const resetForm = () => {
    setTitle(""); setDescription(""); setIcon(null); setStatus("TODO"); setPriority("MEDIUM");
    setSphereId(spheres[0]?.id ?? ""); setParentId(null); setIsPrivate(false);
    setPlannedDate(""); setPlannedTime(""); setHasPlannedTime(false);
    setUseDeadline(false); setDueDate(""); setDueTime(""); setHasDueTime(false);
    setShowErrors(false); setStep(1);
  };

  // Check if there are unsaved changes (for edit mode)
  const hasChanges = isEditing ? (
    title !== (task?.title ?? "") ||
    description !== (task?.description ?? "") ||
    icon !== (task?.icon ?? null) ||
    status !== (task?.status ?? "TODO") ||
    priority !== (task?.priority ?? "MEDIUM") ||
    sphereId !== (task?.sphereId ?? "") ||
    parentId !== (task?.parentId ?? null) ||
    isPrivate !== (task?.isPrivate ?? false) ||
    plannedDate !== getInitialPlannedDate() ||
    plannedTime !== getInitialPlannedTime() ||
    hasPlannedTime !== getInitialHasPlannedTime() ||
    useDeadline !== getInitialHasDue() ||
    dueDate !== getInitialDueDate() ||
    dueTime !== getInitialDueTime() ||
    hasDueTime !== getInitialHasDueTime()
  ) : false;

  const handleClose = () => {
    if (!isEditing && !isDuplicate) resetForm();
    onClose();
  };

  const doSubmit = () => {
    if (!title.trim() || !sphereId) {
      setShowErrors(true);
      if (!title.trim()) toast.error("Title is required");
      else toast.error("Life Sphere is required");
      return;
    }

    let finalPlannedDate: string | null = null;
    if (plannedDate) finalPlannedDate = `${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00`;

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
          id: isDuplicate ? undefined : task?.id, title: title.trim(), description: description.trim() || null,
          icon, status, priority, plannedDate: finalPlannedDate, hasPlannedTime,
          dueDate: finalDueDate, hasDueTime, parentId, sphereId, isPrivate,
        });
        toast.success(isEditing ? "Task updated" : isDuplicate ? "Task duplicated" : "Task created");
        handleClose();
      } catch (err) { toast.error("Failed to save task"); console.error(err); }
    });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSubmit(); };

  const handleNext = () => {
    if (step === 1 && !title.trim()) { setShowErrors(true); toast.error("Title is required"); return; }
    setStep(s => s + 1);
  };
  const handleBack = () => setStep(s => s - 1);

  const dialogTitle = isDuplicate ? "Duplicate Task" : isEditing ? "" : parentTask ? "Add Subtask" : "New Task";
  const dialogDescription = isDuplicate ? "Create a copy of this task" : isEditing ? "" : parentTask ? `Under: ${parentTask.title}` : "Create a new task";

  return (
    <Dialog
      isOpen={isOpen} onClose={handleClose} title={dialogTitle} description={dialogDescription}
      maxWidth={isEditing ? "600px" : "480px"}
      footer={!isEditing ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /><span className="text-[10px] font-mono uppercase tracking-widest text-muted">Required Fields</span></div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" form="task-form" variant="primary" size="sm" disabled={isPending || (showErrors && !title.trim())} className="min-w-[120px]">{isPending ? "Saving…" : isDuplicate ? "Duplicate & Create" : "Create Task"}</Button>
          </div>
        </div>
      ) : undefined}
    >
      {isEditing && task ? (
        <TaskDetail task={task} spheres={spheres} allTasks={allTasks} onViewTask={onViewTask}
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          icon={icon} setIcon={setIcon} iconPickerOpen={iconPickerOpen} setIconPickerOpen={setIconPickerOpen}
          status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}
          sphereId={sphereId} setSphereId={setSphereId} parentId={parentId} setParentId={setParentId}
          isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          plannedDate={plannedDate} setPlannedDate={setPlannedDate} plannedTime={plannedTime} setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime} setHasPlannedTime={setHasPlannedTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          hasChanges={hasChanges} onSave={doSubmit} onClose={handleClose} />
      ) : (
        <WizardForm
          spheres={spheres} allTasks={allTasks} parentTask={parentTask ?? null}
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          icon={icon} setIcon={setIcon} iconPickerOpen={iconPickerOpen} setIconPickerOpen={setIconPickerOpen}
          status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}
          sphereId={sphereId} setSphereId={setSphereId} parentId={parentId} setParentId={setParentId}
          isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          plannedDate={plannedDate} setPlannedDate={setPlannedDate} plannedTime={plannedTime} setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime} setHasPlannedTime={setHasPlannedTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          step={step} onNext={handleNext} onBack={handleBack} onSubmit={doSubmit} isPending={isPending} showErrors={showErrors} />
      )}
    </Dialog>
  );
}
