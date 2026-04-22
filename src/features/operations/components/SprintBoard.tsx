"use client";

import React from "react";
import { Target, Activity, MoreHorizontal, Plus, CheckCircle2 } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { ObjectiveDialog } from "./ObjectiveDialog";
import { KeyResultDialog } from "./KeyResultDialog";
import type { SprintData, ObjectiveData } from "../types";

import { calculateSprintWeek } from "../logic/sprint-logic";
import { TacticDialog } from "./TacticDialog";
import { TacticTracker } from "./TacticTracker";

interface SprintBoardProps {
  sprint: SprintData;
  onRefresh: () => void;
}

export function SprintBoard({ sprint, onRefresh }: SprintBoardProps) {
  const currentWeek = calculateSprintWeek(sprint.startDate);
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mb-1 block">
            Level 04 Execution Engine
          </span>
          <div className="flex items-center gap-4">
            <Heading title={`Sprint ${sprint.number.toString().padStart(2, '0')} / ${sprint.year}`} />
            <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
               <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-wider">
                 Week {currentWeek} of 12
               </span>
            </div>
          </div>
          <p className="text-secondary text-sm mt-1">
            {new Date(sprint.startDate).toLocaleDateString()} — {new Date(sprint.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold tracking-wider">
                Active Cycle
              </span>
           </div>
           <Button variant="outline" size="sm">
             <MoreHorizontal size={14} />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Objectives Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text flex items-center gap-2">
              <Target size={14} className="text-emerald-500" />
              Strategic Objectives
            </h3>
            <ObjectiveDialog sprintId={sprint.id} onSuccess={onRefresh}>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] uppercase tracking-tighter">
                <Plus size={12} className="mr-1" /> Add Goal
              </Button>
            </ObjectiveDialog>
          </div>

          <div className="space-y-4">
            {sprint.objectives.length === 0 ? (
              <div className="p-12 border border-dashed border-border rounded-2xl text-center">
                <p className="text-xs text-secondary italic">No objectives defined for this sprint.</p>
                <ObjectiveDialog sprintId={sprint.id} onSuccess={onRefresh}>
                  <Button variant="outline" size="sm" className="mt-4">
                    Define first objective
                  </Button>
                </ObjectiveDialog>
              </div>
            ) : (
              sprint.objectives.map((obj) => (
                <ObjectiveCard key={obj.id} objective={obj} onRefresh={onRefresh} currentWeek={currentWeek} />
              ))
            )}
          </div>
        </div>

        {/* Pipeline / Stats Column */}
        <div className="space-y-8">
           <div>
             <h3 className="text-xs font-bold uppercase tracking-widest text-text flex items-center gap-2 mb-6">
               <Activity size={14} className="text-emerald-500" />
               Project Pipeline
             </h3>
             <div className="space-y-3">
               {sprint.objectives.flatMap(obj => obj.projects).length === 0 ? (
                 <p className="text-[10px] text-muted italic">No active projects linked to objectives.</p>
               ) : (
                 sprint.objectives.flatMap(obj => obj.projects).map(project => (
                   <div key={project.id} className="p-4 bg-surface border border-border rounded-xl">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase text-text truncate pr-2">
                          {project.title}
                        </span>
                        <span className="text-[10px] font-mono text-muted">
                          {Math.round(project.progress)}%
                        </span>
                     </div>
                     <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-500" 
                          style={{ width: `${project.progress}%` }}
                        />
                     </div>
                   </div>
                 ))
               )}
             </div>
           </div>

           <div className="p-6 bg-surface border border-border rounded-2xl">
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4 text-text">Weekly Execution Score</h4>
              <div className="flex items-center gap-4">
                 <div className="text-4xl font-heading text-emerald-500">
                   {Math.round(calculateExecutionScore(sprint, currentWeek))}%
                 </div>
                 <div className="flex-1">
                    <div className="h-2 w-full bg-border/30 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${calculateExecutionScore(sprint, currentWeek)}%` }} />
                    </div>
                    <p className="text-[10px] text-muted mt-2">Tactical completion (Week {currentWeek})</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function calculateExecutionScore(sprint: SprintData, week: number): number {
  const allTactics = sprint.objectives.flatMap(obj => obj.keyResults.flatMap(kr => kr.tactics));
  if (allTactics.length === 0) return 0;
  
  const completed = allTactics.filter(t => t.completions.some(c => c.weekNumber === week && c.completed)).length;
  return (completed / allTactics.length) * 100;
}

function ObjectiveCard({ objective, onRefresh, currentWeek }: { objective: ObjectiveData, onRefresh: () => void, currentWeek: number }) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden group hover:border-accent/30 transition-colors">
      <div className="p-6 border-b border-border/50">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: objective.sphereColor || 'var(--color-accent)' }}
              />
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                {objective.sphereName || 'Uncategorized'}
              </span>
            </div>
            <h4 className="text-lg font-heading text-text group-hover:text-accent transition-colors">
              {objective.title}
            </h4>
          </div>
          <ObjectiveDialog sprintId={objective.sprintId} objective={objective} onSuccess={onRefresh}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
               <MoreHorizontal size={14} />
            </Button>
          </ObjectiveDialog>
        </div>

        <div className="space-y-4">
           {objective.keyResults.map(kr => (
             <div key={kr.id} className="space-y-4 p-4 bg-raised/10 rounded-xl border border-border/40">
                <KeyResultDialog objectiveId={objective.id} keyResult={kr} onSuccess={onRefresh}>
                  <div className="space-y-2 cursor-pointer group/kr">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-secondary group-hover/kr:text-text transition-colors">{kr.title}</span>
                        <span className="text-[10px] font-mono text-text">
                          {kr.currentValue} / {kr.targetValue} {kr.unit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${kr.progress}%` }}
                        />
                      </div>
                  </div>
                </KeyResultDialog>

                <div className="space-y-2">
                  <TacticTracker 
                    tactics={kr.tactics} 
                    currentWeek={currentWeek} 
                    onRefresh={onRefresh} 
                  />
                  <TacticDialog keyResultId={kr.id} onSuccess={onRefresh}>
                    <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[9px] uppercase tracking-tighter text-muted hover:text-accent">
                      <Plus size={10} className="mr-1" /> Add Tactic
                    </Button>
                  </TacticDialog>
                </div>
             </div>
           ))}
           
           {objective.keyResults.length < 3 && (
             <KeyResultDialog objectiveId={objective.id} onSuccess={onRefresh}>
               <Button variant="ghost" size="sm" className="w-full border border-dashed border-border h-8 text-[10px] uppercase tracking-widest text-muted hover:text-accent hover:border-accent/40">
                 <Plus size={12} className="mr-2" /> Add Key Result
               </Button>
             </KeyResultDialog>
           )}
        </div>
      </div>
      
      <div className="px-6 py-3 bg-raised/30 flex justify-between items-center">
         <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
               <Activity size={12} className="text-muted" />
               <span className="text-[10px] font-mono text-muted">{objective.projects.length} Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
               <CheckCircle2 size={12} className="text-muted" />
               <span className="text-[10px] font-mono text-muted">
                 {objective.keyResults.reduce((acc, kr) => acc + kr.tactics.length, 0)} Tactics
               </span>
            </div>
         </div>
         <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] uppercase font-bold text-accent">
           Manage
         </Button>
      </div>
    </div>
  );
}
