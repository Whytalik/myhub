"use client";

import { useState } from "react";
import { Layers, Plus } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <Heading title="Tasks" />
          <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
            Organize your goals, projects, and daily work.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface/50 border border-border p-1 rounded-xl">
            <Button
              variant={view === "gallery" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("gallery")}
              className="rounded-lg px-4 h-8 text-[11px]"
            >
              Gallery
            </Button>
            <Button
              variant={view === "calendar" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setView("calendar")}
              className="rounded-lg px-4 h-8 text-[11px]"
            >
              Calendar
            </Button>
          </div>

          <div className="hidden sm:block h-6 w-px bg-border/40 mx-1" />

          <Button variant="outline" size="sm" onClick={() => setSpheresOpen(true)} className="rounded-xl px-4 h-9 text-[11px]">
            <Layers size={14} className="mr-1.5" />
            Spheres
          </Button>

          <Button variant="primary" size="sm" onClick={handleAddNew} className="rounded-xl px-4 h-9 text-[11px]">
            <Plus size={16} className="mr-1.5" />
            New Task
          </Button>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        {view === "gallery" ? (
          <TaskTree 
            tasks={initialTasks} 
            spheres={spheres} 
            onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onAddChild={handleAddChild}
            hideHeader 
          />
        ) : (
          <TaskCalendar 
            tasks={calendarTasks} 
            allTasks={initialTasks}
            spheres={spheres} 
            onDuplicate={handleDuplicate}
            onAdd={handleAddNew}
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
        isOpen={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        task={editingTask}
        parentTask={parentTask}
        spheres={spheres}
        allTasks={initialTasks}
        isDuplicate={isDuplicate}
      />
    </div>
  );
}
