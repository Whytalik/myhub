"use client";

import React, { useState } from "react";
import { Compass, Sparkles, Shield, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { upsertAnnualCompassAction } from "../actions/sprint-actions";

interface AnnualCompassViewProps {
  initialData: {
    id?: string;
    year: number;
    theme: string | null;
    wigs: string | null;
    focusAreas: string | null;
  } | null;
}

export function AnnualCompassView({ initialData }: AnnualCompassViewProps) {
  const currentYear = new Date().getFullYear();
  const [compass, setCompass] = useState(initialData || { year: currentYear, theme: null, wigs: null, focusAreas: null });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(compass.theme || "");
  const [wigs, setWigs] = useState(compass.wigs || "");
  const [focusAreas, setFocusAreas] = useState(compass.focusAreas || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      const saved = await upsertAnnualCompassAction({
        id: compass.id,
        year: compass.year,
        theme,
        wigs,
        focusAreas
      });
      setCompass(saved);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save compass:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <section className="bg-surface border border-border p-12 rounded-[3rem] text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0" />
        
        <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center mx-auto mb-8 text-amber-500">
          <Compass size={40} />
        </div>

        <h2 className="text-[10px] font-mono text-amber-500 uppercase tracking-[0.5em] mb-6">Level 03: Annual Theme</h2>
        
        <div className="py-12 border-y border-border/40 relative group/theme">
          {compass.theme ? (
            <p className="text-5xl md:text-6xl font-heading text-text uppercase tracking-tight">
              {compass.theme}
            </p>
          ) : (
            <p className="text-4xl font-heading text-muted uppercase italic opacity-20">No Theme Defined</p>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/theme:opacity-100 transition-opacity"
            onClick={() => setIsDialogOpen(true)}
          >
            <Edit2 size={16} />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                 <Sparkles size={16} />
                 <h3 className="text-[11px] font-mono uppercase font-bold tracking-widest">Wildly Important Goals</h3>
              </div>
              <div className="p-6 bg-raised/30 border border-border rounded-2xl min-h-[120px]">
                 {compass.wigs ? (
                   <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">{compass.wigs}</p>
                 ) : (
                   <p className="text-xs text-muted italic">What are your 1-2 non-negotiable achievements for {currentYear}?</p>
                 )}
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                 <Shield size={16} />
                 <h3 className="text-[11px] font-mono uppercase font-bold tracking-widest">Strategic Focus Areas</h3>
              </div>
              <div className="p-6 bg-raised/30 border border-border rounded-2xl min-h-[120px]">
                 {compass.focusAreas ? (
                   <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">{compass.focusAreas}</p>
                 ) : (
                   <p className="text-xs text-muted italic">Which areas of life require the most energy this year?</p>
                 )}
              </div>
           </div>
        </div>
      </section>

      <div className="flex justify-center">
        {!compass.theme && (
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2 px-10 rounded-full">
            <Plus size={16} />
            Initialize Annual Compass
          </Button>
        )}
      </div>

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`${currentYear} Annual Compass`}
        description="Level 03: The flavor and strategic focus of your year."
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading || !theme}>
              {loading ? "Saving..." : "Save Compass"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest text-amber-500">Annual Theme</label>
            <Input 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)} 
              placeholder="e.g. THE YEAR OF LEVERAGE"
              className="uppercase font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest text-amber-500">Wildly Important Goals (WIGs)</label>
            <textarea 
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-amber-500/40 transition-colors"
              value={wigs} 
              onChange={(e) => setWigs(e.target.value)} 
              placeholder="1. Build $100k ARR business&#10;2. Run a marathon under 4h"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted tracking-widest text-amber-500">Focus Areas</label>
            <textarea 
              className="w-full bg-surface border border-border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-amber-500/40 transition-colors"
              value={focusAreas} 
              onChange={(e) => setFocusAreas(e.target.value)} 
              placeholder="Health (Zone 2 cardio), Wealth (SaaS development)"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
