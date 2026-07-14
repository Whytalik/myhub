"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import {
  CheckSquare,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Compass,
  Layers,
  ArrowRightLeft,
  Pencil,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Dialog } from "@/components/ui/overlays/dialog";
import { TaskCardBase } from "@/features/life/components/tasks/TaskCardBase";
import { TaskCalendar } from "@/features/life/components/tasks/TaskCalendar";
import { ProjectAtomsDialog } from "./ProjectAtomsDialog";
import {
  createProjectAction,
  deleteProjectAction,
  assignProjectToObjectiveAction,
  createSprintObjectiveAction,
  updateProjectAction,
  updateSprintObjectiveAction,
} from "@/features/life/actions/sprint-actions";
import { upsertTaskAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData, TaskData } from "@/features/life/types";
import { startOfWeek, endOfWeek, format, addDays } from "date-fns";

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
  initialAllTasks?: TaskData[];
  initialStandaloneTasks?: TaskData[];
  spheres: LifeSphereData[];
}

export function KanbanBoardClient({
  initialSprint,
  initialBacklogProjects,
  initialColumns,
  initialAllTasks,
  initialStandaloneTasks,
  spheres,
}: KanbanBoardClientProps) {
  // State
  const [sprint, setSprint] = useState<SprintData>(initialSprint);
  const [backlogProjects, setBacklogProjects] = useState<ProjectData[]>(initialBacklogProjects);
  const [standaloneTasks, setStandaloneTasks] = useState<TaskData[]>(initialStandaloneTasks || []);

  const [sprintTasks, setSprintTasks] = useState<TaskData[]>(() => {
    const all = initialAllTasks || [
      ...initialColumns.weekly,
      ...initialColumns.today,
      ...initialColumns.done,
    ];
    const seen = new Set();
    return all.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  });

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(() => {
    const now = new Date();
    const sprintStart = startOfWeek(new Date(initialSprint.startDate), { weekStartsOn: 1 });
    const diffTime = now.getTime() - sprintStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentIdx = Math.floor(diffDays / 7);
    return Math.max(0, Math.min(11, currentIdx));
  });

  // Modal Open states
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newObjectiveOpen, setNewObjectiveOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [targetObjectiveId, setTargetObjectiveId] = useState<string | null>(null);

  const [objectiveTitle, setObjectiveTitle] = useState("");
  const [objectiveDesc, setObjectiveDesc] = useState("");
  const [selectedSphereId, setSelectedSphereId] = useState<string>(spheres[0]?.id || "");

  const [openAtomsProjectId, setOpenAtomsProjectId] = useState<string | null>(null);

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

  const findProjectById = (projectId: string): ProjectData | undefined => {
    const inBacklog = backlogProjects.find((p) => p.id === projectId);
    if (inBacklog) return inBacklog;
    for (const obj of sprint.objectives) {
      const found = obj.projects.find((p) => p.id === projectId);
      if (found) return found;
    }
    return undefined;
  };

  const findObjectiveSphereForProject = (projectId: string): string | null => {
    for (const obj of sprint.objectives) {
      if (obj.projects.some((p) => p.id === projectId)) return obj.sphere.id;
    }
    return null;
  };

  const openAtomsProject = openAtomsProjectId ? findProjectById(openAtomsProjectId) : undefined;

  const handleAtomAdded = (projectId: string, newTask: TaskData) => {
    setSprintTasks((prev) => [...prev, newTask]);
    setSprint((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj) => ({
        ...obj,
        projects: obj.projects.map((p) =>
          p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p,
        ),
      })),
    }));
    setBacklogProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p)),
    );
  };

  const handleAtomDeletedFromDialog = (projectId: string, taskId: string) => {
    setSprintTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSprint((prev) => ({
      ...prev,
      objectives: prev.objectives.map((obj) => ({
        ...obj,
        projects: obj.projects.map((p) =>
          p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p,
        ),
      })),
    }));
    setBacklogProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p,
      ),
    );
  };

  const handleAssignStandaloneTask = (taskId: string, projectId: string) => {
    startTransition(async () => {
      const result = await upsertTaskAction({ id: taskId, projectId });
      if (result.success) {
        toast.success("Task assigned to project");
        setStandaloneTasks((prev) => prev.filter((t) => t.id !== taskId));
        const updatedTask = result.data as unknown as TaskData;
        setSprintTasks((prev) => [...prev, updatedTask]);
        setSprint((prev) => ({
          ...prev,
          objectives: prev.objectives.map((obj) => ({
            ...obj,
            projects: obj.projects.map((p) =>
              p.id === projectId ? { ...p, tasks: [...p.tasks, updatedTask] } : p,
            ),
          })),
        }));
        setBacklogProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, tasks: [...p.tasks, updatedTask] } : p)),
        );
      } else {
        toast.error(result.error || "Failed to assign task");
      }
    });
  };

  const handleDeleteStandaloneTask = (taskId: string) => {
    setStandaloneTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const filteredBacklogProjects = useMemo(() => {
    if (!backlogSearch.trim()) return backlogProjects;
    const term = backlogSearch.toLowerCase();
    return backlogProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        (project.description || "").toLowerCase().includes(term),
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
        (line) => !line.startsWith("📋 Type:") && !line.startsWith("•"),
      );
      const cleanDescription = cleanLines.join("\n").trim();
      const fields = lines.filter((line) => line.startsWith("•")).map((line) => line.slice(2)); // remove "• "
      return { templateType: typeLabel, fields, cleanDescription };
    }
    return { templateType: null, fields: [], cleanDescription: descriptionText };
  };

  // Helper date conversions
  const now = new Date();

  const sprintStart = useMemo(
    () => startOfWeek(new Date(sprint.startDate), { weekStartsOn: 1 }),
    [sprint.startDate],
  );
  const weekStart = useMemo(
    () => addDays(sprintStart, selectedWeekIndex * 7),
    [sprintStart, selectedWeekIndex],
  );
  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);

  const currentWeekIndex = useMemo(() => {
    const sprintStartVal = startOfWeek(new Date(sprint.startDate), { weekStartsOn: 1 });
    const diffTime = now.getTime() - sprintStartVal.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }, [sprint.startDate, now]);

  const sprintWeeks = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const start = addDays(sprintStart, i * 7);
      const end = endOfWeek(start, { weekStartsOn: 1 });
      return {
        index: i,
        label: `W${i + 1}`,
        dateRange: `${format(start, "dd.MM")} - ${format(end, "dd.MM")}`,
        start,
        end,
      };
    });
  }, [sprintStart]);

  const isSunday = now.getDay() === 0;
  const isNextWeek = selectedWeekIndex === currentWeekIndex + 1;
  const isPlanningLocked = selectedWeekIndex > currentWeekIndex && !(isNextWeek && isSunday);

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
        finalDescription || undefined,
      );

      if (result.success) {
        toast.success("Project updated successfully!");

        setBacklogProjects((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? { ...p, title: editProjectTitle.trim(), description: finalDescription || null }
              : p,
          ),
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
                  : p,
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
        editObjectiveDesc.trim() || undefined,
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
                : obj,
            ),
          };
        });

        setObjectiveToEdit(null);
      } else {
        toast.error(result.error || "Failed to update objective");
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
              obj.id === targetObjectiveId ? { ...obj, projects: [newProj, ...obj.projects] } : obj,
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
                : obj,
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
        objectiveDesc,
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
                  const { templateType, fields, cleanDescription } = parseProjectDescription(
                    project.description,
                  );

                  return (
                    <div
                      key={project.id}
                      className="glass-card p-3 flex flex-col justify-between gap-3 w-[300px] shrink-0 relative hover:border-white/10 transition-colors duration-150"
                    >
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="text-body font-semibold text-zinc-200 line-clamp-1"
                            title={project.title}
                          >
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
                                {templateType === "Worry / Problem" && (
                                  <AlertTriangle size={9} className="text-amber-400" />
                                )}
                                {templateType === "Idea / Dream" && (
                                  <Sparkles size={9} className="text-purple-400" />
                                )}
                                {templateType === "Task / Deadline" && (
                                  <CheckCircle2 size={9} className="text-emerald-400" />
                                )}
                                {templateType}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Render template fields inline if present */}
                        {fields.length > 0 && (
                          <div className="flex flex-col gap-0.5 text-[10px] text-zinc-400 font-sans mt-0.5 p-1.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                            {fields.map((f, idx) => (
                              <div key={idx} className="truncate" title={f}>
                                {f}
                              </div>
                            ))}
                          </div>
                        )}

                        {cleanDescription && (
                          <p className="text-caption text-zinc-400 text-xs line-clamp-2 mt-0.5">
                            {cleanDescription}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-white/[0.04]">
                        <button
                          type="button"
                          onClick={() => setOpenAtomsProjectId(project.id)}
                          className="text-[10px] font-mono font-semibold uppercase text-zinc-400 hover:text-zinc-200 flex items-center gap-1 self-start"
                        >
                          <CheckSquare size={10} /> Atoms ({project.tasks?.length ?? 0})
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setAssigningProjectId(
                              assigningProjectId === project.id ? null : project.id,
                            )
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

            {standaloneTasks.length > 0 && (
              <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.04]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Standalone tasks (no project) — {standaloneTasks.length}
                </span>
                <div className="flex flex-row gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {standaloneTasks.map((task) => {
                    const assignableProjects = [
                      ...backlogProjects,
                      ...sprint.objectives.flatMap((obj) => obj.projects),
                    ];
                    return (
                      <div key={task.id} className="w-[260px] shrink-0 flex flex-col gap-2">
                        <TaskCardBase
                          task={task}
                          variant="atom"
                          onEdit={() => {}}
                          onDelete={() => handleDeleteStandaloneTask(task.id)}
                        />
                        {assignableProjects.length > 0 && (
                          <Select
                            onChange={(e) => handleAssignStandaloneTask(task.id, e.target.value)}
                            value=""
                            variant="inline"
                            className="text-[10px] text-zinc-400 font-mono"
                          >
                            <option value="" disabled className="bg-zinc-950 text-zinc-500">
                              Assign to project...
                            </option>
                            {assignableProjects.map((p) => (
                              <option key={p.id} value={p.id} className="bg-zinc-950 text-zinc-200">
                                {p.title}
                              </option>
                            ))}
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
                        <h4
                          className="text-body font-bold text-zinc-100 truncate"
                          title={obj.title}
                        >
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
                          const completedTasks = project.tasks.filter(
                            (t) => t.status === "DONE",
                          ).length;
                          const progressPct =
                            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                          const hasActiveTask = project.tasks.some(
                            (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
                          );
                          const isStalled = totalTasks === 0 || !hasActiveTask;
                          const { templateType, fields, cleanDescription } =
                            parseProjectDescription(project.description);

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
                                  <h5
                                    className="text-body font-semibold text-zinc-150 truncate cursor-pointer hover:text-white transition-colors"
                                    onClick={() => setOpenAtomsProjectId(project.id)}
                                    title={project.title}
                                  >
                                    {project.title}
                                  </h5>

                                  {/* Template badge */}
                                  {templateType && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[9px] font-mono border border-white/[0.06]">
                                        {templateType === "Worry / Problem" && (
                                          <AlertTriangle size={9} className="text-amber-400" />
                                        )}
                                        {templateType === "Idea / Dream" && (
                                          <Sparkles size={9} className="text-purple-400" />
                                        )}
                                        {templateType === "Task / Deadline" && (
                                          <CheckCircle2 size={9} className="text-emerald-400" />
                                        )}
                                        {templateType}
                                      </span>
                                    </div>
                                  )}

                                  {/* Render template fields inline if present */}
                                  {fields.length > 0 && (
                                    <div className="flex flex-col gap-0.5 text-[10px] text-zinc-400 font-sans mt-1 p-1.5 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                                      {fields.map((f, idx) => (
                                        <div key={idx} className="truncate" title={f}>
                                          {f}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {cleanDescription && (
                                    <p className="text-caption text-zinc-400 text-xs line-clamp-1 mt-1">
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

                              {isStalled && (
                                <div className="flex items-center gap-1.5 text-orange-400 text-[10px] font-mono bg-orange-500/5 px-2 py-1 rounded border border-orange-500/10">
                                  <AlertTriangle size={11} className="shrink-0" />
                                  <span>STALLED: no active atoms</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => setOpenAtomsProjectId(project.id)}
                                className="text-[10px] font-mono font-semibold uppercase text-zinc-400 hover:text-zinc-200 flex items-center gap-1 self-start"
                              >
                                <CheckSquare size={10} /> View / add atoms
                              </button>

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
        <div className="flex items-center gap-2 text-zinc-400 border-b border-white/[0.04] pb-2">
          <CheckSquare size={14} className="text-orange-400" />
          <h2 className="text-panel-title uppercase tracking-wider font-semibold text-xs font-mono">
            Operational Atoms (Weekly Execution)
          </h2>
        </div>

        {/* 12-Week Sprint Navigator */}
        <div className="flex flex-col gap-3 p-4 bg-black/10 border border-white/[0.04] rounded-2xl">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 tracking-wider">
              Sprint Weeks Selector
            </span>
            <span className="text-xs font-semibold text-zinc-300 font-mono">
              {format(weekStart, "MMMM d")} — {format(weekEnd, "MMMM d, yyyy")}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {sprintWeeks.map((w) => {
              const isCurrent = w.index === currentWeekIndex;
              const isSelected = w.index === selectedWeekIndex;

              const wNextWeek = w.index === currentWeekIndex + 1;
              const wIsLocked = w.index > currentWeekIndex && !(wNextWeek && isSunday);

              return (
                <button
                  key={w.index}
                  type="button"
                  onClick={() => setSelectedWeekIndex(w.index)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-150 ${
                    isSelected
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/5 font-bold"
                      : isCurrent
                        ? "bg-white/[0.04] text-white border-white/20 hover:bg-white/[0.08]"
                        : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]"
                  }`}
                >
                  <span>{w.label}</span>
                  {isCurrent && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                      title="Current Week"
                    />
                  )}
                  {wIsLocked && (
                    <span title="Locked for planning">
                      <Lock size={10} className="text-zinc-600 shrink-0" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isPlanningLocked && (
            <div className="flex items-center gap-2 p-2 px-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono w-fit">
              <Lock size={12} className="shrink-0" />
              <span>
                Planning for this week is locked. It unlocks on Sunday of the current week.
              </span>
            </div>
          )}
        </div>

        <TaskCalendar
          key={weekStart.toISOString()}
          tasks={sprintTasks}
          allTasks={sprintTasks}
          spheres={spheres}
          defaultMode="week"
          initialDate={weekStart}
          hideModeSwitch
          showUnplannedPool
          locked={isPlanningLocked}
        />
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

      {openAtomsProject && (
        <ProjectAtomsDialog
          isOpen={true}
          onClose={() => setOpenAtomsProjectId(null)}
          projectId={openAtomsProject.id}
          projectTitle={openAtomsProject.title}
          tasks={openAtomsProject.tasks}
          sphereId={
            findObjectiveSphereForProject(openAtomsProject.id) ||
            openAtomsProject.tasks.find((t) => t.sphere)?.sphere?.id ||
            spheres[0]?.id ||
            null
          }
          isPlanningLocked={isPlanningLocked}
          onAtomAdded={(task) => handleAtomAdded(openAtomsProject.id, task)}
          onAtomDeleted={(taskId) => handleAtomDeletedFromDialog(openAtomsProject.id, taskId)}
        />
      )}
    </div>
  );
}
