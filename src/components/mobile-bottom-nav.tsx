"use client";

import { BookText, CalendarDays, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const LIFE_NAV = [
  { href: "/life/journal", label: "Journal", icon: BookText },
  { href: "/life/habits",  label: "Habits",  icon: Zap },
  { href: "/life/tasks",   label: "Tasks",   icon: CheckCircle2 },
  { href: "/life/week",    label: "Week",    icon: CalendarDays },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

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
      className={`
        lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface/90 backdrop-blur-xl border-t border-border-dim z-[100] flex items-center justify-around px-2 pb-safe
        transition-transform duration-500 ease-in-out
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      {LIFE_NAV.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          pathname.startsWith(item.href + "/") ||
          (item.href === "/life/journal" && pathname.startsWith("/life/history"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 ${isActive ? "text-accent" : "text-muted"}`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${isActive ? "bg-accent/10 scale-105" : ""}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-label font-medium uppercase tracking-tighter transition-colors duration-300 ${isActive ? "text-text" : "text-muted"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
