"use client";

import { logoutAction } from "@/actions/logout";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookText,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  Dumbbell,
  HelpCircle,
  History,
  Languages,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// ... [rest of the nav constants remains same] ...

export function Sidebar({ user, initialOrder }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ... [useEffect for ALL_SECTIONS and handleSync remains same] ...

  if (!mounted) return <aside className="hidden md:flex w-64 bg-surface border-r border-border h-screen shrink-0" />;

  const filteredOrder = order.filter(section => ALL_SECTIONS.includes(section));

  const renderNavGroup = (
    label: string,
    items: { href: string; label: string; icon: LucideIcon }[],
    groupHref: string,
    groupIcon: LucideIcon,
    withSubItems = true,
  ) => {
    // ... [renderNavGroup implementation remains same] ...
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
            <Sparkles size={16} className="text-bg" fill="currentColor" />
          </div>
          <h1 className="text-lg font-black text-text tracking-tighter leading-none">MYHUB</h1>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2 text-muted hover:text-text transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 h-screen w-72 bg-surface border-r border-border flex flex-col shrink-0 transition-transform duration-300 z-50 md:sticky md:top-0 md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Mobile Close Button (inside sidebar) */}
        <div className="md:hidden flex justify-end p-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-muted">
            <X size={24} />
          </button>
        </div>

        {/* Brand */}
        <div className="shrink-0 py-8 px-6">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              <Sparkles size={20} className="text-bg" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-black text-text tracking-tighter leading-none">
                MYHUB
              </h1>
              <p className="text-[10px] font-mono text-accent uppercase tracking-widest mt-1">
                Personal OS
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-6 md:py-0 flex flex-col scroll-smooth">
          {/* ... [nav implementation remains same] ... */}
        </div>

        <div className="border-t border-border mt-auto" />

        {/* Footer */}
        <div className="shrink-0 flex flex-col gap-1 px-4 pb-4 pt-2">
          {/* ... [user footer remains same] ... */}
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
