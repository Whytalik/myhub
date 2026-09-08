"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type { TaskData } from "@/features/life/types";

export function DayTimelineCardWrapper({
  task,
  children,
  style,
  isResizing = false,
}: {
  task: TaskData;
  children: React.ReactNode;
  style?: React.CSSProperties;
  isResizing?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: task.id,
    data: task,
    disabled: isResizing,
  });

  const dragStyle: React.CSSProperties = {
    ...style,
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging || isResizing ? 1000 : style?.zIndex,
    transition: "none",
    willChange: isResizing ? "height" : "auto",
  };

  return (
    <div ref={setNodeRef} className="absolute" style={dragStyle} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
