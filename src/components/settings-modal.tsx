"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/dialog";
import { useSpace } from "./space-provider";
import { updateUserNameAction } from "@/features/profile/actions";
import { exportSystemAction, resetSystemAction, importSystemAction } from "@/features/system/actions/system-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ICON_LIBRARY, IconName } from "@/lib/constants/icons";
import { SYSTEM_COLORS } from "@/lib/constants/colors";
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
  Loader2,
  Pencil
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

type Space = {
  id: string;
  label: string;
  icon: LucideIcon;
  domainId: string;
};

const DEFAULT_DOMAINS: Domain[] = [
  { id: "operations", label: "Operations", icon: Briefcase },
  { id: "health",     label: "Health",     icon: Shield },
  { id: "mind",       label: "Mind",       icon: Brain },
  { id: "wealth",     label: "Wealth",     icon: Database },
  { id: "vault",      label: "Vault",      icon: Package },
];

const DEFAULT_SPACES: Space[] = [
  { id: "planning",  label: "Planning Space",  icon: ICON_LIBRARY.Planning, domainId: "operations" },
  { id: "life",      label: "Life Space",      icon: ICON_LIBRARY.Life,     domainId: "operations" },
  { id: "food",      label: "Food Space",      icon: ICON_LIBRARY.Food,     domainId: "health" },
  { id: "fitness",   label: "Fitness Space",   icon: ICON_LIBRARY.Fitness,  domainId: "health" },
  { id: "languages", label: "Language Space",  icon: ICON_LIBRARY.Languages, domainId: "mind" },
  { id: "library",   label: "Library Space",   icon: ICON_LIBRARY.Library,   domainId: "mind" },
  { id: "trading",   label: "Trading Space",   icon: ICON_LIBRARY.Trading,   domainId: "wealth" },
  { id: "other",     label: "Misc / Other",    icon: ICON_LIBRARY.Vault,     domainId: "vault" },
];

// --- Sortable Item Component ---

function SortableItem({ id, label, icon: Icon, color = "#a3a3a3", onEdit }: { id: string, label: string, icon: LucideIcon, color?: string, onEdit?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

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
      <div className={`p-1.5 rounded-lg border transition-colors ${
        isDragging ? "bg-bg/20 border-bg/20" : "bg-bg border-border/60"
      }`}>
        <Icon size={14} className={isDragging ? "text-bg" : "text-secondary"} strokeWidth={2.5} />
      </div>
      <span className="flex-1 text-[12px] font-bold truncate">{label}</span>
      {!isDragging && onEdit && (
        <button onClick={onEdit} className="p-1.5 text-muted hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
          <Pencil size={12} />
        </button>
      )}
    </div>
  );
}

// --- Pickers ---

function IconPicker({ currentIcon, onSelect, color }: { currentIcon: string, onSelect: (name: string) => void, color: string }) {
  return (
    <div className="grid grid-cols-6 gap-1 p-2 max-h-32 overflow-y-auto scrollbar-hide bg-bg/50 rounded-xl border border-border/40">
      {Object.entries(ICON_LIBRARY).map(([name, Icon]) => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`p-2 rounded-lg transition-all hover:bg-raised flex items-center justify-center ${currentIcon === name ? "ring-2 ring-accent bg-accent/10" : ""}`}
        >
          <Icon size={14} style={{ color: currentIcon === name ? color : undefined }} />
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ currentColor, onSelect }: { currentColor: string, onSelect: (hex: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-bg/50 rounded-xl border border-border/40">
      {SYSTEM_COLORS.map((c) => (
        <button
          key={c.hex}
          onClick={() => onSelect(c.hex)}
          className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${currentColor === c.hex ? "ring-2 ring-text ring-offset-2 ring-offset-bg" : ""}`}
          style={{ backgroundColor: c.hex }}
          title={c.label}
        />
      ))}
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
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "domains" | "spaces" | "data">("general");
  const { theme, setTheme } = useSpace();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(userName || "");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customization State
  const [editingItem, setEditingItem] = useState<{ type: 'domain' | 'space', id: string } | null>(null);
  const [customizations, setCustomizations] = useState<Record<string, { icon?: string, color?: string }>>({});

  useEffect(() => {
    if (isOpen) {
      setDisplayName(userName || "");
      const saved = localStorage.getItem("system-customizations");
      if (saved) setCustomizations(JSON.parse(saved));
    }
  }, [userName, isOpen]);
  
  const [domains, setDomains] = useState<Domain[]>(DEFAULT_DOMAINS);
  const [spaces, setSpaces] = useState<Space[]>(DEFAULT_SPACES);
  const [isSaved, setIsSaved] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndDomains = (event: DragEndEvent) => {
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

  const handleDragEndSpaces = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSpaces((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveSpaceOrder(newOrder);
        return newOrder;
      });
    }
  };

  const saveDomainOrder = (newDomains: Domain[]) => {
    const orderIds = newDomains.map(d => d.id);
    localStorage.setItem("sidebar-domains-order", JSON.stringify(orderIds));
    document.cookie = `sidebar-domains-order=${JSON.stringify(orderIds)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new Event("sidebar-order-updated"));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
  };

  const saveSpaceOrder = (newSpaces: Space[]) => {
    localStorage.setItem("sidebar-spaces-order", JSON.stringify(newSpaces.map(s => s.id)));
    window.dispatchEvent(new Event("sidebar-order-updated"));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1000);
  };

  const updateCustomization = (id: string, key: 'icon' | 'color', value: string) => {
    const next = { ...customizations, [id]: { ...customizations[id], [key]: value } };
    setCustomizations(next);
    localStorage.setItem("system-customizations", JSON.stringify(next));
    window.dispatchEvent(new Event("system-customizations-updated"));
  };

  const handleUpdateName = () => {
    if (!displayName || displayName === userName) return;
    startTransition(async () => {
      const result = await updateUserNameAction(displayName);
      if (result.success) {
        toast.success("Name updated");
        router.refresh();
      } else {
        toast.error("Failed to update");
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
      a.download = `myhub-backup.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    }
  };

  const handleReset = async () => {
    startTransition(async () => {
      const result = await resetSystemAction();
      if (result.success) {
        toast.success("System reset");
        onClose();
        router.refresh();
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
            toast.success("Imported");
            onClose();
            window.location.reload();
          }
        });
      } catch { toast.error("Invalid file"); }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "domains", label: "Domains", icon: Briefcase },
    { id: "spaces", label: "Spaces", icon: Layout },
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
        <div className="flex h-[460px] -mx-6 -mb-6 mt-4 border-t border-border/30 overflow-hidden text-text">
          {/* Sidebar Tabs */}
          <div className="w-44 border-r border-border/50 bg-raised/30 p-2 flex flex-col gap-1 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setEditingItem(null); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[12px] font-bold transition-all ${
                  activeTab === tab.id ? "bg-accent text-bg shadow-sm" : "text-muted hover:text-text hover:bg-raised/80"
                }`}
              >
                <tab.icon size={14} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
              </button>
            ))}
            <div className="mt-auto p-2 text-center">
               <span className="text-[8px] font-mono text-accent uppercase font-bold tracking-tighter opacity-40">V1.2.5</span>
            </div>
          </div>

          {/* Content Area - SCROLL ENABLED HERE */}
          <div className="flex-1 bg-surface overflow-hidden relative">
            <div className="h-full overflow-y-auto scrollbar-hide p-6">
              
              {editingItem && (
                <div className="absolute inset-0 z-[60] bg-surface p-6 animate-in slide-in-from-right-4 duration-300 overflow-y-auto scrollbar-hide">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent font-bold">Edit {editingItem.id}</h4>
                    <button onClick={() => setEditingItem(null)} className="text-[10px] font-bold uppercase hover:text-accent">Close</button>
                  </div>
                  <div className="space-y-6">
                    <section>
                      <label className="text-[9px] font-bold uppercase text-muted block mb-2">Icon</label>
                      <IconPicker 
                        currentIcon={customizations[editingItem.id]?.icon || ""} 
                        onSelect={(icon) => updateCustomization(editingItem.id, 'icon', icon)} 
                        color={customizations[editingItem.id]?.color || "#a3a3a3"}
                      />
                    </section>
                    <section>
                      <label className="text-[9px] font-bold uppercase text-muted block mb-2">Color</label>
                      <ColorPicker 
                        currentColor={customizations[editingItem.id]?.color || "#a3a3a3"} 
                        onSelect={(color) => updateCustomization(editingItem.id, 'color', color)} 
                      />
                    </section>
                  </div>
                </div>
              )}

              {activeTab === "general" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <section>
                    <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-3">Profile</h4>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-muted">Display Name</label>
                      <div className="flex gap-2">
                        <input className="flex-1 bg-raised border border-border px-3 py-1.5 rounded-xl text-sm outline-none transition-all text-text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        <button onClick={handleUpdateName} disabled={isPending} className="px-3 bg-accent text-bg rounded-xl text-[10px] font-bold uppercase disabled:opacity-30 flex items-center gap-2 h-9">
                          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
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
                       <button onClick={() => setTheme("dark")} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${theme === "dark" ? "bg-accent/10 border-accent text-accent" : "bg-raised/30 border-border text-muted hover:text-text"}`}>
                          <div className="flex items-center gap-2"><Moon size={14} /><span className="text-[10px] font-bold uppercase">Dark</span></div>
                          {theme === "dark" && <div className="w-1 h-1 rounded-full bg-accent" />}
                       </button>
                       <button onClick={() => setTheme("light")} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${theme === "light" ? "bg-accent/10 border-accent text-accent" : "bg-raised/30 border-border text-muted hover:text-text"}`}>
                          <div className="flex items-center gap-2"><Sun size={14} /><span className="text-[10px] font-bold uppercase">Light</span></div>
                          {theme === "light" && <div className="w-1 h-1 rounded-full bg-accent" />}
                       </button>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "domains" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold">Domains</h4>
                    {isSaved && <span className="text-[9px] font-bold text-emerald-500 uppercase animate-pulse">Saved</span>}
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndDomains} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                    <SortableContext items={domains.map(d => d.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-1.5 pb-2">
                        {domains.map((domain) => (
                          <SortableItem key={domain.id} id={domain.id} label={domain.label} icon={ICON_LIBRARY[customizations[domain.id]?.icon as IconName] || domain.icon} color={customizations[domain.id]?.color} onEdit={() => setEditingItem({ type: 'domain', id: domain.id })} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-[9px] text-muted pt-3 text-center italic opacity-60">Vertical drag to reorder.</p>
                </div>
              )}

              {activeTab === "spaces" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold">Spaces</h4>
                    {isSaved && <span className="text-[9px] font-bold text-emerald-500 uppercase animate-pulse">Saved</span>}
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSpaces} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                    <SortableContext items={spaces.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-1.5 pb-2">
                        {spaces.map((space) => (
                          <SortableItem key={space.id} id={space.id} label={space.label} icon={ICON_LIBRARY[customizations[space.id]?.icon as IconName] || space.icon} color={customizations[space.id]?.color} onEdit={() => setEditingItem({ type: 'space', id: space.id })} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-[9px] text-muted pt-3 text-center italic opacity-60">Vertical drag to reorder.</p>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                  <h4 className="text-[8px] font-mono uppercase tracking-[0.2em] text-accent font-bold mb-3">Management</h4>
                  <div className="grid grid-cols-1 gap-2">
                     <div className="p-3 bg-raised/30 border border-border rounded-xl flex items-center justify-between">
                        <div><h5 className="text-[11px] font-bold">Export JSON</h5><p className="text-[9px] text-muted">Complete backup.</p></div>
                        <button onClick={handleExport} className="p-2 bg-accent text-bg rounded-lg hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20"><Download size={14} strokeWidth={2.5} /></button>
                     </div>
                     <div className="p-3 bg-raised/30 border border-border rounded-xl flex items-center justify-between">
                        <div><h5 className="text-[11px] font-bold">Import Backup</h5><p className="text-[9px] text-muted">Restore state.</p></div>
                        <div className="flex items-center gap-2">
                          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-surface border border-border rounded-lg hover:border-accent transition-all active:scale-95"><Upload size={14} /></button>
                        </div>
                     </div>
                     <div className="p-3 border border-red-500/10 bg-red-500/5 rounded-xl flex items-center justify-between">
                          <div><h5 className="text-[11px] font-bold text-red-500">Reset System</h5><p className="text-[9px] text-red-500/60">Wipe all records.</p></div>
                          <button onClick={() => setIsResetConfirmOpen(true)} className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all"><Trash2 size={14} /></button>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>

      <ConfirmationDialog 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleReset}
        title="Wipe System?"
        description="Permanently delete all data. CANNOT be undone."
        confirmLabel={isPending ? "Resetting..." : "Wipe Everything"}
        variant="danger"
      />
    </>
  );
}
