"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces/spaces";
import { GUIDE_DATA, type SpaceGuide } from "@/lib/guide-data";
import { Dialog } from "@/components/ui/overlays/dialog";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getSectionFromPath(pathname: string, guide: SpaceGuide | undefined): string {
  if (!guide) return "";
  let targetId: string | undefined;

  if (pathname.startsWith("/life/journal")) targetId = "journal-sleep";
  else if (pathname.startsWith("/life/tasks")) targetId = "tasks";
  else if (pathname.startsWith("/life/habits")) targetId = "habits";
  else if (pathname.startsWith("/life/week")) targetId = "week";
  else if (pathname.startsWith("/nutrition/products")) targetId = "products";
  else if (pathname.startsWith("/nutrition/dishes")) targetId = "dishes";
  else if (
    pathname.startsWith("/nutrition/plan") ||
    pathname.startsWith("/nutrition/plans") ||
    pathname.startsWith("/nutrition/week")
  )
    targetId = "plans";
  else if (pathname.startsWith("/nutrition/shopping")) targetId = "shopping";

  const exists = targetId && guide.sections.some((s) => s.id === targetId);
  return exists ? targetId! : (guide.sections[0]?.id ?? "");
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const pathname = usePathname();
  const space = getSpaceFromPath(pathname);
  const guide = GUIDE_DATA[space];

  const [activeSectionId, setActiveSectionId] = useState<string>(() =>
    getSectionFromPath(pathname, guide),
  );
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveSectionId(getSectionFromPath(pathname, guide));
  }

  if (!guide) return null;

  const activeSection = guide.sections.find((s) => s.id === activeSectionId);

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-150 text-left ${
      isActive
        ? "bg-accent/15 text-accent font-medium"
        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
    }`;
  const mobileNavItemClass = (isActive: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-150 shrink-0 ${
      isActive ? "bg-accent/15 text-accent" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
    }`;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="1200px" bare noScroll>
      <div className="flex flex-col h-[80dvh]">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-panel-title">{guide.title}</h2>
            <p className="text-caption">{guide.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto py-3 border-b border-white/[0.06]">
          {guide.sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSectionId === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={mobileNavItemClass(isActive)}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 flex gap-6 min-h-0 pt-4">
          <div className="hidden md:flex flex-col gap-0.5 w-52 shrink-0 overflow-y-auto">
            {guide.sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSectionId === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={navItemClass(isActive)}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto text-body">{activeSection?.content}</div>
        </div>
      </div>
    </Dialog>
  );
}
