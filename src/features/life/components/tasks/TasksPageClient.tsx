"use client";

import Link from "next/link";
import { Button } from "@/components/ui/actions/button";
import { Heading } from "@/components/ui/display/heading";
import { instantDuplicateTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";
import { CheckCircle2, Layers, Loader2, Plus } from "lucide-react";
import { lazy, Suspense, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskTree } from "./TaskTree";

const TaskCalendar = lazy(() =>
  import("./TaskCalendar").then((m) => ({ default: m.TaskCalendar })),
);
const TaskGraph = lazy(() => import("./TaskGraph").then((m) => ({ default: m.TaskGraph })));

interface TasksPageClientProps {
  initialTasks: TaskData[];
  calendarTasks: TaskData[];
  spheres: LifeSphereData[];
  initialView?: string;
}

export function TasksPageClient({
  initialTasks,
  calendarTasks,
  spheres,
  initialView,
}: TasksPageClientProps) {
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [view, setView] = useState(initialView ?? "gallery");
  const [hideDoneSubtasks, setHideDoneSubtasks] = useState(false);
  const [isActionPending, startActionTransition] = useTransition();

  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask] = useState<TaskData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dialogVersion, setDialogVersion] = useState(0);

  const handleEdit = (task: TaskData) => {
    setEditingTask(task);
    setParentTask(null);
    setIsDuplicate(false);
    setDialogVersion((v) => v + 1);
    setTaskFormOpen(true);
  };

  const handleDuplicate = (task: TaskData) => {
    startActionTransition(async () => {
      const result = await instantDuplicateTaskAction(task);
      if (result.success) {
        toast.success("Task duplicated instantly");
      } else {
        toast.error(result.error || "Failed to duplicate task");
      }
    });
  };

  const handleAddChild = (parent: TaskData) => {
    setEditingTask(null);
    setParentTask(parent);
    setIsDuplicate(false);
    setDialogVersion((v) => v + 1);
    setTaskFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
    setDialogVersion((v) => v + 1);
    setTaskFormOpen(true);
  };

  const handleTaskDeleted = () => {
    setDialogVersion((v) => v + 1);
    setTaskFormOpen(false);
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
  };

  const filteredTasks = useMemo(() => {
    if (!hideDoneSubtasks) return initialTasks;
    return initialTasks.filter((t) => !(t.parentId && t.status === "DONE"));
  }, [initialTasks, hideDoneSubtasks]);

  const galleryButtonVariant = view === "gallery" ? "primary" : "ghost";
  const calendarButtonVariant = view === "calendar" ? "primary" : "ghost";
  const graphButtonVariant = view === "graph" ? "primary" : "ghost";
  const hideDoneButtonVariant = hideDoneSubtasks ? "primary" : "outline";
  const hideDoneLabel = hideDoneSubtasks ? "Showing Active" : "Hide Done";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading title="Tasks" />
          <p className="text-caption mt-1">Organize your goals, projects, and daily work.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
            <Button variant={galleryButtonVariant} size="sm" onClick={() => setView("gallery")}>
              Gallery
            </Button>
            <Button variant={calendarButtonVariant} size="sm" onClick={() => setView("calendar")}>
              Calendar
            </Button>
            <Button variant={graphButtonVariant} size="sm" onClick={() => setView("graph")}>
              Graph
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {view === "graph" && (
              <Button
                variant={hideDoneButtonVariant}
                size="sm"
                onClick={() => setHideDoneSubtasks(!hideDoneSubtasks)}
                title="Toggle completed subtasks"
              >
                <CheckCircle2 size={14} />
                {hideDoneLabel}
              </Button>
            )}

            <Link href="/life/planning/spheres">
              <Button variant="outline" size="sm">
                <Layers size={14} />
                Life Spheres
              </Button>
            </Link>

            <Button variant="primary" size="sm" onClick={handleAddNew}>
              <Plus size={16} />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {isActionPending && (
        <div className="glass-card px-4 py-2 flex items-center gap-2 w-fit">
          <Loader2 size={20} className="animate-spin text-accent" />
          <span className="text-caption">Updating...</span>
        </div>
      )}

      <div>
        {view === "gallery" && (
          <TaskTree
            tasks={initialTasks}
            spheres={spheres}
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onAddChild={handleAddChild}
            onDelete={handleTaskDeleted}
            hideHeader
          />
        )}
        {view === "calendar" && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-96">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            }
          >
            <TaskCalendar
              tasks={calendarTasks}
              allTasks={initialTasks}
              spheres={spheres}
              defaultMode="week"
              onDuplicate={handleDuplicate}
              onDelete={handleTaskDeleted}
            />
          </Suspense>
        )}
        {view === "graph" && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-96">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            }
          >
            <TaskGraph
              tasks={filteredTasks}
              spheres={spheres}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onAddChild={handleAddChild}
            />
          </Suspense>
        )}
      </div>

      <TaskFormDialog
        key={`task-form-${dialogVersion}-${editingTask?.id ?? "new"}`}
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        task={editingTask}
        parentTask={parentTask}
        spheres={spheres}
        allTasks={initialTasks}
        isDuplicate={isDuplicate}
        onViewTask={(t) => handleEdit(t)}
      />
    </div>
  );
}
