import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import type { LifeSphereData } from "@/features/life/types";
import type { SprintData, SprintObjective, SprintProject } from "../types";

export function StepSprintObjectives({
  showAddObjectiveForm,
  setShowAddObjectiveForm,
  setStep,
  newObjectiveTitle,
  setNewObjectiveTitle,
  newObjectiveSphereId,
  setNewObjectiveSphereId,
  newObjectiveDesc,
  setNewObjectiveDesc,
  spheres,
  handleCreateObjective,
  isActionPending,
  sprint,
  handleOpenEditProject,
  setDeleteProjectId,
  handleAssignProject,
  backlogProjects,
  backlogSearch,
  setBacklogSearch,
}: {
  showAddObjectiveForm: boolean;
  setShowAddObjectiveForm: (value: boolean | ((previous: boolean) => boolean)) => void;
  setStep: (step: number) => void;
  newObjectiveTitle: string;
  setNewObjectiveTitle: (value: string) => void;
  newObjectiveSphereId: string;
  setNewObjectiveSphereId: (value: string) => void;
  newObjectiveDesc: string;
  setNewObjectiveDesc: (value: string) => void;
  spheres: LifeSphereData[];
  handleCreateObjective: () => void;
  isActionPending: boolean;
  sprint: SprintData;
  handleOpenEditProject: (project: {
    id: string;
    title: string;
    description?: string | null;
  }) => void;
  setDeleteProjectId: (id: string | null) => void;
  handleAssignProject: (projectId: string, objectiveId: string | null) => void;
  backlogProjects: SprintProject[];
  backlogSearch: string;
  setBacklogSearch: (value: string) => void;
}) {
  return (
    <div className="glass-card p-6 md:p-8 bg-black/15 border border-white/[0.04] rounded-2xl flex flex-col gap-6">
      <div className="w-full flex items-center justify-between border-b border-white/[0.04] pb-3 mb-2">
        <div>
          <h3 className="text-panel-title font-semibold text-zinc-200">
            Step 4: Sprint Objectives & Projects
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Define your goals for the sprint and assign backlog projects to them.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddObjectiveForm(!showAddObjectiveForm)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> New Objective
          </Button>
          <Button variant="primary" size="sm" onClick={() => setStep(5)} className="text-xs">
            Next: Deconstruct Projects <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>

      {showAddObjectiveForm && (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col gap-4 animate-fade-up max-w-lg">
          <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase">
            Add Sprint Objective
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400">Title</label>
              <Input
                value={newObjectiveTitle}
                onChange={(e) => setNewObjectiveTitle(e.target.value)}
                placeholder="e.g. Master React Native navigation"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400">Sphere (Area)</label>
              <select
                value={newObjectiveSphereId}
                onChange={(e) => setNewObjectiveSphereId(e.target.value)}
                className="bg-black/30 border border-white/8 rounded-lg px-3 py-1.5 text-sm text-zinc-200"
              >
                {(spheres || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-zinc-400">Description</label>
              <Textarea
                value={newObjectiveDesc}
                onChange={(e) => setNewObjectiveDesc(e.target.value)}
                placeholder="What does success look like?"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <Button variant="ghost" size="sm" onClick={() => setShowAddObjectiveForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateObjective}
                disabled={!newObjectiveTitle.trim() || isActionPending}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Objectives with assigned projects */}
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400 border-b border-white/[0.04] pb-2">
          Sprint Objectives & Assigned Projects
        </h4>

        {!sprint?.objectives || sprint.objectives.length === 0 ? (
          <div className="text-zinc-500 text-xs italic py-8 text-center border border-dashed border-white/[0.06] rounded-xl">
            No objectives defined for this sprint. Create one to assign projects.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {(sprint.objectives || []).map((obj: SprintObjective) => (
              <div
                key={obj.id}
                className="glass-card p-4 border-white/[0.06] bg-white/[0.02] rounded-xl flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: obj.sphere?.color }}
                    />
                    <h5 className="text-sm font-semibold text-zinc-200">{obj.title}</h5>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase bg-white/[0.04] px-2 py-0.5 rounded">
                    {obj.sphere?.name}
                  </span>
                </div>

                {obj.description && (
                  <p className="text-xs text-zinc-400 italic">{obj.description}</p>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                    Assigned Projects:
                  </span>

                  {!obj.projects || obj.projects.length === 0 ? (
                    <div className="text-[11px] text-zinc-500 italic py-2">
                      No projects linked. Assign a project from the backlog.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {obj.projects.map((p: SprintProject) => (
                        <div
                          key={p.id}
                          className="group/item flex justify-between items-center bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg text-xs hover:bg-white/[0.02] transition-colors duration-150"
                        >
                          <span className="text-zinc-200 font-medium truncate">📂 {p.title}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 shrink-0">
                            <Button
                              variant="ghost-accent"
                              size="icon-sm"
                              onClick={() => handleOpenEditProject(p)}
                              title="Edit project"
                              disabled={isActionPending}
                            >
                              <Pencil size={12} />
                            </Button>
                            <Button
                              variant="ghost-danger"
                              size="icon-sm"
                              onClick={() => setDeleteProjectId(p.id)}
                              title="Delete project"
                              disabled={isActionPending}
                            >
                              <Trash2 size={12} />
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleAssignProject(p.id, null)}
                              className="text-[10px] text-rose-500 hover:text-rose-400 font-mono ml-1"
                              disabled={isActionPending}
                            >
                              Unassign
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backlog Projects Panel */}
      <div className="flex flex-col gap-4 bg-black/10 border border-white/[0.04] p-4 rounded-xl">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-mono font-semibold uppercase text-zinc-400">
            Project Backlog
          </h4>
          <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded">
            {backlogProjects.length} projects
          </span>
        </div>

        <Input
          value={backlogSearch}
          onChange={(e) => setBacklogSearch(e.target.value)}
          placeholder="Search backlog projects..."
          className="h-8 text-xs"
        />

        <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
          {backlogProjects.filter((p) =>
            p.title.toLowerCase().includes(backlogSearch.toLowerCase()),
          ).length === 0 ? (
            <div className="text-zinc-500 text-xs italic py-8 text-center">
              No backlog projects found.
            </div>
          ) : (
            backlogProjects
              .filter((p) => p.title.toLowerCase().includes(backlogSearch.toLowerCase()))
              .map((p) => (
                <div
                  key={p.id}
                  className="group/backlog glass-card p-3 border-white/[0.04] bg-white/[0.01] rounded-lg text-xs flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-zinc-200 font-medium break-words truncate">
                      📂 {p.title}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover/backlog:opacity-100 transition-opacity duration-150 shrink-0">
                      <Button
                        variant="ghost-accent"
                        size="icon-sm"
                        onClick={() => handleOpenEditProject(p)}
                        title="Edit project"
                        disabled={isActionPending}
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost-danger"
                        size="icon-sm"
                        onClick={() => setDeleteProjectId(p.id)}
                        title="Delete project"
                        disabled={isActionPending}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                  {p.description && (
                    <span className="text-[10px] text-zinc-500 line-clamp-2">{p.description}</span>
                  )}
                  {sprint.objectives && sprint.objectives.length > 0 ? (
                    <div className="flex flex-col gap-1 mt-1 pt-1.5 border-t border-white/[0.04]">
                      <span className="text-[8px] font-mono text-zinc-500 uppercase">
                        Assign to Objective:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(sprint.objectives || []).map((obj: SprintObjective) => (
                          <button
                            key={obj.id}
                            type="button"
                            onClick={() => handleAssignProject(p.id, obj.id)}
                            className="text-[9px] font-mono bg-white/[0.03] hover:bg-accent/15 hover:text-accent border border-white/[0.06] rounded px-1.5 py-0.5 text-zinc-300 transition-colors duration-150 truncate max-w-[100px]"
                            title={obj.title}
                            disabled={isActionPending}
                          >
                            {obj.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-[8px] text-zinc-500 italic">
                      Create an objective first
                    </span>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
