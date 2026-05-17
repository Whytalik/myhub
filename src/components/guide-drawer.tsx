"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces";
import { GUIDE_DATA } from "@/lib/guide-data";
import { Dialog } from "@/components/ui/dialog";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const pathname = usePathname();
  const space = getSpaceFromPath(pathname);
  const guide = GUIDE_DATA[space];

  const [activeSectionId, setActiveSectionId] = useState<string>(guide?.sections[0]?.id ?? "");
  const [prevSpace, setPrevSpace] = useState(space);

  if (prevSpace !== space) {
    setPrevSpace(space);
    setActiveSectionId(guide?.sections[0]?.id ?? "");
  }

  if (!guide) return null;

  const activeSection = guide.sections.find((s) => s.id === activeSectionId);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="1200px" bare noScroll>
      <div className="flex flex-col w-full sm:w-[1200px] h-[82vh] text-text">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface-hover shrink-0">
          <div>
            <h2 className="text-heading font-bold text-text-primary">{guide.title}</h2>
            <p className="text-caption text-text-muted mt-0.5">{guide.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface rounded-lg text-muted hover:text-text transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Mobile: horizontal scrollable tabs */}
        <div className="sm:hidden flex overflow-x-auto scrollbar-hide border-b border-border/30 bg-surface-hover shrink-0">
          {guide.sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`flex flex-col items-center justify-center gap-1.5 px-6 py-3 text-caption font-medium whitespace-nowrap transition-all shrink-0 border-b-2 min-w-[80px] active:bg-accent/5 ${
                  activeSectionId === section.id
                    ? "border-accent text-accent bg-accent/5"
                    : "border-transparent text-muted"
                }`}
              >
                <Icon size={18} strokeWidth={activeSectionId === section.id ? 2.5 : 2} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Desktop: sidebar + content */}
        <div className="hidden sm:flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-border bg-surface-hover p-2 flex flex-col gap-1 shrink-0 overflow-y-auto scrollbar-hide">
            {guide.sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-note font-medium transition-all text-left ${
                    isActive ? "bg-accent text-bg" : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  }`}
                >
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 bg-surface overflow-y-auto px-6 py-5 animate-in fade-in slide-in-from-right-2 duration-300">
            {activeSection?.content}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
