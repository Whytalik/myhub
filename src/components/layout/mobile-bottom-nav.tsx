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

          >
            <div

            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span

            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
