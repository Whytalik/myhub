"use client";

import { Dialog } from "@/components/ui/dialog";
import { useSpace } from "./space-provider";
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Configure your Personal OS"
      maxWidth="480px"
      bare
    >
      <div className="flex flex-col w-full sm:w-[480px] text-text">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-hover shrink-0">
          <h2 className="text-heading font-bold text-text-primary">Settings</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-surface rounded-lg text-muted hover:text-text transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 bg-surface space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Palette size={14} className="text-accent" />
            <h4 className="text-micro font-medium uppercase tracking-wider text-accent">Theme</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                theme === "dark"
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-surface-hover border-border text-text-muted hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon size={14} />
                <span className="text-caption font-medium">Dark</span>
              </div>
              {theme === "dark" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                theme === "light"
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-surface-hover border-border text-text-muted hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun size={14} />
                <span className="text-caption font-medium">Light</span>
              </div>
              {theme === "light" && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
