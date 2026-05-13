"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/dialog";
import { useSpace } from "./space-provider";
import { updateUserNameAction, setPrivateTaskPasswordAction } from "@/features/profile/actions";
import { exportSystemAction, resetSystemAction, importSystemAction } from "@/features/system/actions/system-actions";
import { seedVisualPlanAction } from "@/features/system/actions/seed-action";
import { savePushSubscriptionAction, sendTestNotificationAction, getPushSubscriptionCountAction } from "@/features/system/actions/push-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ICON_LIBRARY, IconName } from "@/lib/constants/icons";
import { SYSTEM_COLORS } from "@/lib/constants/colors";
import { SPACE_THEMES } from "@/lib/spaces";
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
  ChevronDown,
  Lock,
  Bell,
  Smartphone,
  X
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
  { id: "nutrition", label: "Nutrition Space", icon: ICON_LIBRARY.Food,     domainId: "health" },
  { id: "fitness",   label: "Fitness Space",   icon: ICON_LIBRARY.Fitness,  domainId: "health" },
  { id: "languages", label: "Language Space",  icon: ICON_LIBRARY.Languages, domainId: "mind" },
  { id: "library",   label: "Library Space",   icon: ICON_LIBRARY.Library,   domainId: "mind" },
  { id: "trading",   label: "Trading Space",   icon: ICON_LIBRARY.Trading,   domainId: "wealth" },
  { id: "other",     label: "Misc / Other",    icon: ICON_LIBRARY.Vault,     domainId: "vault" },
];

function IconPicker({ currentIcon, onSelect, color }: { currentIcon: string, onSelect: (name: string) => void, color: string }) {
  return (
    <div className="grid grid-cols-8 gap-1 p-2 max-h-32 overflow-y-auto scrollbar-hide bg-bg/30 rounded-lg border border-border/20 mt-2">
      {Object.entries(ICON_LIBRARY).map(([name, Icon]) => (
        <button
          key={name}
          onClick={(e) => { e.stopPropagation(); onSelect(name); }}
          className={`p-1.5 rounded-md transition-all hover:bg-surface-hover flex items-center justify-center ${currentIcon === name ? "bg-accent/20 ring-1 ring-accent/30" : ""}`}
        >
          <Icon size={12} style={{ color: currentIcon === name ? color : undefined }} />
        </button>
      ))}
    </div>
  );
}

function ColorPicker({ currentColor, onSelect }: { currentColor: string, onSelect: (hex: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-bg/30 rounded-lg border border-border/20 mt-2">
      {SYSTEM_COLORS.map((c) => (
        <button
          key={c.hex}
          onClick={(e) => { e.stopPropagation(); onSelect(c.hex); }}
          className={`w-4 h-4 rounded-full transition-transform hover:scale-125 ${currentColor.toLowerCase() === c.hex.toLowerCase() ? "ring-1 ring-text ring-offset-1 ring-offset-bg" : ""}`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function SortableItem({
  id,
  label,
  icon: Icon,
  color,
  isSelected,
  onSelect,
  onUpdate,
  currentIconName
}: {
  id: string,
  label: string,
  icon: LucideIcon,
  color: string,
  isSelected: boolean,
  onSelect: () => void,
  onUpdate: (key: 'icon' | 'color', val: string) => void,
  currentIconName: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

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
      onClick={onSelect}
      className={`flex flex-col border rounded-lg transition-all cursor-pointer overflow-hidden ${
        isDragging
          ? "bg-accent text-bg border-accent shadow-elevated z-50 ring-4 ring-accent/20 scale-[1.02]"
          : isSelected
            ? "bg-surface-hover border-accent/30"
            : "bg-surface/50 border-border/30 hover:border-accent/20"
      }`}
    >
      <div className="flex items-center gap-3 p-2.5">
        <div
          {...attributes}
          {...listeners}
          className={`p-1 touch-none transition-colors ${isDragging ? "text-bg" : "text-muted hover:text-accent"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>
        <div className={`p-1.5 rounded-lg border transition-colors ${isDragging ? "bg-bg/20 border-bg/20" : "bg-bg border-border/60"}`}>
          <Icon size={14} className={isDragging ? "text-bg" : "text-secondary"} style={{ color: isDragging ? undefined : color }} strokeWidth={2.5} />
        </div>
        <span className={`flex-1 text-note font-medium truncate ${isSelected ? "text-accent" : ""}`}>{label}</span>
        <ChevronDown size={14} className={`text-muted transition-transform duration-300 ${isSelected ? "rotate-180 text-accent" : ""}`} />
      </div>

      {isSelected && !isDragging && (
        <div className="px-3 pb-3 pt-1 border-t border-border/20 animate-in slide-in-from-top-2 duration-300">
           <div className="space-y-3">
              <div>
                <span className="text-label font-mono uppercase tracking-wider text-muted">Icon Library</span>
                <IconPicker currentIcon={currentIconName} onSelect={(icon) => onUpdate('icon', icon)} color={color} />
              </div>
              <div>
                <span className="text-label font-mono uppercase tracking-wider text-muted">Accent Color</span>
                <ColorPicker currentColor={color} onSelect={(c) => onUpdate('color', c)} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export function SettingsModal({
  isOpen,
  onClose,
  userName
}: {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "domains" | "spaces" | "data" | "notifications">("general");
  const { theme, setTheme } = useSpace();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(userName || "");
  const handleUpdateName = useCallback(() => {
    if (!displayName || displayName === userName) return;
    startTransition(async () => {
      const result = await updateUserNameAction(displayName);
      if (result.success) {
        toast.success("Name updated");
        router.refresh();
      }
    });
  }, [displayName, userName, router]);

  const [privatePassword, setPrivatePassword] = useState("");
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);
  const handleUpdatePassword = useCallback(() => {
    startTransition(async () => {
      const result = privatePassword
        ? await setPrivateTaskPasswordAction(privatePassword)
        : await setPrivateTaskPasswordAction(null);
      if (result.success) {
        toast.success(privatePassword ? "Private password set" : "Private password removed");
        setPrivatePassword("");
        setIsPasswordSaved(true);
        setTimeout(() => setIsPasswordSaved(false), 2000);
      }
    });
  }, [privatePassword]);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deviceCount, setDeviceCount] = useState<number>(0);

  const checkSubscription = useCallback(async () => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      const res = await getPushSubscriptionCountAction();
      setDeviceCount(res.count);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      startTransition(() => {
        setIsNotificationSupported(true);
        checkSubscription();
      });
    }
  }, [checkSubscription]);

  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permission denied for notifications");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        toast.error("VAPID Public Key not found in environment");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const res = await savePushSubscriptionAction(JSON.parse(JSON.stringify(subscription)));
      if (res.success) {
        setIsSubscribed(true);
        const countRes = await getPushSubscriptionCountAction();
        setDeviceCount(countRes.count);
        toast.success("Device linked successfully!");
      } else {
        toast.error(res.error || "Failed to save subscription");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to link device");
    }
  };

  const testPush = async () => {
    const res = await sendTestNotificationAction();

    if (res.success) {
      toast.success("Broadcast successful!");
    } else {
      const errorMsg = res.results?.find((r: { success: boolean; message?: string }) => !r.success)?.message || "Failed";
      toast.error(`Broadcast incomplete: ${errorMsg}`);
    }
  };

  const loadCustomizations = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem("system-customizations");
    return saved ? JSON.parse(saved) : {};
  }, []);
  const [customizations, setCustomizations] = useState<Record<string, { icon?: string; color?: string }>>(loadCustomizations());

  useEffect(() => {
    const handler = () => {
      startTransition(() => {
        setCustomizations(loadCustomizations());
      });
    };    window.addEventListener("system-customizations-updated", handler);
    return () => window.removeEventListener("system-customizations-updated", handler);
  }, [loadCustomizations]);

  const [domains, setDomains] = useState<Domain[]>(DEFAULT_DOMAINS);
  const [spaces, setSpaces] = useState<Space[]>(DEFAULT_SPACES);
  const [isSaved, setIsSaved] = useState(false);

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

  const handleExport = async () => {
    const result = await exportSystemAction();
    if (result.success && result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `myhub-backup.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("Exported");
    }
  };

  const handleReset = async () => {
    startTransition(async () => {
      const result = await resetSystemAction();
      if (result.success) {
        toast.success("System reset");
        onClose(); router.refresh();
      }
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        JSON.parse(event.target?.result as string);
        startTransition(async () => {
          const result = await importSystemAction();
          if (result.success) {
            toast.success("Imported"); onClose(); window.location.reload();
          }
        });
      } catch { toast.error("Invalid file"); }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "appearance", label: "Appearance", icon: Palette },
    {id: "domains", label: "Domains", icon: Briefcase },
    { id: "spaces", label: "Spaces", icon: Layout },
    { id: "notifications", label: "Notifications", icon: Bell },
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
      >
        <div className="flex flex-col w-full sm:w-[800px] min-h-[600px] sm:min-h-[650px] text-text">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-hover shrink-0">
            <h2 className="text-heading font-bold text-text-primary">Settings</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-surface rounded-lg text-muted hover:text-text transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Mobile: horizontal scrollable tabs */}
          <div className="sm:hidden flex overflow-x-auto scrollbar-hide border-b border-border/30 bg-surface-hover shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedId(null); }}
                className={`flex flex-col items-center justify-center gap-1.5 px-6 py-3 text-caption font-medium whitespace-nowrap transition-all shrink-0 border-b-2 min-w-[80px] active:bg-accent/5 ${
                  activeTab === tab.id
                    ? "border-accent text-accent bg-accent/5"
                    : "border-transparent text-muted"
                }`}
              >
                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: sidebar + content */}
          <div className="hidden sm:flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-44 border-r border-border bg-surface-hover p-2 flex flex-col gap-1 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedId(null); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-note font-medium transition-all ${
                    activeTab === tab.id ? "bg-accent text-bg" : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  }`}
                >
                  <tab.icon size={14} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                  {tab.label}
                </button>
              ))}
              <div className="mt-auto p-2 text-center">
                <span className="text-micro font-mono text-accent uppercase font-medium tracking-wider opacity-40">v1.2.6</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-surface overflow-y-auto px-6 py-5">

              {activeTab === "general" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <section>
                    <h4 className="text-micro font-medium uppercase tracking-wider text-accent mb-3">Profile</h4>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption font-medium text-text-muted">Display Name</label>
                      <div className="flex gap-2">
                        <input className="flex-1 bg-surface-hover border border-border px-3 py-2 rounded-lg text-note outline-none transition-all text-text-primary focus:border-accent/40" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        <button onClick={handleUpdateName} disabled={isPending} className="px-3 bg-accent text-bg rounded-lg text-caption font-medium disabled:opacity-30 flex items-center gap-2 h-10">
                          {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                        </button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-micro font-medium uppercase tracking-wider text-accent mb-3 flex items-center gap-2">
                      <Lock size={12} /> Private Tasks
                    </h4>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-caption font-medium text-text-muted">Password</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          className="flex-1 bg-surface-hover border border-border px-3 py-2 rounded-lg text-note outline-none transition-all text-text-primary focus:border-accent/40"
                          value={privatePassword}
                          onChange={(e) => setPrivatePassword(e.target.value)}
                          placeholder="Set password to hide tasks"
                        />
                        <button onClick={handleUpdatePassword} disabled={isPending} className="px-3 bg-accent text-bg rounded-lg text-caption font-medium disabled:opacity-30 flex items-center gap-2 h-10">
                          {isPending ? <Loader2 size={12} className="animate-spin" /> : isPasswordSaved ? <Check size={12} /> : "Save"}
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                  <section>
                    <h4 className="text-micro font-medium uppercase tracking-wider text-accent mb-3">Theme</h4>
                    <div className="grid grid-cols-2 gap-2">
                       <button onClick={() => setTheme("dark")} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${theme === "dark" ? "bg-accent/10 border-accent/30 text-accent" : "bg-surface-hover border-border text-text-muted hover:text-text-primary"}`}>
                          <div className="flex items-center gap-2"><Moon size={14} /><span className="text-caption font-medium">Dark Mode</span></div>
                          {theme === "dark" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                       </button>
                       <button onClick={() => setTheme("light")} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${theme === "light" ? "bg-accent/10 border-accent/30 text-accent" : "bg-surface-hover border-border text-text-muted hover:text-text-primary"}`}>
                          <div className="flex items-center gap-2"><Sun size={14} /><span className="text-caption font-medium">Light Mode</span></div>
                          {theme === "light" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                       </button>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === "domains" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-micro font-medium uppercase tracking-wider text-accent">Domains</h4>
                    {isSaved && <span className="text-micro font-medium text-success uppercase animate-pulse tracking-wider">Saved</span>}
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndDomains} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                    <SortableContext items={domains.map(d => d.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2 pb-2">
                        {domains.map((domain) => {
                          const custom = customizations[domain.id];
                          const activeColor = custom?.color || (SPACE_THEMES as Record<string, { accent?: string }>)[domain.id]?.accent || "#fbbf24";
                          const ActiveIcon = custom?.icon ? (ICON_LIBRARY[custom.icon as IconName] || domain.icon) : domain.icon;

                          return (
                            <SortableItem
                              key={domain.id}
                              id={domain.id}
                              label={domain.label}
                              icon={ActiveIcon}
                              currentIconName={custom?.icon || ""}
                              color={activeColor}
                              isSelected={selectedId === domain.id}
                              onSelect={() => setSelectedId(selectedId === domain.id ? null : domain.id)}
                              onUpdate={(k, v) => updateCustomization(domain.id, k, v)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-micro text-text-muted pt-2 text-center italic opacity-60">Click to customize, drag to reorder.</p>
                </div>
              )}

              {activeTab === "spaces" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-micro font-medium uppercase tracking-wider text-accent">Spaces</h4>
                    {isSaved && <span className="text-micro font-medium text-success uppercase animate-pulse tracking-wider">Saved</span>}
                  </div>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSpaces} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                    <SortableContext items={spaces.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-2 pb-2">
                        {spaces.map((space) => {
                          const custom = customizations[space.id];
                          const activeColor = custom?.color || (SPACE_THEMES as Record<string, { accent?: string }>)[space.id]?.accent || "#fbbf24";
                          const ActiveIcon = custom?.icon ? (ICON_LIBRARY[custom.icon as IconName] || space.icon) : space.icon;

                          return (
                            <SortableItem
                              key={space.id}
                              id={space.id}
                              label={space.label}
                              icon={ActiveIcon}
                              currentIconName={custom?.icon || ""}
                              color={activeColor}
                              isSelected={selectedId === space.id}
                              onSelect={() => setSelectedId(selectedId === space.id ? null : space.id)}
                              onUpdate={(k, v) => updateCustomization(space.id, k, v)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-micro text-text-muted pt-2 text-center italic opacity-60">Click to customize, drag to reorder.</p>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
                  <h4 className="text-micro font-medium uppercase tracking-wider text-accent mb-3">Management</h4>
                  <div className="grid grid-cols-1 gap-2">
                     <div className="p-4 bg-surface-hover border border-border rounded-lg flex items-center justify-between">
                        <div><h5 className="text-note font-medium text-text-primary">Export JSON</h5><p className="text-micro text-text-muted">Complete system backup.</p></div>
                        <button onClick={handleExport} className="p-2.5 bg-accent text-bg rounded-lg hover:bg-accent-hover active:scale-95 transition-all"><Download size={14} strokeWidth={2.5} /></button>
                     </div>
                     <div className="p-4 bg-surface-hover border border-border rounded-lg flex items-center justify-between">
                        <div><h5 className="text-note font-medium text-text-primary">Import Backup</h5><p className="text-micro text-text-muted">Restore system state.</p></div>
                        <div className="flex items-center gap-2">
                          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-surface border border-border rounded-lg hover:border-accent transition-all active:scale-95"><Upload size={14} /></button>
                        </div>
                     </div>
                     <div className="p-4 border border-danger/10 bg-danger/5 rounded-lg flex items-center justify-between">
                          <div><h5 className="text-note font-medium text-danger">Reset System</h5><p className="text-micro text-danger/60">Wipe all local records.</p></div>
                          <button onClick={() => setIsResetConfirmOpen(true)} className="p-2.5 bg-danger/10 text-danger border border-danger/20 rounded-lg hover:bg-danger/20 transition-all"><Trash2 size={14} /></button>
                     </div>
                     <div className="p-4 border border-accent/10 bg-accent/5 rounded-lg flex items-center justify-between mt-2">
                          <div><h5 className="text-note font-medium text-accent">Seed Visual Plan</h5><p className="text-micro text-accent/60">Populate with default data.</p></div>
                          <button
                            onClick={async () => {
                              startTransition(async () => {
                                const res = await seedVisualPlanAction();
                                if (res.success) toast.success("Visual Plan Seeded!");
                                else toast.error(res.error || "Seed failed");
                              });
                            }}
                            disabled={isPending}
                            className="p-2.5 bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50"
                          >
                            <Database size={14} />
                          </button>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                  <section>
                    <div className="flex justify-between items-center mb-3">
                       <h4 className="text-micro font-medium uppercase tracking-wider text-accent">Push Notifications</h4>
                       {deviceCount > 0 && (
                         <span className="text-micro font-medium bg-success/10 text-success px-2 py-0.5 rounded-full border border-success/20">
                           {deviceCount} Linked Device{deviceCount > 1 ? 's' : ''}
                         </span>
                       )}
                    </div>

                    {!isNotificationSupported ? (
                       <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg text-warning text-caption leading-relaxed">
                          Your browser does not support push notifications. If you are on iPhone, make sure to &quot;Add to Home Screen&quot; first.
                       </div>
                    ) : (
                      <div className="space-y-3">
                         <div className="p-4 bg-surface-hover border border-border rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${isSubscribed ? "bg-success/10 text-success" : "bg-accent/10 text-accent"}`}>
                                  <Smartphone size={16} />
                               </div>
                               <div>
                                  <h5 className="text-note font-medium text-text-primary">Current Device</h5>
                                  <p className="text-micro text-text-muted">{isSubscribed ? "Connection established" : "Ready to link"}</p>
                               </div>
                            </div>
                            <button
                              onClick={subscribeToPush}
                              className="px-3 py-1.5 rounded-lg text-micro font-medium uppercase transition-all bg-accent text-bg hover:bg-accent-hover active:scale-95"
                            >
                               {isSubscribed ? "Re-link" : "Link"}
                            </button>
                         </div>

                         {deviceCount > 0 && (
                            <div className="space-y-2">
                               <div className="p-4 bg-surface-hover border border-border rounded-lg flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <div className="p-2 rounded-lg bg-info/10 text-info">
                                        <Bell size={16} />
                                     </div>
                                     <div>
                                        <h5 className="text-note font-medium text-text-primary">Broadcast Test</h5>
                                        <p className="text-micro text-text-muted">Ping all {deviceCount} linked devices.</p>
                                     </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={testPush}
                                    className="p-2 bg-surface border border-border rounded-lg hover:border-accent transition-all active:scale-95"
                                  >
                                     <Check size={14} className="text-text-muted" />
                                  </button>
                               </div>
                            </div>
                         )}
                      </div>
                    )}
                  </section>
                  <p className="text-micro text-text-muted leading-relaxed italic opacity-70">
                    To link your iPhone, open the app from your Home Screen and click &quot;Link&quot; here.
                  </p>
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
