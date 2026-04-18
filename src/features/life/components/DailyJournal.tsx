"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function DailyJournal() {
  const [content, setContent] = useState("");
  const [focus, setFocus] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [gratitude, setGratitude] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem("daily-journal-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setContent(parsed.content || "");
        setFocus(parsed.focus || "");
        setEnergy(parsed.energy || null);
        setGratitude(parsed.gratitude || "");
        if (parsed.savedAt) setLastSaved(new Date(parsed.savedAt));
      } catch (e) {
        console.error("Failed to load journal draft", e);
      }
    }
  }, []);

  const saveDraft = () => {
    const data = { content, focus, energy, gratitude, savedAt: new Date() };
    localStorage.setItem("daily-journal-draft", JSON.stringify(data));
    setLastSaved(new Date());
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  // Auto-save on any change
  useEffect(() => {
    if (!content && !focus && !energy && !gratitude) return;
    
    const timer = setTimeout(() => {
      saveDraft();
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, focus, energy, gratitude]);

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      {/* Top Controls */}
      <div className="flex justify-between items-center bg-surface border border-border px-8 py-5 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-3xl leading-none tracking-tight">Daily Journal</h2>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted uppercase tracking-widest">
            <Clock size={12} className="text-accent" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            {lastSaved && (
              <span className="text-[10px] font-mono text-muted flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                <CheckCircle2 size={12} className={isSaving ? "text-accent animate-pulse" : "text-emerald-500/70"} />
                {isSaving ? "Saving..." : `Last saved ${lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            )}
            <span className="text-[9px] font-mono text-accent/50 uppercase tracking-tighter">Auto-save enabled</span>
          </div>
          <button 
            onClick={saveDraft}
            className="flex items-center gap-2.5 bg-accent text-bg px-5 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-[0.15em] font-bold hover:shadow-lg hover:shadow-accent/20 active:scale-95 transition-all"
          >
            <Save size={14} />
            Commit Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Entry Space */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-8 min-h-[500px] flex flex-col focus-within:border-accent/30 transition-colors shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] font-mono text-muted uppercase tracking-[0.4em] px-4">Deep Reflection</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>
            
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none resize-none text-text text-lg leading-relaxed placeholder:text-muted/20 placeholder:italic font-light tracking-wide"
              placeholder="What did you achieve today? What challenges did you face? Any new insights or breakthroughs? Write freely..."
            />
            
            <div className="mt-8 pt-6 border-t border-border/30 flex justify-between items-center">
               <span className="text-[10px] font-mono text-muted/60">{content.split(/\s+/).filter(Boolean).length} words</span>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted group cursor-help">
                    <AlertCircle size={12} className="group-hover:text-accent transition-colors" />
                    <span>Focus on outcomes, not just activities.</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em] mb-6">Today&apos;s Focus</h4>
            <input 
              type="text" 
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full bg-raised/50 border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-muted/40 focus:border-accent/40 outline-none transition-all" 
              placeholder="Primary objective..." 
            />
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em] mb-6">Vitality Index</h4>
            <div className="flex justify-between items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button 
                  key={level}
                  onClick={() => setEnergy(level)}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-mono transition-all ${
                    energy === level 
                      ? "bg-accent border-accent text-bg font-bold scale-110 shadow-lg shadow-accent/20" 
                      : "bg-raised border-border/50 text-muted hover:text-text hover:border-accent/40"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="text-[10px] font-mono text-accent uppercase tracking-[0.3em] mb-6">Gratitude</h4>
            <textarea 
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full h-32 bg-raised/50 border border-border rounded-xl px-4 py-3 text-xs text-secondary leading-relaxed placeholder:text-muted/40 focus:border-accent/40 outline-none transition-all resize-none" 
              placeholder="One thing you're thankful for..." 
            />
          </div>

          <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl italic text-xs text-secondary leading-relaxed">
            &ldquo;The secret of change is to focus all of your energy, not on fighting the old, but on building the new.&rdquo;
            <span className="block mt-2 font-mono text-[10px] text-accent not-italic uppercase tracking-widest">— Socrates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
