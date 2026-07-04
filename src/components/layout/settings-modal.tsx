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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      description="Configure your Personal OS"
      maxWidth="480px"
      bare
    >
      <div >
        <div >
          <h2 >Settings</h2>
          <button onClick={onClose} >
            <X size={18} />
          </button>
        </div>

        <div >
          <div >
            <Palette size={14} />
            <h4 >Theme</h4>
          </div>
          <div >
            <button
              onClick={() => setTheme("dark")}

            >
              <div >
                <Moon size={14} />
                <span >Dark</span>
              </div>
              {theme === "dark" && <div />}
            </button>
            <button
              onClick={() => setTheme("light")}

            >
              <div >
                <Sun size={14} />
                <span >Light</span>
              </div>
              {theme === "light" && <div />}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
