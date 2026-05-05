"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import { Trophy, AlertCircle, RefreshCw, Star, Save, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { upsertSprintReviewAction, getSprintReviewAction } from "../actions/sprint-actions";
import { calculateSprintWeek } from "../logic/sprint-logic";
import type { SprintData } from "../types";

interface SprintReviewViewProps {
  sprint: SprintData;
}

export function SprintReviewView({ sprint }: SprintReviewViewProps) {
  const currentWeek = calculateSprintWeek(sprint.startDate);
  const [selectedWeek, setSelectedWeek] = useState(Math.min(currentWeek, 12));
  const [isPending, startTransition] = useTransition();
  const [showSaved, setShowSaved] = useState(false);
  
  const [reviewId, setReviewId] = useState<string | undefined>();
  const [score, setScore] = useState<number | null>(null);
  const [wins, setWins] = useState("");
  const [challenges, setChallenges] = useState("");
  const [adjustments, setAdjustments] = useState("");

  const loadReview = useCallback(async (week: number) => {
    const review = await getSprintReviewAction(sprint.id, week);
    if (review) {
      setReviewId(review.id);
      setScore(review.score);
      setWins(review.wins || "");
      setChallenges(review.challenges || "");
      setAdjustments(review.adjustments || "");
    } else {
      setReviewId(undefined);
      setScore(null);
      setWins("");
      setChallenges("");
      setAdjustments("");
    }
  }, [sprint.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReview(selectedWeek);
  }, [selectedWeek, loadReview]);

  const handleSave = () => {
    startTransition(async () => {
      await upsertSprintReviewAction({
        id: reviewId,
        sprintId: sprint.id,
        weekNumber: selectedWeek,
        score,
        wins,
        challenges,
        adjustments
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    });
  };

  // Logic to calculate stats for the selected week
  const calculateWeeklyStats = (week: number) => {
    const allTactics = sprint.objectives.flatMap(obj => obj.keyResults.flatMap(kr => kr.tactics));
    const total = allTactics.length;
    if (total === 0) return 0;
    const completed = allTactics.filter(t => t.completions.some(c => c.weekNumber === week && c.completed)).length;
    return Math.round((completed / total) * 100);
  };

  const weeklyScore = calculateWeeklyStats(selectedWeek);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] mb-1 block">
            Level 05 Review Center
          </span>
          <Heading title="Sprint Weekly Scorecard" />
        </div>
        
        <div className="flex bg-surface border border-border p-1 rounded-xl">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`w-8 h-8 rounded-lg text-[10px] font-mono transition-all ${
                selectedWeek === w 
                  ? "bg-accent text-bg font-bold" 
                  : w > currentWeek 
                  ? "text-muted opacity-40 cursor-not-allowed" 
                  : "text-secondary hover:bg-raised"
              }`}
            >
              W{w}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Weekly Stats & Score */}
        <div className="space-y-6">
           <div className="bg-surface border border-border rounded-3xl p-8 text-center space-y-4">
              <h3 className="text-[10px] font-mono text-muted uppercase tracking-widest">Tactical Execution Score</h3>
              <div className="text-6xl font-heading text-emerald-500">{weeklyScore}%</div>
              <p className="text-xs text-secondary">
                {weeklyScore >= 80 ? "Excellent execution!" : weeklyScore >= 50 ? "Steady progress." : "Need tactical adjustments."}
              </p>
              <div className="w-full h-2 bg-border/40 rounded-full overflow-hidden mt-4">
                 <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${weeklyScore}%` }} />
              </div>
           </div>

           <div className="bg-surface border border-border rounded-3xl p-8 space-y-6">
              <h3 className="text-[10px] font-mono text-muted uppercase tracking-widest">Subjective Rating</h3>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScore(s)}
                    className={`flex flex-col items-center gap-2 group`}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                      score === s ? "bg-accent border-accent text-bg shadow-lg shadow-accent/20" : "bg-raised border-border text-muted group-hover:border-accent/40"
                    }`}>
                      <Star size={16} fill={score === s ? "currentColor" : "none"} />
                    </div>
                    <span className="text-[10px] font-mono text-muted">{s}</span>
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Right: Narrative Review */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-surface border border-border rounded-3xl p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Trophy size={16} />
                  <h4 className="text-[11px] font-mono uppercase font-bold tracking-widest">Big Wins & Achievements</h4>
                </div>
                <textarea
                  className="w-full bg-raised/30 border border-border rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-emerald-500/40 transition-colors"
                  placeholder="What went exceptionally well this week?"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertCircle size={16} />
                  <h4 className="text-[11px] font-mono uppercase font-bold tracking-widest">Challenges & Blockers</h4>
                </div>
                <textarea
                  className="w-full bg-raised/30 border border-border rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-rose-500/40 transition-colors"
                  placeholder="What slowed you down or felt heavy?"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <RefreshCw size={16} />
                  <h4 className="text-[11px] font-mono uppercase font-bold tracking-widest">Adjustments for next week</h4>
                </div>
                <textarea
                  className="w-full bg-raised/30 border border-border rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-accent/40 transition-colors"
                  placeholder="How will you pivot to ensure success next week?"
                  value={adjustments}
                  onChange={(e) => setAdjustments(e.target.value)}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                {showSaved && (
                  <div className="flex items-center gap-2 text-emerald-500 font-mono text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                    <CheckCircle2 size={14} />
                    Review Committed
                  </div>
                )}
                <Button 
                  onClick={handleSave} 
                  disabled={isPending}
                  className="gap-2 px-8"
                >
                  {isPending ? <Zap size={14} className="animate-pulse" /> : <Save size={14} />}
                  {isPending ? "Saving..." : "Commit Review"}
                </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
