"use client";

import React, { useState } from "react";
import { Plus, GripVertical, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTaskStatusAction, upsertTaskAction } from "@/features/life/actions/task-actions";
import type { SprintData } from "../types";
import type { TaskStatus } from "@/features/life/types";

interface SprintBacklogProps {
  sprint: SprintData;
  onRefresh: () => void;
}

export function SprintBacklog({ sprint, onRefresh }: SprintBacklogProps) {
  const projects = sprint.objectives.flatMap(obj => obj.projects);
  const [newTaskTitle, setNewTaskTitle] = useState<{ [projectId: string]: string }>({});

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatusAction(taskId, status);
      onRefresh();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleAddTask = async (projectId: string) => {
    const title = newTaskTitle[projectId];
    if (!title) return;

    try {
      await upsertTaskAction({
        title,
        projectId,
        status: "TODO"
      });
      setNewTaskTitle(prev => ({ ...prev, [projectId]: "" }));
      onRefresh();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const columns: { status: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { status: "TODO", label: "To Do", icon: <Circle size={14} />, color: "text-muted" },
    { status: "IN_PROGRESS", label: "In Progress", icon: <Clock size={14} />, color: "text-accent" },
    { status: "DONE", label: "Done", icon: <CheckCircle2 size={14} />, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-12">
      {projects.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
           <p className="text-sm text-secondary italic">No projects found. Add a project to an objective to start building your backlog.</p>
        </div>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-accent rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-text">
                {project.title}
              </h3>
              <span className="text-[10px] font-mono text-muted">
                {project.completedTaskCount} / {project.taskCount} Tasks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {columns.map((col) => (
                <div key={col.status} className="flex flex-col gap-3 min-h-[150px]">
                  <div className="flex items-center justify-between px-2">
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${col.color}`}>
                      {col.icon}
                      {col.label}
                    </div>
                    <span className="text-[10px] font-mono text-muted">
                      {project.tasks.filter(t => t.status === col.status).length}
                    </span>
                  </div>

                  <div className="flex-1 bg-surface/50 border border-border/40 rounded-xl p-3 space-y-2">
                    {project.tasks.filter(t => t.status === col.status).map((task) => (
                      <div 
                        key={task.id} 
                        className="p-3 bg-surface border border-border rounded-lg group hover:border-accent/30 transition-colors shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                           <GripVertical size={14} className="text-muted/40 mt-0.5" />
                           <div className="flex-1">
                              <p className="text-xs text-text leading-tight">{task.title}</p>
                              <div className="flex gap-2 mt-3">
                                {columns.filter(c => c.status !== task.status).map(targetCol => (
                                  <button
                                    key={targetCol.status}
                                    onClick={() => handleUpdateStatus(task.id, targetCol.status)}
                                    className="text-[9px] uppercase font-bold text-muted hover:text-accent transition-colors"
                                  >
                                    Move to {targetCol.label}
                                  </button>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}

                    {col.status === "TODO" && (
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <Input 
                            value={newTaskTitle[project.id] || ""} 
                            onChange={(e) => setNewTaskTitle(prev => ({ ...prev, [project.id]: e.target.value }))}
                            placeholder="Add task..."
                            className="h-8 text-[11px] bg-surface"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(project.id)}
                          />
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleAddTask(project.id)}>
                            <Plus size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {project.tasks.filter(t => t.status === col.status).length === 0 && col.status !== "TODO" && (
                      <div className="flex items-center justify-center h-full py-8 text-center">
                         <p className="text-[10px] text-muted italic">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
