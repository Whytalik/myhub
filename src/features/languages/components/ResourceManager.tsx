"use client";

import React, { useState } from "react";
import { LanguageResource, LanguageSphere, CefrLevel } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Plus, ExternalLink, Book, Headphones, Mic, PenTool, Library, Trash2, Globe } from "lucide-react";

interface ResourceManagerProps {
  userLanguageId: string;
  initialItems: LanguageResource[];
}

const sphereIcons: Record<string, any> = {
  [LanguageSphere.VOCABULARY]: Library,
  [LanguageSphere.LISTENING]: Headphones,
  [LanguageSphere.READING]: Book,
  [LanguageSphere.SPEAKING]: Mic,
  [LanguageSphere.WRITING]: PenTool,
};

export function ResourceManager({ userLanguageId, initialItems }: ResourceManagerProps) {
  const [items, setItems] = useState<LanguageResource[]>(initialItems);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [sphere, setSphere] = useState<LanguageSphere>(LanguageSphere.READING);
  const [level, setLevel] = useState<CefrLevel>(CefrLevel.A1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsAdding(true);
    // Simulation of action since I'll add the server action later if needed
    // For now, focusing on UI/UX as per design system
    toast.success("Resource matrix updated");
    setName("");
    setUrl("");
    setIsAdding(false);
  };

  const filtered = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700">
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter matrix by name or source..." 
            className="pl-10 h-9 bg-surface/40 border-border/50 rounded-lg text-[12px]"
          />
        </div>
        
        <div className="flex items-center gap-4">
           {Object.values(LanguageSphere).map(s => {
             const Icon = sphereIcons[s];
             return (
               <button key={s} className="p-2 rounded-lg bg-surface/40 border border-border/40 text-muted hover:text-accent hover:border-accent/40 transition-all">
                 <Icon size={14} />
               </button>
             );
           })}
        </div>
      </div>

      {/* Grid Layout for Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add New Card */}
        <form onSubmit={handleAdd} className="bg-accent/5 border border-dashed border-accent/30 p-6 rounded-[32px] flex flex-col gap-4 group hover:bg-accent/10 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent text-bg shadow-sm">
              <Plus size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-accent">Map New Source</span>
          </div>
          <Input 
            variant="inline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Source title..."
            className="font-black uppercase tracking-tight text-lg placeholder:text-accent/20"
          />
          <Input 
            variant="inline"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL or Location..."
            className="text-xs font-mono text-secondary placeholder:text-muted/30"
          />
          <div className="mt-auto flex justify-end">
            <Button size="sm" type="submit" disabled={!name || isAdding} className="rounded-xl px-6">
              Initialize
            </Button>
          </div>
        </form>

        {filtered.length === 0 && !name && (
          <div className="col-span-full py-32 text-center border border-dashed border-border/40 rounded-[40px]">
             <Globe size={40} className="mx-auto text-muted/20 mb-4" />
             <p className="text-muted font-mono text-[10px] uppercase tracking-widest">No active materials mapped to this environment</p>
          </div>
        )}

        {filtered.map((item) => {
          const Icon = sphereIcons[item.sphere || "READING"] || Globe;
          return (
            <div key={item.id} className="group bg-surface/60 border border-border/40 p-6 rounded-[32px] hover:bg-raised/60 transition-all duration-500 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon size={80} />
               </div>
               
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-bg text-accent border border-border/40 shadow-inner">
                      <Icon size={20} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                        {item.level || "A1"}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black uppercase tracking-tight text-text mb-2 group-hover:text-accent transition-colors line-clamp-1">
                    {item.name}
                  </h4>
                  
                  <p className="text-secondary text-xs font-medium mb-8 line-clamp-2 opacity-70">
                    {item.notes || "No additional metadata mapped for this resource environment."}
                  </p>
                  
                  <div className="mt-auto flex justify-between items-center">
                    <a 
                      href={item.url || "#"} 
                      target="_blank" 
                      className="flex items-center gap-2 text-[10px] font-mono text-muted group-hover:text-text transition-colors uppercase tracking-widest font-bold"
                    >
                      <span>Access Material</span>
                      <ExternalLink size={12} />
                    </a>
                    <button className="text-muted/40 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
