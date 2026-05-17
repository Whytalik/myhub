"use client";

import React, { useState } from "react";
import { Brain, Target, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertVisionAction } from "../actions/sprint-actions";
import { toggleSphereActiveAction } from "@/features/life/actions/task-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ObjectiveData } from "../types";
import type { LifeSphereData, SphereLevel } from "@/features/life/types";

const LEVEL_CONFIG: Record<SphereLevel, { label: string; color: string; dot: string }> = {
  MINIMUM:  { label: "Min",     color: "text-rose-500",   dot: "bg-rose-500" },
  MEDIUM:   { label: "Medium",  color: "text-amber-500",  dot: "bg-amber-500" },
  DESIRED:  { label: "Desired", color: "text-emerald-500", dot: "bg-emerald-500" },
};

interface SphereLevelHabit {
  id: string;
  name: string;
  sphereId: string | null;
  sphereLevel: SphereLevel;
}

interface AlignmentMapProps {
  initialData: {
    vision: { title: string; content: string | null } | null;
    spheres: LifeSphereData[];
    activeObjectives: ObjectiveData[];
    sphereLevelHabits: SphereLevelHabit[];
  };
}

export function AlignmentMap({ initialData }: AlignmentMapProps) {
  const [vision, setVision] = useState(initialData.vision);
  const [spheres, setSpheres] = useState(initialData.spheres);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = useState(false);
  const [newVisionTitle, setNewVisionTitle] = useState(vision?.title ?? "");
  const [newVisionContent, setNewVisionContent] = useState(vision?.content ?? "");
  const [loading, setLoading] = useState(false);

  const handleSaveVision = async () => {
    setLoading(true);
    try {
      const result = await upsertVisionAction(newVisionTitle, newVisionContent);
      if (result.success) {
        setVision(result.data);
        setIsVisionDialogOpen(false);
      } else {
        toast.error(result.error ?? "Failed to save mission");
      }
    } catch {
      toast.error("Failed to save mission");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSphere = async (id: string, isActive: boolean) => {
    setSpheres(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));
    const result = await toggleSphereActiveAction(id, isActive);
    if (!result.success) {
      setSpheres(prev => prev.map(s => s.id === id ? { ...s, isActive: !isActive } : s));
      toast.error("Failed to update sphere");
    }
  };

  const activeSpheres = spheres.filter(s => s.isActive);

  return (
    <div className="space-y-16 py-10">
      {/* Level 01: 5-Year Mission */}
      <section className="relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
            <Brain size={32} />
          </div>
          <h2 className="text-caption font-mono text-rose-500 uppercase tracking-[0.4em]">Level 01: 5-Year Mission</h2>

          {vision ? (
            <div className="space-y-4 group relative">
              <h3 className="text-sm md:text-base font-heading text-text uppercase tracking-tight">
                {vision.title}
              </h3>
              <p className="text-secondary leading-relaxed text-sm italic">
                &quot;{vision.content}&quot;
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  setNewVisionTitle(vision.title);
                  setNewVisionContent(vision.content ?? "");
                  setIsVisionDialogOpen(true);
                }}
              >
                <Edit2 size={14} />
              </Button>
            </div>
          ) : (
            <div
              className="p-10 border-2 border-dashed border-border rounded-[2.5rem] cursor-pointer hover:border-rose-500/30 transition-colors w-full"
              onClick={() => setIsVisionDialogOpen(true)}
            >
              <p className="text-muted font-mono uppercase text-caption tracking-widest">Define your 5-Year Mission</p>
            </div>
          )}
        </div>
      </section>

      {/* Sphere Focus Selector */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-caption font-mono text-muted uppercase tracking-[0.4em] mb-2">Focus Spheres</h2>
          <p className="text-xs text-secondary">Toggle which life spheres to activate as strategic pillars</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {spheres.map((sphere) => (
            <button
              key={sphere.id}
              onClick={() => handleToggleSphere(sphere.id, !sphere.isActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                sphere.isActive
                  ? "border-transparent text-white shadow-sm"
                  : "border-border text-muted bg-surface opacity-40 hover:opacity-60"
              }`}
              style={sphere.isActive ? { backgroundColor: sphere.color } : {}}
            >
              {sphere.name}
            </button>
          ))}
        </div>
      </section>

      {/* Level 02: Strategic Pillars */}
      <section className="space-y-10">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-caption font-mono text-muted uppercase tracking-[0.4em] mb-4">Level 02: Strategic Pillars</h2>
          <div className="h-px w-20 bg-border" />
        </div>

        {activeSpheres.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-border rounded-[3rem] text-center">
            <p className="text-secondary italic text-sm">No focus spheres selected. Toggle some spheres above to activate them as strategic pillars.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {activeSpheres.map((sphere) => {
              const sphereObjectives = initialData.activeObjectives.filter(obj => obj.sphereId === sphere.id);
              const sphereHabits = initialData.sphereLevelHabits.filter(h => h.sphereId === sphere.id);
              const hasStandards = sphereHabits.length > 0;

              return (
                <div key={sphere.id} className="flex flex-col space-y-6">
                  {/* Pillar Card */}
                  <div className="p-6 bg-surface border border-border rounded-[2rem] relative overflow-hidden hover:border-accent/40 transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${sphere.color}20`, border: `1px solid ${sphere.color}40` }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sphere.color }} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-text">{sphere.name}</h4>
                        <span className="text-caption font-mono text-muted">Core Pillar</span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                      <div className="h-full opacity-20" style={{ width: "100%", backgroundColor: sphere.color }} />
                    </div>
                  </div>

                  <div className="flex justify-center h-8">
                    <div className="w-px bg-gradient-to-b from-border to-transparent" />
                  </div>

                  {/* Sphere Standards */}
                  {hasStandards && (
                    <>
                      <div className="space-y-2">
                        <h5 className="text-label font-mono text-muted uppercase tracking-widest text-center mb-3">Standards</h5>
                        {(["MINIMUM", "MEDIUM", "DESIRED"] as SphereLevel[]).map(level => {
                          const habits = sphereHabits.filter(h => h.sphereLevel === level);
                          if (habits.length === 0) return null;
                          const cfg = LEVEL_CONFIG[level];
                          return (
                            <div key={level} className="flex items-start gap-2">
                              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                              <div className="flex-1 min-w-0">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
                                <div className="space-y-0.5 mt-0.5">
                                  {habits.map(h => (
                                    <p key={h.id} className="text-label text-secondary leading-tight truncate">{h.name}</p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-center h-8">
                        <div className="w-px bg-gradient-to-b from-border to-transparent" />
                      </div>
                    </>
                  )}

                  {/* Sprint OKRs */}
                  <div className="space-y-3">
                    <h5 className="text-label font-mono text-muted uppercase tracking-widest text-center mb-4">Current Sprint OKRs</h5>
                    {sphereObjectives.length === 0 ? (
                      <div className="p-4 border border-dashed border-border rounded-xl text-center">
                        <p className="text-label text-muted italic">No objectives this sprint</p>
                      </div>
                    ) : (
                      sphereObjectives.map(obj => (
                        <div key={obj.id} className="p-4 bg-raised/20 border border-border/50 rounded-2xl group hover:border-emerald-500/30 transition-colors">
                          <div className="flex items-start gap-3">
                            <Target size={12} className="text-emerald-500 mt-1 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-note font-bold text-text leading-tight group-hover:text-emerald-500 transition-colors">
                                {obj.title}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1 bg-border/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: "45%" }} />
                                </div>
                                <span className="text-[8px] font-mono text-muted">OKR</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Mission Dialog */}
      <Dialog
        isOpen={isVisionDialogOpen}
        onClose={() => setIsVisionDialogOpen(false)}
        title="5-Year Mission"
        description="Level 01: Your vision for the next 5 years."
        maxWidth="640px"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsVisionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveVision} disabled={loading || !newVisionTitle}>
              {loading ? "Saving..." : "Save Mission"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-caption font-mono uppercase text-muted tracking-widest">Mission Title</label>
            <Input
              value={newVisionTitle}
              onChange={(e) => setNewVisionTitle(e.target.value)}
              placeholder="e.g. The Sovereign Architect"
            />
          </div>
          <div className="space-y-2">
            <label className="text-caption font-mono uppercase text-muted tracking-widest">Description — Who will I be in 5 years?</label>
            <textarea
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm min-h-[120px] focus:outline-none focus:border-accent transition-colors resize-none"
              value={newVisionContent}
              onChange={(e) => setNewVisionContent(e.target.value)}
              placeholder="In 5 years, I am..."
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
