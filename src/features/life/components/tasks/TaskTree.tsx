import { useState, useMemo } from "react";
import { ChevronDown, Calendar, Layers, Activity, LayoutList } from "lucide-react";
import { TaskGrid } from "./TaskGrid";
import { Tabs } from "@/components/ui/navigation/tabs";
import type { TaskData, LifeSphereData, TaskStatus } from "@/features/life/types";
import { STATUS_CONFIG } from "./StatusToggle";

interface TaskTreeProps {
  tasks: TaskData[];
  spheres: LifeSphereData[];
  onEdit: (task: TaskData) => void;
  onDuplicate: (task: TaskData) => void;
  onAddChild: (parent: TaskData) => void;
  hideHeader?: boolean;
}

function getWeekStart(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekLabel(date: Date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
}

const PRIMARY_TABS = [
  { id: "time", label: "Time", icon: Calendar },
  { id: "hierarchy", label: "Hierarchy", icon: LayoutList },
  { id: "sphere", label: "Spheres", icon: Layers },
  { id: "status", label: "Status", icon: Activity },
];

export function TaskTree({
  tasks,
  spheres,
  onEdit,
  onDuplicate,
  onAddChild,
  onDelete,
}: TaskTreeProps & { onDelete?: () => void }) {
  const [activePrimary, setActivePrimary] = useState("time");
  const [activeSecondary, setActiveSecondary] = useState("weeks");
  const [visibleGroups, setVisibleGroups] = useState(3);

  const secondaryTabs = useMemo(() => {
    switch (activePrimary) {
      case "time":
        return [
          { id: "weeks", label: "Weeks" },
          { id: "months", label: "Months" },
          { id: "quarters", label: "Quarters" },
          { id: "years", label: "Years" },
          { id: "no-date", label: "Unplanned" },
        ];
      case "hierarchy":
        return [
          { id: "all", label: "All Tasks" },
          { id: "parents", label: "Main Tasks" },
          { id: "subtasks", label: "Subtasks Only" },
        ];
      case "sphere":
        return [
          { id: "all", label: "All Spheres" },
          ...spheres.map((s) => ({ id: s.id, label: s.name })),
        ];
      case "status":
        return [
          { id: "all", label: "All Statuses" },
          ...Object.keys(STATUS_CONFIG).map((s) => ({
            id: s,
            label: STATUS_CONFIG[s as TaskStatus].label,
          })),
        ];
      default:
        return [];
    }
  }, [activePrimary, spheres]);

  const handlePrimaryChange = (id: string) => {
    setActivePrimary(id);
    setVisibleGroups(3);

    if (id === "time") setActiveSecondary("weeks");
    else if (id === "hierarchy") setActiveSecondary("all");
    else if (id === "sphere") setActiveSecondary("all");
    else if (id === "status") setActiveSecondary("all");
  };

  const groupedTasks = useMemo(() => {
    let filtered = tasks;

    if (activePrimary === "hierarchy") {
      if (activeSecondary === "parents") {
        filtered = tasks.filter((t) => t.children.length > 0 || !t.parentId);
      } else if (activeSecondary === "subtasks") {
        filtered = tasks.filter((t) => !!t.parentId);
      }
    } else if (activePrimary === "sphere" && activeSecondary !== "all") {
      filtered = tasks.filter((t) => t.sphereId === activeSecondary);
    } else if (activePrimary === "status" && activeSecondary !== "all") {
      filtered = tasks.filter((t) => t.status === activeSecondary);
    } else if (activePrimary === "time" && activeSecondary === "no-date") {
      filtered = tasks.filter((t) => !t.plannedDate);
    }

    const groups: Record<string, { tasks: TaskData[]; sortKey: number }> = {};

    if (activePrimary === "time" && activeSecondary !== "no-date") {
      const now = new Date();
      const currentWeekStart = getWeekStart(now);

      filtered.forEach((task) => {
        if (!task.plannedDate) return;
        const date = new Date(task.plannedDate);
        let key = "";
        let sortKey = 0;
        if (activeSecondary === "weeks") {
          const weekStart = getWeekStart(date);
          if (weekStart < currentWeekStart) return;
          key = getWeekLabel(date);
          sortKey = weekStart.getTime();
        } else if (activeSecondary === "months") {
          if (date < new Date(now.getFullYear(), now.getMonth(), 1)) return;
          key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          sortKey = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        } else if (activeSecondary === "quarters") {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
          if (
            date.getFullYear() < now.getFullYear() ||
            (date.getFullYear() === now.getFullYear() && quarter < currentQuarter)
          )
            return;
          key = `Q${quarter} ${date.getFullYear()}`;
          sortKey = new Date(date.getFullYear(), (quarter - 1) * 3, 1).getTime();
        } else if (activeSecondary === "years") {
          if (date.getFullYear() < now.getFullYear()) return;
          key = date.getFullYear().toString();
          sortKey = new Date(date.getFullYear(), 0, 1).getTime();
        }
        if (!groups[key]) groups[key] = { tasks: [], sortKey };
        groups[key].tasks.push(task);
      });
    } else if (activePrimary === "sphere" && activeSecondary === "all") {
      spheres.forEach((s) => {
        const sphereTasks = filtered.filter((t) => t.sphereId === s.id);
        if (sphereTasks.length > 0) groups[s.name] = { tasks: sphereTasks, sortKey: 0 };
      });
    } else if (activePrimary === "status" && activeSecondary === "all") {
      const statusOrder: Record<string, number> = {
        BACKLOG: 0,
        TODO: 1,
        IN_PROGRESS: 2,
        DONE: 3,
        CANCELLED: 4,
      };
      Object.keys(STATUS_CONFIG).forEach((s) => {
        const statusTasks = filtered.filter((t) => t.status === s);
        if (statusTasks.length > 0)
          groups[STATUS_CONFIG[s as TaskStatus].label] = {
            tasks: statusTasks,
            sortKey: statusOrder[s] ?? 99,
          };
      });
    } else {
      const label =
        activePrimary === "hierarchy"
          ? activeSecondary === "parents"
            ? "Main Tasks"
            : activeSecondary === "subtasks"
              ? "Subtasks"
              : "All Tasks"
          : activePrimary === "sphere"
            ? spheres.find((s) => s.id === activeSecondary)?.name || "Sphere Tasks"
            : activePrimary === "status"
              ? STATUS_CONFIG[activeSecondary as TaskStatus]?.label || "Status Tasks"
              : "Unplanned Tasks";

      if (filtered.length > 0) groups[label] = { tasks: filtered, sortKey: 0 };
    }

    if (activePrimary === "time" && activeSecondary !== "no-date") {
      const sorted = Object.entries(groups).sort((a, b) => a[1].sortKey - b[1].sortKey);
      const result: Record<string, TaskData[]> = {};
      for (const [key, value] of sorted) {
        result[key] = value.tasks;
      }
      return result;
    }

    const result: Record<string, TaskData[]> = {};
    for (const [key, value] of Object.entries(groups)) {
      result[key] = value.tasks;
    }
    return result;
  }, [tasks, activePrimary, activeSecondary, spheres]);

  const groupKeys = Object.keys(groupedTasks);
  const displayedKeys = groupKeys.slice(0, visibleGroups);
  const hasMore = groupKeys.length > visibleGroups;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-label">Group By:</span>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {PRIMARY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activePrimary === tab.id;
              const tabButtonClass = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
                active
                  ? "bg-accent text-white"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
              }`;

              return (
                <button
                  key={tab.id}
                  onClick={() => handlePrimaryChange(tab.id)}
                  className={tabButtonClass}
                >
                  <Icon size={14} strokeWidth={active ? 3 : 2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Tabs
          tabs={secondaryTabs}
          activeTab={activeSecondary}
          onTabChange={setActiveSecondary}
          variant="ghost"
        />
      </div>

      {groupKeys.length === 0 ? (
        <div className="glass-card p-8 flex items-center justify-center">
          <p className="text-caption">No tasks found for this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {displayedKeys.map((key) => (
            <div key={key} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-label whitespace-nowrap">{key}</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <TaskGrid
                tasks={groupedTasks[key]}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onAddChild={onAddChild}
                onDelete={onDelete ?? (() => {})}
                allTasks={tasks}
              />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => setVisibleGroups((prev) => prev + 5)}
          className="flex items-center gap-1 mx-auto text-xs font-semibold text-accent hover:opacity-80 transition-opacity"
        >
          <ChevronDown size={14} />
          Show More Groups
        </button>
      )}
    </div>
  );
}
