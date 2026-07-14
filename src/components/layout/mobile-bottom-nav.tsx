"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { DOMAINS, getActiveDomain } from "@/lib/spaces/domains";

function getMobileDomainColors(domainId: string) {
  switch (domainId) {
    case "life":
      return "bg-[#6fbfbf]/10 text-[#6fbfbf] border border-[#6fbfbf]/20";
    case "health":
      return "bg-[#ff8c00]/10 text-[#ff8c00] border border-[#ff8c00]/20";
    case "review":
      return "bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20";
    default:
      return "bg-accent/15 text-accent border border-accent/20";
  }
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const activeDomain = useMemo(() => getActiveDomain(pathname), [pathname]);

  const activeSpace = useMemo(() => {
    return activeDomain.spaces.find(
      (s) =>
        pathname.startsWith(s.href + "/") ||
        pathname === s.href ||
        s.pages.some((p) => pathname.startsWith(p.href + "/") || pathname === p.href),
    );
  }, [pathname, activeDomain]);

  const activePages = useMemo(
    () => activeSpace?.pages ?? activeDomain.spaces[0]?.pages ?? [],
    [activeSpace, activeDomain],
  );

  const activePage = useMemo(() => {
    const matchesPage = (page: { href: string }) =>
      pathname === page.href ||
      pathname.startsWith(page.href + "/") ||
      (page.href === "/life/journal" && pathname.startsWith("/life/history"));

    return activePages
      .filter(matchesPage)
      .reduce<(typeof activePages)[number] | undefined>(
        (best, page) => (!best || page.href.length > best.href.length ? page : best),
        undefined,
      );
  }, [pathname, activePages]);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll-container");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY <= 100);
      lastScrollY.current = currentScrollY;
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const navVisibilityClass = isVisible ? "translate-y-0" : "translate-y-full";
  const navClass = `md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/90 backdrop-blur-2xl border-t border-white/[0.06] transition-transform duration-300 ${navVisibilityClass}`;

  return (
    <nav className={navClass}>
      {/* Domain Switcher */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomain.id === domain.id;
          const domainAccentClass = getMobileDomainColors(domain.id);
          const domainLinkClass = `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
            isActive ? domainAccentClass : "text-zinc-500 hover:text-zinc-300"
          }`;
          const domainIconStrokeWidth = isActive ? 2.5 : 2;

          return (
            <Link
              key={domain.id}
              href={domain.spaces[0]?.pages[0]?.href ?? domain.href}
              className={domainLinkClass}
            >
              <Icon size={12} strokeWidth={domainIconStrokeWidth} />
              <span>{domain.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Links */}
      <div className="flex items-center justify-around px-2 h-14 pb-safe">
        {activePages.map((item) => {
          const Icon = item.icon;
          const isActive = activePage?.href === item.href;
          const pageLinkClass = `flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
            isActive ? "text-accent" : "text-zinc-500 hover:text-zinc-300"
          }`;
          const pageIconStrokeWidth = isActive ? 2.5 : 2;

          return (
            <Link key={item.href} href={item.href} className={pageLinkClass}>
              <div className="flex items-center justify-center relative w-6 h-6">
                <Icon size={18} strokeWidth={pageIconStrokeWidth} />
                {isActive && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent" />}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-1 font-sans">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
