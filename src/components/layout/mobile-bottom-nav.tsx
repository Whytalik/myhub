"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { DOMAINS, getActiveDomain } from "@/lib/spaces/domains";

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

  useEffect(() => {
    const scrollContainer = document.querySelector("main");
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY <= 100);
      lastScrollY.current = currentScrollY;
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/90 backdrop-blur-2xl border-t border-white/[0.06] transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Domain Switcher */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-1">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomain.id === domain.id;
          const domainAccentClass =
            domain.id === "life"
              ? "bg-accent-life/15 text-accent-life border border-accent-life/20"
              : "bg-accent-nutrition/15 text-accent-nutrition border border-accent-nutrition/20";
          return (
            <Link
              key={domain.id}
              href={domain.spaces[0]?.pages[0]?.href ?? domain.href}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                isActive
                  ? domainAccentClass
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon size={12} strokeWidth={isActive ? 2.5 : 2} />
              <span>{domain.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Links */}
      <div className="flex items-center justify-around px-2 h-14 pb-safe">
        {activePages.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/") ||
            (item.href === "/life/journal" && pathname.startsWith("/life/history"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors duration-150 ${
                isActive ? "text-accent" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <div className="flex items-center justify-center relative w-6 h-6">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent" />
                )}
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
