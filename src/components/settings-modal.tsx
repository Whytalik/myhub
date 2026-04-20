"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { 
  User, 
  Palette, 
  Layout, 
  GripVertical,
  Database,
  Briefcase,
  Shield,
  Brain,
  Package,
  LucideIcon,
  Download,
  Upload,
  Sun,
  Moon,
  Trash2
} from "lucide-react";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

// --- Types & Data ---

type Domain = {
  id: string;
  label: string;
  icon: LucideIcon;
};

const DEFAULT_DOMAINS: Domain[] = [
  { id: "operations", label: "Operations", icon: Briefcase },
  { id: "health",     label: "Health",     icon: Shield },
  { id: "mind",       label: "Mind",       icon: Brain },
  { id: "wealth",     label: "Wealth",     icon: Database },
  { id: "vault",      label: "Vault",      icon: Package },
];

// --- Sortable Item Component ---

function SortableDomainItem({ domain, color = "#a3a3a3" }: { domain: Domain, color?: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: domain.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-4 p-3 bg-raised/30 border border-border/40 rounded-2xl group transition-all ${
        isDragging ? "shadow-2xl border-accent/50 bg-raised scale-[1.02] opacity-80" : "hover:border-accent/30"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-muted group-hover:text-accent transition-colors cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical size={16} />
      </div>
      <div className="p-2 rounded-xl bg-bg border border-border/60">
        <domain.icon size={16} className="text-secondary" />
      </div>
      <span className="flex-1 text-[13px] font-bold">{domain.label}</span>
    </div>
  );
}

// --- Main Modal ---

export function SettingsModal({ 
  isOpen, 
  onClose,
  initialOrder 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialOrder?: string[];
}) {
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "domains" | "data">("general");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [domains, setDomains] = useState<Domain[]>(() => {
    if (initialOrder) {
      const ordered = initialOrder
        .map(id => DEFAULT_DOMAINS.find(d => d.id === id))
        .filter(Boolean) as Domain[];
      const missing = DEFAULT_DOMAINS.filter(d => !initialOrder.includes(d.id));
      return [...ordered, ...missing];
    }
    return DEFAULT_DOMAINS;
  });

  const [isSaved, setIsSaved] = useState(false);

  // DnD Setup
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setDomains((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveDomainOrder(newOrder);
        return newOrder;
      });
    }
  };

  const saveDomainOrder = (newDomains: Domain[]) => {
    const orderIds = newDomains.map(d => d.id);
    const orderString = JSON.stringify(orderIds);
    localStorage.setItem("sidebar-domains-order", orderString);
    document.cookie = `sidebar-domains-order=${orderString}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new Event("sidebar-order-updated"));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "domains", label: "Domains", icon: Layout },
    { id: "data", label: "Data", icon: Database },
  ] as const;

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="System Settings" 
      description="Configure your Personal OS environment"
      maxWidth="850px"
      bare
    >
      <div className="flex min-h-[550px] -mx-6 -mb-6 mt-4 border-t border-border/30">
        {/* Sidebar Tabs */}
        <div className="w-56 border-r border-border/50 bg-raised/30 p-3 flex flex-col gap-1.5 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-accent text-bg shadow-lg shadow-accent/20 scale-[1.02]" 
                  : "text-muted hover:text-text hover:bg-raised/80"
              }`}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {tab.label}
            </button>
          ))}
          
          <div className="mt-auto p-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">V1.2.0-STABLE</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 bg-surface">
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-6">Profile Configuration</h4>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase text-muted">Display Name</label>
                    <input className="bg-raised border border-border px-4 py-2.5 rounded-xl text-sm focus:border-accent/50 outline-none transition-all" defaultValue="Vitalii" />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-6">Visual Theme</h4>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                     onClick={() => setTheme("dark")}
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                       theme === "dark" ? "bg-accent/10 border-accent text-accent" : "bg-raised/30 border-border text-muted hover:text-text"
                     }`}
                   >
                      <div className="flex items-center gap-3">
                        <Moon size={18} />
                        <span className="text-sm font-bold uppercase tracking-tight">Dark Mode</span>
                      </div>
                      {theme === "dark" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                   </button>
                   <button 
                     onClick={() => setTheme("light")}
                     className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                       theme === "light" ? "bg-accent/10 border-accent text-accent" : "bg-raised/30 border-border text-muted hover:text-text"
                     }`}
                   >
                      <div className="flex items-center gap-3">
                        <Sun size={18} />
                        <span className="text-sm font-bold uppercase tracking-tight">Light Mode</span>
                      </div>
                      {theme === "light" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                   </button>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-6">Interface Layout</h4>
                <div className="grid grid-cols-1 gap-4">
                   <div className="flex items-center justify-between p-4 bg-raised/30 border border-border rounded-2xl">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold">Sidebar Auto-expansion</span>
                        <span className="text-[11px] text-muted">Expand on mouse hover</span>
                      </div>
                      <div className="w-10 h-6 rounded-full bg-accent flex items-center px-1">
                        <div className="w-4 h-4 rounded-full bg-bg shadow-sm ml-auto" />
                      </div>
                   </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "domains" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-bold">Domain Hierarchy</h4>
                  {isSaved && <span className="text-[10px] font-bold text-emerald-500 uppercase animate-pulse">Saved</span>}
                </div>
                
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={domains.map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {domains.map((domain) => (
                        <SortableDomainItem key={domain.id} domain={domain} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                <p className="text-[11px] text-muted mt-6 text-center italic">
                  Drag the handle on the left to reorder domains.
                </p>
              </section>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-6">System Data Management</h4>
                <div className="grid grid-cols-1 gap-4">
                   <div className="p-6 bg-raised/30 border border-border rounded-[2rem] flex items-center justify-between group">
                      <div className="flex flex-col gap-1">
                        <h5 className="text-sm font-bold">Export Database</h5>
                        <p className="text-[11px] text-muted max-w-[200px]">Download all your data as a portable JSON file.</p>
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-accent text-bg rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                        <Download size={14} strokeWidth={2.5} />
                        Export JSON
                      </button>
                   </div>

                   <div className="p-6 bg-raised/30 border border-border rounded-[2rem] flex items-center justify-between group">
                      <div className="flex flex-col gap-1">
                        <h5 className="text-sm font-bold">Import Data</h5>
                        <p className="text-[11px] text-muted max-w-[200px]">Restore your system state from a backup file.</p>
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:border-accent/40 transition-all active:scale-95">
                        <Upload size={14} />
                        Select File
                      </button>
                   </div>
                   
                   <div className="p-6 border border-red-500/10 bg-red-500/5 rounded-[2rem] flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <h5 className="text-sm font-bold text-red-500">System Reset</h5>
                        <p className="text-[11px] text-red-500/60 max-w-[200px]">Permanently clear all data and reset to default.</p>
                      </div>
                      <button className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all">
                        <Trash2 size={14} />
                        Reset System
                      </button>
                   </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
