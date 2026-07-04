"use client";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Checkbox } from "@/components/ui/inputs/checkbox";

import { useState, useTransition } from "react";
import * as React from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/overlays/dialog";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { DatePicker } from "@/components/ui/inputs/date-picker";
import { DateRangePicker } from "@/components/ui/inputs/date-range-picker";
import { TimePicker } from "@/components/ui/inputs/time-picker";
import { CustomSelect } from "@/components/ui/inputs/custom-select";
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
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (task: TaskData) => void;
  task?: TaskData | null;
  parentTask?: TaskData | null;
  spheres: LifeSphereData[];
  allTasks?: TaskData[];
  onViewTask?: (t: TaskData) => void;
  isDuplicate?: boolean;
}

const STEPS = [
  { number: 1, label: "Core", icon: <Pencil size={14} /> },
  { number: 2, label: "Category", icon: <LayoutGrid size={14} /> },
  { number: 3, label: "Planning", icon: <Calendar size={14} /> },
  { number: 4, label: "Context", icon: <Link2Off size={14} /> },
];

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div >
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        return (
          <React.Fragment key={step.number}>
            <div >
              <div >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.icon}
              </div>
              <span >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

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

function UnifiedTaskForm({
  spheres, allTasks,
  title, setTitle, description, setDescription,
  icon, setIconPickerOpen,
  status, setStatus, priority, setPriority, sphereId, setSphereId,
  parentId, setParentId, isPrivate, setIsPrivate,
  plannedDate, setPlannedDate, plannedTime, setPlannedTime,
  hasPlannedTime, setHasPlannedTime,
  plannedEndTime, setPlannedEndTime,
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

  const handleTogglePlannedEndTime = (checked: boolean) => {
    setHasPlannedEndTime(checked);
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

  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };

  const renderStepContent = () => {
    const sphere = spheres.find(s => s.id === sphereId);
    switch (currentStep) {
      case 1:
        return (
          <div >
            <div >
              <label >Title & Symbol</label>
              <div >
                <div
                  onClick={() => setIconPickerOpen(true)}

                >
                  {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={24} />; })() : <Plus size={20} />}
                </div>
                <Input
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>
            </div>
            <div >
              <label >Description</label>
              <Textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."

              />
            </div>
          </div>
        );

      case 2:
        return (
          <div >
            <div >
              <label >Sphere</label>
              <div >
                {spheres.map(s => (
                  <button
                    key={s.id} type="button" onClick={() => setSphereId(s.id)}

                  >
                    {s.icon && SPHERE_ICONS[s.icon] && (() => { const I = SPHERE_ICONS[s.icon]; return <I size={14} strokeWidth={3} />; })()}
                    <span >{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div >
              <div >
                <label >Status</label>
                <CustomSelect
                  value={status}
                  onChange={(val) => setStatus(val as TaskStatus)}
                  options={(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => ({
                    id: s, label: STATUS_CONFIG[s as TaskStatus].label, icon: STATUS_CONFIG[s as TaskStatus].icon, color: STATUS_CONFIG[s as TaskStatus].color,
                  }))}
                />
              </div>
              <div >
                <label >Priority</label>
                <CustomSelect
                  value={priority}
                  onChange={(val) => setPriority(val as TaskPriority)}
                  options={Object.keys(PRIORITY_CONFIG).map((p) => ({
                    id: p, label: PRIORITY_CONFIG[p as TaskPriority].label, icon: PRIORITY_CONFIG[p as TaskPriority].icon, color: PRIORITY_CONFIG[p as TaskPriority].color,
                  }))}
                />
              </div>
            </div>

            <div >
              <label >Preview</label>
              <div >
                <div >
                  {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={20} />; })() : <FileText size={16} />}
                </div>
                <div >
                  <p >{title || "Task title"}</p>
                  <p >{sphere?.name || "No sphere"}</p>
                  <div >
                    <span

                    >
                      {React.createElement(STATUS_CONFIG[status].icon, { size: 10 })}
                      {STATUS_CONFIG[status].label}
                    </span>
                    <span

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
          <div >
            {parentId ? (
              <div >
                <label >Subtask Planning</label>
                <div >
                  <div >
                    <Calendar size={12} />
                    <span >When will you do this?</span>
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
                  <div >
                    <div >
                      <label >
                        <Checkbox  checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} />
                        <span>Start time</span>
                      </label>
                      {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} />}
                    </div>
                    <div >
                      <label >
                        <Checkbox  checked={hasPlannedEndTime} onChange={(e) => handleTogglePlannedEndTime(e.target.checked)} />
                        <span>End time</span>
                      </label>
                      {hasPlannedEndTime && <TimePicker value={plannedEndTime} onChange={setPlannedEndTime} />}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div >
                  <label >Planning (Optional)</label>
                  <div >
                    <div >
                      <Calendar size={12} />
                      <span >Planned Range</span>
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
                    <div >
                      <div >
                        <label >
                          <Checkbox  checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} />
                          <span>Start time</span>
                        </label>
                        {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} />}
                      </div>
                      <div >
                        <label >
                          <Checkbox  checked={hasPlannedEndTime} onChange={(e) => handleTogglePlannedEndTime(e.target.checked)} />
                          <span>End time</span>
                        </label>
                        {hasPlannedEndTime && <TimePicker value={plannedEndTime} onChange={setPlannedEndTime} />}
                      </div>
                    </div>
                  </div>
                </div>

                <div >
                  <div >
                    <div >
                      <div >
                        <Flag size={12} />
                        <span >Deadline</span>
                      </div>
                      <button type="button" onClick={() => setUseDeadline(!useDeadline)} >
                        {useDeadline ? "Active" : "Add"}
                      </button>
                    </div>
                    {useDeadline && (
                      <div >
                        <DatePicker value={dueDate} onChange={setDueDate} />
                        <label >
                          <Checkbox  checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} />
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
          <div >
            <div >
              <label >Parent Task</label>
              <CustomSelect
                value={parentId || "none"}
                onChange={(val) => setParentId(val === "none" ? null : val)}
                placeholder="No parent"
                options={[
                  { id: "none", label: "Top Level", icon: Link2Off, color: "#666" },
                  ...allTasks.map((t: TaskData) => ({
                    id: t.id, label: t.isPrivate ? "Private" : t.title, icon: t.icon ? (SPHERE_ICONS[t.icon] || FileText) : FileText, color: t.sphere?.color || "#888",
                  }))
                ]}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}

            >
              <EyeOff size={14} />
              <div >
                <span >{isPrivate ? "Private" : "Public"}</span>
                <span >{isPrivate ? "Only you can see this" : "Visible to everyone"}</span>
              </div>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div >
      <Stepper currentStep={currentStep} />

      <div >
        {renderStepContent()}
      </div>

      <div >
        <div >
          <div />
          <span >Required Fields</span>
        </div>
        <div >
          {currentStep > 1 && (
            <Button type="button" variant="ghost" size="sm" onClick={handleBack} disabled={isPending}>
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
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleNext}

            >
              Next
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

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
  plannedEndTime, setPlannedEndTime,
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
  const handleTogglePlannedEndTime = (checked: boolean) => {
    setHasPlannedEndTime(checked);
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
  const handleToggleDueTime = (checked: boolean) => {
    setHasDueTime(checked);
    if (checked && !dueTime) setDueTime("12:00");
  };
  const handleUnlinkSubtask = async (subtask: TaskData) => {
    const result = await upsertTaskAction({ id: subtask.id, parentId: null });
    if (result.success) {
      toast.success("Subtask unlinked");
    } else {
      toast.error(result.error || "Failed to unlink subtask");
    }
  };
  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (result.success) {
        toast.success("Task deleted");
        onClose();
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    });
  };

  const sphere = spheres.find(s => s.id === sphereId);
  const statusCfg = STATUS_CONFIG[status];
  const priorityCfg = PRIORITY_CONFIG[priority];

  return (
    <div >
      {}
      <div >
        <div onClick={() => setIconPickerOpen(true)}>
          {icon && ALL_ICONS[icon] ? (() => { const I = ALL_ICONS[icon]; return <I size={20} />; })() : <FileText size={20} />}
        </div>
        <div >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}

            placeholder="Task title"
          />
          <div >
            <button
              onClick={() => {}}

            >
              {sphere && ALL_ICONS[sphere.icon] && (() => { const I = ALL_ICONS[sphere.icon]; return <I size={9} strokeWidth={3} />; })()}
              {sphere?.name || "Sphere"}
            </button>
            <div />
            <button
              onClick={() => setStatus(status === "DONE" ? "TODO" : status === "TODO" ? "IN_PROGRESS" : "DONE")}

            >
              <statusCfg.icon size={9} />
              {statusCfg.label}
            </button>
            <button
              onClick={() => setPriority(priority === "URGENT" ? "LOW" : "URGENT")}

            >
              <priorityCfg.icon size={9} />
              {priorityCfg.label}
            </button>
          </div>
        </div>
        <div >
          <button onClick={() => setDeleteDialogOpen(true)} >
            <Trash2 size={18} />
          </button>
          <button onClick={onClose} >
            <X size={18} />
          </button>
        </div>
      </div>

      <div >
        <div >
          {}
          <div >
            <section >
              <label >Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes, steps, or details..."

              />
            </section>

            <section >
              <label >
                <span>Subtasks</span>
                {task.children?.length > 0 && <span >{task.children.length}</span>}
              </label>
              {task.children?.length > 0 ? (
                <div >
                  {task.children.map((child: TaskData) => (
                    <div key={child.id} >
                      <div >
                        {child.icon && SPHERE_ICONS[child.icon] ? (() => { const I = SPHERE_ICONS[child.icon]; return <I size={11} />; })() : <FileText size={11} />}
                        <span >{child.isPrivate ? "Private" : child.title}</span>
                      </div>
                      <div >
                        {onViewTask && <button onClick={() => onViewTask(child)} ><Eye size={12} /></button>}
                        <button onClick={() => handleUnlinkSubtask(child)} ><Link2Off size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div >
                  <span >No subtasks</span>
                </div>
              )}
            </section>
          </div>

          {}
          <div >
            {}
            <div >
              <section >
                <label >
                  {task.children.length > 0 ? "Deadline" : parentId ? "When to do" : "Planning"}
                </label>
                {task.children.length > 0 ? (
                  <div >
                    <div >
                      <Flag size={13} />
                      {useDeadline ? (
                        <>
                          <DatePicker value={dueDate} onChange={setDueDate} />
                          <button
                            type="button"
                            onClick={() => { setUseDeadline(false); setDueDate(""); setDueTime(""); setHasDueTime(false); }}

                            title="Clear deadline"
                          >
                            <X size={11} />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => setUseDeadline(true)} >Set deadline...</button>
                      )}
                    </div>
                    {useDeadline && (
                      <>
                        <label >
                          <Checkbox  checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} />
                          <span>Exact time</span>
                        </label>
                        {hasDueTime && <div ><TimePicker value={dueTime} onChange={setDueTime} /></div>}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <div >
                      <div >
                        <CalendarClock size={13} />
                        <DateRangePicker
                          startDate={plannedDate}
                          endDate={plannedEndDate}
                          onChange={(start, end) => {
                            setPlannedDate(start);
                            setPlannedEndDate(end);
                          }}
                        />
                        {plannedDate && (
                          <button
                            type="button"
                            onClick={() => {
                              setPlannedDate("");
                              setPlannedEndDate(null);
                              setPlannedTime("");
                              setPlannedEndTime("");
                              setHasPlannedTime(false);
                              setHasPlannedEndTime(false);
                            }}

                            title="Clear date"
                          >
                            <X size={11} />
                          </button>
                        )}
                      </div>
                      <div >
                        <label >
                          <Checkbox  checked={hasPlannedTime} onChange={(e) => handleTogglePlannedTime(e.target.checked)} />
                          <span>Start time</span>
                        </label>
                        {hasPlannedTime && <TimePicker value={plannedTime} onChange={setPlannedTime} />}

                        <label >
                          <Checkbox  checked={hasPlannedEndTime} onChange={(e) => handleTogglePlannedEndTime(e.target.checked)} />
                          <span>End time</span>
                        </label>
                        {hasPlannedEndTime && <TimePicker value={plannedEndTime} onChange={setPlannedEndTime} />}
                      </div>
                    </div>
                    <div >
                      <div >
                        <Flag size={13} />
                        {useDeadline ? (
                          <>
                            <DatePicker value={dueDate} onChange={setDueDate} />
                            <button
                              type="button"
                              onClick={() => { setUseDeadline(false); setDueDate(""); setDueTime(""); setHasDueTime(false); }}

                              title="Clear deadline"
                            >
                              <X size={11} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setUseDeadline(true)} >Set deadline...</button>
                        )}
                      </div>
                      {useDeadline && (
                        <>
                          <label >
                            <Checkbox  checked={hasDueTime} onChange={(e) => handleToggleDueTime(e.target.checked)} />
                            <span>Exact time</span>
                          </label>
                          {hasDueTime && <div ><TimePicker value={dueTime} onChange={setDueTime} /></div>}
                        </>
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>

            {}
            <div >
              <section >
                <label >Organization</label>
                <div >
                  <div >
                    <label >Parent Task</label>
                    <CustomSelect
                      value={parentId || "none"}
                      onChange={(val) => setParentId(val === "none" ? null : val)}
                      options={[{ id: "none", label: "Top Level", icon: Link2Off }, ...allTasks.filter((t: TaskData) => t.id !== task.id).map((t: TaskData) => ({ id: t.id, label: t.isPrivate ? "Private" : t.title, icon: LayoutGrid }))]}
                    />
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}

                  >
                    <EyeOff size={12} />
                    <span >{isPrivate ? "Private Task" : "Public Task"}</span>
                  </button>
                </div>
              </section>
            </div>

            {hasChanges && (
              <div >
                <div />
                <span >Saving on close...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Task" description={`Permanently delete "${task.title}"?`} confirmLabel="Delete" variant="danger" />
    </div>
  );
}

export function TaskFormDialog({
  isOpen, onClose, onSuccess, task, parentTask, spheres, allTasks = [], onViewTask, isDuplicate = false,
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
  const [plannedTime, setPlannedTime] = useState(() => task?.plannedDate ? new Date(task.plannedDate).toTimeString().slice(0, 5) : "");
  const [hasPlannedTime, setHasPlannedTime] = useState(() => task?.hasPlannedTime ?? !!task?.plannedDate);
  const [plannedEndDate, setPlannedEndDate] = useState<string | null>(() => task?.plannedEndDate ? new Date(task.plannedEndDate).toISOString().split("T")[0] : null);
  const [plannedEndTime, setPlannedEndTime] = useState(() => task?.plannedEndDate ? new Date(task.plannedEndDate).toTimeString().slice(0, 5) : "");
  const [hasPlannedEndTime, setHasPlannedEndTime] = useState(() => task?.hasPlannedEndTime ?? !!task?.plannedEndDate);

  const [useDeadline, setUseDeadline] = useState(() => !!task?.dueDate);
  const [dueDate, setDueDate] = useState(() => useDeadline && task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  const [dueTime, setDueTime] = useState(() => useDeadline && task?.hasDueTime ? new Date(task.dueDate!).toTimeString().slice(0, 5) : "");
  const [hasDueTime, setHasDueTime] = useState(() => task?.hasDueTime ?? false);

  const resetForm = () => {
    setTitle(""); setDescription(""); setIcon(null); setStatus("TODO"); setPriority("MEDIUM");
    setSphereId(""); setParentId(null); setIsPrivate(false);
    setPlannedDate(""); setPlannedTime(""); setHasPlannedTime(false);
    setPlannedEndDate(null); setPlannedEndTime(""); setHasPlannedEndTime(false);
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
    plannedEndTime !== (task?.plannedEndDate && task?.hasPlannedEndTime ? new Date(task.plannedEndDate).toTimeString().slice(0, 5) : "") ||
    hasPlannedEndTime !== (task?.hasPlannedEndTime ?? false) ||
    useDeadline !== (!!task?.dueDate) ||
    dueDate !== (task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "") ||
    dueTime !== (task?.dueDate && task?.hasDueTime ? new Date(task.dueDate).toTimeString().slice(0, 5) : "") ||
    hasDueTime !== (task?.hasDueTime ?? false)
  ) : false;

  const saveInBackground = () => {
    if (!title.trim() || !sphereId) return;

    const finalPlannedDate = plannedDate ? new Date(`${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00`).toISOString() : null;
    const finalPlannedEndDate = plannedEndDate ? new Date(`${plannedEndDate}T${hasPlannedEndTime && plannedEndTime ? plannedEndTime : "12:00"}:00`).toISOString() : null;
    const finalDueDate = (useDeadline && dueDate) ? new Date(`${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00`).toISOString() : null;

    upsertTaskAction({
      id: isDuplicate ? undefined : task?.id, title: title.trim(), description: description.trim() || null,
      icon, status, priority, plannedDate: finalPlannedDate, hasPlannedTime,
      plannedEndDate: finalPlannedEndDate, hasPlannedEndTime,
      dueDate: finalDueDate, hasDueTime, parentId, sphereId, isPrivate,
    }).then(r => { if (!r.success) toast.error(r.error || "Error saving task"); });
  };

  const handleClose = () => {
    if (isEditing && hasChanges) {
      saveInBackground();
      onClose();
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

    const finalPlannedDate = plannedDate ? new Date(`${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00`).toISOString() : null;
    const finalPlannedEndDate = plannedEndDate ? new Date(`${plannedEndDate}T${hasPlannedEndTime && plannedEndTime ? plannedEndTime : "12:00"}:00`).toISOString() : null;
    const finalDueDate = (useDeadline && dueDate) ? new Date(`${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00`).toISOString() : null;

    startTransition(async () => {
      const result = await upsertTaskAction({
        id: isDuplicate ? undefined : task?.id, title: title.trim(), description: description.trim() || null,
        icon, status, priority, plannedDate: finalPlannedDate, hasPlannedTime,
        plannedEndDate: finalPlannedEndDate, hasPlannedEndTime,
        dueDate: finalDueDate, hasDueTime, parentId, sphereId, isPrivate,
      });
      if (!result.success) { toast.error(result.error || "Error saving task"); return; }
      if (!isEditing) toast.success(isDuplicate ? "Duplicated" : "Created");
      if (result.data) onSuccess?.(result.data);
      onClose();
      if (!isEditing) resetForm();
    });
  };

  return (
    <Dialog
      isOpen={isOpen} onClose={handleClose}
      title={isEditing ? "" : isDuplicate ? "Duplicate Task" : "New Life Task"}
      description={isEditing ? "" : "Define your next objective"}
      maxWidth={isEditing ? "1060px" : "960px"}
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
          plannedEndTime={plannedEndTime} setPlannedEndTime={setPlannedEndTime}
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
          plannedEndTime={plannedEndTime} setPlannedEndTime={setPlannedEndTime}
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
