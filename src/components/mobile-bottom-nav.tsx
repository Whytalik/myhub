"use client";

import { useSpace } from "./space-provider";
import { 
  Briefcase, 
  Shield, 
  Brain, 
  Database, 
  Package
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const DOMAINS = [
  { id: "operations", label: "Ops", icon: Briefcase, href: "/operations" },
  { id: "health",     label: "Health", icon: Shield,    href: "/health" },
  { id: "mind",       label: "Mind", icon: Brain,     href: "/mind" },
  { id: "wealth",     label: "Wealth", icon: Database,  href: "/wealth" },
  { id: "vault",      label: "Vault", icon: Package,   href: "/vault" },
];

export function MobileBottomNav() {
  const { activeDomain } = useSpace();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Знаходимо основний контейнер, який скролиться
    const scrollContainer = document.querySelector('main');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollY = scrollContainer.scrollTop;
      
      // Логіка: 
      // 1. Якщо скролимо вниз (current > last) і ми не біля самого верху -> ховаємо
      // 2. Якщо скролимо вгору (current < last) -> показуємо
      // Додаємо поріг (threshold) у 10px, щоб уникнути тремтіння
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`
        lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-xl border-t border-border z-[100] flex items-center justify-around px-2 pb-safe
        transition-transform duration-500 ease-in-out
        ${isVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      {DOMAINS.map((domain) => {
        const Icon = domain.icon;
        const isActive = activeDomain === domain.id;
        
        return (
          <Link
            key={domain.id}
            href={domain.href}
            className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-300 ${
              isActive ? "text-accent" : "text-muted"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${
              isActive ? "bg-accent/15 scale-110" : ""
            }`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
              isActive ? "text-text" : "text-muted"
            }`}>
              {domain.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
