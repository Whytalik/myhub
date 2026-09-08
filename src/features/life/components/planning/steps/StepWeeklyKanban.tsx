import type { useRouter } from "next/navigation";
import { format, endOfWeek } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  Folder,
  FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { WeeklyStatusBoard } from "@/features/life/components/sprints/WeeklyStatusBoard";
import type { LifeSphereData } from "@/features/life/types";
import type { TaskData } from "@/features/life/types";
import { AtomCard } from "../AtomCard";
import type { SprintData, SprintObjective, SprintProject, SprintTask } from "../types";

type Router = ReturnType<typeof useRouter>;
type DistributionAtom = SprintTask & { projectName?: string; groupName?: string };

export function StepWeeklyKanban({
  router,
  weekStart,
  sprintWeeks,
  selectedWeekIndex,
  setSelectedWeekIndex,
  allAtomsForDistribution,
  spheres,
  handleOpenEditTaskFromAnywhere,
  setDeleteTaskId,
  setSprint,
  setStandaloneAtoms,
  overdueScheduledAtoms,
  setSchedulingTaskId,
  isPendingAtom,
  activeSprintProjects,
  expandedProjects,
  toggleProjectCollapse,
  expandedGroups,
  toggleGroupCollapse,
  setBatchScheduleAtomIds,
  setBatchScheduleDate,
  standaloneAtoms,
}: {
  router: Router;
  weekStart: Date;
  sprintWeeks: { index: number; label: string; dateRange: string }[];
  selectedWeekIndex: number;
  setSelectedWeekIndex: (index: number) => void;
  allAtomsForDistribution: DistributionAtom[];
  spheres: LifeSphereData[];
  handleOpenEditTaskFromAnywhere: (task: SprintTask) => void;
  setDeleteTaskId: (id: string | null) => void;
  setSprint: (updater: (previous: SprintData) => SprintData) => void;
  setStandaloneAtoms: (updater: (previous: SprintTask[]) => SprintTask[]) => void;
  overdueScheduledAtoms: DistributionAtom[];
  setSchedulingTaskId: (id: string | null) => void;
  isPendingAtom: (atom: SprintTask) => boolean;
  activeSprintProjects: SprintProject[];
  expandedProjects: Set<string>;
  toggleProjectCollapse: (projectId: string) => void;
  expandedGroups: Set<string>;
  toggleGroupCollapse: (groupId: string) => void;
  setBatchScheduleAtomIds: (ids: string[] | null) => void;
  setBatchScheduleDate: (date: string) => void;
  standaloneAtoms: SprintTask[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Week Selector */}
      <div className="glass-card p-4 bg-black/15 border border-white/[0.04] rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Calendar size={14} className="text-accent" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
              Sprint Week Selector
            </span>
          </div>
          <span className="text-xs font-semibold text-zinc-300 font-mono">
            {weekStart
              ? `${format(weekStart, "MMMM d")} — ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMMM d, yyyy")}`
              : ""}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sprintWeeks.map((w) => {
            const isSelected = w.index === selectedWeekIndex;
            return (
              <button
                key={w.index}
                type="button"
                onClick={() => setSelectedWeekIndex(w.index)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-150 ${
                  isSelected
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm font-bold"
                    : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-white/[0.02]"
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Kanban Board */}
      <div className="glass-card p-4 bg-black/10 border border-white/[0.04] rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <FolderKanban size={14} className="text-accent" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Weekly Board —{" "}
            {weekStart
              ? `${format(weekStart, "dd.MM")} - ${format(endOfWeek(weekStart, { weekStartsOn: 1 }), "dd.MM")}`
              : ""}
          </span>
        </div>
        <WeeklyStatusBoard
          tasks={allAtomsForDistribution as unknown as TaskData[]}
          weekStart={weekStart}
          locked={false}
          spheres={spheres}
          onTaskEdit={(task) => handleOpenEditTaskFromAnywhere(task as unknown as SprintTask)}
          onTaskDelete={(id) => setDeleteTaskId(id)}
          onTasksChange={(updater) => {
            const currentTasks = allAtomsForDistribution as unknown as TaskData[];
            const updatedTasks = updater(currentTasks);
            setSprint((prev: SprintData) => {
              if (!prev || !prev.objectives) return prev;
              return {
                ...prev,
                objectives: prev.objectives.map((obj: SprintObjective) => ({
                  ...obj,
                  projects: (obj.projects || []).map((p: SprintProject) => ({
                    ...p,
                    tasks: (p.tasks || []).map((t: SprintTask) => {
                      const updated = updatedTasks.find((u: SprintTask) => u.id === t.id);
                      if (updated) {
                        return {
                          ...t,
                          plannedDate: updated.plannedDate,
                          status: updated.status,
                        };
                      }
                      return {
                        ...t,
                        children: (t.children || []).map((c: SprintTask) => {
                          const childUpdated = updatedTasks.find((u: SprintTask) => u.id === c.id);
                          return childUpdated
                            ? {
                                ...c,
                                plannedDate: childUpdated.plannedDate,
                                status: childUpdated.status,
                              }
                            : c;
                        }),
                      };
                    }),
                  })),
                })),
              };
            });
            setStandaloneAtoms((prev) =>
              prev.map((atom) => {
                const updatedAtom = updatedTasks.find((u: SprintTask) => u.id === atom.id);
                return updatedAtom
                  ? {
                      ...atom,
                      plannedDate: updatedAtom.plannedDate,
                      status: updatedAtom.status,
                    }
                  : atom;
              }),
            );
          }}
        />
      </div>

      {overdueScheduledAtoms.length > 0 && (
        <div className="glass-card p-4 bg-black/10 border border-white/[0.04] rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Overdue from past weeks
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded">
              {overdueScheduledAtoms.length} atom{overdueScheduledAtoms.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-2">
            {overdueScheduledAtoms.map((atom) => (
              <AtomCard
                key={atom.id}
                atom={atom}
                onSchedule={setSchedulingTaskId}
                onEdit={handleOpenEditTaskFromAnywhere}
                onDelete={(id) => setDeleteTaskId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unscheduled Atoms Pool */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1">
          <CheckSquare size={14} className="text-zinc-400" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            Unscheduled Atoms
          </span>
          <span className="text-[9px] font-mono text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded">
            {allAtomsForDistribution.filter(isPendingAtom).length} unscheduled
          </span>
        </div>

        {activeSprintProjects.map((project: SprintProject) => {
          const topLevelTasks = (project.tasks || []).filter((task: SprintTask) => !task.parentId);
          const projectAtoms: DistributionAtom[] = topLevelTasks.flatMap((task: SprintTask) => {
            const items: DistributionAtom[] = [];
            if (task.resistance !== null && isPendingAtom(task)) {
              items.push({ ...task, projectName: project.title });
            }
            for (const c of task.children || []) {
              if (isPendingAtom(c)) {
                items.push({ ...c, projectName: project.title, groupName: task.title });
              }
            }
            return items;
          });

          if (projectAtoms.length === 0) return null;

          const projectGroups = topLevelTasks
            .filter((t: SprintTask) => (t.children || []).length > 0 && t.resistance === null)
            .map((t: SprintTask) => ({
              group: t,
              atoms: projectAtoms.filter((a) => a.groupName === t.title),
            }))
            .filter(({ atoms }) => atoms.length > 0);

          const projectDirectAtoms = projectAtoms.filter((a) => !a.groupName);
          const isProjectCollapsed = !expandedProjects.has(project.id);
          const unscheduledCount = projectAtoms.length;

          return (
            <div
              key={project.id}
              className="glass-card bg-black/10 border border-white/[0.04] rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleProjectCollapse(project.id)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.02] transition-colors duration-150"
              >
                <ChevronDown
                  size={12}
                  className={`text-zinc-500 transition-transform duration-150 ${isProjectCollapsed ? "-rotate-90" : ""}`}
                />
                <Folder size={12} className="text-amber-500/70 shrink-0" />
                <span className="text-xs font-semibold text-zinc-200 truncate">
                  {project.title}
                </span>
                <span className="text-[9px] font-mono text-zinc-600 bg-white/[0.04] px-1.5 py-0.5 rounded ml-auto shrink-0">
                  {unscheduledCount}
                </span>
              </button>

              {!isProjectCollapsed && (
                <div className="px-3 pb-3 flex flex-col gap-2">
                  {projectGroups.map(({ group, atoms }) => {
                    const isGroupCollapsed = !expandedGroups.has(group.id);
                    return (
                      <div key={group.id} className="flex flex-col gap-1">
                        <div className="w-full flex items-center gap-2 px-2 py-1 hover:bg-white/[0.02] rounded-lg transition-colors duration-150 group/grp">
                          <button
                            type="button"
                            onClick={() => toggleGroupCollapse(group.id)}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <ChevronDown
                              size={10}
                              className={`text-zinc-600 transition-transform duration-150 shrink-0 ${isGroupCollapsed ? "-rotate-90" : ""}`}
                            />
                            <span className="text-[10px] font-mono text-zinc-400 font-semibold truncate">
                              {group.title}
                            </span>
                          </button>
                          <span className="text-[8px] font-mono text-zinc-600 bg-white/[0.04] px-1 py-0.5 rounded shrink-0">
                            {atoms.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const ids = atoms.map((a) => a.id);
                              setBatchScheduleAtomIds(ids);
                              setBatchScheduleDate("");
                            }}
                            className="p-1 rounded text-zinc-600 hover:text-accent hover:bg-accent/10 opacity-0 group-hover/grp:opacity-100 transition-all duration-150 shrink-0"
                            title={`Schedule all ${atoms.length} atoms`}
                          >
                            <Calendar size={11} />
                          </button>
                        </div>
                        {!isGroupCollapsed && (
                          <div className="flex flex-col gap-1 pl-4">
                            {atoms.map((atom) => (
                              <AtomCard
                                key={atom.id}
                                atom={atom}
                                onSchedule={setSchedulingTaskId}
                                onEdit={handleOpenEditTaskFromAnywhere}
                                onDelete={(id) => setDeleteTaskId(id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {projectDirectAtoms.map((atom) => (
                    <AtomCard
                      key={atom.id}
                      atom={atom}
                      onSchedule={setSchedulingTaskId}
                      onEdit={handleOpenEditTaskFromAnywhere}
                      onDelete={(id) => setDeleteTaskId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {standaloneAtoms.filter(isPendingAtom).length > 0 && (
          <div className="glass-card bg-black/10 border border-white/[0.04] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleProjectCollapse("__standalone__")}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.02] transition-colors duration-150"
            >
              <ChevronDown
                size={12}
                className={`text-zinc-500 transition-transform duration-150 ${!expandedProjects.has("__standalone__") ? "-rotate-90" : ""}`}
              />
              <CheckSquare size={12} className="text-zinc-500 shrink-0" />
              <span className="text-xs font-semibold text-zinc-200 truncate">Standalone</span>
              <span className="text-[9px] font-mono text-zinc-600 bg-white/[0.04] px-1.5 py-0.5 rounded ml-auto shrink-0">
                {standaloneAtoms.filter(isPendingAtom).length}
              </span>
            </button>
            {expandedProjects.has("__standalone__") && (
              <div className="px-3 pb-3 flex flex-col gap-1">
                {standaloneAtoms
                  .filter((a: SprintTask) => !a.plannedDate)
                  .map((atom: SprintTask) => (
                    <AtomCard
                      key={atom.id}
                      atom={atom}
                      onSchedule={setSchedulingTaskId}
                      onEdit={handleOpenEditTaskFromAnywhere}
                      onDelete={(id) => setDeleteTaskId(id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Finish Banner */}
      <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/10 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <h4 className="text-sm font-bold text-zinc-100 font-mono">Planning complete!</h4>
            <p className="text-xs text-zinc-400">
              Atoms are distributed across the week. Review on the Kanban board.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push("/life/sprint")}
          className="flex items-center gap-1.5"
        >
          Open Kanban <CheckCircle2 size={14} />
        </Button>
      </div>
    </div>
  );
}
