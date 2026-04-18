"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { Moon, Zap, Utensils, CheckCircle2, ChevronDown, Smile, Weight, Trash2 } from "lucide-react";
import { ROUTINE_ITEMS, type RoutineMap } from "@/lib/routine-items";
import { deleteEntryAction } from "../actions/journal-actions";
import { ConfirmationDialog } from "@/components/ui/dialog";
import { useTransition } from "react";

interface HistoryEntry {
  id: string;
  date: Date;
  sleepHours: number | null;
  energy: number | null;
  mood: number | null;
  weight: number | null;
  nutrition: number | null;
  winToday: string | null;
  morningRoutine: unknown;
  eveningRoutine: unknown;
}

interface Props {
  entries: HistoryEntry[];
}

function routineScore(morning: unknown, evening: unknown): number | null {
  const totalItems = ROUTINE_ITEMS.length;
  if (totalItems === 0) return null;

  const morningMap = morning as RoutineMap | null;
  const eveningMap = evening as RoutineMap | null;
  
  if (!morningMap && !eveningMap) return null;

  let done = 0;
  ROUTINE_ITEMS.forEach(item => {
    if ((morningMap && morningMap[item.id]) || (eveningMap && eveningMap[item.id])) {
      done++;
    }
  });

  return Math.round((done / totalItems) * 100);
}

function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

export function JournalHistoryView({ entries }: Props) {
  const [activeTab, setActiveTab] = useState("all");
  const [visibleGroups, setVisibleGroups] = useState(3);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteEntryAction(id);
      setDeleteId(null);
    });
  };

  const groupedEntries = useMemo(() => {
    if (activeTab === "all") return { "Recent Entries": entries };

    const groups: Record<string, HistoryEntry[]> = {};
    
    entries.forEach(e => {
      const date = new Date(e.date);
      let key = "";
      
      if (activeTab === "weeks") {
        const week = getWeekNumber(date);
        key = `Week ${week}, ${date.getFullYear()}`;
      } else if (activeTab === "months") {
        key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      } else if (activeTab === "quarters") {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${quarter} ${date.getFullYear()}`;
      } else if (activeTab === "years") {
        key = date.getFullYear().toString();
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    
    return groups;
  }, [entries, activeTab]);

  const groupKeys = Object.keys(groupedEntries);
  const displayedKeys = groupKeys.slice(0, visibleGroups);
  const hasMore = groupKeys.length > visibleGroups;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-start">
        <Tabs 
          tabs={[
            { id: "all", label: "All" },
            { id: "weeks", label: "Weeks" },
            { id: "months", label: "Months" },
            { id: "quarters", label: "Quarters" },
            { id: "years", label: "Years" },
          ]} 
          activeTab={activeTab} 
          onTabChange={(id) => {
            setActiveTab(id);
            setVisibleGroups(3);
          }} 
        />
      </div>

      <div className="flex flex-col gap-10">
        {displayedKeys.map(key => (
          <div key={key} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] font-mono text-muted uppercase tracking-[0.4em] px-4">{key}</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="flex flex-col gap-2">
              {groupedEntries[key].map((e) => {
                const dateStr = e.date.toISOString().slice(0, 10);
                const label = new Date(e.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                });
                const score = routineScore(e.morningRoutine, e.eveningRoutine);

                return (
                  <div key={e.id} className="relative group/row">
                    <Link
                      href={`/life/journal?date=${dateStr}`}
                      className="flex items-center gap-6 bg-surface border border-border rounded-xl px-6 py-4 hover:border-accent/40 hover:bg-raised/50 transition-all group shadow-sm"
                    >
                      <span className="text-[13px] font-medium text-text group-hover:text-accent transition-colors capitalize w-48 shrink-0">
                        {label}
                      </span>

                      <div className="flex items-center gap-5 text-[12px] font-mono text-muted">
                        <span className="flex items-center gap-1.5" title="Sleep">
                          <Moon size={13} className="text-accent/60" />
                          {e.sleepHours !== null ? `${e.sleepHours}h` : "—"}
                        </span>
                        <span className="flex items-center gap-1.5" title="Energy">
                          <Zap size={13} className="text-accent/60" />
                          {e.energy !== null ? `${e.energy}/10` : "—"}
                        </span>
                        <span className="flex items-center gap-1.5" title="Mood">
                          <Smile size={13} className="text-accent/60" />
                          {e.mood !== null ? `${e.mood}/10` : "—"}
                        </span>
                        {e.weight !== null && (
                          <span className="flex items-center gap-1.5" title="Weight">
                            <Weight size={13} className="text-accent/60" />
                            {e.weight}kg
                          </span>
                        )}
                        <span className="flex items-center gap-1.5" title="Nutrition Adherence">
                          <Utensils size={13} className="text-accent/60" />
                          {e.nutrition !== null ? `${e.nutrition}/5` : "—"}
                        </span>
                        <span className="flex items-center gap-1.5" title="Routine Score">
                          <CheckCircle2 size={13} className="text-accent/60" />
                          {score !== null ? `${score}%` : "—"}
                        </span>
                      </div>

                      {e.winToday && (
                        <span className="text-[12px] text-secondary truncate flex-1 italic">
                          &ldquo;{e.winToday}&rdquo;
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-muted/50 group-hover:text-accent/60 transition-colors shrink-0 mr-8">
                        →
                      </span>
                    </Link>

                    <button
                      onClick={() => setDeleteId(e.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover/row:opacity-100 transition-all z-10"
                      title="Delete Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Journal Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      {hasMore && (
        <button 
          onClick={() => setVisibleGroups(prev => prev + 5)}
          className="mx-auto flex items-center gap-2 px-8 py-3 bg-raised border border-border rounded-2xl text-[11px] font-mono uppercase tracking-[0.2em] hover:text-accent hover:border-accent/40 transition-all shadow-md group"
        >
          <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
          Show More Groups
        </button>
      )}
    </div>
  );
}
