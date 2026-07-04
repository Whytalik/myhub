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
  else if (pathname.startsWith("/nutrition/plan") ||
           pathname.startsWith("/nutrition/plans") ||
           pathname.startsWith("/nutrition/week")) targetId = "plans";
  else if (pathname.startsWith("/nutrition/shopping")) targetId = "shopping";

  const exists = targetId && guide.sections.some((s) => s.id === targetId);
  return exists ? targetId! : (guide.sections[0]?.id ?? "");
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const pathname = usePathname();
  const space = getSpaceFromPath(pathname);
  const guide = GUIDE_DATA[space];

  const [activeSectionId, setActiveSectionId] = useState<string>(() => getSectionFromPath(pathname, guide));
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveSectionId(getSectionFromPath(pathname, guide));
  }

  if (!guide) return null;

  const activeSection = guide.sections.find((s) => s.id === activeSectionId);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="1200px" bare noScroll>
      <div >

        {}
        <div >
          <div>
            <h2 >{guide.title}</h2>
            <p >{guide.description}</p>
          </div>
          <button onClick={onClose} >
            <X size={18} />
          </button>
        </div>

        {}
        <div >
          {guide.sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}

              >
                <Icon size={18} strokeWidth={activeSectionId === section.id ? 2.5 : 2} />
                {section.label}
              </button>
            );
          })}
        </div>

        {}
        <div >
          {}
          <div >
            {guide.sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}

                >
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                  {section.label}
                </button>
              );
            })}
          </div>

          {}
          <div >
            {activeSection?.content}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
