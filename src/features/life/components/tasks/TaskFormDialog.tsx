"use client";

import { useState, useTransition } from "react";
import { Dialog } from "@/components/ui/overlays/dialog";
import type { TaskData, LifeSphereData, TaskStatus, TaskPriority } from "@/features/life/types";
import { toast } from "sonner";
import { IconPickerDialog } from "./IconPickerDialog";
import { UnifiedTaskForm } from "./UnifiedTaskForm";
import { TaskDetail } from "./TaskDetail";
import { upsertTaskAction } from "@/features/life/actions/task-actions";

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

export function TaskFormDialog({
  isOpen,
  onClose,
  onSuccess,
  task,
  parentTask,
  spheres,
  allTasks = [],
  onViewTask,
  isDuplicate = false,
}: TaskFormDialogProps) {
  const isEditing = !!task?.id && !isDuplicate;
  const [isPending, startTransition] = useTransition();
  const [showErrors, setShowErrors] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const getInitialValue = (key: string) => {
    if (key === "icon") return task?.icon ?? parentTask?.icon ?? null;
    if (key === "status") return isDuplicate ? "TODO" : (task?.status ?? "TODO");
    if (key === "priority") return task?.priority ?? parentTask?.priority ?? "MEDIUM";
    if (key === "sphereId") return task?.sphereId ?? parentTask?.sphereId ?? "";
    if (key === "parentId") return task?.parentId ?? parentTask?.id ?? null;
    return null;
  };

  const [title, setTitle] = useState(() => task?.title ?? "");
  const [description, setDescription] = useState(() => task?.description ?? "");
  const [icon, setIcon] = useState<string | null>(() => getInitialValue("icon"));
  const [status, setStatus] = useState<TaskStatus>(() => getInitialValue("status") as TaskStatus);
  const [priority, setPriority] = useState<TaskPriority>(
    () => getInitialValue("priority") as TaskPriority,
  );
  const [sphereId, setSphereId] = useState(() => getInitialValue("sphereId") as string);
  const [parentId, setParentId] = useState<string | null>(() => getInitialValue("parentId"));
  const [isPrivate, setIsPrivate] = useState(() => task?.isPrivate ?? false);

  const [plannedDate, setPlannedDate] = useState(() =>
    task?.plannedDate ? new Date(task.plannedDate).toISOString().split("T")[0] : "",
  );
  const [plannedTime, setPlannedTime] = useState(() =>
    task?.plannedDate ? new Date(task.plannedDate).toTimeString().slice(0, 5) : "",
  );
  const [hasPlannedTime, setHasPlannedTime] = useState(
    () => task?.hasPlannedTime ?? !!task?.plannedDate,
  );
  const [plannedEndDate, setPlannedEndDate] = useState<string | null>(() =>
    task?.plannedEndDate ? new Date(task.plannedEndDate).toISOString().split("T")[0] : null,
  );
  const [plannedEndTime, setPlannedEndTime] = useState(() =>
    task?.plannedEndDate ? new Date(task.plannedEndDate).toTimeString().slice(0, 5) : "",
  );
  const [hasPlannedEndTime, setHasPlannedEndTime] = useState(
    () => task?.hasPlannedEndTime ?? !!task?.plannedEndDate,
  );

  const [useDeadline, setUseDeadline] = useState(() => !!task?.dueDate);
  const [dueDate, setDueDate] = useState(() =>
    useDeadline && task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
  );
  const [dueTime, setDueTime] = useState(() =>
    useDeadline && task?.hasDueTime ? new Date(task.dueDate!).toTimeString().slice(0, 5) : "",
  );
  const [hasDueTime, setHasDueTime] = useState(() => task?.hasDueTime ?? false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIcon(null);
    setStatus("TODO");
    setPriority("MEDIUM");
    setSphereId("");
    setParentId(null);
    setIsPrivate(false);
    setPlannedDate("");
    setPlannedTime("");
    setHasPlannedTime(false);
    setPlannedEndDate(null);
    setPlannedEndTime("");
    setHasPlannedEndTime(false);
    setUseDeadline(false);
    setDueDate("");
    setDueTime("");
    setHasDueTime(false);
    setShowErrors(false);
  };

  const hasChanges = isEditing
    ? title !== (task?.title ?? "") ||
      description !== (task?.description ?? "") ||
      icon !== (task?.icon ?? null) ||
      status !== (task?.status ?? "TODO") ||
      priority !== (task?.priority ?? "MEDIUM") ||
      sphereId !== (task?.sphereId ?? "") ||
      parentId !== (task?.parentId ?? null) ||
      isPrivate !== (task?.isPrivate ?? false) ||
      plannedDate !==
        (task?.plannedDate ? new Date(task.plannedDate).toISOString().split("T")[0] : "") ||
      plannedTime !==
        (task?.plannedDate && task?.hasPlannedTime
          ? new Date(task.plannedDate).toTimeString().slice(0, 5)
          : "") ||
      hasPlannedTime !== (task?.hasPlannedTime ?? false) ||
      plannedEndDate !==
        (task?.plannedEndDate ? new Date(task.plannedEndDate).toISOString().split("T")[0] : null) ||
      plannedEndTime !==
        (task?.plannedEndDate && task?.hasPlannedEndTime
          ? new Date(task.plannedEndDate).toTimeString().slice(0, 5)
          : "") ||
      hasPlannedEndTime !== (task?.hasPlannedEndTime ?? false) ||
      useDeadline !== !!task?.dueDate ||
      dueDate !== (task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "") ||
      dueTime !==
        (task?.dueDate && task?.hasDueTime
          ? new Date(task.dueDate).toTimeString().slice(0, 5)
          : "") ||
      hasDueTime !== (task?.hasDueTime ?? false)
    : false;

  const saveInBackground = () => {
    if (!title.trim() || !sphereId) return;

    const finalPlannedDate = plannedDate
      ? new Date(
          `${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00`,
        ).toISOString()
      : null;
    const plannedEndDateBase =
      plannedEndDate || (hasPlannedEndTime && plannedEndTime ? plannedDate : null);
    const finalPlannedEndDate = plannedEndDateBase
      ? new Date(
          `${plannedEndDateBase}T${hasPlannedEndTime && plannedEndTime ? plannedEndTime : "12:00"}:00`,
        ).toISOString()
      : null;
    const finalDueDate =
      useDeadline && dueDate
        ? new Date(`${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00`).toISOString()
        : null;

    upsertTaskAction({
      id: isDuplicate ? undefined : task?.id,
      title: title.trim(),
      description: description.trim() || null,
      icon,
      status,
      priority,
      plannedDate: finalPlannedDate,
      hasPlannedTime,
      plannedEndDate: finalPlannedEndDate,
      hasPlannedEndTime,
      dueDate: finalDueDate,
      hasDueTime,
      parentId,
      sphereId,
      isPrivate,
    }).then((r) => {
      if (!r.success) toast.error(r.error || "Error saving task");
    });
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

    const finalPlannedDate = plannedDate
      ? new Date(
          `${plannedDate}T${hasPlannedTime && plannedTime ? plannedTime : "12:00"}:00`,
        ).toISOString()
      : null;
    const plannedEndDateBase =
      plannedEndDate || (hasPlannedEndTime && plannedEndTime ? plannedDate : null);
    const finalPlannedEndDate = plannedEndDateBase
      ? new Date(
          `${plannedEndDateBase}T${hasPlannedEndTime && plannedEndTime ? plannedEndTime : "12:00"}:00`,
        ).toISOString()
      : null;
    const finalDueDate =
      useDeadline && dueDate
        ? new Date(`${dueDate}T${hasDueTime && dueTime ? dueTime : "12:00"}:00`).toISOString()
        : null;

    startTransition(async () => {
      const result = await upsertTaskAction({
        id: isDuplicate ? undefined : task?.id,
        title: title.trim(),
        description: description.trim() || null,
        icon,
        status,
        priority,
        plannedDate: finalPlannedDate,
        hasPlannedTime,
        plannedEndDate: finalPlannedEndDate,
        hasPlannedEndTime,
        dueDate: finalDueDate,
        hasDueTime,
        parentId,
        sphereId,
        isPrivate,
      });
      if (!result.success) {
        toast.error(result.error || "Error saving task");
        return;
      }
      if (!isEditing) toast.success(isDuplicate ? "Duplicated" : "Created");
      if (result.data) onSuccess?.(result.data);
      onClose();
      if (!isEditing) resetForm();
    });
  };

  const dialogTitle = isEditing ? "" : isDuplicate ? "Duplicate Task" : "New Life Task";
  const dialogDescription = isEditing ? "" : "Define your next objective";
  const dialogMaxWidth = isEditing ? "1060px" : "960px";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={dialogTitle}
      description={dialogDescription}
      maxWidth={dialogMaxWidth}
      bare={isEditing}
    >
      {isEditing && task ? (
        <TaskDetail
          task={task}
          spheres={spheres}
          allTasks={allTasks}
          onViewTask={onViewTask}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          icon={icon}
          setIcon={setIcon}
          iconPickerOpen={iconPickerOpen}
          setIconPickerOpen={setIconPickerOpen}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          sphereId={sphereId}
          setSphereId={setSphereId}
          parentId={parentId}
          setParentId={setParentId}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          plannedDate={plannedDate}
          setPlannedDate={setPlannedDate}
          plannedTime={plannedTime}
          setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime}
          setHasPlannedTime={setHasPlannedTime}
          plannedEndTime={plannedEndTime}
          setPlannedEndTime={setPlannedEndTime}
          plannedEndDate={plannedEndDate}
          setPlannedEndDate={setPlannedEndDate}
          hasPlannedEndTime={hasPlannedEndTime}
          setHasPlannedEndTime={setHasPlannedEndTime}
          useDeadline={useDeadline}
          setUseDeadline={setUseDeadline}
          dueDate={dueDate}
          setDueDate={setDueDate}
          dueTime={dueTime}
          setDueTime={setDueTime}
          hasDueTime={hasDueTime}
          setHasDueTime={setHasDueTime}
          hasChanges={hasChanges}
          onSave={doSubmit}
          onClose={handleClose}
        />
      ) : (
        <UnifiedTaskForm
          key={isOpen ? "create" : "closed"}
          spheres={spheres}
          allTasks={allTasks}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          icon={icon}
          setIcon={setIcon}
          iconPickerOpen={iconPickerOpen}
          setIconPickerOpen={setIconPickerOpen}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          sphereId={sphereId}
          setSphereId={setSphereId}
          parentId={parentId}
          setParentId={setParentId}
          isPrivate={isPrivate}
          setIsPrivate={setIsPrivate}
          plannedDate={plannedDate}
          setPlannedDate={setPlannedDate}
          plannedTime={plannedTime}
          setPlannedTime={setPlannedTime}
          hasPlannedTime={hasPlannedTime}
          setHasPlannedTime={setHasPlannedTime}
          plannedEndTime={plannedEndTime}
          setPlannedEndTime={setPlannedEndTime}
          plannedEndDate={plannedEndDate}
          setPlannedEndDate={setPlannedEndDate}
          hasPlannedEndTime={hasPlannedEndTime}
          setHasPlannedEndTime={setHasPlannedEndTime}
          useDeadline={useDeadline}
          setUseDeadline={setUseDeadline}
          dueDate={dueDate}
          setDueDate={setDueDate}
          dueTime={dueTime}
          setDueTime={setDueTime}
          hasDueTime={hasDueTime}
          setHasDueTime={setHasDueTime}
          onSubmit={doSubmit}
          isPending={isPending}
          showErrors={showErrors}
          setShowErrors={setShowErrors}
        />
      )}
      <IconPickerDialog
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        value={icon}
        onChange={setIcon}
        color={spheres.find((s) => s.id === sphereId)?.color || "#fbbf24"}
        title="Task Symbol"
      />
    </Dialog>
  );
}
