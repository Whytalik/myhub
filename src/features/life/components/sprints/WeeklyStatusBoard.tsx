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

// Soft daily capacity guide: atoms run ~15min each, and context-switching
// overhead between small unrelated tasks eats a large share of a day's
// realistic focus budget, so this is a nudge, not an enforced limit.
const DAILY_ATOM_SOFT_CAP = 10;

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
  onTaskUnschedule,
}: {
  task: TaskData;
  locked: boolean;
  onTaskEdit?: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUnschedule?: (taskId: string) => void;
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
        onUnschedule={onTaskUnschedule ? () => onTaskUnschedule(task.id) : undefined}
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
  onTaskUnschedule,
}: {
  id: string;
  cellTasks: TaskData[];
  locked: boolean;
  onTaskEdit?: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUnschedule?: (taskId: string) => void;
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
        <BoardCard
          key={t.id}
          task={t}
          locked={locked}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
          onTaskUnschedule={onTaskUnschedule}
        />
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

  const dayAtomCount = (day: Date): number =>
    (tasks || []).filter((t) => {
      if (t.status === "CANCELLED") return false;
      return t.plannedDate ? isSameDay(new Date(t.plannedDate), day) : false;
    }).length;

  const handleUnschedule = (taskId: string) => {
    onTasksChange((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              plannedDate: null,
              plannedEndDate: null,
            }
          : t,
      ),
    );

    upsertTaskAction({
      id: taskId,
      plannedDate: null,
      plannedEndDate: null,
    }).then((result) => {
      if (result.success) {
        toast.success("Атом повернено в беклог");
      } else {
        toast.error(result.error || "Failed to unschedule atom");
      }
    });
  };

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
            const atomCount = dayAtomCount(day);
            const isOverSoftCap = atomCount >= DAILY_ATOM_SOFT_CAP;
            return (
              <Fragment key={dayKey}>
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-2 ${
                    isTodayRow ? "text-accent font-semibold" : "text-zinc-400"
                  }`}
                >
                  <span>{format(day, "EEE dd.MM")}</span>
                  {atomCount > 0 && (
                    <span
                      title={
                        isOverSoftCap
                          ? `${atomCount} atoms — past the ~${DAILY_ATOM_SOFT_CAP}/day focus budget`
                          : `${atomCount} atoms planned`
                      }
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                        isOverSoftCap
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-white/[0.04] text-zinc-500"
                      }`}
                    >
                      {atomCount}/{DAILY_ATOM_SOFT_CAP}
                    </span>
                  )}
                </div>
                {STATUS_COLUMNS.map((c) => (
                  <BoardCell
                    key={`${c.id}|${dayKey}`}
                    id={`${c.id}|${dayKey}`}
                    cellTasks={cellTasks(c.id, day)}
                    locked={locked}
                    onTaskEdit={onTaskEdit}
                    onTaskDelete={onTaskDelete}
                    onTaskUnschedule={handleUnschedule}
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
