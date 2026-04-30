"use client";

import { useState, useTransition } from "react";
import * as React from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { ALL_ICONS, SPHERE_ICONS } from "./lucide-icons-map";
import type { TaskData, LifeSphereData, TaskStatus, TaskPriority } from "@/features/life/types";
import { toast } from "sonner";
import {
  CalendarClock, Flag, Pencil, FileText,
  Link2Off, Eye, EyeOff,
  Trash2, Calendar, LayoutGrid,
  Check, ChevronRight, ChevronLeft, X, Plus
} from "lucide-react";
import { STATUS_CONFIG } from "./StatusToggle";
import { PRIORITY_CONFIG } from "./PriorityBadge";
import { IconPickerDialog } from "./IconPickerDialog";
import { upsertTaskAction, deleteTaskAction } from "@/features/life/actions/task-actions";

interface TaskFormDialogProps {
  isOpen:       boolean;
  onClose:      () => void;
  task?:        TaskData | null;
  parentTask?:  TaskData | null;
  spheres:      LifeSphereData[];
  allTasks?:    TaskData[];
  onViewTask?:  (t: TaskData) => void;
  isDuplicate?: boolean;
}

const STEPS = [
  { number: 1, label: "Core",     icon: <Pencil size={14} /> },
  { number: 2, label: "Category", icon: <LayoutGrid size={14} /> },
  { number: 3, label: "Planning", icon: <Calendar size={14} /> },
  { number: 4, label: "Context",  icon: <Link2Off size={14} /> },
];

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-border/30 bg-surface/50">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center gap-1.5 group cursor-default">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted ? "bg-accent text-bg" : isActive ? "bg-accent/10 text-accent border-2 border-accent" : "bg-raised text-muted/40 border border-border/50"}
              `}>
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.icon}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest ${isActive ? "text-accent font-bold" : "text-muted/40"}`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-4 ${currentStep > step.number + 1 ? "bg-accent" : "bg-border/30"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step-by-Step Creation Form ─────────────────────────────────────────────

interface UnifiedTaskFormProps {
  spheres:      LifeSphereData[];
  allTasks:     TaskData[];
  title:        string;
  setTitle:     (v: string) => void;
  description:  string;
  setDescription: (v: string) => void;
  icon:         string | null;
  setIcon:      (v: string | null) => void;
  iconPickerOpen: boolean;
  setIconPickerOpen: (v: boolean) => void;
  status:       TaskStatus;
  setStatus:    (v: TaskStatus) => void;
  priority:     TaskPriority;
  setPriority:  (v: TaskPriority) => void;
  sphereId:     string;
  setSphereId:  (v: string) => void;
  parentId:     string | null;
  setParentId:  (v: string | null) => void;
  isPrivate:    boolean;
  setIsPrivate: (v: boolean) => void;
  plannedDate:  string;
  setPlannedDate: (v: string) => void;
  plannedTime:  string;
  setPlannedTime: (v: string) => void;
  hasPlannedTime: boolean;
  setHasPlannedTime: (v: boolean) => void;
  plannedEndDate: string | null;
  setPlannedEndDate: (v: string | null) => void;
  hasPlannedEndTime: boolean;
  setHasPlannedEndTime: (v: boolean) => void;
  useDeadline:  boolean;
  setUseDeadline: (v: boolean) => void;
  dueDate:      string;
  setDueDate:   (v: string) => void;
  dueTime:      string;
  setDueTime:   (v: string) => void;
  hasDueTime:   boolean;
  setHasDueTime: (v: boolean) => void;
  onSubmit:     () => void;
  isPending:    boolean;
  showErrors:   boolean;
  setShowErrors: (v: boolean) => void;
}

function UnifiedTaskForm({
  spheres, allTasks,
  title, setTitle, description, setDescription,
  icon, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId, setSphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  plannedEndDate, setPlannedEndDate,
  hasPlannedEndTime, setHasPlannedEndTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  onSubmit, isPending,
}: UnifiedTaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const handleTogglePlannedTime = (checked: boolean) => {
    setHasPlannedTime(checked);
    if (checked && !plannedTime) setPlannedTime("12:00");
  };

  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };

  const renderStepContent = () => {
    const sphere = spheres.find(s => s.id === sphereId);
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Title & Symbol</label>
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setIconPickerOpen(true)}
                  className="w-12 h-12 rounded-2xl bg-accent/10 border-2 border-dashed border-accent/30 flex items-center justify-center cursor-pointer hover:bg-accent/20 transition-all"
                >
                  {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={24} className="text-accent" />; })() : <Plus size={20} className="text-accent/40" />}
                </div>
                <Input 
                  value={title} onChange={(e) => setTitle(e.target.value)} 
                  placeholder="What needs to be done?" className="text-lg font-bold h-12"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Description</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="w-full min-h-[120px] bg-surface border border-border/50 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Sphere</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {spheres.map(s => (
                  <button
                    key={s.id} type="button" onClick={() => setSphereId(s.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${sphereId === s.id ? "bg-accent text-bg border-accent shadow-lg shadow-accent/20" : "bg-surface/50 border-border/40 hover:bg-raised"}`}
                  >
                    {s.icon && SPHERE_ICONS[s.icon] && (() => { const I = SPHERE_ICONS[s.icon]; return <I size={14} strokeWidth={3} />; })()}
                    <span className="text-[11px] font-bold truncate uppercase">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div className="p-5 rounded-2xl border border-border/30 bg-surface/30">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted mb-3 block">Preview</label>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: sphere ? `${sphere.color}25` : "transparent" }}>
                  {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={20} style={{ color: sphere?.color }} />; })() : <FileText size={16} className="text-muted/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-text truncate">{title || "Task title"}</p>
                  <p className="text-[10px] font-mono text-muted truncate" style={{ color: sphere?.color }}>{sphere?.name || "No sphere"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border"
                      style={{ backgroundColor: `${STATUS_CONFIG[status].color}15`, borderColor: `${STATUS_CONFIG[status].color}40`, color: STATUS_CONFIG[status].color }}
                    >
                      {React.createElement(STATUS_CONFIG[status].icon, { size: 10 })}
                      {STATUS_CONFIG[status].label}
                    </span>
                    <span 
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border"
                      style={{ backgroundColor: `${PRIORITY_CONFIG[priority].color}15`, borderColor: `${PRIORITY_CONFIG[priority].color}40`, color: PRIORITY_CONFIG[priority].color }}
                    >
                      {React.createElement(PRIORITY_CONFIG[priority].icon, { size: 10 })}
                      {PRIORITY_CONFIG[priority].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Planning</label>
              <div className="flex flex-col gap-3 p-4 bg-surface/50 rounded-xl border border-border/40">
                <div className="flex items-center gap-2 text-accent">
                  <Calendar size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Planned Range</span>
                </div>
                <DateRangePicker 
                  startDate={plannedDate} 
                  endDate={plannedEndDate} 
                  onChange={(start, end) => {
                    setPlannedDate(start);
                    setPlannedEndDate(end);
                  }} 
                  placeholder="Select range" 
                />
                <label className="flex items-center gap-2 text-[10px] font-mono text-muted cursor-pointer hover:text-text transition-colors">
                  <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
                  <span>Set specific time</span>
                </label>
                {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} />}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-3 p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
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
        );

      case 4:
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono uppercase tracking-widest text-muted">Parent Task</label>
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                placeholder="No parent"
                options={[
                  { id: "none", label: "Top Level", icon: Link2Off, color: "#666" },
                  ...allTasks.map((t: TaskData) => ({
                    id: t.id, label: t.isPrivate ? "••••••••" : t.title, icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText, color: t.sphere?.color || "#888",
                  }))
                ]}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/5 border-amber-500/20" : "bg-surface/30 border-border/60 hover:bg-surface"}`}
            >
              <EyeOff size={14} className={isPrivate ? "text-amber-500" : "text-muted/40"} />
              <div className="flex flex-col items-start">
                <span className={`text-[12px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>{isPrivate ? "Private" : "Public"}</span>
                <span className="text-[10px] text-muted font-mono">{isPrivate ? "Only you can see this" : "Visible to everyone"}</span>
              </div>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      <Stepper currentStep={currentStep} />

      <div className="p-6">
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between p-6 bg-raised/10 border-t border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted">Required Fields</span>
        </div>
        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleBack} disabled={isPending}>
              <ChevronLeft size={14} className="mr-1" />
              Back
            </Button>
          )}
          {currentStep === 4 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onSubmit}
              disabled={isPending}
              className="min-w-[140px] shadow-lg shadow-accent/20"
            >
              {isPending ? "Saving..." : "Create Task"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}
              className="min-w-[120px]"
            >
              Next
              <ChevronRight size={14} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
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
  plannedEndDate: string | null;
  setPlannedEndDate: (v: string | null) => void;
  hasPlannedEndTime: boolean;
  setHasPlannedEndTime: (v: boolean) => void;
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
  icon, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  plannedEndDate, setPlannedEndDate,
  hasPlannedEndTime, setHasPlannedEndTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  hasChanges, onClose,
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
    <div className="flex flex-col w-full max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border/30 bg-raised/10 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0 cursor-pointer hover:bg-accent/20 transition-all" onClick={() => setIconPickerOpen(true)}>
          {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={20} className="text-accent" />; })() : <FileText size={20} className="text-muted/40" />}
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-[18px] font-bold text-text placeholder:text-muted/40 outline-none border-none p-0"
            placeholder="Task title"
          />
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border transition-all"
              style={{ backgroundColor: sphere ? `${sphere.color}15` : "transparent", borderColor: sphere ? `${sphere.color}40` : "var(--border)", color: sphere?.color || "var(--muted)" }}
            >
              {sphere && ALL_ICONS[sphere.icon] && (() => { const I = ALL_ICONS[sphere.icon]; return <I size={9} strokeWidth={3} />; })()}
              {sphere?.name || "Sphere"}
            </button>
            <div className="w-px h-3 bg-border/50 mx-0.5" />
            <button
              onClick={() => setStatus(status === "DONE" ? "TODO" : status === "TODO" ? "IN_PROGRESS" : "DONE")}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border transition-all"
              style={{ backgroundColor: `${statusCfg.color}15`, borderColor: `${statusCfg.color}40`, color: statusCfg.color }}
            >
              <statusCfg.icon size={9} />
              {statusCfg.label}
            </button>
            <button
              onClick={() => setPriority(priority === "URGENT" ? "LOW" : "URGENT")}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border transition-all`}
              style={{ backgroundColor: `${priorityCfg.color}15`, borderColor: `${priorityCfg.color}40`, color: priorityCfg.color }}
            >
              <priorityCfg.icon size={9} />
              {priorityCfg.label}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDeleteDialogOpen(true)} className="p-2 rounded-lg text-muted/30 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded-lg text-muted/30 hover:text-text hover:bg-raised transition-all">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          {/* Main Column */}
          <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-1.5">
              <label className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted/40 px-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes, steps, or details..."
                className="w-full min-h-[180px] lg:min-h-[220px] resize-none bg-surface/20 border border-border/30 rounded-xl px-4 py-3 text-[13px] text-text placeholder:text-muted/30 outline-none focus:ring-1 focus:ring-accent/10 transition-all leading-relaxed"
              />
            </section>

            <section className="flex flex-col gap-2">
              <label className="text-[8px] font-mono uppercase tracking-[0.2em] text-muted/40 px-1 flex items-center justify-between">
                <span>Subtasks</span>
                {task.children?.length > 0 && <span className="px-1.5 py-0.5 rounded bg-accent/5 text-accent/60 text-[8px] font-bold">{task.children.length}</span>}
              </label>
              {task.children?.length > 0 ? (
                <div className="grid grid-cols-1 gap-1 bg-raised/5 border border-border/10 rounded-xl p-1">
                  {task.children.map((child: TaskData) => (
                    <div key={child.id} className="group/item flex items-center justify-between p-2 hover:bg-surface/60 rounded-lg transition-all border border-transparent hover:border-border/20">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {child.icon && SPHERE_ICONS[child.icon] ? (() => { const I = SPHERE_ICONS[child.icon]; return <I size={11} className="text-accent/40" />; })() : <FileText size={11} className="text-muted/20" />}
                        <span className={`text-[12px] font-medium truncate ${child.status === 'DONE' ? 'line-through text-muted/30' : 'text-text/90'}`}>{child.isPrivate ? "••••••••" : child.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {onViewTask && <button onClick={() => onViewTask(child)} className="p-1 rounded-lg text-muted hover:text-accent transition-all"><Eye size={12} /></button>}
                        <button onClick={() => handleUnlinkSubtask(child)} className="p-1 rounded-lg text-muted hover:text-red-400 transition-all"><Link2Off size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 border border-dashed border-border/10 rounded-xl bg-surface/5">
                  <span className="text-[8px] font-mono text-muted/20 uppercase tracking-widest">No subtasks</span>
                </div>
              )}
            </section>
          </div>

          {/* Settings Column */}
          <div className="flex flex-col gap-3">
            {/* Planning Block */}
            <div className="p-3.5 rounded-xl bg-raised/15 border border-border/30 flex flex-col gap-3 h-fit shadow-sm">
              <section className="flex flex-col gap-2.5">
                <label className="text-[8px] font-mono uppercase tracking-widest text-accent/60 font-bold ml-0.5">Planning</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock size={13} className="text-accent/30" />
                    <DateRangePicker 
                      startDate={plannedDate} 
                      endDate={plannedEndDate} 
                      onChange={(start, end) => {
                        setPlannedDate(start);
                        setPlannedEndDate(end);
                      }} 
                    />
                  </div>
                  <label className="flex items-center gap-2 ml-5 text-[9px] font-mono text-muted/60 cursor-pointer hover:text-text transition-colors">
                    <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3 h-3 opacity-50" />
                    <span>Exact time</span>
                  </label>
                  {hasPlannedTime && <div className="ml-5"><TimePicker value={plannedTime} onChange={setPlannedTime} /></div>}
                </div>

                <div className="flex flex-col gap-2 mt-1 border-t border-border/10 pt-2.5">
                  <div className="flex items-center gap-2">
                    <Flag size={13} className="text-rose-400/30" />
                    {useDeadline ? <DatePicker value={dueDate} onChange={setDueDate} /> : <button onClick={() => setUseDeadline(true)} className="text-[9px] text-muted/50 italic hover:text-rose-400 transition-colors">Set deadline...</button>}
                  </div>
                  {useDeadline && (
                    <>
                      <label className="flex items-center gap-2 ml-5 text-[9px] font-mono text-muted/60 cursor-pointer hover:text-text transition-colors">
                        <input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-rose-500 w-3 h-3 opacity-50" />
                        <span>Exact time</span>
                      </label>
                      {hasDueTime && <div className="ml-5"><TimePicker value={dueTime} onChange={setDueTime} /></div>}
                    </>
                  )}
                </div>
              </section>
            </div>

            {/* Organization Block */}
            <div className="p-3.5 rounded-xl bg-raised/15 border border-border/30 flex flex-col gap-3 h-fit shadow-sm">
              <section className="flex flex-col gap-2.5">
                <label className="text-[8px] font-mono uppercase tracking-widest text-life/60 font-bold ml-0.5">Organization</label>
                <div className="flex flex-col gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[7px] font-mono uppercase text-muted/30 ml-1">Parent Task</label>
                    <CustomSelect
                      value={parentId || "none"}
                      onChange={(val) => setParentId(val === "none" ? null : val)}
                      options={[{ id: "none", label: "Top Level", icon: Link2Off }, ...allTasks.filter((t: TaskData) => t.id !== task.id).map((t: TaskData) => ({ id: t.id, label: t.isPrivate ? "••••••••" : t.title, icon: LayoutGrid }))]}
                    />
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/5 border-amber-500/20" : "bg-surface/20 border-border/30"}`}
                  >
                    <EyeOff size={12} className={isPrivate ? "text-amber-500/80" : "text-muted/20"} />
                    <span className={`text-[10px] font-bold ${isPrivate ? "text-amber-500/80" : "text-text/70"}`}>{isPrivate ? "Private Task" : "Public Task"}</span>
                  </button>
                </div>
              </section>
            </div>

            {hasChanges && (
              <div className="px-2 mt-1 flex items-center gap-2 opacity-50">
                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                <span className="text-[8px] font-mono text-muted uppercase tracking-wider">Saving on close...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Task" description={`Permanently delete "${task.title}"?`} confirmLabel="Delete" variant="danger" />
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
    if (key === 'sphereId') return task?.sphereId ?? parentTask?.sphereId ?? "";
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
  const [plannedEndDate, setPlannedEndDate] = useState<string | null>(() => task?.plannedEndDate ? new Date(task.plannedEndDate).toISOString().split("T")[0] : null);
  const [hasPlannedEndTime, setHasPlannedEndTime] = useState(() => task?.hasPlannedEndTime ?? false);
  
  const [useDeadline, setUseDeadline] = useState(() => !!task?.dueDate);
  const [dueDate, setDueDate] = useState(() => useDeadline && task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  const [dueTime, setDueTime] = useState(() => useDeadline && task?.hasDueTime ? new Date(task.dueDate!).toTimeString().slice(0, 5) : "");
  const [hasDueTime, setHasDueTime] = useState(() => task?.hasDueTime ?? false);

  const resetForm = () => {
    setTitle(""); setDescription(""); setIcon(null); setStatus("TODO"); setPriority("MEDIUM");
    setSphereId(""); setParentId(null); setIsPrivate(false);
    setPlannedDate(""); setPlannedTime(""); setHasPlannedTime(false);
    setPlannedEndDate(null); setHasPlannedEndTime(false);
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
    plannedEndDate !== (task?.plannedEndDate ? new Date(task.plannedEndDate).toISOString().split("T")[0] : null) ||
    hasPlannedEndTime !== (task?.hasPlannedEndTime ?? false) ||
    useDeadline !== (!!task?.dueDate) ||
    dueDate !== (task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "") ||
    dueTime !== (task?.dueDate && task?.hasDueTime ? new Date(task.dueDate).toTimeString().slice(0, 5) : "") ||
    hasDueTime !== (task?.hasDueTime ?? false)
  ) : false;

  const handleClose = () => {
    if (isEditing && hasChanges) {
      doSubmit();
    } else {
      if (!isEditing) resetForm();
      onClose();
    }
  };

  const doSubmit = () => {
    if (!title.trim() || !sphereId) {
      if (!isEditing) {
        setShowErrors(true);
        toast.error(title.trim() ? "Sphere is required" : "Title is required");
      } else {
        onClose();
      }
      return;
    }

    const finalPlannedDate = plannedDate ? `${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00` : null;
    const finalPlannedEndDate = plannedEndDate ? `${plannedEndDate}T${hasPlannedEndTime && plannedTime ? plannedTime : "12:00"}:00` : null;
    const finalDueDate = (useDeadline && dueDate) ? `${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00` : null;

    startTransition(async () => {
      try {
        await upsertTaskAction({
          id: isDuplicate ? undefined : task?.id, title: title.trim(), description: description.trim() || null,
          icon, status, priority, plannedDate: finalPlannedDate, hasPlannedTime,
          plannedEndDate: finalPlannedEndDate, hasPlannedEndTime,
          dueDate: finalDueDate, hasDueTime, parentId, sphereId, isPrivate,
        });
        if (!isEditing) toast.success(isDuplicate ? "Duplicated" : "Created");
        onClose();
        if (!isEditing) resetForm();
      } catch { toast.error("Error saving task"); }
    });
  };

  return (
    <Dialog
      isOpen={isOpen} onClose={handleClose}
      title={isEditing ? "" : isDuplicate ? "Duplicate Task" : "New Life Task"}
      description={isEditing ? "" : "Define your next objective"}
      maxWidth={isEditing ? "900px" : "850px"}
      bare={isEditing}
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
          plannedEndDate={plannedEndDate} setPlannedEndDate={setPlannedEndDate}
          hasPlannedEndTime={hasPlannedEndTime} setHasPlannedEndTime={setHasPlannedEndTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          hasChanges={hasChanges} onSave={doSubmit} onClose={handleClose}
        />
      ) : (
        <UnifiedTaskForm
          key={isOpen ? 'create' : 'closed'}
          spheres={spheres} allTasks={allTasks}
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          icon={icon} setIcon={setIcon} iconPickerOpen={iconPickerOpen} setIconPickerOpen={setIconPickerOpen}
          status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}
          sphereId={sphereId} setSphereId={setSphereId} parentId={parentId} setParentId={setParentId}
          isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          plannedDate={plannedDate} setPlannedDate={setPlannedDate} plannedTime={plannedTime} setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime} setHasPlannedTime={setHasPlannedTime}
          plannedEndDate={plannedEndDate} setPlannedEndDate={setPlannedEndDate}
          hasPlannedEndTime={hasPlannedEndTime} setHasPlannedEndTime={setHasPlannedEndTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          onSubmit={doSubmit} isPending={isPending} showErrors={showErrors} setShowErrors={setShowErrors}
        />
      )}
      <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={spheres.find(s => s.id === sphereId)?.color || "#fbbf24"} title="Task Symbol" />
    </Dialog>
  );
}
