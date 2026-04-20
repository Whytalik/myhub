"use client";

import React from "react";
import type { TaskData } from "@/features/life/types";
import { TaskCardBase } from "./TaskCardBase";

interface TaskRowProps {
  task:         TaskData;
  onAddChild:   (parent: TaskData) => void;
  onEdit:       (task: TaskData) => void;
  onDuplicate:  (task: TaskData) => void;
  allTasks:     TaskData[];
}

export function TaskRow({ task, onAddChild, onEdit, onDuplicate, allTasks }: TaskRowProps) {
  return (
    <TaskCardBase
      task={task}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onAddChild={onAddChild}
      allTasks={allTasks}
      variant="default"
    />
  );
}
