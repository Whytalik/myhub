"use client";

import React, { useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { TaskData } from "@/features/life/types";
import { TaskCardBase } from "./TaskCardBase";

export function TaskCalendarCard({
  task,
  onEdit,
  onDuplicate,
  onAddChild,
  onDelete,
  allTasks,
  isDraggable = false,
  isOverlay = false,
  startIdx,
  endIdx,
  level = 0,
  rowIdx: _rowIdx = 0,
  onResize,
  isResizing = false,
  onResizeStart,
  onResizeEnd,
  style,
  onHeightChange,
  fixedHeight,
}: {
  task: TaskData;
  onEdit: (t: TaskData) => void;
  onDuplicate?: (t: TaskData) => void;
  onAddChild?: (t: TaskData) => void;
  onDelete?: () => void;
  allTasks: TaskData[];
  isDraggable?: boolean;
  isOverlay?: boolean;
  startIdx?: number;
  endIdx?: number;
  level?: number;
  rowIdx?: number;
  mode?: "month" | "week" | "day";
  days?: Date[];
  onResize?: (taskId: string, daysDelta: number) => void;
  isResizing?: boolean;
  onResizeStart?: (taskId: string) => void;
  onResizeEnd?: () => void;
  style?: React.CSSProperties;
  onHeightChange?: (id: string, height: number) => void;
  fixedHeight?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
    disabled: !isDraggable,
  });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOverlay && ref.current) {
      onHeightChange?.(task.id, ref.current.offsetHeight);
    }
  }, [
    isOverlay,
    task.id,
    task.title,
    task.description,
    task.status,
    task.plannedDate,
    task.plannedEndDate,
    onHeightChange,
  ]);

  const dragStyle: React.CSSProperties = {
    ...(isDraggable
      ? {
          transform: CSS.Translate.toString(transform ?? null),
          zIndex: isDragging ? 1000 : isOverlay ? 30 : undefined,
          position: "relative" as const,
          transition: isDragging ? "none" : "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
          willChange: isDragging ? "transform" : "auto",
        }
      : {}),
    ...(fixedHeight ? { minHeight: `${fixedHeight}px` } : {}),
  };

  const overlayStyle: React.CSSProperties = isOverlay
    ? {
        position: "absolute" as const,
        gridRowStart: 1,
        gridColumnStart: ((startIdx ?? 0) % 7) + 1,
        gridColumnEnd: `span ${Math.max((endIdx ?? startIdx ?? 0) - (startIdx ?? 0) + 1, 1)}`,
        left: "0",
        right: "0",
        zIndex: isDragging || isResizing ? 9999 : 30 + level,
        ...style,
      }
    : {};

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart?.(task.id);

    const startX = e.clientX;
    const container = (e.currentTarget as HTMLElement).closest(".grid-cols-7");
    const cellWidth = container ? container.clientWidth / 7 : 100;

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onResizeEnd?.();

      const delta = upEvent.clientX - startX;
      const daysDelta = Math.round(delta / cellWidth);
      if (daysDelta !== 0) {
        onResize?.(task.id, daysDelta);
      }
    };

    const handleMouseMove = () => {};

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const showResizeHandle = isOverlay && task.plannedDate && isDraggable;
  const combinedStyle: React.CSSProperties = { ...dragStyle, ...overlayStyle };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (ref) ref.current = node;
      }}
      className={isOverlay ? "absolute" : "relative"}
      style={combinedStyle}
    >
      <TaskCardBase
        task={task}
        variant="compact"
        isDragging={isDragging}
        listeners={listeners}
        attributes={attributes}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onAddChild={onAddChild}
        onDelete={onDelete}
        allTasks={allTasks}
      />
      {showResizeHandle && (
        <div
          className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize flex items-center justify-center z-10"
          onMouseDown={handleResizeStart}
        >
          <div className="w-0.5 h-4 rounded-full bg-white/20 hover:bg-accent transition-colors" />
        </div>
      )}
    </div>
  );
}
