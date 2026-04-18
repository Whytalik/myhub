"use client";

import type { HabitStats } from "@/features/life/types";
import { TrendingUp, Flame, Calendar } from "lucide-react";

interface HabitStatsViewProps {
  stats: HabitStats[];
}

export function HabitStatsView({ stats }: HabitStatsViewProps) {
  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((habit) => (
        <div key={habit.id} className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-text truncate max-w-[150px]">{habit.name}</h4>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20">
                <Flame size={12} strokeWidth={2} />
                <span className="text-[10px] font-mono font-bold">{habit.streak} day streak</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted">
                  <TrendingUp size={12} />
                  <span className="text-[9px] font-mono tracking-widest">Efficiency</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-text">{habit.completionRate}%</span>
                  <span className="text-[10px] text-muted font-mono tracking-tighter">/ 30d</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-muted">
                  <Calendar size={12} />
                  <span className="text-[9px] font-mono tracking-widest">Total</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-text">{habit.totalCompletions}</span>
                  <span className="text-[10px] text-muted font-mono tracking-tighter">days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono tracking-widest text-muted">Last 7 days</span>
              <div className="flex justify-between items-center gap-1.5">
                {[...habit.last7Days].reverse().map((done, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 h-8 rounded-lg border flex items-center justify-center transition-all ${
                      done 
                        ? "bg-emerald-500 border-emerald-600 shadow-sm" 
                        : "bg-raised/30 border-border/40"
                    }`}
                    title={i === 6 ? "Today" : `${6-i} days ago`}
                  >
                    {done && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] font-mono text-muted px-1">
                <span>{6}d ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
