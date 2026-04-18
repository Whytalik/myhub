"use client";

import React, { useState } from "react";
import { VocabularyItem } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addVocabularyAction } from "../actions/language-actions";
import { toast } from "sonner";
import { Search, Plus, BookOpen, Calendar, Trash2, Hash } from "lucide-react";

interface VocabularyManagerProps {
  userLanguageId: string;
  initialItems: VocabularyItem[];
}

export function VocabularyManager({ userLanguageId, initialItems }: VocabularyManagerProps) {
  const [items, setItems] = useState<VocabularyItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word || !translation) return;

    setIsAdding(true);
    try {
      const result = await addVocabularyAction({
        userLanguageId,
        word,
        translation,
      });

      if (result.success) {
        toast.success("Lexical data mapped successfully");
        setItems([result.data as VocabularyItem, ...items]);
        setWord("");
        setTranslation("");
      } else {
        toast.error(result.error || "Neural mapping failed");
      }
    } catch (error) {
      toast.error("Process interruption");
    } finally {
      setIsAdding(false);
    }
  };

  const filtered = items.filter(
    (item) =>
      item.word.toLowerCase().includes(search.toLowerCase()) ||
      item.translation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700">
      {/* Search & Statistics Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lexeme..." 
            className="pl-10 h-10 bg-surface/40 border-border/50 rounded-xl text-[12px] focus-visible:ring-violet"
          />
        </div>
        
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-4">
              <Hash size={16} className="text-violet/60" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-muted uppercase tracking-[0.2em] leading-none mb-1.5 font-bold">Lexemes</span>
                <span className="text-lg font-black uppercase leading-none">{items.length}</span>
              </div>
           </div>
           <div className="h-8 w-px bg-border/40" />
           <div className="flex items-center gap-4">
              <Calendar size={16} className="text-violet/60" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-muted uppercase tracking-[0.2em] leading-none mb-1.5 font-bold">SRS Queue</span>
                <span className="text-lg font-black uppercase leading-none text-violet">
                  {items.filter(i => new Date(i.nextReview) <= new Date()).length}
                </span>
              </div>
           </div>
        </div>
      </div>

      {/* Notion-style Data Table */}
      <div className="bg-surface/30 border border-border/40 rounded-[32px] overflow-hidden shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-12 gap-4 p-5 bg-raised/30 border-b border-border/40 text-[10px] font-mono text-muted uppercase tracking-[0.25em] px-10 font-black">
          <div className="col-span-4">Term / Phrase</div>
          <div className="col-span-4">Semantic Mapping</div>
          <div className="col-span-3">Next Optimization</div>
          <div className="col-span-1 text-right">Status</div>
        </div>
        
        {/* Inline Add Row */}
        <form onSubmit={handleAdd} className="grid grid-cols-12 gap-4 p-4 px-10 bg-violet/5 border-b border-border/20 items-center group">
          <div className="col-span-4">
            <Input 
              variant="inline"
              value={word} 
              onChange={(e) => setWord(e.target.value)} 
              placeholder="Enter new term..."
              className="font-black uppercase tracking-tight placeholder:text-violet/20 placeholder:font-bold text-sm focus-visible:ring-0"
            />
          </div>
          <div className="col-span-4">
            <Input 
              variant="inline"
              value={translation} 
              onChange={(e) => setTranslation(e.target.value)} 
              placeholder="Define translation..."
              className="text-secondary font-medium placeholder:text-muted/30 text-sm focus-visible:ring-0"
            />
          </div>
          <div className="col-span-3 text-[10px] font-mono text-violet/40 uppercase tracking-widest font-bold">
            Pending Neural Link
          </div>
          <div className="col-span-1 text-right">
            <Button 
              type="submit" 
              size="sm" 
              disabled={isAdding || !word || !translation}
              className="h-8 w-8 p-0 rounded-xl shadow-lg shadow-violet/20 bg-violet text-bg hover:bg-violet/90"
            >
              <Plus size={16} strokeWidth={3} />
            </Button>
          </div>
        </form>

        <div className="divide-y divide-border/20">
          {filtered.length === 0 ? (
            <div className="p-32 text-center">
               <BookOpen size={48} className="mx-auto text-muted/10 mb-6" />
               <p className="text-muted font-mono text-[11px] uppercase tracking-[0.3em] font-black">No neural data mapped</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-5 px-10 items-center hover:bg-raised/40 transition-all group">
                <div className="col-span-4 flex items-center gap-3">
                  <span className="font-black uppercase tracking-tight text-sm text-text group-hover:text-violet transition-colors">{item.word}</span>
                </div>
                <div className="col-span-4 text-secondary text-sm font-medium opacity-80">{item.translation}</div>
                <div className="col-span-3 flex items-center gap-2 text-muted text-[10px] font-mono uppercase tracking-wider font-bold">
                  <Calendar size={12} className="text-violet/40" />
                  {new Date(item.nextReview).toLocaleDateString()}
                </div>
                <div className="col-span-1 text-right">
                  <button className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
