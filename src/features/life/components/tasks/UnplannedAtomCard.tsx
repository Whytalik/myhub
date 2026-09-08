"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskData } from "@/features/life/types";
import { TaskCardBase } from "./TaskCardBase";

export function UnplannedAtomCard({
  task,
  onEdit,
  allTasks,
  locked,
}: {
  task: TaskData;
  onEdit: (t: TaskData) => void;
  allTasks: TaskData[];
  locked: boolean;
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
    <div ref={setNodeRef} style={style} className="w-64 shrink-0">
      <TaskCardBase
        task={task}
        variant="atom"
        isDragging={isDragging}
        listeners={listeners}
        attributes={attributes}
        onEdit={onEdit}
        allTasks={allTasks}
      />
    </div>
  );
}
