"use client";

import { Button } from "@/components/ui/actions/button";
import { Dialog } from "@/components/ui/overlays/dialog";
import { Heading } from "@/components/ui/display/heading";
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
    <div >
      <div >
        <div >
          <div >
            <Heading title="Tasks" />
            <p >
              Organize your goals, projects, and daily work.
            </p>
          </div>

          <div >
            <div >
              <Button
                variant={view === "gallery" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("gallery")}

              >
                Gallery
              </Button>
              <Button
                variant={view === "calendar" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}

              >
                Calendar
              </Button>
              <Button
                variant={view === "graph" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("graph")}

              >
                Graph
              </Button>
            </div>

            <div >
              {view === "graph" && (
                <Button
                  variant={hideDoneSubtasks ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setHideDoneSubtasks(!hideDoneSubtasks)}

                  title="Toggle completed subtasks"
                >
                  <CheckCircle2
                    size={14}

                  />
                  {hideDoneSubtasks ? "Showing Active" : "Hide Done"}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSpheresOpen(true)}

              >
                <Layers size={14} />
                Life Spheres
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleAddNew}

              >
                <Plus size={16} />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isActionPending && (
        <div >
          <div >
            <Loader2 size={20} />
            <span >
              Updating...
            </span>
          </div>
        </div>
      )}

      <div >
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
              <div >
                <Loader2 size={24} />
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
              <div >
                <Loader2 size={24} />
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
