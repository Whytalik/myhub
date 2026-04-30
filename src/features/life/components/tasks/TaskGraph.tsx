"use client";

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Edge,
  MarkerType,
  Node,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

import { TaskNode, TaskNodeData } from './TaskNode';
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

const getLayoutedElements = (nodes: Node<TaskNodeData>[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 320;
  const nodeHeight = 160;

  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 140, marginx: 80, marginy: 80 });

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
    const nodes: Node<TaskNodeData>[] = tasks.map((task) => ({
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
          style: { stroke: 'rgba(192, 132, 252, 0.35)', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'rgba(192, 132, 252, 0.35)',
          },
        });
      }
    });

    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(nodes, edges);
    return { layoutedNodes: lNodes, layoutedEdges: lEdges };
  }, [tasks, onEdit, onDuplicate, onAddChild]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  React.useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-[85vh] min-h-[700px] bg-[#141414] border border-border rounded-[2.5rem] overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.1}
        maxZoom={2}
        autoPanOnConnect={false}
        autoPanOnNodeDrag={false}
        zoomOnPinch={true}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnDrag={true}
        selectionOnDrag={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#2a2a2a" gap={24} size={1} />
      </ReactFlow>
      
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <p className="text-[10px] font-mono text-muted uppercase tracking-[0.4em] bg-[#1a1a1a]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50">
          Mind Map — Horizontal
        </p>
      </div>
    </div>
  );
}
