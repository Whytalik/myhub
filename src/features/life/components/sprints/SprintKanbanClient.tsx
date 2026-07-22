"use client";

import { useMemo, useState } from "react";
import { addDays, format, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/actions/button";
import { WeeklyStatusBoard } from "./WeeklyStatusBoard";
import type { TaskData } from "@/features/life/types";
import {
  Trophy,
  Target,
  Calendar,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface SprintKanbanClientProps {
  sprint: {
    id: string;
    number: number;
    year: number;
    startDate: Date;
    endDate: Date;
    status: string;
    objectives: {
      id: string;
      title: string;
      description: string | null;
      sphere: {
        id: string;
        name: string;
        color: string;
        icon: string;
      };
      projects: {
        id: string;
        title: string;
        description: string | null;
        tasks: {
          id: string;
          title: string;
          status: string;
        }[];
      }[];
    }[];
  };
  allTasks: TaskData[];
  sprintReviews: {
    id: string;
    weekNumber: number;
    score: number | null;
    wins: string | null;
    challenges: string | null;
    adjustments: string | null;
  }[];
}

export function SprintKanbanClient({
  sprint,
  allTasks,
  sprintReviews,
}: SprintKanbanClientProps) {
  const sprintStart = useMemo(() => new Date(sprint.startDate), [sprint.startDate]);
  const now = useMemo(() => new Date(), []);
  
  const initialWeekIndex = useMemo(() => {
    const differenceInMilliseconds = now.getTime() - sprintStart.getTime();
    if (differenceInMilliseconds < 0) {
      return 0;
    }
    return Math.min(11, Math.floor(differenceInMilliseconds / (7 * 24 * 60 * 60 * 1000)));
  }, [now, sprintStart]);

  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(initialWeekIndex);
  const [activeTab, setActiveTab] = useState<"board" | "goals" | "scorecard">("board");

  const weekStart = useMemo(
    () => addDays(sprintStart, selectedWeekIndex * 7),
    [sprintStart, selectedWeekIndex]
  );

  const weekButtons = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        index,
        label: `W${index + 1}`,
      })),
    []
  );

  const [tasks, setTasks] = useState<TaskData[]>(allTasks);

  // Selected week's review data (if it exists)
  const selectedWeekReview = useMemo(() => {
    return sprintReviews.find((review) => review.weekNumber === selectedWeekIndex + 1);
  }, [sprintReviews, selectedWeekIndex]);

  // Calculations for average sprint score
  const completedReviews = useMemo(() => {
    return sprintReviews.filter((review) => review.score !== null);
  }, [sprintReviews]);

  const averageSprintScore = useMemo(() => {
    if (completedReviews.length === 0) {
      return null;
    }
    const totalScore = completedReviews.reduce((sum, review) => sum + (review.score ?? 0), 0);
    return (totalScore / completedReviews.length).toFixed(1);
  }, [completedReviews]);

  const getScoreColorClass = (score: number) => {
    if (score >= 8) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 5) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 🚀 Header Sprint Card */}
      <div className="glass-card p-5 bg-black/15 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label tracking-[0.24em] text-zinc-500">
            12-Week Year Sprint
          </p>
          <h1 className="text-page-title mt-1">Спринт {sprint.number} · {sprint.year}</h1>
          <p className="text-caption mt-1">
            {format(sprintStart, "MMM d, yyyy")} — {format(new Date(sprint.endDate), "MMM d, yyyy")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {averageSprintScore && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <Trophy size={14} className="text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-wider">Avg Score</span>
                <span className="text-xs font-bold text-zinc-200 font-mono">{averageSprintScore} / 10</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {weekButtons.map((week) => {
              const isSelected = week.index === selectedWeekIndex;
              const hasReview = sprintReviews.some((r) => r.weekNumber === week.index + 1 && r.score !== null);
              const weekReview = sprintReviews.find((r) => r.weekNumber === week.index + 1);
              const isCurrent = week.index === initialWeekIndex;
              const isDisabled = !isCurrent;
              
              let weekBadgeColor = "border-white/[0.06] text-zinc-400 hover:bg-white/5";
              if (isSelected) {
                weekBadgeColor = "bg-accent border-accent text-white";
              } else if (hasReview && weekReview?.score) {
                if (weekReview.score >= 8) weekBadgeColor = "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5";
                else if (weekReview.score >= 5) weekBadgeColor = "border-amber-500/30 text-amber-400 hover:bg-amber-500/5";
                else weekBadgeColor = "border-rose-500/30 text-rose-400 hover:bg-rose-500/5";
              }

              return (
                <button
                  key={week.index}
                  disabled={isDisabled}
                  onClick={() => setSelectedWeekIndex(week.index)}
                  className={`px-2.5 py-1 text-[11px] font-bold font-mono rounded-lg border transition-all duration-150 flex items-center gap-1.5 ${
                    isDisabled
                      ? "border-white/[0.03] text-zinc-600 bg-black/5 cursor-not-allowed opacity-50"
                      : weekBadgeColor
                  }`}
                >
                  {isDisabled && <Lock size={10} className="text-zinc-600 shrink-0" />}
                  {week.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📑 Tab Selection Controls */}
      <div className="flex border-b border-white/[0.06]">
        <button
          onClick={() => setActiveTab("board")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "board"
              ? "border-accent text-accent"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={13} />
            Дошка тижня (W{selectedWeekIndex + 1})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "goals"
              ? "border-accent text-accent"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Target size={13} />
            Цілі спринту (OKR)
          </span>
        </button>
        <button
          onClick={() => setActiveTab("scorecard")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "scorecard"
              ? "border-accent text-accent"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Trophy size={13} />
            Звіт та Scorecard
          </span>
        </button>
      </div>

      {/* 📦 Tab Content rendering */}
      {activeTab === "board" && (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-4 bg-black/10">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-white/[0.04] pb-3 mb-4">
              <div>
                <p className="text-label text-zinc-500">Розклад тижня</p>
                <h2 className="text-panel-title mt-1">
                  {format(weekStart, "MMM d")} — {format(endOfWeek(weekStart, { weekStartsOn: 1 }), "MMM d, yyyy")}
                </h2>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                {tasks.filter((t) => !t.plannedDate && t.status !== "DONE" && t.status !== "CANCELLED").length} нерозподілених атомів
              </div>
            </div>

            <WeeklyStatusBoard
              tasks={tasks}
              weekStart={weekStart}
              locked={false}
              onTasksChange={(updater) => setTasks((prev) => updater(prev))}
            />
          </div>
        </div>
      )}

      {activeTab === "goals" && (
        <div className="glass-card p-5 bg-black/10 flex flex-col gap-6">
          <div>
            <h2 className="text-panel-title">Цілі та Ключові Результати Спринту</h2>
            <p className="text-caption mt-1">Ваші орієнтири на цей 12-ти тижневий рік.</p>
          </div>

          {sprint.objectives.length === 0 ? (
            <div className="p-8 border border-dashed border-white/[0.08] rounded-2xl flex flex-col items-center justify-center text-center">
              <Target size={24} className="text-zinc-600 mb-2" />
              <p className="text-caption text-zinc-500 italic">Цілей на цей спринт не створено.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {sprint.objectives.map((objective) => (
                <div key={objective.id} className="rounded-2xl border border-white/[0.06] bg-black/5 p-4 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">Ціль</span>
                      <h3 className="text-sm font-semibold text-zinc-100">{objective.title}</h3>
                      {objective.description && (
                        <p className="text-[11px] text-zinc-400 mt-0.5">{objective.description}</p>
                      )}
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold border"
                      style={{
                        color: objective.sphere.color,
                        borderColor: `${objective.sphere.color}33`,
                        backgroundColor: `${objective.sphere.color}0a`,
                      }}
                    >
                      {objective.sphere.name}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">Проекти цілі</span>
                    
                    {objective.projects.length === 0 ? (
                      <p className="text-[11px] text-zinc-600 italic">Немає прив&apos;язаних проектів.</p>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {objective.projects.map((project) => {
                          const completed = project.tasks.filter((t) => t.status === "DONE").length;
                          const total = project.tasks.length;
                          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                          return (
                            <div key={project.id} className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-xs font-semibold text-zinc-200">{project.title}</span>
                                <span className="text-[10px] text-zinc-400 font-mono font-bold">{completed}/{total} ({percent}%)</span>
                              </div>
                              <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-accent rounded-full transition-all duration-350"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "scorecard" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* 📈 Scorecard Grid */}
          <div className="glass-card p-5 bg-black/10 flex flex-col gap-4">
            <div>
              <h2 className="text-panel-title">12-Week Scorecard</h2>
              <p className="text-caption mt-1">Оцінки виконання планів та Kaizen-звіти за тижнями.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {weekButtons.map((week) => {
                const review = sprintReviews.find((r) => r.weekNumber === week.index + 1);
                const hasReview = review !== undefined && review.score !== null;
                const isSelected = week.index === selectedWeekIndex;
                const isCurrent = week.index === initialWeekIndex;
                const isDisabled = !isCurrent;

                let scoreStyles = "border-white/[0.06] bg-black/5 hover:border-white/10 hover:bg-white/[0.02]";
                if (isSelected) {
                  scoreStyles = "border-accent bg-accent/5 ring-1 ring-accent/30";
                } else if (hasReview && review?.score !== null) {
                  if (review.score >= 8) scoreStyles = "border-emerald-500/20 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]";
                  else if (review.score >= 5) scoreStyles = "border-amber-500/20 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]";
                  else scoreStyles = "border-rose-500/20 bg-rose-500/[0.02] hover:bg-rose-500/[0.04]";
                }

                return (
                  <button
                    key={week.index}
                    disabled={isDisabled}
                    onClick={() => setSelectedWeekIndex(week.index)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all duration-150 ${
                      isDisabled
                        ? "border-white/[0.03] bg-black/2 opacity-40 cursor-not-allowed text-zinc-600"
                        : scoreStyles
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isDisabled && <Lock size={9} className="text-zinc-600 shrink-0" />}
                      <span className={`text-[10px] font-mono font-bold ${isDisabled ? "text-zinc-600" : "text-zinc-500"}`}>
                        Тиждень {week.index + 1}
                      </span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${isDisabled ? "text-zinc-700" : "text-zinc-200"}`}>
                      {hasReview && review?.score !== null ? `${review.score} / 10` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 p-4 border border-dashed border-white/[0.08] rounded-xl flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-300">Тижневий ретроспективний аналіз</span>
                <span className="text-[11px] text-zinc-500 mt-0.5">В кінці кожного тижня важливо оцінювати дисципліну.</span>
              </div>
              <Link href="/life/review">
                <Button size="sm" variant="ghost" className="text-xs flex items-center gap-1">
                  Заповнити Рев&apos;ю <ArrowRight size={13} />
                </Button>
              </Link>
            </div>
          </div>

          {/* 🧠 Weekly reflection viewer */}
          <div className="glass-card p-5 bg-black/10 flex flex-col gap-4">
            <div>
              <p className="text-label text-zinc-500">Деталі тижня</p>
              <h2 className="text-panel-title mt-1">Результати W{selectedWeekIndex + 1}</h2>
            </div>

            {selectedWeekReview ? (
              <div className="flex flex-col gap-4 mt-2">
                {selectedWeekReview.score !== null && (
                  <div className="flex justify-between items-center p-3 rounded-xl border border-white/[0.06] bg-black/10">
                    <span className="text-xs font-semibold text-zinc-400">Оцінка дисципліни:</span>
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${getScoreColorClass(selectedWeekReview.score)}`}>
                      {selectedWeekReview.score} / 10
                    </span>
                  </div>
                )}

                {selectedWeekReview.wins && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">🏆 Перемоги тижня</span>
                    <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                      {selectedWeekReview.wins}
                    </div>
                  </div>
                )}

                {selectedWeekReview.challenges && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">⚠️ Перешкоди</span>
                    <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                      {selectedWeekReview.challenges}
                    </div>
                  </div>
                )}

                {selectedWeekReview.adjustments && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">🔄 Корективи (Kaizen)</span>
                    <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.01] text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                      {selectedWeekReview.adjustments}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/[0.08] rounded-2xl mt-4">
                <Sparkles size={20} className="text-zinc-600 mb-2 animate-pulse" />
                <p className="text-caption text-zinc-500 italic">Звіт для W{selectedWeekIndex + 1} ще не заповнено.</p>
                <Link href="/life/review" className="mt-4">
                  <Button size="sm" variant="primary" className="text-xs">
                    Заповнити звіт за тиждень
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
