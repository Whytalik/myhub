"use client";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Checkbox } from "@/components/ui/inputs/checkbox";

import { useState } from "react";
import * as React from "react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { DatePicker } from "@/components/ui/inputs/date-picker";
import { DateRangePicker } from "@/components/ui/inputs/date-range-picker";
import { TimePicker } from "@/components/ui/inputs/time-picker";
import { CustomSelect } from "@/components/ui/inputs/custom-select";
import { ALL_ICONS, SPHERE_ICONS } from "./lucide-icons-map";
import type { TaskData, LifeSphereData, TaskStatus, TaskPriority } from "@/features/life/types";
import { Flag, FileText, Link2Off, Calendar, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { STATUS_CONFIG } from "./StatusToggle";
import { PRIORITY_CONFIG } from "./PriorityBadge";
import { Stepper } from "./Stepper";

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
  plannedEndTime: string;
  setPlannedEndTime: (v: string) => void;
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
  onSubmit: () => void;
  isPending: boolean;
  showErrors: boolean;
  setShowErrors: (v: boolean) => void;
}

export function UnifiedTaskForm({
  spheres,
  allTasks,
  title,
  setTitle,
  description,
  setDescription,
  icon,
  setIconPickerOpen,
  status,
  setStatus,
  priority,
  setPriority,
  sphereId,
  setSphereId,
  parentId,
  setParentId,
  isPrivate: _isPrivate,
  setIsPrivate: _setIsPrivate,
  plannedDate,
  setPlannedDate,
  plannedTime,
  setPlannedTime,
  hasPlannedTime,
  setHasPlannedTime,
  plannedEndTime,
  setPlannedEndTime,
  plannedEndDate,
  setPlannedEndDate,
  hasPlannedEndTime,
  setHasPlannedEndTime,
  useDeadline,
  setUseDeadline,
  dueDate,
  setDueDate,
  dueTime,
  setDueTime,
  hasDueTime,
  setHasDueTime,
  onSubmit,
  isPending,
}: UnifiedTaskFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const handleTogglePlannedTime = (checked: boolean) => {
    setHasPlannedTime(checked);
    if (checked && !plannedTime) setPlannedTime("12:00");
  };

  const handleTogglePlannedEndTime = (checked: boolean) => {
    setHasPlannedEndTime(checked);
    if (checked && !plannedEndDate && plannedDate) setPlannedEndDate(plannedDate);
    if (checked && !plannedEndTime) {
      if (plannedTime) {
        const [h, m] = plannedTime.split(":").map(Number);
        const newH = (h + 1) % 24;
        setPlannedEndTime(`${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      } else {
        setPlannedEndTime("13:00");
      }
    }
  };

  const handlePlannedRangeChange = (start: string, end: string | null) => {
    setPlannedDate(start);
    setPlannedEndDate(end);
    if (!start) {
      setHasPlannedTime(false);
      setPlannedTime("");
      setHasPlannedEndTime(false);
      setPlannedEndTime("");
    }
  };

  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };

  const fieldLabelClass = "text-label";
  const symbolButtonClass =
    "flex items-center justify-center w-11 h-11 rounded-xl glass-input cursor-pointer text-zinc-400 hover:text-accent transition-colors shrink-0";
  const sphereChipsClass = "flex flex-wrap gap-2";
  const timeCheckboxLabelClass = "flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer";
  const deadlineToggleClass =
    "text-xs font-semibold text-accent hover:opacity-80 transition-opacity";

  const renderStepContent = () => {
    const sphere = spheres.find((s) => s.id === sphereId);
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass}>Title & Symbol</label>
              <div className="flex items-center gap-2">
                <div onClick={() => setIconPickerOpen(true)} className={symbolButtonClass}>
                  {icon && ALL_ICONS[icon] ? (
                    (() => {
                      const I = ALL_ICONS[icon];
                      return <I size={24} />;
                    })()
                  ) : (
                    <Plus size={20} />
                  )}
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass}>Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                rows={4}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass}>Sphere</label>
              <div className={sphereChipsClass}>
                {spheres.map((s) => {
                  const isActive = s.id === sphereId;
                  const chipClass = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 ${
                    isActive
                      ? "bg-accent/15 text-accent border-accent/30"
                      : "text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/5"
                  }`;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSphereId(s.id)}
                      className={chipClass}
                    >
                      {s.icon &&
                        SPHERE_ICONS[s.icon] &&
                        (() => {
                          const I = SPHERE_ICONS[s.icon];
                          return <I size={14} strokeWidth={3} />;
                        })()}
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabelClass}>Status</label>
                <CustomSelect
                  value={status}
                  onChange={(val) => setStatus(val as TaskStatus)}
                  options={(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => ({
                    id: s,
                    label: STATUS_CONFIG[s as TaskStatus].label,
                    icon: STATUS_CONFIG[s as TaskStatus].icon,
                    color: STATUS_CONFIG[s as TaskStatus].color,
                  }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabelClass}>Priority</label>
                <CustomSelect
                  value={priority}
                  onChange={(val) => setPriority(val as TaskPriority)}
                  options={Object.keys(PRIORITY_CONFIG).map((p) => ({
                    id: p,
                    label: PRIORITY_CONFIG[p as TaskPriority].label,
                    icon: PRIORITY_CONFIG[p as TaskPriority].icon,
                    color: PRIORITY_CONFIG[p as TaskPriority].color,
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass}>Preview</label>
              <div className="glass-card p-3 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 text-zinc-400 shrink-0">
                  {icon && ALL_ICONS[icon] ? (
                    (() => {
                      const I = ALL_ICONS[icon];
                      return <I size={20} />;
                    })()
                  ) : (
                    <FileText size={16} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {title || "Task title"}
                  </p>
                  <p className="text-caption truncate">{sphere?.name || "No sphere"}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide ${STATUS_CONFIG[status].style}`}
                    >
                      {React.createElement(STATUS_CONFIG[status].icon, { size: 10 })}
                      {STATUS_CONFIG[status].label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-mono font-semibold uppercase tracking-wide ${PRIORITY_CONFIG[priority].style}`}
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
          <div className="flex flex-col gap-5">
            {parentId ? (
              <div className="flex flex-col gap-1.5">
                <label className={fieldLabelClass}>Subtask Planning</label>
                <div className="glass-card p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar size={12} />
                    <span className="text-caption">When will you do this?</span>
                  </div>
                  <DateRangePicker
                    startDate={plannedDate}
                    endDate={plannedEndDate}
                    onChange={handlePlannedRangeChange}
                    placeholder="Select range"
                  />
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className={timeCheckboxLabelClass}>
                        <Checkbox
                          checked={hasPlannedTime}
                          onChange={(e) => handleTogglePlannedTime(e.target.checked)}
                        />
                        <span>Start time</span>
                      </label>
                      {hasPlannedTime && (
                        <TimePicker value={plannedTime} onChange={setPlannedTime} />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={timeCheckboxLabelClass}>
                        <Checkbox
                          checked={hasPlannedEndTime}
                          onChange={(e) => handleTogglePlannedEndTime(e.target.checked)}
                        />
                        <span>End time</span>
                      </label>
                      {hasPlannedEndTime && (
                        <TimePicker value={plannedEndTime} onChange={setPlannedEndTime} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className={fieldLabelClass}>Planning (Optional)</label>
                  <div className="glass-card p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar size={12} />
                      <span className="text-caption">Planned Range</span>
                    </div>
                    <DateRangePicker
                      startDate={plannedDate}
                      endDate={plannedEndDate}
                      onChange={handlePlannedRangeChange}
                      placeholder="Select range"
                    />
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className={timeCheckboxLabelClass}>
                          <Checkbox
                            checked={hasPlannedTime}
                            onChange={(e) => handleTogglePlannedTime(e.target.checked)}
                          />
                          <span>Start time</span>
                        </label>
                        {hasPlannedTime && (
                          <TimePicker value={plannedTime} onChange={setPlannedTime} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className={timeCheckboxLabelClass}>
                          <Checkbox
                            checked={hasPlannedEndTime}
                            onChange={(e) => handleTogglePlannedEndTime(e.target.checked)}
                          />
                          <span>End time</span>
                        </label>
                        {hasPlannedEndTime && (
                          <TimePicker value={plannedEndTime} onChange={setPlannedEndTime} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="glass-card p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Flag size={12} />
                        <span className="text-caption">Deadline</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseDeadline(!useDeadline)}
                        className={deadlineToggleClass}
                      >
                        {useDeadline ? "Active" : "Add"}
                      </button>
                    </div>
                    {useDeadline && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <DatePicker value={dueDate} onChange={setDueDate} />
                        <label className={timeCheckboxLabelClass}>
                          <Checkbox
                            checked={hasDueTime}
                            onChange={(e) => handleToggleDueTime(e.target.checked)}
                          />
                          <span>Specific time</span>
                        </label>
                        {hasDueTime && <TimePicker value={dueTime} onChange={setDueTime} />}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className={fieldLabelClass}>Parent Task</label>
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                placeholder="No parent"
                options={[
                  { id: "none", label: "Top Level", icon: Link2Off, color: "#666" },
                  ...allTasks.map((t: TaskData) => ({
                    id: t.id,
                    label: t.title,
                    icon: t.icon ? SPHERE_ICONS[t.icon] || FileText : FileText,
                    color: t.sphere?.color || "#888",
                  })),
                ]}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Stepper currentStep={currentStep} />

      <div className="min-h-[280px]">{renderStepContent()}</div>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-accent" />
          <span className="text-caption">Required Fields</span>
        </div>
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isPending}
            >
              <ChevronLeft size={14} />
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
            >
              {isPending ? "Saving..." : "Create Task"}
            </Button>
          ) : (
            <Button type="button" variant="primary" size="sm" onClick={handleNext}>
              Next
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
