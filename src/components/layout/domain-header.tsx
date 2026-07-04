"use client";

import { useState } from "react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { Menu, X, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSpaceFromPath } from "@/lib/spaces/spaces";
import { DOMAINS, getActiveDomain } from "@/lib/spaces/domains";
import { GUIDE_DATA } from "@/lib/guide-data";
import { GuideModal } from "@/components/layout/guide-drawer";

export function DomainHeader() {
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [guideOpen, setGuideOpen] = useState(false);
  const hasGuide = !!GUIDE_DATA[getSpaceFromPath(pathname)];
  const activeDomainId = getActiveDomain(pathname).id;

  return (
    <header >
      {}
      <div >
        <Link href="/life" >
          <div >
            <Sparkles size={16} />
          </div>
          <span >
            MyHub
          </span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}

          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {}
      <div >
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomainId === domain.id;
          return (
            <Link
              key={domain.id}
              href={domain.href}

            >
              <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
              <span>{domain.label}</span>
            </Link>
          );
        })}
      </div>

      {}
      <div >
        {hasGuide && (
          <button
            onClick={() => setGuideOpen(true)}

          >
            <BookOpen size={13} />
            Guide
          </button>
        )}
      </div>

      <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
    </header>
  );
}
