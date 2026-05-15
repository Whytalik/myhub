"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces";
import { GUIDE_DATA } from "@/lib/guide-data";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const pathname = usePathname();
  const space = getSpaceFromPath(pathname);
  const guide = GUIDE_DATA[space];

  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (guide && guide.sections.length > 0) {
      setActiveSectionId(guide.sections[0].id);
    }
  }, [guide, space]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !guide) return null;

  const activeSection = guide.sections.find((s) => s.id === activeSectionId);
  const SectionIcon = activeSection?.icon;

  return createPortal(
    <div className="fixed inset-0 z-[8000] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg/70 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-4xl h-[85vh] animate-in zoom-in-95 fade-in duration-300 shadow-2xl rounded-2xl overflow-hidden">
        <div className="flex w-full h-full bg-elevated border border-border-strong overflow-hidden rounded-2xl">

          {/* Left sidebar */}
          <div className="w-56 shrink-0 border-r border-border bg-surface/60 flex flex-col overflow-y-auto scrollbar-hide">
            <div className="px-4 pt-5 pb-4 border-b border-border">
              <p className="text-caption font-mono uppercase tracking-widest text-text-muted">Guide</p>
              <h2 className="text-body font-bold text-text-primary mt-0.5">{guide.title}</h2>
            </div>
            <nav className="flex-1 p-2">
              {guide.sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === activeSectionId;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150 mb-0.5 ${
                      isActive
                        ? "bg-accent/10 border border-accent/20 text-accent"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent"
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="text-note font-medium leading-tight">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Content header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                {activeSection && SectionIcon && (
                  <>
                    <SectionIcon size={15} className="text-accent" />
                    <span className="text-body font-semibold text-text-primary">{activeSection.label}</span>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all active:scale-90"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5">
              {activeSection?.content}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
