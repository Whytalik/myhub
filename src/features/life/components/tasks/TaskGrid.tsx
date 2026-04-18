"use client";

import { TaskRow } from "./TaskRow";
import type { TaskData } from "@/features/life/types";

interface TaskGridProps {
  tasks:        TaskData[];
  onEdit:       (task: TaskData) => void;
  onDuplicate:  (task: TaskData) => void;
  onAddChild:   (parent: TaskData) => void;
  allTasks:     TaskData[];
}

export function TaskGrid({ tasks, onEdit, onDuplicate, onAddChild, allTasks = [] }: TaskGridProps) {
  if (tasks.length === 0) {
    return (
      <div className="bg-surface border border-border border-dashed rounded-3xl p-12 text-center">
        <p className="text-muted text-sm italic">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          allTasks={allTasks}
        />
      ))}
    </div>
  );
}
