"use client";

import { TaskRow } from "./TaskRow";
import type { TaskData } from "@/features/life/types";

interface TaskGridProps {
  tasks: TaskData[];
  onEdit: (task: TaskData) => void;
  onDuplicate: (task: TaskData) => void;
  onAddChild: (parent: TaskData) => void;
  onDelete?: () => void;
  allTasks: TaskData[];
}

export function TaskGrid({ tasks, onEdit, onDuplicate, onAddChild, onDelete, allTasks = [] }: TaskGridProps) {
  if (tasks.length === 0) {
    return (
      <div >
        <p >No tasks found.</p>
      </div>
    );
  }

  return (
    <div >
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          allTasks={allTasks}
        />
      ))}
    </div>
  );
}
