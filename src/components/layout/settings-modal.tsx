"use client";

import { Dialog } from "@/components/ui/overlays/dialog";
import { useSpace } from "@/components/providers/space-provider";
import { Moon, Palette, Sun, X } from "lucide-react";

export function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}) {
  const { theme, setTheme } = useSpace();

  const themeOptionClass = (isActive: boolean) =>
    `flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors duration-150 ${
      isActive
        ? "bg-accent/15 border-accent/30 text-accent"
        : "border-white/[0.08] text-zinc-400 hover:bg-white/5"
    }`;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Configure your Personal OS"
      maxWidth="480px"
      bare
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-panel-title">Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Palette size={14} />
            <h4 className="text-label">Theme</h4>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme("dark")} className={themeOptionClass(theme === "dark")}>
              <div className="flex items-center gap-2">
                <Moon size={14} />
                <span className="text-sm font-medium">Dark</span>
              </div>
              {theme === "dark" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
            <button
              onClick={() => setTheme("light")}
              className={themeOptionClass(theme === "light")}
            >
              <div className="flex items-center gap-2">
                <Sun size={14} />
                <span className="text-sm font-medium">Light</span>
              </div>
              {theme === "light" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
