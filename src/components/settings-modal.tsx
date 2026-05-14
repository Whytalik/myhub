"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Dialog, ConfirmationDialog } from "@/components/ui/dialog";
import { useSpace } from "./space-provider";
import { updateUserNameAction, setPrivateTaskPasswordAction } from "@/features/profile/actions";
import { exportSystemAction, resetSystemAction, importSystemAction } from "@/features/system/actions/system-actions";
import { seedVisualPlanAction, seedCookingLists } from "@/features/system/actions/seed-action";
import { savePushSubscriptionAction, sendTestNotificationAction, getPushSubscriptionCountAction } from "@/features/system/actions/push-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  User,
  Palette,
  Database,
  Download,
  Upload,
  Sun,
  Moon,
  Trash2,
  Check,
  Loader2,
  Lock,
  Bell,
  Smartphone,
  X
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "notifications" | "data">("general");
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
                onClick={() => { setActiveTab(tab.id); }}
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
                  onClick={() => { setActiveTab(tab.id); }}
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
                      <div className="p-4 border border-accent/10 bg-accent/5 rounded-lg flex items-center justify-between mt-2">
                           <div><h5 className="text-note font-medium text-accent">Seed Cooking Lists</h5><p className="text-micro text-accent/60">Generate optimized daily cooking steps.</p></div>
                           <button
                             onClick={async () => {
                               startTransition(async () => {
                                 const res = await seedCookingLists();
                                 if (res.success) toast.success("Cooking Lists Seeded!");
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
