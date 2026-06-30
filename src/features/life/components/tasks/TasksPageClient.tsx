"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Heading } from "@/components/ui/heading";
import { instantDuplicateTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";
import { CheckCircle2, Layers, Loader2, Plus } from "lucide-react";
import { lazy, Suspense, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { SphereGrid } from "./SphereGrid";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskTree } from "./TaskTree";

const TaskCalendar = lazy(() =>
  import("./TaskCalendar").then((m) => ({ default: m.TaskCalendar })),
);
const TaskGraph = lazy(() =>
  import("./TaskGraph").then((m) => ({ default: m.TaskGraph })),
);

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
  const [spheresOpen, setSpheresOpen] = useState(false);
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Heading title="Tasks" />
            <p className="text-subtitle text-text-secondary leading-relaxed pl-3 border-l-2 border-border-strong">
              Organize your goals, projects, and daily work.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl w-full sm:w-auto">
              <Button
                variant={view === "gallery" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("gallery")}
                className="flex-1 sm:flex-none rounded-lg px-4 h-8 text-note whitespace-nowrap"
              >
                Gallery
              </Button>
              <Button
                variant={view === "calendar" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}
                className="flex-1 sm:flex-none rounded-lg px-4 h-8 text-note whitespace-nowrap"
              >
                Calendar
              </Button>
              <Button
                variant={view === "graph" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("graph")}
                className="flex-1 sm:flex-none rounded-lg px-4 h-8 text-note whitespace-nowrap"
              >
                Graph
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {view === "graph" && (
                <Button
                  variant={hideDoneSubtasks ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setHideDoneSubtasks(!hideDoneSubtasks)}
                  className="rounded-xl px-4 h-10 sm:h-9 text-note font-bold transition-all"
                  title="Toggle completed subtasks"
                >
                  <CheckCircle2
                    size={14}
                    className={hideDoneSubtasks ? "mr-2" : "mr-2 text-muted/50"}
                  />
                  {hideDoneSubtasks ? "Showing Active" : "Hide Done"}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpheresOpen(true)}
                className="flex-1 sm:flex-none rounded-xl px-4 h-10 sm:h-9 text-note font-bold"
              >
                <Layers size={14} className="mr-2" />
                Life Spheres
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAddNew}
                className="flex-1 sm:flex-none rounded-xl px-6 h-10 sm:h-9 text-note font-bold"
              >
                <Plus size={16} className="mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isActionPending && (
        <div className="fixed inset-0 z-[9999] bg-bg/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
          <div className="bg-surface border border-border p-4 rounded-xl shadow-elevated flex items-center gap-3">
            <Loader2 size={20} className="text-accent animate-spin" />
            <span className="text-note font-mono uppercase tracking-widest text-muted">
              Updating...
            </span>
          </div>
        </div>
      )}

      <div className="animate-in fade-in duration-500">
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
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="text-accent animate-spin" />
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
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="text-accent animate-spin" />
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

      <Dialog
        isOpen={spheresOpen}
        onClose={() => setSpheresOpen(false)}
        title="Life Spheres"
        description="Areas of your life"
        maxWidth="720px"
        bare
      >
        <SphereGrid spheres={spheres} onClose={() => setSpheresOpen(false)} />
      </Dialog>

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
