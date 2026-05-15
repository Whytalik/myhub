"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { instantDuplicateTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";
import { verifyPrivateTaskPasswordAction } from "@/features/profile/actions";
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
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [pendingTaskAction, setPendingTaskAction] = useState<{
    type: "edit" | "duplicate" | "addChild";
    task: TaskData;
  } | null>(null);
  const [isActionPending, startActionTransition] = useTransition();

  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask] = useState<TaskData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dialogVersion, setDialogVersion] = useState(0);

  const checkPrivate = (
    task: TaskData,
    action: () => void,
    type: "edit" | "duplicate" | "addChild",
  ) => {
    if (task.isPrivate) {
      setPendingTaskAction({ type, task });
      setPasswordDialogOpen(true);
    } else {
      action();
    }
  };

  const handleEdit = (task: TaskData) => {
    checkPrivate(
      task,
      () => {
        setEditingTask(task);
        setParentTask(null);
        setIsDuplicate(false);
        setDialogVersion((v) => v + 1);
        setTaskFormOpen(true);
      },
      "edit",
    );
  };

  const handleDuplicate = (task: TaskData) => {
    checkPrivate(
      task,
      () => {
        startActionTransition(async () => {
          const result = await instantDuplicateTaskAction(task);
          if (result.success) {
            toast.success("Task duplicated instantly");
          } else {
            toast.error(result.error || "Failed to duplicate task");
          }
        });
      },
      "duplicate",
    );
  };

  const handleAddChild = (parent: TaskData) => {
    checkPrivate(
      parent,
      () => {
        setEditingTask(null);
        setParentTask(parent);
        setIsDuplicate(false);
        setDialogVersion((v) => v + 1);
        setTaskFormOpen(true);
      },
      "addChild",
    );
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

  const tasks = initialTasks;

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (hideDoneSubtasks) {
      result = result.filter((t) => !(t.parentId && t.status === "DONE"));
    }
    return result;
  }, [tasks, hideDoneSubtasks]);

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
            tasks={tasks}
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

      <Dialog
        isOpen={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setPasswordInput("");
          setPasswordError(false);
          setPendingTaskAction(null);
        }}
        title="Verification Required"
        description="Enter password to access private entry"
      >
        <div className="space-y-4">
          <Input
            autoFocus
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              setPasswordError(false);
            }}
            placeholder="��������"
            onKeyDown={(e) => {
              if (e.key === "Enter")
                document.getElementById("unlock-btn")?.click();
            }}
          />
          {passwordError && (
            <p className="text-caption font-bold text-rose-500">
              Invalid password
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setPasswordDialogOpen(false);
                setPasswordInput("");
                setPasswordError(false);
                setPendingTaskAction(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              id="unlock-btn"
              variant="primary"
              onClick={async () => {
                const result =
                  await verifyPrivateTaskPasswordAction(passwordInput);
                if (result.success) {
                  const { type, task } = pendingTaskAction!;
                  setPasswordDialogOpen(false);
                  setPasswordInput("");
                  setPendingTaskAction(null);

                  // Execute the actual action
                  if (type === "edit") {
                    setEditingTask(task);
                    setParentTask(null);
                    setIsDuplicate(false);
                    setDialogVersion((v) => v + 1);
                    setTaskFormOpen(true);
                  } else if (type === "duplicate") {
                    startActionTransition(async () => {
                      const result = await instantDuplicateTaskAction(task);
                      if (result.success) {
                        toast.success("Task duplicated instantly");
                      } else {
                        toast.error(result.error || "Failed to duplicate task");
                      }
                    });
                  } else if (type === "addChild") {
                    setEditingTask(null);
                    setParentTask(task);
                    setIsDuplicate(false);
                    setDialogVersion((v) => v + 1);
                    setTaskFormOpen(true);
                  }
                } else {
                  setPasswordError(true);
                }
              }}
              className="flex-1"
            >
              Verify
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
