"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Calendar, Layers, Activity, LayoutList } from "lucide-react";
import { TaskGrid } from "./TaskGrid";
import { TaskFormDialog } from "./TaskFormDialog";
import { Tabs } from "@/components/ui/tabs";
import type { TaskData, LifeSphereData, TaskStatus } from "@/features/life/types";
import { STATUS_CONFIG } from "./StatusToggle";

interface TaskTreeProps {
  tasks:        TaskData[];
  spheres:      LifeSphereData[];
  onEdit:       (task: TaskData) => void;
  onDuplicate:  (task: TaskData) => void;
  onAddChild:   (parent: TaskData) => void;
  hideHeader?:  boolean;
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

const PRIMARY_TABS = [
  { id: "time",      label: "Time",      icon: Calendar },
  { id: "hierarchy", label: "Hierarchy", icon: LayoutList },
  { id: "sphere",    label: "Spheres",   icon: Layers },
  { id: "status",    label: "Status",    icon: Activity },
];

export function TaskTree({ tasks, spheres, onEdit, onDuplicate, onAddChild }: TaskTreeProps) {
  const [activePrimary, setActivePrimary] = useState("time");
  const [activeSecondary, setActiveSecondary] = useState("weeks");
  const [visibleGroups, setVisibleGroups] = useState(3);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [parentTask, setParentTask]   = useState<TaskData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [dialogOpen, setDialogOpen]   = useState(false);

  const secondaryTabs = useMemo(() => {
    switch (activePrimary) {
      case "time":
        return [
          { id: "weeks",    label: "Weeks" },
          { id: "months",   label: "Months" },
          { id: "quarters", label: "Quarters" },
          { id: "years",    label: "Years" },
          { id: "no-date",  label: "Unplanned" },
        ];
      case "hierarchy":
        return [
          { id: "all",      label: "All Tasks" },
          { id: "parents",  label: "Main Tasks" },
          { id: "subtasks", label: "Subtasks Only" },
        ];
      case "sphere":
        return [
          { id: "all",      label: "All Spheres" },
          ...spheres.map(s => ({ id: s.id, label: s.name })),
        ];
      case "status":
        return [
          { id: "all",      label: "All Statuses" },
          ...Object.keys(STATUS_CONFIG).map(s => ({ 
            id: s, 
            label: STATUS_CONFIG[s as TaskStatus].label 
          })),
        ];
      default:
        return [];
    }
  }, [activePrimary, spheres]);

  // Handle Primary Tab Change
  const handlePrimaryChange = (id: string) => {
    setActivePrimary(id);
    setVisibleGroups(3);
    // Set default secondary tab
    if (id === "time") setActiveSecondary("weeks");
    else if (id === "hierarchy") setActiveSecondary("all");
    else if (id === "sphere") setActiveSecondary("all");
    else if (id === "status") setActiveSecondary("all");
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setParentTask(null);
    setIsDuplicate(false);
  };

  const groupedTasks = useMemo(() => {
    let filtered = tasks;

    // 1. Apply Primary Filter Logic
    if (activePrimary === "hierarchy") {
      if (activeSecondary === "parents") {
        filtered = tasks.filter(t => t.children.length > 0 || !t.parentId);
      } else if (activeSecondary === "subtasks") {
        filtered = tasks.filter(t => !!t.parentId);
      }
    } else if (activePrimary === "sphere" && activeSecondary !== "all") {
      filtered = tasks.filter(t => t.sphereId === activeSecondary);
    } else if (activePrimary === "status" && activeSecondary !== "all") {
      filtered = tasks.filter(t => t.status === activeSecondary);
    } else if (activePrimary === "time" && activeSecondary === "no-date") {
      filtered = tasks.filter(t => !t.plannedDate);
    }

    // 2. Perform Grouping
    const groups: Record<string, TaskData[]> = {};

    if (activePrimary === "time" && activeSecondary !== "no-date") {
      filtered.forEach(task => {
        if (!task.plannedDate) return;
        const date = new Date(task.plannedDate);
        let key = "";
        if (activeSecondary === "weeks") {
          const week = getWeekNumber(date);
          key = `Week ${week}, ${date.getFullYear()}`;
        } else if (activeSecondary === "months") {
          key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        } else if (activeSecondary === "quarters") {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `Q${quarter} ${date.getFullYear()}`;
        } else if (activeSecondary === "years") {
          key = date.getFullYear().toString();
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });
    } else if (activePrimary === "sphere" && activeSecondary === "all") {
      spheres.forEach(s => {
        const sphereTasks = filtered.filter(t => t.sphereId === s.id);
        if (sphereTasks.length > 0) groups[s.name] = sphereTasks;
      });
    } else if (activePrimary === "status" && activeSecondary === "all") {
      Object.keys(STATUS_CONFIG).forEach(s => {
        const statusTasks = filtered.filter(t => t.status === s);
        if (statusTasks.length > 0) groups[STATUS_CONFIG[s as TaskStatus].label] = statusTasks;
      });
    } else {
      // Single group (Hierarchy or filtered results)
      const label = activePrimary === "hierarchy" 
        ? (activeSecondary === "parents" ? "Main Tasks" : activeSecondary === "subtasks" ? "Subtasks" : "All Tasks")
        : activePrimary === "sphere" ? spheres.find(s => s.id === activeSecondary)?.name || "Sphere Tasks"
        : activePrimary === "status" ? STATUS_CONFIG[activeSecondary as TaskStatus]?.label || "Status Tasks"
        : "Unplanned Tasks";
      
      if (filtered.length > 0) groups[label] = filtered;
    }

    return groups;
  }, [tasks, activePrimary, activeSecondary, spheres]);

  const groupKeys = Object.keys(groupedTasks);
  const displayedKeys = groupKeys.slice(0, visibleGroups);
  const hasMore = groupKeys.length > visibleGroups;

  return (
    <div className="flex flex-col gap-8">
      {/* 2-Level Tabs Header */}
      <div className="flex flex-col gap-2.5 bg-surface/50 border border-border p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
        {/* Primary Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-2">
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] shrink-0">Group By:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRIMARY_TABS.map(tab => {
              const Icon = tab.icon;
              const active = activePrimary === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handlePrimaryChange(tab.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-[11px] font-bold transition-all ${
                    active 
                      ? "bg-accent text-bg shadow-lg shadow-accent/20" 
                      : "text-secondary hover:bg-raised hover:text-text"
                  }`}
                >
                  <Icon size={14} strokeWidth={active ? 3 : 2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40 mx-2" />

        {/* Secondary Tabs */}
        <div className="px-2 overflow-x-auto scrollbar-hide">
          <Tabs 
            tabs={secondaryTabs} 
            activeTab={activeSecondary} 
            onTabChange={setActiveSecondary} 
            variant="ghost"
          />
        </div>
      </div>

      {/* Task list with grouping */}
      {groupKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-surface/30 border border-dashed border-border rounded-[2.5rem]">
          <p className="text-muted text-sm italic">No tasks found for this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {displayedKeys.map(key => (
            <div key={key} className="flex flex-col gap-6">
              {/* Group Separator */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[10px] font-mono text-muted uppercase tracking-[0.4em] px-4 whitespace-nowrap">{key}</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              <TaskGrid 
                tasks={groupedTasks[key]} 
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onAddChild={onAddChild}
                allTasks={tasks}
              />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button 
          onClick={() => setVisibleGroups(prev => prev + 5)}
          className="mx-auto flex items-center gap-2 px-8 py-3 bg-raised border border-border rounded-2xl text-[11px] font-mono uppercase tracking-[0.2em] hover:text-accent hover:border-accent/40 transition-all shadow-md group"
        >
          <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          Show More Groups
        </button>
      )}

      <TaskFormDialog
        key={`task-form-${editingTask?.id ?? 'new'}`}
        isOpen={dialogOpen}
        onClose={handleClose}
        task={editingTask}
        parentTask={parentTask}
        spheres={spheres}
        allTasks={tasks}
        onViewTask={(t) => setEditingTask(t)}
        isDuplicate={isDuplicate}
      />
    </div>
  );
}
