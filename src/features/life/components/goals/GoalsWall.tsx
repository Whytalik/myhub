"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Moon, Printer, Sun, Target } from "lucide-react";
import { Button } from "@/components/ui/actions/button";
import { SPHERE_ICONS } from "@/features/life/components/tasks/lucide-icons-map";
import { formatGoalProgress } from "@/features/life/logic/sphere-goals";
import type { LifeSphereData, SphereGoalData, YearFocusData } from "@/features/life/types";

interface GoalsWallProps {
  spheres: LifeSphereData[];
  goals: SphereGoalData[];
  year: number;
  mission: string | null;
  focus: YearFocusData | null;
}

type WallTheme = "dark" | "light";

function WallGoal({ goal, isLever }: { goal: SphereGoalData; isLever: boolean }) {
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-medium text-[color:var(--wall-fg)] break-words">
          {isLever ? "★ " : ""}
          {goal.title}
        </span>
        <span className="text-sm font-mono text-[color:var(--wall-muted)] shrink-0">
          {formatGoalProgress(goal)}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-[var(--wall-track)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[color:var(--wall-fg)]"
          style={{ width: `${goal.progressPercent}%` }}
        />
        {goal.expectedPercent !== null && (
          <div
            className="absolute top-0 h-full w-0.5 bg-[var(--wall-tick)] mix-blend-difference"
            style={{ left: `${goal.expectedPercent}%` }}
          />
        )}
      </div>
    </li>
  );
}

export function GoalsWall({ spheres, goals, year, mission, focus }: GoalsWallProps) {
  const wallRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<WallTheme>("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === wallRef.current);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const spheresWithGoals = spheres
    .filter((sphere) => goals.some((goal) => goal.sphereId === sphere.id))
    .sort(
      (first, second) =>
        Number(second.id === focus?.sphereId) - Number(first.id === focus?.sphereId),
    );
  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void wallRef.current?.requestFullscreen();
    }
  };

  return (
    <div
      ref={wallRef}
      data-theme={theme}
      className="goals-wall rounded-2xl border border-[var(--wall-line)] bg-[var(--wall-bg)] p-8 md:p-10 flex flex-col gap-8 overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2 min-w-0">
          <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--wall-fg)]">
            {year}
          </h2>
          {focus?.identity && (
            <p className="text-xl font-medium text-[color:var(--wall-fg)] max-w-3xl whitespace-pre-wrap">
              “{focus.identity}”
            </p>
          )}
          {mission && (
            <p className="text-sm text-[color:var(--wall-muted)] whitespace-pre-wrap max-w-3xl">
              {mission}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 print:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            <ThemeIcon size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleToggleFullscreen}
            title="Fullscreen"
          >
            <FullscreenIcon size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </Button>
        </div>
      </div>

      {spheresWithGoals.length === 0 ? (
        <p className="text-sm text-[color:var(--wall-muted)]">
          No goals yet. Add 3–5 measurable goals per sphere on the Life Goals page.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-8">
          {spheresWithGoals.map((sphere) => {
            const SphereIcon = SPHERE_ICONS[sphere.icon] || Target;
            const isFocus = sphere.id === focus?.sphereId;
            const sectionClassName = `flex flex-col gap-4 break-inside-avoid ${
              isFocus ? "md:col-span-2 xl:col-span-3" : focus ? "opacity-80" : ""
            }`;
            return (
              <section key={sphere.id} className={sectionClassName}>
                <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--wall-line)]">
                  <SphereIcon size={18} style={{ color: sphere.color }} />
                  <h3 className="text-base font-semibold uppercase tracking-wider text-[color:var(--wall-fg)]">
                    {sphere.name}
                  </h3>
                  {isFocus && (
                    <span className="text-xs font-mono uppercase tracking-wider text-[color:var(--wall-muted)]">
                      · Focus of the year
                    </span>
                  )}
                </div>
                <ul className="flex flex-col gap-4">
                  {goals
                    .filter((goal) => goal.sphereId === sphere.id)
                    .map((goal) => (
                      <WallGoal
                        key={goal.id}
                        goal={goal}
                        isLever={goal.id === focus?.leverGoalId}
                      />
                    ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
