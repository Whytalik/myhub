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

const NODE_WIDTH = 320;
const NODE_HEIGHT = 160;
const RANK_SEP = 120;
const NODE_SEP = 30;

interface TreeNode {
  id: string;
  children: TreeNode[];
}

function buildTree(tasks: TaskData[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  tasks.forEach(task => {
    nodeMap.set(task.id, { id: task.id, children: [] });
  });

  tasks.forEach(task => {
    const node = nodeMap.get(task.id)!;
    if (task.parentId && nodeMap.has(task.parentId)) {
      nodeMap.get(task.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function subtreeHeight(node: TreeNode): number {
  if (node.children.length === 0) return NODE_HEIGHT;
  const childHeights = node.children.map(c => subtreeHeight(c));
  const total = childHeights.reduce((a, b) => a + b, 0);
  return Math.max(NODE_HEIGHT, total + NODE_SEP * (node.children.length - 1));
}

function layoutTree(
  node: TreeNode,
  x: number,
  y: number,
  positions: Map<string, { x: number; y: number }>
): void {
  positions.set(node.id, { x, y });

  if (node.children.length === 0) return;

  const totalHeight = node.children.reduce((sum, c) => sum + subtreeHeight(c), 0)
    + NODE_SEP * (node.children.length - 1);

  let currentY = y - totalHeight / 2;

  node.children.forEach(child => {
    const childH = subtreeHeight(child);
    const childY = currentY + childH / 2;
    layoutTree(child, x + NODE_WIDTH + RANK_SEP, childY, positions);
    currentY += childH + NODE_SEP;
  });
}

const getLayoutedElements = (nodes: Node<TaskNodeData>[], edges: Edge[]) => {
  const allTasks = nodes.map(n => n.data.task);
  const roots = buildTree(allTasks);

  const positions = new Map<string, { x: number; y: number }>();

  if (roots.length === 0) {
    nodes.forEach((node, i) => {
      node.position = { x: 0, y: i * (NODE_HEIGHT + NODE_SEP) };
    });
    return { nodes, edges };
  }

  if (roots.length === 1) {
    layoutTree(roots[0], 0, 0, positions);
  } else {
    const totalWidth = roots.reduce((max, r) => {
      const w = getMaxDepth(r) * (NODE_WIDTH + RANK_SEP);
      return Math.max(max, w);
    }, 0);

    let currentX = 0;
    roots.forEach(root => {
      layoutTree(root, currentX, 0, positions);
      currentX += totalWidth + RANK_SEP * 2;
    });
  }

  nodes.forEach(node => {
    const pos = positions.get(node.id);
    if (pos) {
      node.position = { x: pos.x, y: pos.y };
    }
  });

  return { nodes, edges };
};

function getMaxDepth(node: TreeNode): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(getMaxDepth));
}

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
    <div >
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

      <div >
        <p >
          Mind Map — Horizontal
        </p>
      </div>
    </div>
  );
}
