"use client";

import { Fragment } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, addDays, isSameDay, isToday } from "date-fns";
import { toast } from "sonner";
import { upsertTaskAction } from "@/features/life/actions/task-actions";
import { TaskCardBase } from "@/features/life/components/tasks/TaskCardBase";
import type { TaskData, TaskStatus } from "@/features/life/types";

const STATUS_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

interface WeeklyStatusBoardProps {
  tasks: TaskData[];
  weekStart: Date;
  locked: boolean;
  onTasksChange: (updater: (prev: TaskData[]) => TaskData[]) => void;
  onTaskEdit?: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => void;
}

function BoardCard({
  task,
  locked,
  onTaskEdit,
  onTaskDelete,
}: {
  task: TaskData;
  locked: boolean;
  onTaskEdit?: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
    disabled: locked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform ?? null),
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardBase
        task={task}
        variant="atom"
        isDragging={isDragging}
        onEdit={() => onTaskEdit?.(task)}
        onDelete={onTaskDelete ? () => onTaskDelete(task.id) : undefined}
      />
    </div>
  );
}

function BoardCell({
  id,
  cellTasks,
  locked,
  onTaskEdit,
  onTaskDelete,
}: {
  id: string;
  cellTasks: TaskData[];
  locked: boolean;
  onTaskEdit?: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled: locked });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-1.5 p-2 min-h-[64px] rounded-lg border transition-colors ${
        isOver ? "border-accent/40 bg-accent/5" : "border-white/[0.04] bg-black/10"
      }`}
    >
      {cellTasks.map((t) => (
        <BoardCard key={t.id} task={t} locked={locked} onTaskEdit={onTaskEdit} onTaskDelete={onTaskDelete} />
      ))}
      {cellTasks.length === 0 && <span className="text-[10px] text-zinc-600 italic px-1">—</span>}
    </div>
  );
}

export function WeeklyStatusBoard({
  tasks,
  weekStart,
  locked,
  onTasksChange,
  onTaskEdit,
  onTaskDelete,
}: WeeklyStatusBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const days = weekStart ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [];

  const cellTasks = (status: TaskStatus, day: Date): TaskData[] =>
    (tasks || []).filter((t) => {
      if (t.status !== status) return false;
      return t.plannedDate ? isSameDay(new Date(t.plannedDate), day) : false;
    });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || locked) return;

    const taskId = active.id as string;
    const [status, dayKey] = (over.id as string).split("|") as [TaskStatus, string];
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentDayKey = task.plannedDate
      ? format(new Date(task.plannedDate), "yyyy-MM-dd")
      : null;
    if (task.status === status && currentDayKey === dayKey) return;

    const newPlannedDate = new Date(dayKey);

    onTasksChange((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              plannedDate: newPlannedDate,
              completedAt: status === "DONE" ? new Date() : t.completedAt,
            }
          : t,
      ),
    );

    upsertTaskAction({
      id: taskId,
      status,
      plannedDate: newPlannedDate ? newPlannedDate.toISOString() : null,
    }).then((result) => {
      if (!result.success) toast.error(result.error || "Failed to move atom");
    });
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto">
        <div
          className="grid gap-2 min-w-[720px]"
          style={{ gridTemplateColumns: `130px repeat(${STATUS_COLUMNS.length}, 1fr)` }}
        >
          <div />
          {STATUS_COLUMNS.map((c) => (
            <div
              key={c.id}
              className="text-[10px] font-mono uppercase text-zinc-400 font-semibold px-2 pb-1 tracking-wider"
            >
              {c.label}
            </div>
          ))}

          {days.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const isTodayRow = isToday(day);
            return (
              <Fragment key={dayKey}>
                <div
                  className={`text-[11px] font-mono px-2 py-2 ${
                    isTodayRow ? "text-accent font-semibold" : "text-zinc-400"
                  }`}
                >
                  {format(day, "EEE dd.MM")}
                </div>
                {STATUS_COLUMNS.map((c) => (
                  <BoardCell
                    key={`${c.id}|${dayKey}`}
                    id={`${c.id}|${dayKey}`}
                    cellTasks={cellTasks(c.id, day)}
                    locked={locked}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                  />
                ))}
              </Fragment>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
