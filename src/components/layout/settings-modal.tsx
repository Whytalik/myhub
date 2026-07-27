"use client";

import { Dialog } from "@/components/ui/overlays/dialog";
import { useSpace } from "@/components/providers/space-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Moon, Palette, Sun, X, CloudSun, Leaf, Snowflake, Sprout, Utensils } from "lucide-react";

function getSeasonFromCookie(): string {
  if (typeof document === "undefined") return "auto";
  const match = document.cookie.match(/(^| )nutrition-menu-season=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : "auto";
}

export function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}) {
  const router = useRouter();
  const { theme, setTheme } = useSpace();
  const [season, setSeasonState] = useState<string>(getSeasonFromCookie);

  const setSeason = (newSeason: string) => {
    setSeasonState(newSeason);
    document.cookie = `nutrition-menu-season=${encodeURIComponent(newSeason)}; path=/; max-age=31536000`;
    router.refresh();
  };

  const themeOptionClass = (isActive: boolean) =>
    `flex-1 flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors duration-150 ${
      isActive
        ? "bg-accent/15 border-accent/30 text-accent"
        : "border-white/[0.08] text-zinc-400 hover:bg-white/5"
    }`;

  const seasonOptionClass = (isActive: boolean) =>
    `w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors duration-150 ${
      isActive
        ? "bg-accent-nutrition/15 border-accent-nutrition/30 text-accent-nutrition"
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

        {/* Theme Settings */}
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

        {/* Nutrition Menu Settings */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Utensils size={14} />
            <h4 className="text-label">Seasonal Nutrition Menu</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setSeason("auto")}
              className={seasonOptionClass(season === "auto") + " sm:col-span-2"}
            >
              <div className="flex items-center gap-2">
                <CloudSun size={14} />
                <span className="text-sm font-medium">Auto (За календарем)</span>
              </div>
              {season === "auto" && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-nutrition" />
              )}
            </button>

            <button
              onClick={() => setSeason("summer")}
              className={seasonOptionClass(season === "summer")}
            >
              <div className="flex items-center gap-2">
                <Sun size={14} />
                <span className="text-sm font-medium">Літо (Summer)</span>
              </div>
              {season === "summer" && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-nutrition" />
              )}
            </button>

            <button
              onClick={() => setSeason("autumn")}
              className={seasonOptionClass(season === "autumn")}
            >
              <div className="flex items-center gap-2">
                <Leaf size={14} />
                <span className="text-sm font-medium">Осінь (Autumn)</span>
              </div>
              {season === "autumn" && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-nutrition" />
              )}
            </button>

            <button
              onClick={() => setSeason("winter")}
              className={seasonOptionClass(season === "winter")}
            >
              <div className="flex items-center gap-2">
                <Snowflake size={14} />
                <span className="text-sm font-medium">Зима (Winter)</span>
              </div>
              {season === "winter" && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-nutrition" />
              )}
            </button>

            <button
              onClick={() => setSeason("spring")}
              className={seasonOptionClass(season === "spring")}
            >
              <div className="flex items-center gap-2">
                <Sprout size={14} />
                <span className="text-sm font-medium">Весна (Spring)</span>
              </div>
              {season === "spring" && (
                <div className="w-1.5 h-1.5 rounded-full bg-accent-nutrition" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
