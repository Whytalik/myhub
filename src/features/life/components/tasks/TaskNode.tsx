"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { TaskCardBase } from './TaskCardBase';
import type { TaskData } from '@/features/life/types';

export type TaskNodeData = {
  task: TaskData;
  allTasks: TaskData[];
  onEdit: (task: TaskData) => void;
  onDuplicate: (task: TaskData) => void;
  onAddChild: (parent: TaskData) => void;
};

export type TaskNodeType = Node<TaskNodeData, 'task'>;

export const TaskNode = memo(({ data }: NodeProps<TaskNodeType>) => {
  const { task, allTasks, onEdit, onDuplicate, onAddChild } = data;

  return (
    <div className="relative group min-w-[280px] max-w-[320px]">
      {/* Input Handle (Left for Horizontal Layout) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-accent !border-none"
      />

      <TaskCardBase
        task={task}
        allTasks={allTasks}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onAddChild={onAddChild}
        className="shadow-xl"
      />

      {/* Output Handle (Right for Horizontal Layout) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-accent !border-none"
      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
