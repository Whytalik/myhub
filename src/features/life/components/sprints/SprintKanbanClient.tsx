"use client";

import { useMemo, useState } from "react";
import { addDays, format, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/actions/button";
import { WeeklyStatusBoard } from "./WeeklyStatusBoard";
import type { TaskData } from "@/features/life/types";

interface SprintKanbanClientProps {
  sprint: {
    id: string;
    number: number;
    year: number;
    startDate: Date;
    endDate: Date;
    status: string;
  };
  backlogProjects: { id: string; title: string; tasks: { id: string; title: string }[] }[];
  standaloneAtoms: TaskData[];
  allTasks: TaskData[];
}

export function SprintKanbanClient({
  sprint,
  backlogProjects,
  standaloneAtoms,
  allTasks,
}: SprintKanbanClientProps) {
  const sprintStart = useMemo(() => new Date(sprint.startDate), [sprint.startDate]);
  const now = useMemo(() => new Date(), []);
  const initialWeekIndex = useMemo(() => {
    const diffMs = now.getTime() - sprintStart.getTime();
    if (diffMs < 0) return 0;
    return Math.min(11, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)));
  }, [now, sprintStart]);

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(initialWeekIndex);
  const weekStart = useMemo(
    () => addDays(sprintStart, selectedWeekIndex * 7),
    [sprintStart, selectedWeekIndex],
  );

  const weekButtons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        index,
        label: `W${index + 1}`,
      })),
    [],
  );

  const [tasks, setTasks] = useState<TaskData[]>(allTasks);

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card p-4 bg-black/15 border border-white/[0.04] rounded-2xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-zinc-500">
              12-week Sprint
            </p>
            <h1 className="text-panel-title mt-2">Sprint {sprint.number} · {sprint.year}</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {format(sprintStart, "MMM d, yyyy")} — {format(new Date(sprint.endDate), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {weekButtons.map((week) => {
              const selected = week.index === selectedWeekIndex;
              return (
                <Button
                  key={week.index}
                  type="button"
                  size="sm"
                  variant={selected ? "primary" : "ghost"}
                  className="text-xs px-3"
                  onClick={() => setSelectedWeekIndex(week.index)}
                >
                  {week.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card p-4 bg-black/10 border border-white/[0.04] rounded-2xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-zinc-500">
              Week view
            </p>
            <h2 className="text-sm font-semibold text-zinc-100">
              {format(weekStart, "MMM d")} — {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
            </h2>
          </div>
          <div className="text-[11px] text-zinc-400">
            {tasks.filter((task) => !task.plannedDate && task.status !== "DONE" && task.status !== "CANCELLED").length} unscheduled atoms
          </div>
        </div>

        <div className="mt-4">
          <WeeklyStatusBoard
            tasks={tasks}
            weekStart={weekStart}
            locked={false}
            onTasksChange={(updater) => setTasks((prev) => updater(prev))}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="glass-card p-4 bg-black/10 border border-white/[0.04] rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3">Backlog projects</h3>
          <div className="space-y-3">
            {backlogProjects.length === 0 ? (
              <p className="text-xs text-zinc-500">No backlog projects yet.</p>
            ) : (
              backlogProjects.map((project) => (
                <div key={project.id} className="rounded-xl border border-white/[0.06] p-3 bg-black/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-zinc-100">{project.title}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.24em]">
                      {project.tasks.length} tasks
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-4 bg-black/10 border border-white/[0.04] rounded-2xl">
          <h3 className="text-sm font-semibold text-zinc-100 mb-3">Standalone atoms</h3>
          <div className="space-y-2">
            {standaloneAtoms.length === 0 ? (
              <p className="text-xs text-zinc-500">No standalone atoms found.</p>
            ) : (
              standaloneAtoms.map((atom) => (
                <div key={atom.id} className="rounded-xl border border-white/[0.06] p-3 bg-black/5 text-sm text-zinc-100">
                  {atom.title}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
