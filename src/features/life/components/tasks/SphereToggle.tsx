"use client";

import { useState, useTransition } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { updateTaskSphereAction } from "@/features/life/actions/task-actions";
import type { LifeSphereData } from "@/features/life/types";
import { SPHERE_ICONS } from "./lucide-icons-map";
import { useDynamicPositioning } from "@/lib/hooks/use-dynamic-positioning";
import { createPortal } from "react-dom";

interface SphereToggleProps {
  taskId: string;
  sphere: LifeSphereData | null;
  spheres: LifeSphereData[];
  size?: "sm" | "default";
}

export function SphereToggle({
  taskId,
  sphere: initialSphere,
  spheres,
  size = "default",
}: SphereToggleProps) {
  const [currentSphere, setCurrentSphere] = useState<LifeSphereData | null>(initialSphere);
  const [isPending, startTransition] = useTransition();

  const { isOpen, coords, triggerRef, contentRef, toggle, close } =
    useDynamicPositioning<HTMLButtonElement>({
      contentWidth: 220,
      offset: 8,
    });

  const handleSphereSelect = (newSphere: LifeSphereData | null) => {
    const newId = newSphere?.id ?? null;
    const currentId = currentSphere?.id ?? null;
    if (newId === currentId) {
      close();
      return;
    }

    setCurrentSphere(newSphere);
    close();

    startTransition(async () => {
      const result = await updateTaskSphereAction(taskId, newId);
      if (!result.success) {
        setCurrentSphere(initialSphere);
        toast.error(result.error || "Failed to update sphere");
      }
    });
  };

  const activeSpheres = spheres.filter((s) => s.isActive);
  const isCompact = size === "sm";

  const SphereIcon = currentSphere?.icon && SPHERE_ICONS[currentSphere.icon]
    ? SPHERE_ICONS[currentSphere.icon]
    : FileText;

  const triggerClass = `inline-flex items-center gap-1 rounded-md border text-[10px] font-mono uppercase tracking-wide transition-opacity duration-150 ${
    isCompact ? "px-1 py-0.5" : "px-1.5 py-0.5"
  } bg-white/5 text-zinc-400 border-white/[0.06] ${isPending ? "opacity-50" : ""}`;

  const dropdownStyle: React.CSSProperties = coords
    ? {
        position: "fixed",
        left: coords.left,
        top: coords.align === "bottom" ? coords.top : undefined,
        bottom: coords.align === "top" ? window.innerHeight - coords.top : undefined,
        width: 220,
      }
    : {};

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button ref={triggerRef} onClick={toggle} disabled={isPending} className={triggerClass}>
        <SphereIcon size={isCompact ? 6 : 10} strokeWidth={3} />
        {currentSphere?.name ?? "No Sphere"}
        {!isCompact && <ChevronDown size={8} />}
      </button>

      {isOpen &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={contentRef as React.RefObject<HTMLDivElement>}
            style={dropdownStyle}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated p-1.5 flex flex-col gap-0.5 z-[9000] max-h-[320px] overflow-y-auto"
          >
            <button
              onClick={() => handleSphereSelect(null)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors duration-150 ${
                !currentSphere
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center w-5 h-5 rounded bg-white/5 border border-white/[0.06]">
                <FileText size={9} strokeWidth={3} className="text-zinc-500" />
              </div>
              No Sphere
            </button>

            {activeSpheres.map((s) => {
              const active = s.id === currentSphere?.id;
              const SIcons = s.icon && SPHERE_ICONS[s.icon] ? SPHERE_ICONS[s.icon] : FileText;
              const optionClass = `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-left transition-colors duration-150 ${
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`;

              return (
                <button
                  key={s.id}
                  onClick={() => handleSphereSelect(s)}
                  className={optionClass}
                >
                  <div
                    className="flex items-center justify-center w-5 h-5 rounded"
                    style={{ backgroundColor: `${s.color}20`, border: `1px solid ${s.color}30` }}
                  >
                    <SIcons size={9} strokeWidth={3} style={{ color: s.color }} />
                  </div>
                  {s.name}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
