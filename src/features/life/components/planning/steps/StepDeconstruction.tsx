import { useState } from "react";
import type { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { TaskCreateForm, type TaskCreateFormData } from "../TaskCreateForm";
import { isProjectComplete } from "@/features/life/logic/project-completion";
import type { SprintProject, SprintTask } from "../types";

type Router = ReturnType<typeof useRouter>;

function getProjectSummary(project: SprintProject) {
  const tasks = project.tasks || [];
  const topLevelTasks = tasks.filter((task: SprintTask) => !task.parentId);
  const groupCount = tasks.filter((task: SprintTask) => task.resistance === null).length;
  const standaloneAtoms = tasks.filter((task: SprintTask) => task.resistance !== null);
  const subAtoms = tasks.flatMap((task: SprintTask) => task.children || []);
  const leafAtoms = [...standaloneAtoms, ...subAtoms];

  return {
    isCompleted: isProjectComplete(topLevelTasks.map((task: SprintTask) => task.status)),
    isPlanned: project.status === "IN_PROGRESS",
    groupCount,
    atomCount: leafAtoms.length,
    doneAtomCount: leafAtoms.filter((atom: SprintTask) => atom.status === "DONE").length,
  };
}

function ProjectListItem({
  project,
  isSelected,
  onSelect,
}: {
  project: SprintProject;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { isCompleted, isPlanned, groupCount, atomCount, doneAtomCount } =
    getProjectSummary(project);

  const labelParts: string[] = [];
  if (groupCount > 0) labelParts.push(`${groupCount} group${groupCount > 1 ? "s" : ""}`);
  if (atomCount > 0) labelParts.push(`${doneAtomCount}/${atomCount} atoms`);
  const label = labelParts.length > 0 ? labelParts.join(", ") : "empty";

  const stateClassName = isSelected
    ? "bg-accent/10 border-accent/30 text-accent font-semibold shadow-sm"
    : isCompleted
      ? "bg-emerald-500/5 border-emerald-500/15 text-zinc-500 hover:bg-emerald-500/8"
      : isPlanned
        ? "bg-sky-500/5 border-sky-500/15 text-zinc-400 hover:bg-sky-500/8"
        : "bg-white/[0.01] border-white/[0.04] text-zinc-400 hover:bg-white/[0.02]";
  const buttonClassName = `w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 flex flex-col gap-1 ${stateClassName}`;
  const titleClassName = `truncate w-full ${isCompleted ? "line-through" : ""}`;

  return (
    <div className="group/proj relative">
      <button type="button" onClick={onSelect} className={buttonClassName}>
        <span className={titleClassName}>
          {isCompleted ? "✅" : "📂"} {project.title}
        </span>
        <span className="text-[9px] opacity-75 font-mono">
          {label}
          {isPlanned && !isCompleted ? " · planned" : ""}
        </span>
      </button>
    </div>
  );
}

export function StepDeconstruction({
  router,
  startActionTransition,
  isActionPending,
  setStep,
  activeSprintProjects,
  selectedDeconstructProjectId,
  setSelectedDeconstructProjectId,
  selectedDeconstructProject,
  handleMarkProjectPlanned,
  handleOpenEditProject,
  setDeleteProjectId,
  expandedGroupId,
  setExpandedGroupId,
  handleAddTopLevelTask,
  handleOpenEditTask,
  setDeleteTaskId,
}: {
  router: Router;
  startActionTransition: (callback: () => Promise<void> | void) => void;
  isActionPending: boolean;
  setStep: (step: number) => void;
  activeSprintProjects: SprintProject[];
  selectedDeconstructProjectId: string | null;
  setSelectedDeconstructProjectId: (id: string | null) => void;
  selectedDeconstructProject: SprintProject | null;
  handleMarkProjectPlanned: (projectId: string) => void;
  handleOpenEditProject: (project: {
    id: string;
    title: string;
    description?: string | null;
  }) => void;
  setDeleteProjectId: (id: string | null) => void;
  expandedGroupId: string | null;
  setExpandedGroupId: (id: string | null) => void;
  handleAddTopLevelTask: (data: TaskCreateFormData) => void;
  handleOpenEditTask: (task: SprintTask, mode: "group" | "atom") => void;
  setDeleteTaskId: (id: string | null) => void;
}) {
  const [showCompleted, setShowCompleted] = useState(false);

  const openProjects = activeSprintProjects.filter(
    (project: SprintProject) => !getProjectSummary(project).isCompleted,
  );
  const completedProjects = activeSprintProjects.filter(
    (project: SprintProject) => getProjectSummary(project).isCompleted,
  );

  return (
    <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6 min-h-0 flex-1">
      <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">
            Step 5: Project Deconstruction
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Break down active sprint projects into groups and atomic actions to remove resistance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setStep(4)} className="text-xs">
            <ChevronLeft size={14} className="mr-1" /> Back to Objectives
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              startActionTransition(async () => {
                router.refresh();
                setStep(6);
              });
            }}
            disabled={isActionPending}
            className="text-xs"
          >
            Next: Weekly Planning <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {activeSprintProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <AlertTriangle size={36} className="text-amber-400" />
          <div className="flex flex-col gap-1 max-w-sm">
            <h4 className="text-sm font-semibold text-zinc-200 font-mono">No active projects!</h4>
            <p className="text-xs text-zinc-400">
              You haven&apos;t assigned any projects to this sprint. Go back and assign some to
              objectives.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep(4)} className="mt-2">
            <ChevronLeft size={14} className="mr-1" /> Back to Step 4
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 min-h-0 flex-1">
          {/* Left Project List */}
          <div className="flex flex-col gap-2 border-r border-white/[0.04] pr-4 min-h-0 overflow-y-auto">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold mb-1">
              Active Projects
            </span>
            {openProjects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                isSelected={project.id === selectedDeconstructProjectId}
                onSelect={() => setSelectedDeconstructProjectId(project.id)}
              />
            ))}

            {completedProjects.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold hover:text-zinc-300 transition-colors duration-150"
                >
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-150 ${showCompleted ? "rotate-0" : "-rotate-90"}`}
                  />
                  Completed ({completedProjects.length})
                </button>
                {showCompleted &&
                  completedProjects.map((project) => (
                    <ProjectListItem
                      key={project.id}
                      project={project}
                      isSelected={project.id === selectedDeconstructProjectId}
                      onSelect={() => setSelectedDeconstructProjectId(project.id)}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Right Deconstruction Panel */}
          {selectedDeconstructProject ? (
            <div className="flex flex-col gap-6 min-h-0 flex-1">
              {/* Selected Project Info */}
              <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-accent uppercase tracking-wider block font-semibold mb-1">
                      Currently Deconstructing
                    </span>
                    <h4 className="text-base font-bold text-zinc-200 truncate">
                      📂 {selectedDeconstructProject.title}
                    </h4>
                    {selectedDeconstructProject.description && (
                      <p className="text-xs text-zinc-400 mt-1 whitespace-pre-wrap">
                        {selectedDeconstructProject.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMarkProjectPlanned(selectedDeconstructProject.id)}
                      className={`p-1.5 rounded-lg transition-colors duration-150 ${
                        selectedDeconstructProject.status === "IN_PROGRESS"
                          ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                          : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      title={
                        selectedDeconstructProject.status === "IN_PROGRESS"
                          ? "Mark as not planned"
                          : "Mark as planned"
                      }
                      disabled={isActionPending}
                    >
                      <Check size={13} />
                    </button>
                    <Button
                      variant="ghost-accent"
                      size="icon-sm"
                      onClick={() => handleOpenEditProject(selectedDeconstructProject)}
                      title="Edit project"
                      disabled={isActionPending}
                    >
                      <Pencil size={13} />
                    </Button>
                    <Button
                      variant="ghost-danger"
                      size="icon-sm"
                      onClick={() => setDeleteProjectId(selectedDeconstructProject.id)}
                      title="Delete project"
                      disabled={isActionPending}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add Task Form */}
              <TaskCreateForm
                projects={activeSprintProjects}
                groups={(selectedDeconstructProject.tasks || [])
                  .filter((t: SprintTask) => !t.parentId && t.resistance === null)
                  .map((t: SprintTask) => ({ id: t.id, title: t.title }))}
                defaultProjectId={selectedDeconstructProjectId}
                defaultGroupId={expandedGroupId}
                onSubmit={handleAddTopLevelTask}
                isPending={isActionPending}
              />

              {/* Groups List */}
              <div className="flex flex-col gap-2 flex-1 min-h-0">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold border-b border-white/[0.04] pb-1">
                  Project Groups (
                  {
                    (selectedDeconstructProject.tasks || []).filter((t: SprintTask) => !t.parentId)
                      .length
                  }
                  )
                </span>
                {!(selectedDeconstructProject.tasks || []).some((t: SprintTask) => !t.parentId) ? (
                  <div className="text-zinc-500 text-xs italic py-6 text-center">
                    No groups added yet. Use the form above to add a group or atom.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
                    {selectedDeconstructProject.tasks
                      .filter((t: SprintTask) => !t.parentId)
                      .map((task: SprintTask) => {
                        const isGroup = task.resistance === null;
                        const isExpanded = expandedGroupId === task.id;
                        const children = task.children || [];
                        const childCount = children.length;
                        const doneCount = children.filter(
                          (c: SprintTask) => c.status === "DONE",
                        ).length;
                        const isGroupDone =
                          task.status === "DONE" || (childCount > 0 && doneCount === childCount);
                        const groupTitleClassName = `font-medium truncate ${isGroupDone ? "text-zinc-500 line-through" : "text-zinc-200"}`;
                        const groupCardClassName = `border border-white/[0.04] rounded-lg overflow-hidden ${isGroupDone ? "bg-emerald-500/[0.03]" : "bg-white/[0.01]"}`;

                        if (!isGroup) {
                          const resistanceClass =
                            task.resistance === 0
                              ? "text-emerald-400/80"
                              : task.resistance != null && task.resistance >= 4
                                ? "text-rose-400/80"
                                : task.resistance != null
                                  ? "text-orange-400/80"
                                  : "text-zinc-600";
                          return (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-white/[0.02] transition-colors duration-150 group"
                            >
                              <span
                                className={`flex-1 truncate ${task.status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-300"}`}
                              >
                                {task.status === "DONE" ? "✔️" : "○"} {task.title}
                              </span>
                              {task.resistance != null && (
                                <span
                                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0 ${resistanceClass}`}
                                >
                                  {task.resistance}/5
                                </span>
                              )}
                              <Button
                                variant="ghost-accent"
                                size="icon-sm"
                                onClick={() => handleOpenEditTask(task, "atom")}
                                className="opacity-0 group-hover:opacity-100 shrink-0"
                                title="Edit atom"
                                disabled={isActionPending}
                              >
                                <Pencil size={11} />
                              </Button>
                              <Button
                                variant="ghost-danger"
                                size="icon-sm"
                                onClick={() => setDeleteTaskId(task.id)}
                                className="opacity-0 group-hover:opacity-100 shrink-0"
                                title="Delete atom"
                                disabled={isActionPending}
                              >
                                <Trash2 size={11} />
                              </Button>
                            </div>
                          );
                        }

                        return (
                          <div key={task.id} className={groupCardClassName}>
                            {/* Group header */}
                            <div className="flex items-center gap-2 p-3 text-xs group hover:bg-white/[0.02] transition-colors duration-150">
                              <button
                                type="button"
                                onClick={() => setExpandedGroupId(isExpanded ? null : task.id)}
                                className="p-0.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform duration-150 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                                />
                              </button>
                              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <span className={groupTitleClassName}>
                                  {isGroupDone ? "✅" : "📋"} {task.title}
                                </span>
                                {task.description && (
                                  <span className="text-[10px] text-zinc-500 line-clamp-1">
                                    {task.description}
                                  </span>
                                )}
                              </div>
                              {childCount > 0 && (
                                <span
                                  className={`text-[9px] font-mono shrink-0 ${isGroupDone ? "text-emerald-400" : "text-zinc-500"}`}
                                >
                                  {doneCount}/{childCount}
                                </span>
                              )}
                              <Button
                                variant="ghost-accent"
                                size="icon-sm"
                                onClick={() => handleOpenEditTask(task, "group")}
                                className="opacity-0 group-hover:opacity-100 shrink-0"
                                title="Edit group"
                                disabled={isActionPending}
                              >
                                <Pencil size={13} />
                              </Button>
                              <Button
                                variant="ghost-danger"
                                size="icon-sm"
                                onClick={() => setDeleteTaskId(task.id)}
                                className="opacity-0 group-hover:opacity-100 shrink-0"
                                title="Delete group"
                                disabled={isActionPending}
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>

                            {/* Expanded: sub-atoms + inline form */}
                            {isExpanded && (
                              <div className="border-t border-white/[0.04] bg-black/10 px-3 py-2 flex flex-col gap-1.5">
                                {children.length > 0 ? (
                                  children.map((atom: SprintTask) => (
                                    <div
                                      key={atom.id}
                                      className="flex items-center gap-2 pl-5 pr-1 py-1.5 rounded text-xs group/atom hover:bg-white/[0.02] transition-colors duration-150"
                                    >
                                      <span
                                        className={`flex-1 truncate ${atom.status === "DONE" ? "text-zinc-500 line-through" : "text-zinc-300"}`}
                                      >
                                        {atom.status === "DONE" ? "✔️" : "○"} {atom.title}
                                      </span>
                                      <Button
                                        variant="ghost-accent"
                                        size="icon-sm"
                                        onClick={() => handleOpenEditTask(atom, "atom")}
                                        className="opacity-0 group-hover/atom:opacity-100 shrink-0"
                                        title="Edit atom"
                                        disabled={isActionPending}
                                      >
                                        <Pencil size={11} />
                                      </Button>
                                      <Button
                                        variant="ghost-danger"
                                        size="icon-sm"
                                        onClick={() => setDeleteTaskId(atom.id)}
                                        className="opacity-0 group-hover/atom:opacity-100 shrink-0"
                                        title="Delete atom"
                                        disabled={isActionPending}
                                      >
                                        <Trash2 size={11} />
                                      </Button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="pl-5 py-1 text-[10px] text-zinc-500 italic">
                                    No atoms yet.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-zinc-500 text-xs italic py-16 text-center">
              Select a project from the left to start deconstruction.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
