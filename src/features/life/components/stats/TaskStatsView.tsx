"use client";

import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  PieChart, 
  Zap, 
  TrendingUp, 
  AlertCircle,
  Activity,
  Target
} from "lucide-react";
import type { TaskStats } from "../../types";

interface Props {
  stats: TaskStats;
}

export function TaskStatsView({ stats }: Props) {
  // Helpers for SVG charts
  const maxVelocity = Math.max(...stats.last7Days.map(d => Math.max(d.created, d.completed)), 1);
  
  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* 1. Core Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={CheckCircle2} 
          label="Productivity" 
          value={`${stats.completionRate.toFixed(0)}%`}
          subValue={`${stats.completedTasks} / ${stats.totalTasks} tasks`}
          color="text-accent"
        />
        <StatCard 
          icon={Clock} 
          label="Reliability" 
          value={`${stats.onTimeRate.toFixed(0)}%`}
          subValue={`${stats.overdueTasks} overdue items`}
          color="text-rose-500"
          isWarning={stats.overdueTasks > 0}
        />
        <StatCard 
          icon={PieChart} 
          label="Life Balance" 
          value={stats.mostActiveSphere || "None"}
          subValue="Most active sphere"
          color="text-secondary"
        />
        <StatCard 
          icon={Zap} 
          label="Cognitive Load" 
          value={stats.activeHighPriorityTasks.toString()}
          subValue="Active high priority"
          color="text-amber-500"
          isWarning={stats.activeHighPriorityTasks > 5}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Velocity Chart (7 Days) */}
        <div className="lg:col-span-2 bg-surface border border-border p-8 rounded-[2rem] shadow-xl">
           <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col gap-1">
                 <h3 className="text-xl font-black tracking-tight text-text flex items-center gap-2">
                    <TrendingUp size={18} className="text-accent" />
                    Activity Velocity
                 </h3>
                 <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Last 7 days performance</p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <span className="text-[9px] font-mono text-muted uppercase">Completed</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-border" />
                    <span className="text-[9px] font-mono text-muted uppercase">Created</span>
                 </div>
              </div>
           </div>

           <div className="h-[240px] w-full flex items-end justify-between gap-4 px-2">
              {stats.last7Days.map((day, i) => {
                 const completedHeight = (day.completed / maxVelocity) * 100;
                 const createdHeight = (day.created / maxVelocity) * 100;
                 const date = new Date(day.date);
                 const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                 return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-4 group">
                       <div className="relative w-full flex justify-center items-end gap-1 h-full">
                          {/* Created Bar */}
                          <div 
                             className="w-2.5 bg-border/40 rounded-t-sm transition-all duration-700 group-hover:bg-border/60" 
                             style={{ height: `${createdHeight}%` }}
                             title={`Created: ${day.created}`}
                          />
                          {/* Completed Bar */}
                          <div 
                             className="w-2.5 bg-accent rounded-t-sm transition-all duration-700 group-hover:scale-x-125 group-hover:shadow-[0_0_15px_var(--color-accent)] group-hover:shadow-accent/30" 
                             style={{ height: `${completedHeight}%` }}
                             title={`Completed: ${day.completed}`}
                          />
                       </div>
                       <span className="text-[10px] font-mono text-muted/40 uppercase group-hover:text-text transition-colors">
                          {dayName}
                       </span>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* 3. Lead Time / Efficiency */}
        <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-xl flex flex-col">
           <div className="flex flex-col gap-1 mb-10">
              <h3 className="text-xl font-black tracking-tight text-text flex items-center gap-2">
                 <Activity size={18} className="text-accent" />
                 Efficiency
              </h3>
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Time-to-result metrics</p>
           </div>

           <div className="flex-1 flex flex-col justify-center gap-8">
              <div className="flex flex-col items-center text-center">
                 <span className="text-5xl font-heading text-text mb-2">
                    {stats.avgLeadTimeHours ? stats.avgLeadTimeHours.toFixed(1) : "—"}
                 </span>
                 <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">Avg. Lead Time (Hours)</span>
                 <p className="text-[11px] text-muted/60 mt-4 leading-relaxed italic px-4">
                    Time from task creation to completion. Lower is better.
                 </p>
              </div>

              <div className="pt-8 border-t border-border/40">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-muted uppercase">On-time Completion</span>
                    <span className="text-xs font-mono text-accent">{stats.onTimeRate.toFixed(1)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-border/20 rounded-full overflow-hidden">
                    <div 
                       className="h-full bg-accent transition-all duration-1000" 
                       style={{ width: `${stats.onTimeRate}%` }} 
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* 4. Sphere Distribution (Donut Chart) */}
         <div className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex flex-col gap-1 mb-10">
               <h3 className="text-xl font-black tracking-tight text-text flex items-center gap-2">
                  <PieChart size={18} className="text-accent" />
                  Life Balance
               </h3>
               <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Effort distribution by sphere</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
               {/* Donut SVG */}
               <div className="relative w-48 h-48 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                     {(() => {
                        const total = stats.totalTasks || 1;
                        let accumulatedOffset = 0;
                        
                        return stats.sphereDistribution.map((sphere) => {
                           const percentage = (sphere.count / total) * 100;
                           const strokeDasharray = `${percentage} ${100 - percentage}`;
                           const strokeDashoffset = -accumulatedOffset;
                           accumulatedOffset += percentage;

                           return (
                              <circle
                                 key={sphere.id}
                                 cx="50"
                                 cy="50"
                                 r="40"
                                 fill="transparent"
                                 stroke={sphere.color}
                                 strokeWidth="12"
                                 strokeDasharray={strokeDasharray}
                                 strokeDashoffset={strokeDashoffset}
                                 className="transition-all duration-1000 ease-out hover:stroke-white/20"
                                 pathLength={100}
                              />
                           );
                        });
                     })()}
                     {/* Background ring */}
                     <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-white/[0.03]"
                        style={{ zIndex: -1 }}
                     />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <span className="text-3xl font-heading text-text leading-none">{stats.totalTasks}</span>
                     <span className="text-[8px] font-mono text-muted uppercase tracking-tighter mt-1">Total Tasks</span>
                  </div>
               </div>

               {/* Legend */}
               <div className="flex-1 flex flex-col gap-4 w-full">
                  {stats.sphereDistribution.map(sphere => (
                     <div key={sphere.id} className="flex flex-col gap-1.5 group">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2.5">
                              <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: sphere.color, color: sphere.color }} />
                              <span className="text-[13px] font-bold text-text group-hover:text-accent transition-colors">{sphere.name}</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-[9px] font-mono text-muted uppercase">{sphere.completed}/{sphere.count}</span>
                              <span className="text-xs font-mono text-text w-8 text-right font-black">{((sphere.count / (stats.totalTasks || 1)) * 100).toFixed(0)}%</span>
                           </div>
                        </div>
                        <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                           <div 
                              className="h-full transition-all duration-1000 group-hover:opacity-100 opacity-60" 
                              style={{ width: `${(sphere.count / (stats.totalTasks || 1)) * 100}%`, backgroundColor: sphere.color }} 
                           />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* 5. Top Projects Progress */}
         <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-xl">
            <div className="flex flex-col gap-1 mb-8">
               <h3 className="text-xl font-black tracking-tight text-text flex items-center gap-2">
                  <Target size={18} className="text-accent" />
                  Top Projects
               </h3>
               <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Main tasks with subtasks progress</p>
            </div>

            <div className="flex flex-col gap-6">
               {stats.topProjects.length > 0 ? stats.topProjects.map(proj => (
                  <div key={proj.id} className="flex flex-col gap-3 p-4 bg-raised/20 border border-border/40 rounded-2xl group hover:border-accent/30 transition-all">
                     <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-text truncate pr-4">{proj.title}</span>
                        <span className="text-[11px] font-mono text-accent font-black uppercase tracking-tighter">{proj.progress.toFixed(0)}%</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 h-1 bg-border/20 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-accent transition-all duration-1000" 
                              style={{ width: `${proj.progress}%` }} 
                           />
                        </div>
                        <span className="text-[9px] font-mono text-muted uppercase shrink-0">
                           {proj.completedSubtasks} / {proj.totalSubtasks}
                        </span>
                     </div>
                  </div>
               )) : (
                  <div className="flex flex-col items-center justify-center py-10 opacity-30">
                     <Target size={32} className="mb-4" />
                     <p className="text-sm italic">No projects with subtasks found.</p>
                  </div>
               )}
            </div>
         </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, color, isWarning }: { 
  icon: React.ComponentType<{ size?: number; className?: string }>, label: string, value: string, subValue: string, color: string, isWarning?: boolean 
}) {
  return (
    <div className={`bg-surface border ${isWarning ? "border-rose-500/30" : "border-border"} p-8 rounded-[2.5rem] shadow-lg flex flex-col gap-4 relative overflow-hidden group hover:border-accent/40 transition-all duration-500`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-current opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rounded-full ${color}`} />
      
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl bg-current opacity-10 ${color}`} />
        <Icon className={`absolute ml-2.5 ${color}`} size={16} />
        <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em]">{label}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-4xl font-heading text-text tracking-tighter">{value}</span>
        <span className="text-[11px] font-mono text-muted tracking-tight">{subValue}</span>
      </div>

      {isWarning && (
        <div className="absolute top-4 right-4 text-rose-500">
           <AlertCircle size={14} className="animate-pulse" />
        </div>
      )}
    </div>
  );
}
