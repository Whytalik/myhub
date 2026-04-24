"use client";

import { useState } from "react";
import { Layers, Plus, Lock, Unlock } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyPrivateTaskPasswordAction } from "@/features/profile/actions";
import { TaskTree } from "./TaskTree";
import { TaskCalendar } from "./TaskCalendar";
import { SphereGrid } from "./SphereGrid";
import { TaskFormDialog } from "./TaskFormDialog";
import type { TaskData, LifeSphereData } from "@/features/life/types";

interface TasksPageClientProps {
  initialTasks:  TaskData[];
  calendarTasks: TaskData[];
  spheres:       LifeSphereData[];
  initialView?:  string;
}

export function TasksPageClient({ initialTasks, calendarTasks, spheres, initialView }: TasksPageClientProps) {
  const [spheresOpen, setSpheresOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [view, setView] = useState(initialView ?? "gallery");
  const [privateUnlocked, setPrivateUnlocked] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask]   = useState<TaskData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleEdit = (task: TaskData) => {
    setEditingTask(task);
    setParentTask(null);
    setIsDuplicate(false);
    setTaskFormOpen(true);
  };

  const handleDuplicate = (task: TaskData) => {
    setEditingTask(task);
    setParentTask(null);
    setIsDuplicate(true);
    setTaskFormOpen(true);
  };

  const handleAddChild = (parent: TaskData) => {
    setEditingTask(null);
    setParentTask(parent);
    setIsDuplicate(false);
    setTaskFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
    setTaskFormOpen(true);
  };

  const [passwordError, setPasswordError] = useState(false);
  const handleUnlock = () => {
    setPasswordDialogOpen(true);
  };

  const tasks = privateUnlocked ? initialTasks : initialTasks.filter(t => !t.isPrivate);
  const privateCount = initialTasks.filter(t => t.isPrivate).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Heading title="Tasks" />
            <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
              Organize your goals, projects, and daily work.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-nowrap items-center gap-2 bg-surface/50 border border-border p-1.5 rounded-xl w-full sm:w-auto">
              <Button
                variant={view === "gallery" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("gallery")}
                className="flex-1 sm:flex-none rounded-lg px-6 h-8 text-[11px] whitespace-nowrap"
              >
                Gallery
              </Button>
              <Button
                variant={view === "calendar" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setView("calendar")}
                className="flex-1 sm:flex-none rounded-lg px-6 h-8 text-[11px] whitespace-nowrap"
              >
                Calendar
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {privateCount > 0 && (
                <Button 
                  variant={privateUnlocked ? "secondary" : "outline"} 
                  size="sm" 
                  onClick={handleUnlock} 
                  className="flex-1 sm:flex-none rounded-xl px-4 h-10 sm:h-9 text-[11px] font-bold"
                >
                  {privateUnlocked ? <Unlock size={14} className="mr-2" /> : <Lock size={14} className="mr-2" />}
                  {privateUnlocked ? "Private" : `${privateCount} Private`}
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSpheresOpen(true)} 
                className="flex-1 sm:flex-none rounded-xl px-4 h-10 sm:h-9 text-[11px] font-bold"
              >
                <Layers size={14} className="mr-2" />
                Life Spheres
              </Button>

              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddNew} 
                className="flex-1 sm:flex-none rounded-xl px-6 h-10 sm:h-9 text-[11px] font-bold"
              >
                <Plus size={16} className="mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {view === "gallery" ? (
          <TaskTree 
            tasks={tasks} 
            spheres={spheres} 
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onAddChild={handleAddChild}
            hideHeader 
          />
        ) : (
          <TaskCalendar 
            tasks={privateUnlocked ? calendarTasks : calendarTasks.filter(t => !t.isPrivate)} 
            allTasks={initialTasks}
            spheres={spheres} 
            onDuplicate={handleDuplicate}
          />
        )}
      </div>

      <Dialog
        isOpen={spheresOpen}
        onClose={() => setSpheresOpen(false)}
        title="Life Spheres"
        description="Areas of your life"
        maxWidth="680px"
        bare
      >
        <SphereGrid spheres={spheres} />
      </Dialog>

      <TaskFormDialog
        key={`task-form-${editingTask?.id ?? parentTask?.id ?? 'new'}`}
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        task={editingTask}
        parentTask={parentTask}
        spheres={spheres}
        allTasks={initialTasks}
        isDuplicate={isDuplicate}
      />

      <Dialog
        isOpen={passwordDialogOpen}
        onClose={() => { setPasswordDialogOpen(false); setPasswordInput(""); setPasswordError(false); }}
        title="Unlock Private Tasks"
      >
        <div className="space-y-4">
          <Input
            type="password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            placeholder="Enter your private tasks password"
          />
          {passwordError && <p className="text-[10px] font-bold text-rose-500">Invalid password</p>}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => { setPasswordDialogOpen(false); setPasswordInput(""); setPasswordError(false); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                const result = await verifyPrivateTaskPasswordAction(passwordInput);
                if (result.success) {
                  setPrivateUnlocked(true);
                  setPasswordDialogOpen(false);
                  setPasswordInput("");
                } else {
                  setPasswordError(true);
                }
              }}
              className="flex-1"
            >
              Unlock
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
