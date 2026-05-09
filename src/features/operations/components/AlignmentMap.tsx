"use client";

import React, { useState } from "react";
import { Brain, Target, Shield, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { upsertVisionAction } from "../actions/sprint-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ObjectiveData } from "../types";
import type { LifeSphereData } from "@/features/life/types";

interface AlignmentMapProps {
  initialData: {
    vision: { title: string; content: string | null } | null;
    spheres: LifeSphereData[];
    activeObjectives: ObjectiveData[];
  };
}

export function AlignmentMap({ initialData }: AlignmentMapProps) {
  const [vision, setVision] = useState(initialData.vision);
  const [isVisionDialogOpen, setIsVisionDialogOpen] = useState(false);
  const [newVisionTitle, setNewVisionTitle] = useState(vision?.title || "");
  const [newVisionContent, setNewVisionContent] = useState(vision?.content || "");
  const [loading, setLoading] = useState(false);

  const handleSaveVision = async () => {
    setLoading(true);
    const result = await upsertVisionAction(newVisionTitle, newVisionContent);
    if (result.success) {
      setVision(result.data);
      setIsVisionDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to save vision");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-16 py-10">
      {/* Level 01: Vision (The North Star) */}
      <section className="relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
            <Brain size={32} />
          </div>
          <h2 className="text-caption font-mono text-rose-500 uppercase tracking-[0.4em]">Level 01: Global Vision</h2>
          
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
                onClick={() => setIsVisionDialogOpen(true)}
              >
                <Edit2 size={14} />
              </Button>
            </div>
          ) : (
            <div 
              className="p-10 border-2 border-dashed border-border rounded-[2.5rem] cursor-pointer hover:border-rose-500/30 transition-colors w-full"
              onClick={() => setIsVisionDialogOpen(true)}
            >
              <p className="text-muted font-mono uppercase text-caption tracking-widest">Define your North Star</p>
            </div>
          )}
        </div>
      </section>

      {/* Level 02: Pillars (Life Spheres) & Level 04: Objectives */}
      <section className="space-y-10">
        <div className="flex flex-col items-center text-center mb-12">
           <h2 className="text-caption font-mono text-muted uppercase tracking-[0.4em] mb-4">Level 02: Strategic Pillars</h2>
           <div className="h-px w-20 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {initialData.spheres.map((sphere) => {
            const sphereObjectives = initialData.activeObjectives.filter(obj => obj.sphereId === sphere.id);
            
            return (
              <div key={sphere.id} className="flex flex-col space-y-6">
                {/* The Pillar */}
                <div className="p-6 bg-surface border border-border rounded-[2rem] relative overflow-hidden group hover:border-accent/40 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: sphere.color }}
                    >
                      {/* Simple icon mapping or use sphere.icon string */}
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text">{sphere.name}</h4>
                      <span className="text-caption font-mono text-muted">Core Pillar</span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent opacity-20" 
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* The Connection (Visual Line) */}
                <div className="flex justify-center h-8">
                   <div className="w-px bg-gradient-to-b from-border to-transparent" />
                </div>

                {/* Level 04: Objectives linked to this Pillar */}
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
                           <Target size={12} className="text-emerald-500 mt-1" />
                           <div className="flex-1">
                              <p className="text-note font-bold text-text leading-tight group-hover:text-emerald-500 transition-colors">
                                {obj.title}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                 <div className="flex-1 h-1 bg-border/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: '45%' }} />
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
      </section>

      {/* Vision Dialog */}
      <Dialog
        isOpen={isVisionDialogOpen}
        onClose={() => setIsVisionDialogOpen(false)}
        title="Your North Star"
        description="Level 01: Defining your ultimate destination."
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsVisionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveVision} disabled={loading || !newVisionTitle}>
              {loading ? "Saving..." : "Save Vision"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-caption font-mono uppercase text-muted tracking-widest">Vision Title</label>
            <Input 
              value={newVisionTitle} 
              onChange={(e) => setNewVisionTitle(e.target.value)} 
              placeholder="e.g. The Sovereign Architect"
            />
          </div>

          <div className="space-y-2">
            <label className="text-caption font-mono uppercase text-muted tracking-widest">Qualitative Description (The Why)</label>
            <textarea 
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-accent transition-colors"
              value={newVisionContent} 
              onChange={(e) => setNewVisionContent(e.target.value)} 
              placeholder="In 10 years, I am..."
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
