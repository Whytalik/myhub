"use client";

import { useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Tabs } from "@/components/ui/tabs";
import {
  Activity,
  Trophy,
  Moon,
  Zap,
  Moon as MoonIcon,
  Utensils,
  Smile
} from "lucide-react";
import type { DailyStats, TaskStats } from "../types";
import { TaskStatsView } from "./stats/TaskStatsView";

interface StatsEntry {
  morningRoutine: unknown;
  eveningRoutine: unknown;
  winToday: string | null;
  nutrition: number | null;
}

interface Props {
  entries: StatsEntry[];
  stats: DailyStats;
  taskStats: TaskStats;
}

export function JournalStatsView({ entries, stats, taskStats }: Props) {
  const [activeTab, setActiveTab] = useState("journal");

  const totalEveningTasks = entries.reduce((acc, e) => acc + Object.values(e.eveningRoutine || {}).filter(Boolean).length, 0);
  const totalWins = entries.filter(e => e.winToday).length;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Heading title="Stats" className="text-4xl md:text-5xl" />
            <p className="text-[10px] font-mono text-muted tracking-widest pl-1 italic">
              Visualize your consistency and performance over time.
            </p>
          </div>
          <Tabs
            tabs={[
              { id: "journal", label: "Journal" },
              { id: "tasks", label: "Tasks" }
            ]} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        <div className="bg-surface border border-border px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm self-start xl:self-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">{activeTab === 'journal' ? 'Total Entries' : 'Total Tasks'}</span>
            <span className="text-xl font-heading text-accent">{activeTab === 'journal' ? entries.length : taskStats.totalTasks}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <Activity size={20} className="text-accent" />
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === "tasks" ? (
          <TaskStatsView stats={taskStats} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Moon size={16} className="text-accent" />
                  <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Avg. Sleep</span>
                </div>
                <span className="text-4xl font-heading text-text">
                  {stats.avgSleep !== null ? stats.avgSleep.toFixed(1) : "—"}
                  <span className="text-sm font-mono text-muted ml-2">hours</span>
                </span>
              </div>
              
              <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-accent" />
                  <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Avg. Energy</span>
                </div>
                <span className="text-4xl font-heading text-text">
                  {stats.avgEnergy !== null ? stats.avgEnergy.toFixed(1) : "—"}
                  <span className="text-sm font-mono text-muted ml-2">/ 10</span>
                </span>
              </div>

              <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Smile size={16} className="text-accent" />
                    <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Avg. Mood</span>
                </div>
                <span className="text-4xl font-heading text-text">
                    {stats.avgMood !== null ? stats.avgMood.toFixed(1) : "—"}
                    <span className="text-sm font-mono text-muted ml-2">/ 10</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils size={16} className="text-accent" />
                  <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Nutrition Avg.</span>
                </div>
                <span className="text-4xl font-heading text-text">
                  {entries.length > 0 ? (entries.reduce((acc, e) => acc + (e.nutrition || 0), 0) / (entries.filter(e => e.nutrition).length || 1)).toFixed(1) : "—"}
                  <span className="text-sm font-mono text-muted ml-2">/ 5</span>
                </span>
              </div>

              <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <MoonIcon size={16} className="text-accent" />
                    <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Evening Routine</span>
                </div>
                <span className="text-4xl font-heading text-text">
                    {totalEveningTasks}
                    <span className="text-sm font-mono text-muted ml-2">tasks done</span>
                </span>
              </div>

              <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy size={16} className="text-accent" />
                    <span className="text-[11px] font-mono text-muted uppercase tracking-widest">Total Wins</span>
                </div>
                <span className="text-4xl font-heading text-text">
                    {totalWins}
                    <span className="text-sm font-mono text-muted ml-2">achievements</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
