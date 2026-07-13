"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/actions/button";
import {
  deleteStatusAction,
  deleteThoughtAction,
  moveThoughtAction,
  reorderStatusesAction,
  upsertThoughtAction,
} from "@/features/life/actions/thought-actions";
import type { ThoughtData, ThoughtStatusData } from "@/features/life/types";
import { StatusColumn } from "./StatusColumn";
import { StatusFormDialog } from "./StatusFormDialog";

interface ThoughtsBoardClientProps {
  initialStatuses: ThoughtStatusData[];
}

export function ThoughtsBoardClient({ initialStatuses }: ThoughtsBoardClientProps) {
  const [columns, setColumns] = useState<ThoughtStatusData[]>(initialStatuses);
  const [newStatusOpen, setNewStatusOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  const findColumnByCardId = (cardId: string) =>
    columns.find((c) => c.thoughts.some((t) => t.id === cardId));

  const findColumnById = (id: string) => columns.find((c) => c.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "card") {
      setActiveCardId(event.active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "card") return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const sourceColumn = findColumnByCardId(activeId);
    const overType = over.data.current?.type;
    const targetStatusId: string | undefined =
      overType === "card" || overType === "column-body"
        ? (over.data.current?.statusId as string | undefined)
        : undefined;

    if (!sourceColumn || !targetStatusId || sourceColumn.id === targetStatusId) return;

    setColumns((prev) => {
      const source = prev.find((c) => c.id === sourceColumn.id);
      const target = prev.find((c) => c.id === targetStatusId);
      if (!source || !target) return prev;

      const movingThought = source.thoughts.find((t) => t.id === activeId);
      if (!movingThought) return prev;

      const overIndex =
        overType === "card"
          ? target.thoughts.findIndex((t) => t.id === overId)
          : target.thoughts.length;

      return prev.map((c) => {
        if (c.id === source.id) {
          return { ...c, thoughts: c.thoughts.filter((t) => t.id !== activeId) };
        }
        if (c.id === target.id) {
          const nextThoughts = [...c.thoughts];
          const insertAt = overIndex === -1 ? nextThoughts.length : overIndex;
          nextThoughts.splice(insertAt, 0, { ...movingThought, statusId: target.id });
          return { ...c, thoughts: nextThoughts };
        }
        return c;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over) return;

    if (active.data.current?.type === "column") {
      const activeId = active.id as string;
      const overId = over.id as string;
      if (activeId === overId) return;

      const overColumnId =
        over.data.current?.type === "column"
          ? overId
          : (over.data.current?.statusId as string | undefined);
      if (!overColumnId) return;

      const oldIndex = columns.findIndex((c) => c.id === activeId);
      const newIndex = columns.findIndex((c) => c.id === overColumnId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const previous = columns;
      const reordered = arrayMove(columns, oldIndex, newIndex);
      setColumns(reordered);

      startTransition(async () => {
        const result = await reorderStatusesAction(reordered.map((c) => c.id));
        if (!result.success) {
          setColumns(previous);
          toast.error(result.error || "Failed to reorder statuses");
        }
      });
      return;
    }

    if (active.data.current?.type === "card") {
      const thoughtId = active.id as string;
      const targetColumn = findColumnByCardId(thoughtId);
      if (!targetColumn) return;

      const orderedIds = targetColumn.thoughts.map((t) => t.id);

      startTransition(async () => {
        const result = await moveThoughtAction(thoughtId, targetColumn.id, orderedIds);
        if (!result.success) {
          toast.error(result.error || "Failed to move thought");
        }
      });
    }
  };

  const handleAddThought = (statusId: string, content: string) => {
    const column = findColumnById(statusId);
    if (!column) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticThought: ThoughtData = {
      id: tempId,
      statusId,
      content,
      order: column.thoughts.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setColumns((prev) =>
      prev.map((c) =>
        c.id === statusId ? { ...c, thoughts: [...c.thoughts, optimisticThought] } : c,
      ),
    );

    startTransition(async () => {
      const result = await upsertThoughtAction({ statusId, content });
      if (result.success) {
        const saved = result.data;
        setColumns((prev) =>
          prev.map((c) =>
            c.id === statusId
              ? { ...c, thoughts: c.thoughts.map((t) => (t.id === tempId ? saved : t)) }
              : c,
          ),
        );
      } else {
        setColumns((prev) =>
          prev.map((c) =>
            c.id === statusId ? { ...c, thoughts: c.thoughts.filter((t) => t.id !== tempId) } : c,
          ),
        );
        toast.error(result.error || "Failed to add thought");
      }
    });
  };

  const handleEditThought = (thoughtId: string, content: string) => {
    const column = findColumnByCardId(thoughtId);
    if (!column) return;
    const previous = column.thoughts.find((t) => t.id === thoughtId);
    if (!previous) return;

    setColumns((prev) =>
      prev.map((c) => ({
        ...c,
        thoughts: c.thoughts.map((t) => (t.id === thoughtId ? { ...t, content } : t)),
      })),
    );

    startTransition(async () => {
      const result = await upsertThoughtAction({ id: thoughtId, content });
      if (!result.success) {
        setColumns((prev) =>
          prev.map((c) => ({
            ...c,
            thoughts: c.thoughts.map((t) =>
              t.id === thoughtId ? { ...t, content: previous.content } : t,
            ),
          })),
        );
        toast.error(result.error || "Failed to update thought");
      }
    });
  };

  const handleDeleteThought = (thoughtId: string) => {
    const column = findColumnByCardId(thoughtId);
    if (!column) return;
    const previousThoughts = column.thoughts;

    setColumns((prev) =>
      prev.map((c) =>
        c.id === column.id ? { ...c, thoughts: c.thoughts.filter((t) => t.id !== thoughtId) } : c,
      ),
    );

    startTransition(async () => {
      const result = await deleteThoughtAction(thoughtId);
      if (!result.success) {
        setColumns((prev) =>
          prev.map((c) => (c.id === column.id ? { ...c, thoughts: previousThoughts } : c)),
        );
        toast.error(result.error || "Failed to delete thought");
      }
    });
  };

  const handleDeleteStatus = (statusId: string) => {
    const previous = columns;
    setColumns((prev) => prev.filter((c) => c.id !== statusId));

    startTransition(async () => {
      const result = await deleteStatusAction(statusId);
      if (!result.success) {
        setColumns(previous);
        toast.error(result.error || "Failed to delete status");
      }
    });
  };

  const activeThought = activeCardId
    ? columns.flatMap((c) => c.thoughts).find((t) => t.id === activeCardId)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-2">
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {columns.map((status) => (
              <StatusColumn
                key={status.id}
                status={status}
                onAddThought={handleAddThought}
                onEditThought={handleEditThought}
                onDeleteThought={handleDeleteThought}
                onDeleteStatus={handleDeleteStatus}
              />
            ))}
          </SortableContext>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setNewStatusOpen(true)}
            className="h-10 shrink-0 self-start"
          >
            <Plus size={14} /> Add status
          </Button>
        </div>

        <DragOverlay>
          {activeThought ? (
            <div className="glass-card p-3 w-72">
              <p className="text-body whitespace-pre-wrap break-words">{activeThought.content}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <StatusFormDialog isOpen={newStatusOpen} onClose={() => setNewStatusOpen(false)} />
    </div>
  );
}
