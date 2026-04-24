"use client";

import { useState, useTransition } from "react";
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
  Link2Off, Eye, ChevronRight, Lock,
  ChevronLeft, Check, ArrowRight
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

function WizardStep({ step, current }: { step: number; current: number }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isActive = s.id === current;
        const isDone = s.id < current;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              isActive ? "bg-accent text-bg" : isDone ? "text-accent" : "text-muted/40"
            }`}>
              {isDone ? <Check size={12} /> : <Icon size={12} />}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px ${isDone ? "bg-accent" : "bg-border"}`} />
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

  return (
    <div className="flex flex-col gap-4">
      <WizardStep step={step} current={step} />

      {/* Step 1: What */}
      {step === 1 && (
        <div className="flex flex-col gap-5 px-4 pb-2 animate-in fade-in slide-in-from-right-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">
              Title <span className="text-rose-500 font-bold">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={`text-[15px] font-medium h-11 px-4 rounded-xl transition-all ${showErrors && !title.trim() ? "border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20" : ""}`}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes, steps, or details..."
              rows={4}
              className="w-full min-h-[100px] resize-none bg-surface/50 border border-border rounded-2xl px-5 py-4 text-[12px] text-text placeholder:text-muted outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="flex flex-col gap-5 px-4 pb-2 animate-in fade-in slide-in-from-right-2">
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Status</label>
            <CustomSelect
              value={status}
              onChange={(val) => setStatus(val as TaskStatus)}
              options={(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => ({
                id: s, label: STATUS_CONFIG[s].label, icon: STATUS_CONFIG[s].icon, color: STATUS_CONFIG[s].color,
              }))}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Priority</label>
            <CustomSelect
              value={priority}
              onChange={(val) => setPriority(val as TaskPriority)}
              options={Object.keys(PRIORITY_CONFIG).map((p) => ({
                id: p, label: PRIORITY_CONFIG[p as TaskPriority].label, icon: PRIORITY_CONFIG[p as TaskPriority].icon, color: PRIORITY_CONFIG[p as TaskPriority].color,
              }))}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">
                Life Sphere <span className="text-rose-500 font-bold">*</span>
              </label>
              {showErrors && !sphereId && (
                <span className="text-[9px] font-mono text-rose-500 flex items-center gap-1">
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
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Symbol</label>
            <button
              type="button"
              onClick={() => setIconPickerOpen(true)}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-surface/50 hover:border-accent/40 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={16} className="text-accent" />; })() : <FileText size={14} className="text-muted/40" />}
              </div>
              <span className="text-[12px] font-bold text-text">{icon || "Pick a symbol"}</span>
              <Pencil size={12} className="ml-auto text-muted" />
            </button>
            <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={spheres.find(s => s.id === sphereId)?.color} title="Task Symbol" />
          </div>
        </div>
      )}

      {/* Step 3: When */}
      {step === 3 && (
        <div className="flex flex-col gap-5 px-4 pb-2 animate-in fade-in slide-in-from-right-2">
          {parentTask && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/20">
              <Link2Off size={12} className="text-accent" />
              <span className="text-[11px] font-mono text-accent">Subtask of: <span className="font-bold">{parentTask.title}</span></span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Parent Task</label>
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

          <div className="flex flex-col gap-4 p-4 bg-raised/20 rounded-2xl border border-border/40">
            <div className="flex items-center gap-2 text-accent">
              <CalendarClock size={14} />
              <label className="text-[10px] font-mono uppercase tracking-wider">Planned Day</label>
            </div>
            <DatePicker value={plannedDate} onChange={setPlannedDate} placeholder="Optional" />
            <label className="flex items-center gap-1.5 text-[9px] font-mono text-secondary cursor-pointer">
              <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
              <span>Include time</span>
            </label>
            {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} />}
          </div>

          <div className="flex flex-col gap-4 p-4 bg-raised/20 rounded-2xl border border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted">
                <Flag size={14} />
                <label className="text-[10px] font-mono uppercase tracking-wider">Due Date</label>
              </div>
              <button type="button" onClick={() => setUseDeadline(!useDeadline)} className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${useDeadline ? "bg-rose-500/10 text-rose-500 border-rose-500/30" : "bg-surface text-muted border-border"}`}>
                {useDeadline ? "ON" : "OFF"}
              </button>
            </div>
            {useDeadline ? (
              <div className="flex flex-col gap-3 animate-in fade-in">
                <DatePicker value={dueDate} onChange={setDueDate} />
                <label className="flex items-center gap-1.5 text-[9px] font-mono text-secondary cursor-pointer">
                  <input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" />
                  <span>Include time</span>
                </label>
                {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} />}
              </div>
            ) : (
              <div className="flex items-center justify-center border border-dashed border-border/20 rounded-xl min-h-[60px]">
                <span className="text-[10px] font-mono text-muted/30 uppercase">Optional</span>
              </div>
            )}
          </div>

          <button type="button" onClick={() => setIsPrivate(!isPrivate)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/10 border-amber-500/30" : "bg-surface/50 border-border/40"}`}>
            <Lock size={14} className={isPrivate ? "text-amber-500" : "text-muted/50"} />
            <span className={`text-[12px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>
              {isPrivate ? "Private Task" : "Public Task"}
            </span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 pt-2 border-t border-border/30">
        {step > 1 ? (
          <button type="button" onClick={onBack} className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-text transition-colors">
            <ChevronLeft size={14} /> Back
          </button>
        ) : <div />}
        {step < 3 ? (
          <button type="button" onClick={onNext} className="flex items-center gap-1 text-[11px] font-bold text-accent hover:underline">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="px-6 py-2 rounded-xl text-[11px] font-bold bg-accent text-bg hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Creating…" : "Create Task"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Full Form (Edit Mode) ──────────────────────────────────────────────────

function FullForm({
  task, spheres, allTasks, onViewTask,
  title, setTitle, description, setDescription,
  icon, setIcon, iconPickerOpen, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId, setSphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  useDeadline, setUseDeadline, dueDate, setDueDate,
  dueTime, setDueTime, hasDueTime, setHasDueTime,
  showErrors, onSubmit, isPending,
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
  showErrors: boolean; onSubmit: (e: React.FormEvent) => void; isPending: boolean;
}) {
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 text-sm">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1">
          Title <span className="text-rose-500 font-bold">*</span>
        </label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?"
          className={`text-[15px] font-medium h-11 px-4 rounded-xl transition-all ${showErrors && !title.trim() ? "border-rose-500/50 bg-rose-500/5 ring-1 ring-rose-500/20" : ""}`} autoFocus />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Hierarchy</label>
            <CustomSelect value={parentId || "none"} onChange={(val) => setParentId(val === "none" ? null : val)} placeholder="No Parent Task"
              options={[{ id: "none", label: "None (Top Level)", icon: Link2Off, color: "#666" },
                ...allTasks.map(t => ({ id: t.id, label: t.title, icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText, color: t.sphere?.color || "#888" }))]} />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Visibility</label>
            <button type="button" onClick={() => setIsPrivate(!isPrivate)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isPrivate ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-surface/50 border-border/40 text-muted hover:text-text"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPrivate ? "bg-amber-500/20" : "bg-raised"}`}><Lock size={14} className={isPrivate ? "text-amber-500" : "text-muted/50"} /></div>
              <div className="flex flex-col items-start">
                <span className={`text-[12px] font-bold ${isPrivate ? "text-amber-500" : "text-text"}`}>{isPrivate ? "Private Task" : "Public Task"}</span>
                <span className="text-[9px] font-mono text-muted tracking-wider">{isPrivate ? "Password protected" : "Visible to everyone"}</span>
              </div>
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Symbol</label>
            <div className="flex items-center gap-4 p-4 bg-surface/50 border border-border rounded-2xl group transition-all hover:border-accent/40">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={24} className="text-accent" />; })() : <FileText size={22} className="text-muted/40" />}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold text-text truncate max-w-[140px]">{icon || "No icon selected"}</span>
                <button type="button" onClick={() => setIconPickerOpen(true)} className="text-[10px] font-black uppercase tracking-[0.1em] text-accent hover:underline flex items-center gap-1.5"><Pencil size={10} /> Change Symbol</button>
              </div>
            </div>
            <IconPickerDialog isOpen={iconPickerOpen} onClose={() => setIconPickerOpen(false)} value={icon} onChange={setIcon} color={spheres.find(s => s.id === sphereId)?.color} title="Task Symbol" />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Status</label>
            <CustomSelect value={status} onChange={(val) => setStatus(val as TaskStatus)} options={(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => ({ id: s, label: STATUS_CONFIG[s].label, icon: STATUS_CONFIG[s].icon, color: STATUS_CONFIG[s].color }))} />
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Priority</label>
            <CustomSelect value={priority} onChange={(val) => setPriority(val as TaskPriority)} options={Object.keys(PRIORITY_CONFIG).map((p) => ({ id: p, label: PRIORITY_CONFIG[p as TaskPriority].label, icon: PRIORITY_CONFIG[p as TaskPriority].icon, color: PRIORITY_CONFIG[p as TaskPriority].color }))} />
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted flex items-center gap-1">
                Life Sphere <span className="text-rose-500 font-bold">*</span>
              </label>
              {showErrors && !sphereId && <span className="text-[9px] font-mono text-rose-500 flex items-center gap-1"><AlertCircle size={10} /> Required</span>}
            </div>
            <CustomSelect value={sphereId} onChange={setSphereId} placeholder="Select a sphere" options={spheres.map((s) => ({ id: s.id, label: s.name, icon: ALL_ICONS[s.icon], color: s.color }))} />
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Planning</label>
          <div className="flex flex-col gap-4 p-5 bg-raised/20 rounded-3xl border border-border/40">
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-accent"><CalendarClock size={14} /><label className="text-[10px] font-mono uppercase tracking-wider text-muted">Planned Day</label></div>
                <label className="flex items-center gap-1.5 text-[9px] font-mono text-secondary cursor-pointer group">
                  <input type="checkbox" checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" /><span className="group-hover:text-text transition-colors">Time</span>
                </label>
              </div>
              <DatePicker value={plannedDate} onChange={setPlannedDate} placeholder="Optional" />
              {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} className="mt-1 animate-in fade-in slide-in-from-top-1" />}
            </div>
            <div className="flex flex-col gap-3 w-full border-t border-border/30 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted"><Flag size={14} /><label className="text-[10px] font-mono uppercase tracking-wider">Due Date</label></div>
                <div className="flex items-center gap-3">
                  {useDeadline && <label className="flex items-center gap-1.5 text-[9px] font-mono text-secondary cursor-pointer group"><input type="checkbox" checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} className="accent-accent w-3.5 h-3.5" /><span className="group-hover:text-text transition-colors">Time</span></label>}
                  <button type="button" onClick={() => setUseDeadline(!useDeadline)} className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${useDeadline ? "bg-rose-500/10 text-rose-500 border-rose-500/30" : "bg-surface text-muted border-border"}`}>{useDeadline ? "ON" : "OFF"}</button>
                </div>
              </div>
              {useDeadline ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-1">
                  <DatePicker value={dueDate} onChange={setDueDate} />
                  {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} className="mt-1 animate-in fade-in slide-in-from-top-1" />}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-border/20 rounded-2xl min-h-[80px]"><span className="text-[10px] font-mono text-muted/30 uppercase tracking-widest text-center px-4">Optional Deadline</span></div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 h-full">
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes, steps, or details (Markdown supported)..." rows={3}
              className="w-full min-h-[80px] resize-none bg-surface/50 border border-border rounded-2xl px-5 py-4 text-[12px] text-text placeholder:text-muted outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all shadow-inner" />
          </div>
          <div className="flex flex-col gap-2.5">
            {task.children && task.children.length > 0 ? (
              <>
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1 flex items-center gap-2">Subtasks <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px]">{task.children.length}</span></label>
                <div className="flex flex-col gap-1 bg-surface/30 border border-border/40 rounded-2xl p-2 max-h-[280px] overflow-y-auto scrollbar-hide">
                  {task.children.map(child => (
                    <div key={child.id} className="group/item flex items-center justify-between p-2 hover:bg-raised/50 rounded-xl transition-all border border-transparent hover:border-border/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {child.icon && SPHERE_ICONS[child.icon] ? (() => { const I = SPHERE_ICONS[child.icon]; return <I size={12} className="text-accent/60 shrink-0" />; })() : <FileText size={12} className="text-muted/40 shrink-0" />}
                        <span className={`text-[12px] font-medium truncate ${child.status === 'DONE' ? 'line-through text-muted/50' : 'text-text'}`}>{child.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        {onViewTask && <button type="button" onClick={() => onViewTask(child)} className="p-1 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all" title="Edit subtask"><Eye size={12} /></button>}
                        <button type="button" onClick={() => handleUnlinkSubtask(child)} className="p-1 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-400/10 transition-all" title="Unlink from parent"><Link2Off size={12} /></button>
                        <ChevronRight size={11} className="text-muted/20" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2.5 opacity-40">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted px-1">Subtasks</label>
                <div className="flex flex-col items-center justify-center border border-dashed border-border/20 rounded-2xl min-h-[100px] text-center p-4"><span className="text-[10px] font-mono text-muted uppercase tracking-widest">No subtasks</span></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
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

  const dialogTitle = isDuplicate ? "Duplicate Task" : isEditing ? "Edit Task" : parentTask ? "Add Subtask" : "New Task";
  const dialogDescription = isDuplicate ? "Create a copy of this task" : isEditing ? "Update task details" : parentTask ? `Under: ${parentTask.title}` : "Create a new task";

  return (
    <Dialog
      isOpen={isOpen} onClose={handleClose} title={dialogTitle} description={dialogDescription}
      maxWidth={isEditing ? "1300px" : "480px"}
      footer={isEditing ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /><span className="text-[10px] font-mono uppercase tracking-widest text-muted">Required Fields</span></div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" form="task-form" variant="primary" size="sm" disabled={isPending || (showErrors && !title.trim())} className="min-w-[120px]">{isPending ? "Saving…" : "Save Changes"}</Button>
          </div>
        </div>
      ) : undefined}
    >
      {isEditing && task ? (
        <FullForm task={task} spheres={spheres} allTasks={allTasks} onViewTask={onViewTask}
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          icon={icon} setIcon={setIcon} iconPickerOpen={iconPickerOpen} setIconPickerOpen={setIconPickerOpen}
          status={status} setStatus={setStatus} priority={priority} setPriority={setPriority}
          sphereId={sphereId} setSphereId={setSphereId} parentId={parentId} setParentId={setParentId}
          isPrivate={isPrivate} setIsPrivate={setIsPrivate}
          plannedDate={plannedDate} setPlannedDate={setPlannedDate} plannedTime={plannedTime} setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime} setHasPlannedTime={setHasPlannedTime}
          useDeadline={useDeadline} setUseDeadline={setUseDeadline} dueDate={dueDate} setDueDate={setDueDate}
          dueTime={dueTime} setDueTime={setDueTime} hasDueTime={hasDueTime} setHasDueTime={setHasDueTime}
          showErrors={showErrors} onSubmit={handleSubmit} isPending={isPending} />
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
