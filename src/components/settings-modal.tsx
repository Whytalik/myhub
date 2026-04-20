"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/dialog";
import { useSpace } from "./space-provider";
import { updateUserNameAction } from "@/features/profile/actions";
import { exportSystemAction, resetSystemAction, importSystemAction } from "@/features/system/actions/system-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  Trash2,
  Check,
  Loader2
} from "lucide-react";
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

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

function SortableDomainItem({ domain }: { domain: Domain }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: domain.id });

  const style = {
    transform: transform ? `translate3d(0px, ${Math.round(transform.y)}px, 0px)` : undefined,
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as const,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-3 p-2 border rounded-xl group transition-colors ${
        isDragging 
          ? "bg-accent text-bg border-accent shadow-2xl z-50 ring-4 ring-accent/20" 
          : "bg-raised/30 border-border/40 hover:border-accent/30"
      }`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className={`transition-colors cursor-grab active:cursor-grabbing p-1 touch-none ${
          isDragging ? "text-bg" : "text-muted group-hover:text-accent"
        }`}
      >
        <GripVertical size={14} />
      </div>
      <div className={`p-1 rounded-lg border transition-colors ${
        isDragging ? "bg-bg/20 border-bg/20" : "bg-bg border-border/60"
      }`}>
        <domain.icon size={14} className={isDragging ? "text-bg" : "text-secondary"} />
      </div>
      <span className="flex-1 text-[12px] font-bold">{domain.label}</span>
    </div>
  );
}

// --- Main Modal ---

export function SettingsModal({ 
  isOpen, 
  onClose,
  initialOrder,
  userName
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialOrder?: string[];
  userName?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "domains" | "data">("general");
  const { theme, setTheme } = useSpace();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(userName || "");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal name state when prop changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setDisplayName(userName || "");
    }
  }, [userName, isOpen]);
  
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

  const handleUpdateName = () => {
    if (!displayName || displayName === userName) return;
    
    startTransition(async () => {
      const result = await updateUserNameAction(displayName);
      if (result.success) {
        toast.success("Name updated successfully");
        router.refresh();
      } else {
        toast.error("Failed to update name");
      }
    });
  };

  const handleExport = async () => {
    const result = await exportSystemAction();
    if (result.success && result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `myhub-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("System state exported");
    } else {
      toast.error(result.error || "Export failed");
    }
  };

  const handleReset = async () => {
    startTransition(async () => {
      const result = await resetSystemAction();
      if (result.success) {
        toast.success("System reset complete");
        onClose();
        router.refresh();
      } else {
        toast.error("Reset failed");
      }
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        startTransition(async () => {
          const result = await importSystemAction(data);
          if (result.success) {
            toast.success("Data imported successfully");
            onClose();
            window.location.reload();
          } else {
            toast.error(result.error || "Import failed");
          }
        });
      } catch (err) {
        toast.error("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "domains", label: "Domains", icon: Layout },
    { id: "data", label: "Data", icon: Database },
  ] as const;

  return (
    <>
      <Dialog 
        isOpen={isOpen} 
        onClose={onClose} 
        title="System Settings" 
        description="Configure your Personal OS"
        maxWidth="800px"
        bare
        noScroll
      >
        <div className="flex h-[460px] -mx-6 -mb-6 mt-4 border-t border-border/30 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-44 border-r border-border/50 bg-raised/30 p-2 flex flex-col gap-1 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-accent text-bg shadow-sm" 
                    : "text-muted hover:text-text hover:bg-raised/80"
                }`}
              >
                <tab.icon size={14} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
              </button>
            ))}
            
            <div className="mt-auto p-2">
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent/5 border border-accent/10">
                 <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                 <span className="text-[8px] font-mono text-accent uppercase font-bold tracking-tighter">V1.2.0</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 bg-surface overflow-hidden flex flex-col">
            {activeTab === "general" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <section>
                  <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-3">Profile</h4>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted">Display Name</label>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-raised border border-border px-3 py-1.5 rounded-xl text-sm focus:border-accent/50 outline-none transition-all text-text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                      />
                      <button 
                        onClick={handleUpdateName}
                        disabled={isPending || !displayName || displayName === userName}
                        className="px-3 bg-accent text-bg rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 transition-all flex items-center gap-2 h-9"
                      >
                        {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Save
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                <section>
                  <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-3">Theme</h4>
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                       onClick={() => setTheme("dark")}
                       className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                         theme === "dark" ? "bg-accent/10 border-accent text-accent" : "bg-raised/30 border-border text-muted hover:text-text"
                       }`}
                     >
                        <div className="flex items-center gap-2">
                          <Moon size={14} />
                          <span className="text-[10px] font-bold uppercase">Dark Mode</span>
                        </div>
                        {theme === "dark" && <div className="w-1 h-1 rounded-full bg-accent" />}
                     </button>
                     <button 
                       onClick={() => setTheme("light")}
                       className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                         theme === "light" ? "bg-accent/10 border-accent text-accent" : "bg-raised/30 border-border text-muted hover:text-text"
                       }`}
                     >
                        <div className="flex items-center gap-2">
                          <Sun size={14} />
                          <span className="text-[10px] font-bold uppercase">Light Mode</span>
                        </div>
                        {theme === "light" && <div className="w-1 h-1 rounded-full bg-accent" />}
                     </button>
                     </div>
                     </section>
                     </div>
                     )}
            {activeTab === "domains" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300 h-full flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold">Domain Hierarchy</h4>
                  {isSaved && <span className="text-[9px] font-bold text-emerald-500 uppercase animate-pulse">Saved</span>}
                </div>
                
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                >
                  <SortableContext 
                    items={domains.map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-1.5 overflow-hidden">
                      {domains.map((domain) => (
                        <SortableDomainItem key={domain.id} domain={domain} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                <p className="text-[9px] text-muted mt-auto pt-3 text-center italic opacity-60">
                  Vertical drag to reorder.
                </p>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                <section>
                  <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-3">Data Management</h4>
                  <div className="grid grid-cols-1 gap-2">
                     <div className="p-3 bg-raised/30 border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <h5 className="text-[11px] font-bold">Export Database</h5>
                          <p className="text-[9px] text-muted">Complete JSON backup.</p>
                        </div>
                        <button onClick={handleExport} className="p-2 bg-accent text-bg rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20">
                          <Download size={14} strokeWidth={2.5} />
                        </button>
                     </div>

                     <div className="p-3 bg-raised/30 border border-border rounded-xl flex items-center justify-between">
                        <div>
                          <h5 className="text-[11px] font-bold">Import Backup</h5>
                          <p className="text-[9px] text-muted">Restore from file.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-surface border border-border rounded-lg hover:border-accent transition-all active:scale-95">
                            <Upload size={14} />
                          </button>
                        </div>
                     </div>
                     
                     <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-xl flex items-center justify-between">
                        <div>
                          <h5 className="text-[11px] font-bold text-red-500">System Reset</h5>
                          <p className="text-[9px] text-red-500/60">Wipe all records.</p>
                        </div>
                        <button onClick={() => setIsResetConfirmOpen(true)} className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all">
                          <Trash2 size={14} />
                        </button>
                     </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      <ConfirmationDialog 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleReset}
        title="Wipe Entire System?"
        description="This will permanently delete all your data. This action CANNOT be undone."
        confirmLabel={isPending ? "Resetting..." : "Wipe Everything"}
        variant="danger"
      />
    </>
  );
}
