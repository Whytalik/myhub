"use client";

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Edge,
  MarkerType,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

import { TaskNode, TaskNodeType } from './TaskNode';
import type { TaskData, LifeSphereData } from '@/features/life/types';

interface TaskGraphProps {
  tasks: TaskData[];
  spheres: LifeSphereData[];
  onEdit: (task: TaskData) => void;
  onDuplicate: (task: TaskData) => void;
  onAddChild: (parent: TaskData) => void;
}

const nodeTypes = {
  task: TaskNode,
};

const getLayoutedElements = (nodes: TaskNodeType[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 320;
  const nodeHeight = 180;

  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
  });

  return { nodes, edges };
};

export function TaskGraph({ tasks, onEdit, onDuplicate, onAddChild }: TaskGraphProps) {
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const nodes: TaskNodeType[] = tasks.map((task) => ({
      id: task.id,
      type: 'task',
      data: {
        task,
        allTasks: tasks,
        onEdit,
        onDuplicate,
        onAddChild,
      },
      position: { x: 0, y: 0 },
    }));

    const edges: Edge[] = [];
    tasks.forEach((task) => {
      if (task.parentId) {
        edges.push({
          id: `e-${task.parentId}-${task.id}`,
          source: task.parentId,
          target: task.id,
          animated: true,
          style: { stroke: 'rgba(192, 132, 252, 0.4)', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'rgba(192, 132, 252, 0.4)',
          },
        });
      }
    });

    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(nodes, edges);
    return { layoutedNodes: lNodes, layoutedEdges: lEdges };
  }, [tasks, onEdit, onDuplicate, onAddChild]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Sync state if tasks change
  React.useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[70vh] bg-[#0a0a0a] border border-border rounded-[2.5rem] overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
      >
        <Background color="#1a1a1a" gap={20} />
        <Controls className="!bg-surface !border-border !fill-text" />
      </ReactFlow>
      
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <p className="text-[10px] font-mono text-muted uppercase tracking-[0.4em] bg-bg/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50">
          Mind Map View
        </p>
      </div>
    </div>
  );
}
