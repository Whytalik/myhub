"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  GripVertical,
  ChefHat,
  Dumbbell,
  Sparkles,
  BookText,
  Languages,
  Package,
  RotateCcw
} from "lucide-react";

type System = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const DEFAULT_ORDER: System[] = [
  { id: "food",      label: "Food System",     icon: ChefHat },
  { id: "life",      label: "Life System",     icon: Sparkles },
  { id: "fitness",   label: "Fitness System",  icon: Dumbbell },
  { id: "library",   label: "Library System",  icon: BookText },
  { id: "languages", label: "Language System", icon: Languages },
  { id: "other",     label: "Misc / Other",    icon: Package },
];

export function SettingsForm({ initialOrder }: { initialOrder?: string[] }) {
  const [systems, setSystems] = useState<System[]>(() => {
    if (initialOrder) {
      const ordered = initialOrder
        .map(id => DEFAULT_ORDER.find(s => s.id === id))
        .filter(Boolean) as System[];
      const missing = DEFAULT_ORDER.filter(s => !initialOrder.includes(s.id));
      return [...ordered, ...missing];
    }
    return DEFAULT_ORDER;
  });
  
  const [isSaved, setIsSaved] = useState(false);

  const saveToStorage = (newSystems: System[]) => {
    const orderIds = newSystems.map(s => s.id);
    const orderString = JSON.stringify(orderIds);
    localStorage.setItem("sidebar-systems-order", orderString);
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `sidebar-systems-order=${orderString}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new Event("sidebar-order-updated"));
  };

  const moveSystem = (index: number, direction: 'up' | 'down') => {
    const newSystems = [...systems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= systems.length) return;
    [newSystems[index], newSystems[targetIndex]] = [newSystems[targetIndex], newSystems[index]];
    setSystems(newSystems);
    saveToStorage(newSystems);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
  };

  const resetOrder = () => {
    setSystems(DEFAULT_ORDER);
    saveToStorage(DEFAULT_ORDER);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
  };

  return (
    <div className="px-6 md:px-14 py-8 md:py-10">
      <div className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md pt-2 pb-6 mb-6 -mx-4 px-4">
        <Breadcrumb items={[{ label: "settings" }]} />
        <div className="flex justify-between items-start">
          <Heading title="Settings" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetOrder} className="gap-2">
              <RotateCcw size={14} /> Reset
            </Button>
            <div className="bg-accent/10 text-accent px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 border border-accent/20">
              <div className={`w-1.5 h-1.5 rounded-full bg-accent ${isSaved ? 'animate-ping' : ''}`} />
              {isSaved ? "Saved" : "Auto-saving"}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl">
        <section className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-raised/30">
            <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent font-bold">
              Sidebar Customization
            </h3>
            <p className="text-secondary text-[12px] mt-1">
              Drag or use arrows to reorder your workspace modules.
            </p>
          </div>
          <div className="p-2 flex flex-col gap-1">
            {systems.map((system, index) => (
              <div key={system.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-raised/50 transition-all border border-transparent hover:border-border/40 group">
                <div className="text-muted group-hover:text-accent transition-colors"><GripVertical size={18} /></div>
                <div className="p-2 rounded-lg bg-accent-muted text-accent"><system.icon size={18} /></div>
                <div className="flex-1"><span className="text-[14px] font-medium text-text">{system.label}</span></div>
                <div className="flex gap-1">
                  <button onClick={() => moveSystem(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text disabled:opacity-0 transition-all">↑</button>
                  <button onClick={() => moveSystem(index, 'down')} disabled={index === systems.length - 1} className="p-1.5 hover:bg-raised rounded-lg text-muted hover:text-text disabled:opacity-0 transition-all">↓</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
