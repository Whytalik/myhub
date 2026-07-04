"use client";

import React, { memo } from 'react';
import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { TaskCardBase } from './TaskCardBase';
import type { TaskData } from '@/features/life/types';

export type TaskNodeData = {
  task: TaskData;
  allTasks: TaskData[];
  onEdit: (task: TaskData) => void;
  onDuplicate: (task: TaskData) => void;
  onAddChild: (parent: TaskData) => void;
};

type TaskNodeType = Node<TaskNodeData, 'task'>;

export const TaskNode = memo((props: NodeProps<TaskNodeType>) => {
  const { task, allTasks, onEdit, onDuplicate, onAddChild } = props.data;

  return (
    <div >
      <Handle
        type="target"
        position={Position.Left}

      />

      <TaskCardBase
        task={task}
        allTasks={allTasks}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onAddChild={onAddChild}

      />

      <Handle
        type="source"
        position={Position.Right}

      />
    </div>
  );
});

TaskNode.displayName = 'TaskNode';
