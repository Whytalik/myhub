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
  Sparkles,
  CheckCircle2,
  Compass,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  X,
  ArrowRightLeft,
  Pencil,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Dialog } from "@/components/ui/overlays/dialog";
import {
  createProjectAction,
  deleteProjectAction,
  assignProjectToObjectiveAction,
  createSprintObjectiveAction,
  updateProjectStatusAction,
  updateProjectAction,
  updateSprintObjectiveAction,
} from "@/features/life/actions/sprint-actions";
import {
  upsertTaskAction,
  deleteTaskAction,
  updateTaskStatusAction,
} from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";
import { startOfWeek, endOfWeek, format, addDays, startOfDay, isSameDay, isToday } from "date-fns";

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

      <div className="flex flex-col gap-1 mt-1">
        {task.project && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 font-medium truncate max-w-full">
            <Folder size={10} className="text-amber-500/70 shrink-0" />
            <span>{task.project.title}</span>
          </div>
        )}
        {task.sphere && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] text-[10px] text-zinc-400 w-fit">
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
  const [backlogSearch, setBacklogSearch] = useState("");

  // Edit Project State
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDesc, setEditProjectDesc] = useState("");

  // Edit Objective State
  const [editingObjective, setObjectiveToEdit] = useState<ObjectiveData | null>(null);
  const [editObjectiveTitle, setEditObjectiveTitle] = useState("");
  const [editObjectiveDesc, setEditObjectiveDesc] = useState("");
  const [editObjectiveSphereId, setEditObjectiveSphereId] = useState("");
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);
  const [tacticsView, setTacticsView] = useState<"kanban" | "calendar">("kanban");
  const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const filteredBacklogProjects = useMemo(() => {
    if (!backlogSearch.trim()) return backlogProjects;
    const term = backlogSearch.toLowerCase();
    return backlogProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        (project.description || "").toLowerCase().includes(term)
    );
  }, [backlogProjects, backlogSearch]);

  // Helper to extract template type and original description
  const parseProjectDescription = (descriptionText: string | null) => {
    if (!descriptionText) return { templateType: null, fields: [], cleanDescription: null };
    const match = descriptionText.match(/^📋 Type: ([^\n]+)/);
    if (match) {
      const typeLabel = match[1];
      const lines = descriptionText.split("\n");
      const cleanLines = lines.filter(
        (line) => !line.startsWith("📋 Type:") && !line.startsWith("•")
      );
      const cleanDescription = cleanLines.join("\n").trim();
      const fields = lines
        .filter((line) => line.startsWith("•"))
        .map((line) => line.slice(2)); // remove "• "
      return { templateType: typeLabel, fields, cleanDescription };
    }
    return { templateType: null, fields: [], cleanDescription: descriptionText };
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Helper date conversions
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Projects stats (active + backlog)
  const activeProjectsCount = useMemo(() => {
    return sprint.objectives.reduce((acc, obj) => acc + obj.projects.length, 0);
  }, [sprint]);

  // Edit Project Handlers
  const handleStartEditProject = (project: ProjectData) => {
    setEditingProject(project);
    setEditProjectTitle(project.title);
    const { cleanDescription } = parseProjectDescription(project.description);
    setEditProjectDesc(cleanDescription || "");
  };

  const handleSaveProject = () => {
    if (!editingProject || !editProjectTitle.trim()) return;

    startTransition(async () => {
      const { templateType, fields } = parseProjectDescription(editingProject.description);
      let finalDescription = editProjectDesc.trim();
      if (templateType) {
        let templateText = `📋 Type: ${templateType}`;
        const fieldsText = fields.map((f) => `• ${f}`).join("\n");
        if (fieldsText) {
          templateText += `\n${fieldsText}`;
        }
        finalDescription = finalDescription
          ? `${templateText}\n\n${finalDescription}`
          : templateText;
      }

      const result = await updateProjectAction(
        editingProject.id,
        editProjectTitle.trim(),
        finalDescription || undefined
      );

      if (result.success) {
        toast.success("Project updated successfully!");
        
        setBacklogProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? { ...p, title: editProjectTitle.trim(), description: finalDescription || null }
              : p
          )
        );

        setSprint((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj) => ({
              ...obj,
              projects: obj.projects.map((p) =>
                p.id === editingProject.id
                  ? { ...p, title: editProjectTitle.trim(), description: finalDescription || null }
                  : p
              ),
            })),
          };
        });

        setEditingProject(null);
      } else {
        toast.error(result.error || "Failed to update project");
      }
    });
  };

  // Edit Objective Handlers
  const handleStartEditObjective = (obj: ObjectiveData) => {
    setObjectiveToEdit(obj);
    setEditObjectiveTitle(obj.title);
    setEditObjectiveDesc(obj.description || "");
    setEditObjectiveSphereId(obj.sphere.id);
  };

  const handleSaveObjective = () => {
    if (!editingObjective || !editObjectiveTitle.trim() || !editObjectiveSphereId) return;

    startTransition(async () => {
      const result = await updateSprintObjectiveAction(
        editingObjective.id,
        editObjectiveTitle.trim(),
        editObjectiveSphereId,
        editObjectiveDesc.trim() || undefined
      );

      if (result.success) {
        toast.success("Objective updated successfully!");
        const sphere = spheres.find((s) => s.id === editObjectiveSphereId)!;

        setSprint((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj) =>
              obj.id === editingObjective.id
                ? {
                    ...obj,
                    title: editObjectiveTitle.trim(),
                    description: editObjectiveDesc.trim() || null,
                    sphere: sphere,
                  }
                : obj
            ),
          };
        });

        setObjectiveToEdit(null);
      } else {
        toast.error(result.error || "Failed to update objective");
      }
    });
  };

  // Calendar View Helpers
  const daysOfWeek = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const sprintProjectTasksPool = useMemo(() => {
    const tasks: TaskData[] = [];
    sprint.objectives.forEach((obj) => {
      obj.projects.forEach((proj) => {
        proj.tasks.forEach((t) => {
          if (t.status === "TODO" || t.status === "IN_PROGRESS") {
            if (!t.plannedDate) {
              tasks.push({ ...t, project: { id: proj.id, title: proj.title } } as any);
            }
          }
        });
      });
    });
    return tasks;
  }, [sprint]);

  const handleScheduleTask = (taskId: string, dateIso: string) => {
    startTransition(async () => {
      const targetDate = new Date(dateIso);
      const result = await upsertTaskAction({
        id: taskId,
        plannedDate: dateIso,
      });

      if (result.success) {
        toast.success("Task scheduled successfully!");

        setColumns((prev) => {
          let taskToMove: TaskData | undefined;
          const cleanWeekly = prev.weekly.filter((t) => {
            if (t.id === taskId) {
              taskToMove = { ...t, plannedDate: targetDate };
              return false;
            }
            return true;
          });
          const cleanToday = prev.today.filter((t) => {
            if (t.id === taskId) {
              taskToMove = { ...t, plannedDate: targetDate };
              return false;
            }
            return true;
          });

          if (!taskToMove) {
            // Find it in pool
            sprint.objectives.forEach((obj) => {
              obj.projects.forEach((proj) => {
                const pt = proj.tasks.find((t) => t.id === taskId);
                if (pt) {
                  taskToMove = { ...pt, plannedDate: targetDate, project: { id: proj.id, title: proj.title } } as any;
                }
              });
            });
          }

          if (!taskToMove) return prev;

          const isTodayTask = isSameDay(targetDate, new Date());
          if (isTodayTask) {
            return {
              ...prev,
              weekly: cleanWeekly,
              today: [taskToMove, ...cleanToday],
            };
          } else {
            return {
              ...prev,
              weekly: [taskToMove, ...cleanWeekly],
              today: cleanToday,
            };
          }
        });

        setSprint((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj) => ({
              ...obj,
              projects: obj.projects.map((proj) => ({
                ...proj,
                tasks: proj.tasks.map((t) =>
                  t.id === taskId ? { ...t, plannedDate: targetDate } : t
                ),
              })),
            })),
          };
        });
      } else {
        toast.error(result.error || "Failed to schedule task");
      }
    });
  };

  const handleUnscheduleTask = (taskId: string) => {
    startTransition(async () => {
      const result = await upsertTaskAction({
        id: taskId,
        plannedDate: null,
      });

      if (result.success) {
        toast.success("Task unscheduled!");

        setColumns((prev) => {
          let taskToMove: TaskData | undefined;
          const cleanWeekly = prev.weekly.filter((t) => {
            if (t.id === taskId) {
              taskToMove = { ...t, plannedDate: null };
              return false;
            }
            return true;
          });
          const cleanToday = prev.today.filter((t) => {
            if (t.id === taskId) {
              taskToMove = { ...t, plannedDate: null };
              return false;
            }
            return true;
          });

          if (!taskToMove) return prev;

          return {
            ...prev,
            weekly: [taskToMove, ...cleanWeekly],
            today: cleanToday,
          };
        });

        setSprint((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj) => ({
              ...obj,
              projects: obj.projects.map((proj) => ({
                ...proj,
                tasks: proj.tasks.map((t) =>
                  t.id === taskId ? { ...t, plannedDate: null } : t
                ),
              })),
            })),
          };
        });
      } else {
        toast.error(result.error || "Failed to unschedule task");
      }
    });
  };

  const handleToggleTaskStatus = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";

    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, newStatus as any);
      if (result.success) {
        toast.success(newStatus === "DONE" ? "Task completed!" : "Task active");

        setColumns((prev) => {
          let updatedTask: TaskData | undefined;
          const cleanWeekly = prev.weekly.filter((t) => {
            if (t.id === taskId) {
              updatedTask = { ...t, status: newStatus as any, completedAt: newStatus === "DONE" ? new Date() : null };
              return false;
            }
            return true;
          });
          const cleanToday = prev.today.filter((t) => {
            if (t.id === taskId) {
              updatedTask = { ...t, status: newStatus as any, completedAt: newStatus === "DONE" ? new Date() : null };
              return false;
            }
            return true;
          });
          const cleanDone = prev.done.filter((t) => {
            if (t.id === taskId) {
              updatedTask = { ...t, status: newStatus as any, completedAt: newStatus === "DONE" ? new Date() : null };
              return false;
            }
            return true;
          });

          if (updatedTask) {
            if (newStatus === "DONE") {
              return {
                weekly: cleanWeekly,
                today: cleanToday,
                done: [updatedTask, ...cleanDone],
              };
            } else {
              const isTodayTask = updatedTask.plannedDate && isSameDay(new Date(updatedTask.plannedDate), new Date());
              if (isTodayTask) {
                return {
                  weekly: cleanWeekly,
                  today: [updatedTask, ...cleanToday],
                  done: cleanDone,
                };
              } else {
                return {
                  weekly: [updatedTask, ...cleanWeekly],
                  today: cleanToday,
                  done: cleanDone,
                };
              }
            }
          }
          return prev;
        });

        setSprint((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            objectives: prev.objectives.map((obj) => ({
              ...obj,
              projects: obj.projects.map((proj) => ({
                ...proj,
                tasks: proj.tasks.map((t) =>
                  t.id === taskId
                    ? { ...t, status: newStatus as any, completedAt: newStatus === "DONE" ? new Date() : null }
                    : t
                ),
              })),
            })),
          };
        });
      } else {
        toast.error(result.error || "Failed to update task status");
      }
    });
  };

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

        <div className="flex flex-col gap-6">
          {/* Backlog Column */}
          <div className="glass-card p-4 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/[0.04] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-panel-title font-semibold text-zinc-300">Global Backlog</h3>
                <span className="text-label text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md font-mono">
                  {filteredBacklogProjects.length}
                </span>
              </div>

              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search backlog..."
                  value={backlogSearch}
                  onChange={(e) => setBacklogSearch(e.target.value)}
                  className="h-8 text-xs bg-black/20 border-white/[0.06] focus:border-accent/40"
                />
                {backlogSearch && (
                  <button
                    type="button"
                    onClick={() => setBacklogSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 text-[10px] font-mono"
                  >
                    CLEAR
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-row gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
              {filteredBacklogProjects.length === 0 ? (
                <div className="flex items-center justify-center w-full py-12 text-zinc-500 text-xs italic">
                  {backlogSearch ? "No matching projects" : "Backlog is empty"}
                </div>
              ) : (
                filteredBacklogProjects.map((project) => {
                  const projectSphere = project.tasks?.find((t) => t.sphere)?.sphere;
                  const { templateType, fields, cleanDescription } = parseProjectDescription(project.description);

                  return (
                    <div
                      key={project.id}
                      className="glass-card p-3 flex flex-col justify-between gap-3 w-[300px] shrink-0 relative hover:border-white/10 transition-colors duration-150"
                    >
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-body font-semibold text-zinc-200 line-clamp-1" title={project.title}>
                            {project.title}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditProject(project)}
                              className="text-zinc-600 hover:text-accent transition-colors"
                              title="Edit project"
                            >
                              <Pencil size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project.id, false)}
                              className="text-zinc-600 hover:text-rose-400 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Sphere and Template badges */}
                        {(projectSphere || templateType) && (
                          <div className="flex flex-wrap gap-1.5">
                            {projectSphere && (
                              <div
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-white/[0.03] border border-white/[0.06]"
                                style={{ color: projectSphere.color }}
                              >
                                <span
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: projectSphere.color }}
                                />
                                {projectSphere.name}
                              </div>
                            )}

                            {templateType && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-305 text-[9px] font-mono border border-white/[0.06]">
                                {templateType === "Worry / Problem" && <AlertTriangle size={9} className="text-amber-400" />}
                                {templateType === "Idea / Dream" && <Sparkles size={9} className="text-purple-400" />}
                                {templateType === "Task / Deadline" && <CheckCircle2 size={9} className="text-emerald-400" />}
                                {templateType}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Render template fields inline if present */}
                        {fields.length > 0 && (
                          <div className="flex flex-col gap-0.5 text-[10px] text-zinc-400 font-sans mt-0.5 p-1.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                            {fields.map((f, idx) => (
                              <div key={idx} className="truncate" title={f}>{f}</div>
                            ))}
                          </div>
                        )}

                        {cleanDescription && (
                          <p className="text-caption text-zinc-400 text-xs line-clamp-2 mt-0.5">
                            {cleanDescription}
                          </p>
                        )}

                        {/* Task List (Atoms) in Backlog Project */}
                        {project.tasks && project.tasks.length > 0 && (
                          <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-white/[0.04]">
                            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                              Project Atoms ({project.tasks.length}):
                            </span>
                            <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto scrollbar-thin text-[10px] text-zinc-400 font-mono">
                              {project.tasks.map((task) => (
                                <div key={task.id} className="truncate bg-black/10 px-1.5 py-0.5 rounded border border-white/[0.02]" title={task.title}>
                                  • {task.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-white/[0.04]">
                        <button
                          type="button"
                          onClick={() =>
                            setAssigningProjectId(assigningProjectId === project.id ? null : project.id)
                          }
                          className="text-[10px] font-mono font-semibold uppercase text-accent hover:underline flex items-center gap-1 self-start"
                        >
                          <ArrowRightLeft size={10} /> Assign to Sprint
                        </button>

                        {assigningProjectId === project.id && (
                          <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-2 flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 px-1 block mb-1">
                              Select Objective:
                            </span>
                            {sprint.objectives.length === 0 ? (
                              <span className="text-zinc-500 text-[10px] italic px-1">
                                No objectives in sprint
                              </span>
                            ) : (
                              sprint.objectives.map((obj) => (
                                <button
                                  key={obj.id}
                                  type="button"
                                  onClick={() => handleAssignProject(project.id, obj.id)}
                                  className="text-left text-xs text-zinc-350 hover:bg-white/5 px-2 py-1 rounded transition-colors truncate"
                                >
                                  {obj.title}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
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
              <div className="grid grid-cols-1 gap-4">
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
                        <button
                          type="button"
                          onClick={() => handleStartEditObjective(obj)}
                          className="text-zinc-650 hover:text-accent transition-colors shrink-0"
                          title="Edit objective"
                        >
                          <Pencil size={11} />
                        </button>
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
                          const { templateType, fields, cleanDescription } = parseProjectDescription(project.description);
                          const isCollapsed = collapsedProjects[project.id];

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
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleProjectCollapse(project.id)}
                                        className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors shrink-0"
                                        title={isCollapsed ? "Expand project" : "Collapse project"}
                                      >
                                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                                      </button>
                                      <h5
                                        className="text-body font-semibold text-zinc-150 truncate cursor-pointer hover:text-white transition-colors"
                                        onClick={() => toggleProjectCollapse(project.id)}
                                        title={project.title}
                                      >
                                        {project.title}
                                      </h5>
                                    </div>

                                    {/* Template badge */}
                                    {templateType && (
                                      <div className="flex flex-wrap gap-1 mt-1 pl-6">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[9px] font-mono border border-white/[0.06]">
                                          {templateType === "Worry / Problem" && <AlertTriangle size={9} className="text-amber-400" />}
                                          {templateType === "Idea / Dream" && <Sparkles size={9} className="text-purple-400" />}
                                          {templateType === "Task / Deadline" && <CheckCircle2 size={9} className="text-emerald-400" />}
                                          {templateType}
                                        </span>
                                      </div>
                                    )}

                                    {/* Render template fields inline if present */}
                                    {!isCollapsed && fields.length > 0 && (
                                      <div className="flex flex-col gap-0.5 text-[10px] text-zinc-400 font-sans mt-1 p-1.5 bg-white/[0.01] border border-white/[0.04] rounded-lg ml-6">
                                        {fields.map((f, idx) => (
                                          <div key={idx} className="truncate" title={f}>{f}</div>
                                        ))}
                                      </div>
                                    )}

                                    {!isCollapsed && cleanDescription && (
                                      <p className="text-caption text-zinc-400 text-xs line-clamp-1 mt-1 pl-6">
                                        {cleanDescription}
                                      </p>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditProject(project)}
                                      className="text-zinc-600 hover:text-accent transition-colors"
                                      title="Edit project"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteProject(project.id, true)}
                                      className="text-zinc-600 hover:text-rose-400 transition-colors"
                                      title="Delete project"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
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

                                  {/* Checklist of Project Atoms */}
                                  {!isCollapsed && (
                                    <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto scrollbar-thin mt-2 pt-2 border-t border-white/[0.04]">
                                      {project.tasks.map((task) => (
                                        <div
                                          key={task.id}
                                          className="flex items-center justify-between gap-2 p-1.5 rounded bg-black/20 border border-white/[0.02]"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                                task.status === "DONE"
                                                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                                  : "border-white/20 hover:border-white/40"
                                              }`}
                                            >
                                              {task.status === "DONE" && <CheckCircle2 size={10} />}
                                            </button>
                                            <span
                                              className={`text-[11px] truncate leading-tight ${
                                                task.status === "DONE"
                                                  ? "text-zinc-500 line-through"
                                                  : "text-zinc-300"
                                              }`}
                                              title={task.title}
                                            >
                                              {task.title}
                                            </span>
                                          </div>

                                          {task.priority && (
                                            <span
                                              className={`text-[8px] font-mono px-1 rounded shrink-0 ${
                                                task.priority === "HIGH"
                                                  ? "bg-rose-500/10 text-rose-400"
                                                  : task.priority === "MEDIUM"
                                                    ? "bg-amber-500/10 text-amber-455"
                                                    : "bg-blue-500/10 text-blue-400"
                                              }`}
                                            >
                                              {task.priority.slice(0, 1)}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {!isCollapsed && isStalled && (
                                <div className="flex items-center gap-1.5 text-orange-400 text-[10px] font-mono bg-orange-500/5 px-2 py-1 rounded border border-orange-500/10">
                                  <AlertTriangle size={11} className="shrink-0" />
                                  <span>STALLED: no active atoms</span>
                                </div>
                              )}

                              {!isCollapsed && (
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
                              )}

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
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <CheckSquare size={14} className="text-orange-400" />
            <h2 className="text-panel-title uppercase tracking-wider font-semibold text-xs font-mono">
              Operational Atoms (Weekly Execution)
            </h2>
          </div>
          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setTacticsView("kanban")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                tacticsView === "kanban"
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Kanban Board
            </button>
            <button
              type="button"
              onClick={() => setTacticsView("calendar")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                tacticsView === "calendar"
                  ? "bg-accent/15 text-accent border border-accent/20"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Weekly Planner
            </button>
          </div>
        </div>

        {tacticsView === "kanban" ? (
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
        ) : (
          <div className="flex flex-col gap-5">
            {/* Unplanned Atoms Pool */}
            <div className="glass-card p-4 border-white/[0.04] bg-white/[0.01] rounded-2xl flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-sm font-mono uppercase font-semibold text-zinc-300">
                  Unplanned Sprint Project Atoms ({sprintProjectTasksPool.length})
                </span>
                <span className="text-xs text-zinc-500 italic">
                  Select a day in the selector below to place an atom onto the calendar
                </span>
              </div>
              
              {sprintProjectTasksPool.length === 0 ? (
                <div className="text-zinc-500 text-xs italic py-6 text-center bg-black/10 border border-dashed border-white/[0.04] rounded-xl">
                  All active project tasks have been scheduled!
                </div>
              ) : (
                <div className="flex flex-row gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                  {sprintProjectTasksPool.map((task) => (
                    <div
                      key={task.id}
                      className="glass-card p-3 w-[260px] shrink-0 border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col gap-3 bg-zinc-900/60 justify-between rounded-xl"
                    >
                      <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-snug" title={task.title}>
                          {task.title}
                        </h4>
                        {task.project && (
                          <span className="inline-block self-start px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/10 truncate max-w-full">
                            {task.project.title}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-white/[0.04]">
                        <Select
                          onChange={(e) => handleScheduleTask(task.id, e.target.value)}
                          value=""
                          variant="inline"
                          className="text-[10px] text-zinc-400 font-mono"
                        >
                          <option value="" disabled className="bg-zinc-950 text-zinc-500">Schedule to day...</option>
                          {daysOfWeek.map((day, idx) => (
                            <option key={idx} value={day.toISOString()} className="bg-zinc-950 text-zinc-200">
                              {format(day, "EEEE (dd.MM)")}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overdue / Backlog section */}
            {(() => {
              const allPlannedTasks = [...columns.weekly, ...columns.today];
              const overdueTasks = allPlannedTasks.filter(
                (t) => t.plannedDate && new Date(t.plannedDate) < startOfDay(weekStart)
              );

              return (
                <div className="glass-card p-4 border border-rose-500/20 bg-rose-500/[0.01] rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-sm font-mono uppercase font-semibold text-rose-450">
                        Overdue Backlog ({overdueTasks.length})
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 italic">
                      Unfinished tasks from past days
                    </span>
                  </div>
                  
                  {overdueTasks.length === 0 ? (
                    <div className="text-zinc-500 text-xs italic py-4 text-center bg-black/10 border border-white/[0.02] rounded-xl">
                      No overdue tasks. Great job!
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {overdueTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl bg-zinc-950 border border-rose-500/10 flex flex-col gap-2 text-xs w-[240px] shrink-0"
                        >
                          <p className="text-zinc-200 font-medium break-words leading-tight">
                            {task.title}
                          </p>
                          {task.project && (
                            <span className="inline-block self-start px-1.5 py-0.5 rounded bg-amber-500/5 text-amber-555/80 text-[9px] font-mono max-w-full truncate border border-amber-500/5" title={task.project.title}>
                              {task.project.title}
                            </span>
                          )}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                            <button
                              type="button"
                              onClick={() => handleUnscheduleTask(task.id)}
                              className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 uppercase tracking-wider transition-colors"
                            >
                              Unplan
                            </button>
                            <div className="w-24">
                              <Select
                                onChange={(e) => handleScheduleTask(task.id, e.target.value)}
                                value=""
                                variant="inline"
                                className="text-[10px] text-zinc-400 font-mono"
                              >
                                <option value="" disabled className="bg-zinc-950 text-zinc-500">Move to...</option>
                                {daysOfWeek.map((d, dIdx) => (
                                  <option key={dIdx} value={d.toISOString()} className="bg-zinc-950 text-zinc-200">
                                    {format(d, "EEE")}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 7 Days of the Week as Rows */}
            <div className="flex flex-col gap-3">
              {daysOfWeek.map((day, idx) => {
                const allPlannedTasks = [...columns.weekly, ...columns.today];
                const dayTasks = allPlannedTasks.filter(
                  (t) => t.plannedDate && isSameDay(new Date(t.plannedDate), day)
                );

                const isTodayDay = isToday(day);

                return (
                  <div
                    key={idx}
                    className={`glass-card p-4 border rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors ${
                      isTodayDay
                        ? "border-accent/40 bg-accent/[0.02] ring-1 ring-accent/10"
                        : "border-white/[0.04] bg-black/5 hover:border-white/[0.08]"
                    }`}
                  >
                    {/* Day label info (Left side, fixed width) */}
                    <div className="flex items-center md:flex-col md:items-start gap-2 md:gap-1 shrink-0 w-full md:w-44 pt-1">
                      <span className={`text-sm font-semibold font-mono uppercase tracking-wide ${
                        isTodayDay ? "text-accent" : "text-zinc-300"
                      }`}>
                        {format(day, "EEEE")}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {format(day, "dd.MM.yyyy")} {isTodayDay && <span className="text-accent font-semibold ml-1">(Today)</span>}
                      </span>
                    </div>

                    {/* Tasks list for this day (Right side, expands) */}
                    <div className="flex-grow flex-1 min-w-0">
                      {dayTasks.length === 0 ? (
                        <div className="text-xs text-zinc-650 italic py-2">
                          No atoms scheduled for this day
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {dayTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-xl bg-zinc-950 border flex flex-col gap-2 text-xs w-[240px] shrink-0 relative group ${
                                isTodayDay
                                  ? "border-accent/20"
                                  : "border-white/[0.04]"
                              }`}
                            >
                              <p className="text-zinc-200 font-medium break-words leading-snug">
                                {task.title}
                              </p>
                              {task.project && (
                                <span className="inline-block self-start px-1.5 py-0.5 rounded bg-amber-500/5 text-amber-500/80 text-[9px] font-mono max-w-full truncate border border-amber-500/5" title={task.project.title}>
                                  {task.project.title}
                                </span>
                              )}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
                                <button
                                  type="button"
                                  onClick={() => handleUnscheduleTask(task.id)}
                                  className="text-[10px] font-mono text-zinc-500 hover:text-rose-400 uppercase tracking-wider transition-colors"
                                >
                                  Unplan
                                </button>
                                <div className="w-24">
                                  <Select
                                    onChange={(e) => handleScheduleTask(task.id, e.target.value)}
                                    value={day.toISOString()}
                                    variant="inline"
                                    className="text-[10px] text-zinc-400 font-mono"
                                  >
                                    {daysOfWeek.map((d, dIdx) => (
                                      <option key={dIdx} value={d.toISOString()} className="bg-zinc-950 text-zinc-200">
                                        {format(d, "EEE")}
                                      </option>
                                    ))}
                                  </Select>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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

      {/* Edit Project Modal */}
      {editingProject && (
        <Dialog
          isOpen={true}
          onClose={() => setEditingProject(null)}
          title="Edit project"
          maxWidth="480px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label text-zinc-300">Project title</label>
              <Input
                value={editProjectTitle}
                onChange={(e) => setEditProjectTitle(e.target.value)}
                placeholder="Project title..."
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label text-zinc-300">Description</label>
              <Textarea
                value={editProjectDesc}
                onChange={(e) => setEditProjectDesc(e.target.value)}
                placeholder="Description..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingProject(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveProject}
                disabled={!editProjectTitle.trim() || isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit Objective Modal */}
      {editingObjective && (
        <Dialog
          isOpen={true}
          onClose={() => setObjectiveToEdit(null)}
          title="Edit strategic objective"
          maxWidth="480px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-label text-zinc-300">Objective title</label>
              <Input
                value={editObjectiveTitle}
                onChange={(e) => setEditObjectiveTitle(e.target.value)}
                placeholder="Objective title..."
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-label text-zinc-300">Life sphere</label>
              <div className="flex flex-wrap gap-2">
                {spheres.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setEditObjectiveSphereId(s.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      editObjectiveSphereId === s.id
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

            <div className="flex flex-col gap-1.5">
              <label className="text-label text-zinc-300">Description</label>
              <Textarea
                value={editObjectiveDesc}
                onChange={(e) => setEditObjectiveDesc(e.target.value)}
                placeholder="Objective description..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setObjectiveToEdit(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveObjective}
                disabled={!editObjectiveTitle.trim() || isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
