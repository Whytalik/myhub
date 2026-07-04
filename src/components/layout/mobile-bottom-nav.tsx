"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getActiveDomain } from "@/lib/spaces/domains";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const activeNav = getActiveDomain(pathname).spaces.flatMap((s) => s.pages);

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
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-surface/20 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 pb-safe transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {activeNav.map((item) => {
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
              isActive ? "text-[var(--current-accent)]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <div className="flex items-center justify-center relative w-6 h-6">
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--current-accent)]" />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight mt-1 font-sans">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

}
