"use client";

import { useState, useTransition, useMemo } from "react";
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
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import {
  FolderKanban,
  CheckSquare,
  Plus,
  Trash2,
  AlertTriangle,
  Compass,
  Calendar,
  Layers,
  ChevronRight,
  X,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Dialog } from "@/components/ui/overlays/dialog";
import {
  createProjectAction,
  deleteProjectAction,
  assignProjectToObjectiveAction,
  createSprintObjectiveAction,
  updateProjectStatusAction,
} from "@/features/life/actions/sprint-actions";
import {
  upsertTaskAction,
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";
import { startOfWeek, endOfWeek, format } from "date-fns";

// Custom TaskCard component for the Operational board
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableTaskCardProps {
  task: TaskData;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableTaskCard({ task, onEdit, onDelete }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task-card", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass-card p-3 flex flex-col gap-2 group cursor-grab active:cursor-grabbing touch-none hover:border-white/15 transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-body text-zinc-150 font-medium break-words leading-tight">{task.title}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 p-0.5 rounded transition-all duration-150"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {task.project && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono uppercase tracking-wide">
            {task.project.title}
          </span>
        )}
        {task.sphere && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] text-[10px] text-zinc-400">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: task.sphere.color }}
            />
            {task.sphere.name}
          </span>
        )}
      </div>
    </div>
  );
}

// Operational Kanban Column
interface TaskColumnProps {
  id: string;
  title: string;
  tasks: TaskData[];
  onDeleteTask: (id: string) => void;
  onEditTask: (task: TaskData) => void;
}

function TaskColumn({ id, title, tasks, onDeleteTask, onEditTask }: TaskColumnProps) {
  return (
    <div className="glass-card p-3 bg-black/15 border border-white/[0.04] rounded-2xl w-full flex flex-col gap-3 min-h-[300px]">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
        <h3 className="text-panel-title font-semibold text-zinc-200">{title}</h3>
        <span className="text-label text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md font-mono">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px] pr-1">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-xs italic">
              No atoms
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  objectiveId: string | null;
  tasks: TaskData[];
  createdAt: Date;
}

interface ObjectiveData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  sphere: LifeSphereData;
  projects: ProjectData[];
}

interface SprintData {
  id: string;
  number: number;
  year: number;
  startDate: Date;
  endDate: Date;
  status: string;
  objectives: ObjectiveData[];
}

interface KanbanBoardClientProps {
  initialSprint: SprintData;
  initialBacklogProjects: ProjectData[];
  initialColumns: {
    weekly: TaskData[];
    today: TaskData[];
    done: TaskData[];
  };
  spheres: LifeSphereData[];
}

export function KanbanBoardClient({
  initialSprint,
  initialBacklogProjects,
  initialColumns,
  spheres,
}: KanbanBoardClientProps) {
  // State
  const [sprint, setSprint] = useState<SprintData>(initialSprint);
  const [backlogProjects, setBacklogProjects] = useState<ProjectData[]>(initialBacklogProjects);
  const [columns, setColumns] = useState(initialColumns);

  // Modal Open states
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newObjectiveOpen, setNewObjectiveOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [targetObjectiveId, setTargetObjectiveId] = useState<string | null>(null);

  const [objectiveTitle, setObjectiveTitle] = useState("");
  const [objectiveDesc, setObjectiveDesc] = useState("");
  const [selectedSphereId, setSelectedSphereId] = useState<string>(spheres[0]?.id || "");

  // Inline Quick Add state per project
  const [inlineAtomTitle, setInlineAtomTitle] = useState<Record<string, string>>({});

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Helper date conversions
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Projects stats (active + backlog)
  const activeProjectsCount = useMemo(() => {
    return sprint.objectives.reduce((acc, obj) => acc + obj.projects.length, 0);
  }, [sprint]);

  // Project assign selector positioning
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);

  // Handlers for Projects (Level 1)
  const handleCreateProject = () => {
    const title = projectTitle.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await createProjectAction(title, projectDesc, targetObjectiveId);
      if (result.success) {
        toast.success("Project created successfully!");
        const newProj: ProjectData = {
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          status: result.data.status,
          objectiveId: result.data.objectiveId,
          tasks: [],
          createdAt: new Date(),
        };

        if (targetObjectiveId) {
          setSprint((prev) => ({
            ...prev,
            objectives: prev.objectives.map((obj) =>
              obj.id === targetObjectiveId
                ? { ...obj, projects: [newProj, ...obj.projects] }
                : obj
            ),
          }));
        } else {
          setBacklogProjects((prev) => [newProj, ...prev]);
        }

        setProjectTitle("");
        setProjectDesc("");
        setNewProjectOpen(false);
      } else {
        toast.error(result.error || "Failed to create project");
      }
    });
  };

  const handleDeleteProject = (projectId: string, inSprint: boolean) => {
    startTransition(async () => {
      const result = await deleteProjectAction(projectId);
      if (result.success) {
        toast.success("Project deleted");
        if (inSprint) {
          setSprint((prev) => ({
            ...prev,
            objectives: prev.objectives.map((obj) => ({
              ...obj,
              projects: obj.projects.filter((p) => p.id !== projectId),
            })),
          }));
        } else {
          setBacklogProjects((prev) => prev.filter((p) => p.id !== projectId));
        }
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    });
  };

  const handleAssignProject = (projectId: string, objectiveId: string | null) => {
    startTransition(async () => {
      const result = await assignProjectToObjectiveAction(projectId, objectiveId);
      if (result.success) {
        toast.success("Project reassigned");

        let movingProject: ProjectData | undefined;

        movingProject = backlogProjects.find((p) => p.id === projectId);

        if (!movingProject) {
          for (const obj of sprint.objectives) {
            const found = obj.projects.find((p) => p.id === projectId);
            if (found) {
              movingProject = found;
              break;
            }
          }
        }

        if (!movingProject) return;
        movingProject = { ...movingProject, objectiveId };

        setBacklogProjects((prev) => prev.filter((p) => p.id !== projectId));
        setSprint((prev) => ({
          ...prev,
          objectives: prev.objectives.map((obj) => ({
            ...obj,
            projects: obj.projects.filter((p) => p.id !== projectId),
          })),
        }));

        if (objectiveId === null) {
          setBacklogProjects((prev) => [movingProject!, ...prev]);
        } else {
          setSprint((prev) => ({
            ...prev,
            objectives: prev.objectives.map((obj) =>
              obj.id === objectiveId
                ? { ...obj, projects: [movingProject!, ...obj.projects] }
                : obj
            ),
          }));
        }
        setAssigningProjectId(null);
      } else {
        toast.error(result.error || "Failed to reassign project");
      }
    });
  };

  const handleCreateObjective = () => {
    const title = objectiveTitle.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await createSprintObjectiveAction(
        sprint.id,
        title,
        selectedSphereId,
        objectiveDesc
      );
      if (result.success) {
        toast.success("Objective added successfully!");
        const sphere = spheres.find((s) => s.id === selectedSphereId)!;
        const newObj: ObjectiveData = {
          id: result.data.id,
          title: result.data.title,
          description: result.data.description,
          status: result.data.status,
          sphere: sphere,
          projects: [],
        };
        setSprint((prev) => ({
          ...prev,
          objectives: [...prev.objectives, newObj],
        }));
        setObjectiveTitle("");
        setObjectiveDesc("");
        setNewObjectiveOpen(false);
      } else {
        toast.error(result.error || "Failed to create objective");
      }
    });
  };

  // Inline Quick Add Task Atom under Project card
  const handleAddInlineAtom = (projectId: string, projectSphereId: string | null) => {
    const title = inlineAtomTitle[projectId]?.trim();
    if (!title) return;

    startTransition(async () => {
      const result = await upsertTaskAction({
        title,
        projectId,
        sphereId: projectSphereId || spheres[0]?.id || null,
        status: "TODO",
        plannedDate: weekStart.toISOString(),
      });

      if (result.success) {
        toast.success("Atom added to weekly plan successfully!");

        const newTask: TaskData = result.data as any;

        setColumns((prev) => ({
          ...prev,
          weekly: [...prev.weekly, newTask],
        }));

        setSprint((prev) => ({
          ...prev,
          objectives: prev.objectives.map((obj) => ({
            ...obj,
            projects: obj.projects.map((p) =>
              p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
            ),
          })),
        }));

        setBacklogProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p))
        );

        setInlineAtomTitle((prev) => ({ ...prev, [projectId]: "" }));
      } else {
        toast.error(result.error || "Failed to create atom");
      }
    });
  };

  // Task Actions (Level 2)
  const handleDeleteTask = (taskId: string) => {
    startTransition(async () => {
      const result = await deleteTaskAction(taskId);
      if (result.success) {
        toast.success("Atom deleted");

        setColumns((prev) => ({
          weekly: prev.weekly.filter((t) => t.id !== taskId),
          today: prev.today.filter((t) => t.id !== taskId),
          done: prev.done.filter((t) => t.id !== taskId),
        }));

        setSprint((prev) => ({
          ...prev,
          objectives: prev.objectives.map((obj) => ({
            ...obj,
            projects: obj.projects.map((p) => ({
              ...p,
              tasks: p.tasks.filter((t) => t.id !== taskId),
            })),
          })),
        }));

        setBacklogProjects((prev) =>
          prev.map((p) => ({
            ...p,
            tasks: p.tasks.filter((t) => t.id !== taskId),
          }))
        );
      } else {
        toast.error(result.error || "Failed to delete atom");
      }
    });
  };

  // Operational Kanban Drag & Drop
  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "task-card") {
      setActiveDragId(event.active.id as string);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.data.current?.type !== "task-card") return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!over) return;

    const taskId = active.id as string;
    const task = active.data.current?.task as TaskData;
    if (!task) return;

    const overId = over.id as string;
    let targetCol: "weekly" | "today" | "done" | null = null;

    if (overId === "column-body-weekly" || overId.startsWith("column-weekly")) {
      targetCol = "weekly";
    } else if (overId === "column-body-today" || overId.startsWith("column-today")) {
      targetCol = "today";
    } else if (overId === "column-body-done" || overId.startsWith("column-done")) {
      targetCol = "done";
    } else {
      const inWeekly = columns.weekly.some((t) => t.id === overId);
      const inToday = columns.today.some((t) => t.id === overId);
      const inDone = columns.done.some((t) => t.id === overId);
      if (inWeekly) targetCol = "weekly";
      else if (inToday) targetCol = "today";
      else if (inDone) targetCol = "done";
    }

    if (!targetCol) return;

    const inWeekly = columns.weekly.some((t) => t.id === taskId);
    const inToday = columns.today.some((t) => t.id === taskId);
    const inDone = columns.done.some((t) => t.id === taskId);
    const sourceCol: typeof targetCol | null = inWeekly
      ? "weekly"
      : inToday
        ? "today"
        : inDone
          ? "done"
          : null;

    if (sourceCol === targetCol) return;

    setColumns((prev) => {
      const targetList = [...prev[targetCol!]];
      const updatedTask = { ...task };

      if (targetCol === "weekly") {
        updatedTask.plannedDate = weekStart;
        updatedTask.status = "TODO";
      } else if (targetCol === "today") {
        updatedTask.plannedDate = now;
        updatedTask.status = "TODO";
      } else if (targetCol === "done") {
        updatedTask.status = "DONE";
        updatedTask.completedAt = now;
      }

      return {
        ...prev,
        [sourceCol!]: prev[sourceCol!].filter((t) => t.id !== taskId),
        [targetCol!]: [updatedTask, ...targetList],
      };
    });

    startTransition(async () => {
      let result;
      if (targetCol === "done") {
        result = await updateTaskStatusAction(taskId, "DONE");
      } else if (targetCol === "today") {
        result = await upsertTaskAction({
          id: taskId,
          plannedDate: now.toISOString(),
          status: "TODO",
        });
      } else {
        result = await upsertTaskAction({
          id: taskId,
          plannedDate: weekStart.toISOString(),
          status: "TODO",
        });
      }

      if (!result.success) {
        toast.error(result.error || "Failed to move atom");
      }
    });
  };

  const activeDragTask = activeDragId
    ? [...columns.weekly, ...columns.today, ...columns.done].find((t) => t.id === activeDragId)
    : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Strategy Dashboard Info */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
            <Compass size={20} />
          </div>
          <div>
            <h2 className="text-panel-title font-semibold text-zinc-100 font-mono">
              Sprint #{sprint.number} — {sprint.year}
            </h2>
            <p className="text-caption mt-0.5">
              Period: {format(new Date(sprint.startDate), "dd.MM.yyyy")} —{" "}
              {format(new Date(sprint.endDate), "dd.MM.yyyy")} (Weeks 1-12)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setNewObjectiveOpen(true)}>
            <Plus size={14} /> New Objective
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTargetObjectiveId(null);
              setNewProjectOpen(true);
            }}
          >
            <Plus size={14} /> New Project
          </Button>
        </div>
      </div>

      {/* LEVEL 1: Projects (Strategy) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <Layers size={14} className="text-orange-400" />
          <h2 className="text-panel-title uppercase tracking-wider font-semibold text-xs font-mono">
            Strategic Projects (Sprints & Backlog)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
          {/* Backlog Column */}
          <div className="glass-card p-3 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-3 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <h3 className="text-panel-title font-semibold text-zinc-300">Global Backlog</h3>
              <span className="text-label text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md font-mono">
                {backlogProjects.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px] pr-1">
              {backlogProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-xs italic">
                  Backlog is empty
                </div>
              ) : (
                backlogProjects.map((project) => (
                  <div
                    key={project.id}
                    className="glass-card p-3 flex flex-col gap-2 relative hover:border-white/10 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-body font-semibold text-zinc-200">{project.title}</h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id, false)}
                        className="text-zinc-600 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {project.description && (
                      <p className="text-caption text-zinc-400 text-xs line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() =>
                          setAssigningProjectId(assigningProjectId === project.id ? null : project.id)
                        }
                        className="text-[10px] font-mono font-semibold uppercase text-accent hover:underline flex items-center gap-1"
                      >
                        <ArrowRightLeft size={10} /> Assign to Sprint
                      </button>

                      {assigningProjectId === project.id && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl p-1.5 shadow-xl z-20 flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 px-2 block mb-1">
                            Select Objective:
                          </span>
                          {sprint.objectives.length === 0 ? (
                            <span className="text-zinc-500 text-[10px] italic px-2">
                              No objectives in sprint
                            </span>
                          ) : (
                            sprint.objectives.map((obj) => (
                              <button
                                key={obj.id}
                                type="button"
                                onClick={() => handleAssignProject(project.id, obj.id)}
                                className="text-left text-xs text-zinc-300 hover:bg-white/5 px-2 py-1 rounded transition-colors truncate"
                              >
                                {obj.title}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Sprint Grid */}
          <div className="glass-card p-4 bg-black/10 border border-white/[0.04] rounded-2xl flex flex-col gap-4 min-h-[300px]">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <h3 className="text-panel-title font-semibold text-zinc-200">
                Active Sprint Objectives (Active Projects)
              </h3>
              <span className="text-label text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md font-mono">
                {activeProjectsCount} project(s)
              </span>
            </div>

            {sprint.objectives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-sm">
                <Compass size={32} className="mb-2 text-zinc-600" />
                <p>No objectives created for this sprint yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewObjectiveOpen(true)}
                  className="mt-3"
                >
                  Create first objective
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sprint.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="glass-card p-3 bg-white/[0.01] border-white/[0.06] rounded-xl flex flex-col gap-3"
                  >
                    {/* Objective Title */}
                    <div className="flex items-start justify-between border-b border-white/[0.04] pb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: obj.sphere.color }}
                        />
                        <h4 className="text-body font-bold text-zinc-100 truncate" title={obj.title}>
                          {obj.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500">
                        {obj.sphere.name}
                      </span>
                    </div>

                    {/* Projects under Objective */}
                    <div className="flex flex-col gap-3">
                      {obj.projects.length === 0 ? (
                        <div className="text-zinc-500 text-xs italic py-4 text-center">
                          No projects. Reassign from backlog or add a new one.
                        </div>
                      ) : (
                        obj.projects.map((project) => {
                          const totalTasks = project.tasks.length;
                          const completedTasks = project.tasks.filter((t) => t.status === "DONE")
                            .length;
                          const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                          const hasActiveTask = project.tasks.some(
                            (t) => t.status === "TODO" || t.status === "IN_PROGRESS"
                          );
                          const isStalled = totalTasks === 0 || !hasActiveTask;

                          return (
                            <div
                              key={project.id}
                              className={`glass-card p-3 border flex flex-col gap-3 relative transition-colors ${
                                isStalled
                                  ? "border-orange-500/20 bg-orange-500/[0.01]"
                                  : "border-white/[0.08]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h5 className="text-body font-semibold text-zinc-150">
                                    {project.title}
                                  </h5>
                                  {project.description && (
                                    <p className="text-caption text-zinc-400 text-xs line-clamp-1 mt-0.5">
                                      {project.description}
                                    </p>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteProject(project.id, true)}
                                  className="text-zinc-600 hover:text-rose-400 transition-colors shrink-0"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>

                              {totalTasks > 0 && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                                    <span>Atom progress</span>
                                    <span>
                                      {completedTasks}/{totalTasks} ({Math.round(progressPct)}%)
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 rounded-full bg-black/35 overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {isStalled && (
                                <div className="flex items-center gap-1.5 text-orange-400 text-[10px] font-mono bg-orange-500/5 px-2 py-1 rounded border border-orange-500/10">
                                  <AlertTriangle size={11} className="shrink-0" />
                                  <span>STALLED: no active atoms</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 pt-1">
                                <Input
                                  value={inlineAtomTitle[project.id] || ""}
                                  onChange={(e) =>
                                    setInlineAtomTitle((prev) => ({
                                      ...prev,
                                      [project.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      handleAddInlineAtom(project.id, obj.sphere.id);
                                    }
                                  }}
                                  placeholder="+ New kaizen atom..."
                                  className="text-xs h-7 py-1 px-2 flex-1 bg-black/20"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddInlineAtom(project.id, obj.sphere.id)}
                                  className="h-7 w-7 p-0 flex items-center justify-center text-zinc-400 hover:text-zinc-200"
                                >
                                  <ChevronRight size={14} />
                                </Button>
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleAssignProject(project.id, null)}
                                  className="text-[9px] font-mono font-semibold uppercase text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                                >
                                  Move to backlog
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LEVEL 2: Atoms (Tactics) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <CheckSquare size={14} className="text-orange-400" />
          <h2 className="text-panel-title uppercase tracking-wider font-semibold text-xs font-mono">
            Operational Atoms (Weekly Execution)
          </h2>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div id="column-weekly">
              <TaskColumn
                id="weekly"
                title="Weekly Plan"
                tasks={columns.weekly}
                onDeleteTask={handleDeleteTask}
                onEditTask={() => {}}
              />
            </div>
            <div id="column-today">
              <TaskColumn
                id="today"
                title="TODAY"
                tasks={columns.today}
                onDeleteTask={handleDeleteTask}
                onEditTask={() => {}}
              />
            </div>
            <div id="column-done">
              <TaskColumn
                id="done"
                title="Done"
                tasks={columns.done}
                onDeleteTask={handleDeleteTask}
                onEditTask={() => {}}
              />
            </div>
          </div>

          <DragOverlay>
            {activeDragTask ? (
              <div className="glass-card p-3 w-64 shadow-xl border border-white/20">
                <p className="text-body text-zinc-150 font-medium break-words">{activeDragTask.title}</p>
                {activeDragTask.project && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono">
                    {activeDragTask.project.title}
                  </span>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* MODALS */}
      {/* Create Project Modal */}
      <Dialog
        isOpen={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
        title="Create new project"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label text-zinc-300">Project title</label>
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Train for marathon"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label text-zinc-300">Description (optional)</label>
            <Textarea
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="Brief description of goals..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNewProjectOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateProject}
              disabled={!projectTitle.trim() || isPending}
            >
              Create
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Create Objective Modal */}
      <Dialog
        isOpen={newObjectiveOpen}
        onClose={() => setNewObjectiveOpen(false)}
        title="Add strategic sprint objective"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-label text-zinc-300">Sprint objective</label>
            <Input
              value={objectiveTitle}
              onChange={(e) => setObjectiveTitle(e.target.value)}
              placeholder="e.g. Learn English and pass exam"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label text-zinc-300">Objective description (optional)</label>
            <Textarea
              value={objectiveDesc}
              onChange={(e) => setObjectiveDesc(e.target.value)}
              placeholder="What defines success for this objective..."
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-label text-zinc-300">Life sphere</label>
            <div className="flex flex-wrap gap-2">
              {spheres.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedSphereId(s.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedSphereId === s.id
                      ? "bg-accent/15 text-accent border-accent/30"
                      : "text-zinc-400 border-white/[0.08] hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setNewObjectiveOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateObjective}
              disabled={!objectiveTitle.trim() || isPending}
            >
              Create objective
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
