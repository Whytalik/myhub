"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar-provider";
import { SettingsModal } from "./settings-modal";
import {
  BookText,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Heart,
  History,
  LogOut,
  Settings2,
  Sparkles,
  Utensils,
  Zap,
  Pin,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LIFE_ACCENT = "#6fbfbf";
const HEALTH_ACCENT = "#ff8c00";

const lifeNav = [
  { href: "/life/journal", label: "Journal", icon: BookText },
  { href: "/life/habits",  label: "Habits",  icon: Zap },
  { href: "/life/tasks",   label: "Tasks",   icon: CheckCircle2 },
  { href: "/life/week",    label: "Week",    icon: CalendarDays },
];

const healthNav = [
  { href: "/health/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/health/training",  label: "Training",  icon: Dumbbell },
];

const SIDEBAR_SPRING = { type: "spring", stiffness: 320, damping: 32, restDelta: 0.001 } as const;
const LABEL_TRANSITION = { duration: 0.14, ease: "easeOut" } as const;
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;

interface SidebarProps {
  user?: { name: string; email: string };
  initialOpenSections?: Record<string, boolean>;
  initialOrder?: string[];
}

export function Sidebar({ user, initialOpenSections = {} }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLifeOpen, setIsLifeOpen] = useState(
    initialOpenSections["Life"] ?? true,
  );
  const [isHealthOpen, setIsHealthOpen] = useState(
    initialOpenSections["Health"] ?? pathname.startsWith("/health"),
  );

  const isExpanded = isMobileOpen || !isCollapsed || isHovered;

  const color = {
    text: LIFE_ACCENT,
    bgActive: `${LIFE_ACCENT}12`,
    borderActive: `${LIFE_ACCENT}30`,
  };

  const healthColor = {
    text: HEALTH_ACCENT,
    bgActive: `${HEALTH_ACCENT}12`,
    borderActive: `${HEALTH_ACCENT}30`,
  };

  const isLifeActive = pathname.startsWith("/life");
  const isHealthActive = pathname.startsWith("/health");

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-bg/60 backdrop-blur-sm z-[1000] lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ viewTransitionName: "sidebar" }}
        animate={{ width: isMobileOpen ? 288 : isExpanded ? 280 : 72 }}
        initial={false}
        transition={SIDEBAR_SPRING}
        className={`
          fixed inset-y-0 left-0 z-[2000] lg:sticky lg:top-0 h-screen bg-surface border-r border-border-dim flex flex-col shrink-0 overflow-hidden
          transition-transform duration-300 ease-out
          ${isMobileOpen ? "translate-x-0 shadow-[20px_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="shrink-0 h-20 flex items-center relative border-b border-border-dim px-6">
          <Link href="/life" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 transition-shadow duration-200 group-hover:shadow-[0_0_16px_rgba(96,165,250,0.3)]">
              <Sparkles size={20} className="text-bg" />
            </div>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={LABEL_TRANSITION}
                  className="flex flex-col overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-heading font-bold text-text-primary tracking-tight leading-none">MyHub</h1>
                  <p className="text-micro font-mono text-accent uppercase tracking-wider mt-0.5">Personal OS</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute right-6 flex items-center gap-2"
              >
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
                  className={`hidden lg:flex p-2 rounded-lg transition-all duration-200 ${
                    !isCollapsed ? "text-accent bg-accent/10" : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <motion.div animate={{ rotate: !isCollapsed ? 45 : 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                    <Pin size={14} />
                  </motion.div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col scroll-smooth px-3 pt-4">
          <nav className="flex flex-col gap-4">
            {/* Life Space */}
            <div className="flex flex-col gap-1.5 w-full">
              {/* Life Space header item */}
              <div
                className={`flex flex-col transition-all duration-200 overflow-hidden rounded-lg relative ${
                  isLifeActive ? "bg-[var(--item-bg)]" : "hover:bg-surface-hover"
                }`}
                style={{ "--item-bg": color.bgActive } as React.CSSProperties}
              >
                {isLifeActive && (
                  <div className="absolute left-0 top-2.5 w-0.5 h-6 rounded-r-full" style={{ backgroundColor: color.text }} />
                )}
                <div className="flex items-center w-full">
                  <Link href="/life" className="flex-1 flex items-center h-11">
                    <motion.div
                      initial={false}
                      animate={{ paddingLeft: isExpanded ? 12 : 10 }}
                      transition={SIDEBAR_SPRING}
                      className="flex items-center w-full h-full"
                    >
                      <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg">
                        <Sparkles size={18} style={{ color: color.text }} strokeWidth={isLifeActive ? 2.5 : 2} className="transition-colors duration-200" />
                      </div>
                      <motion.div
                        initial={false}
                        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
                        transition={LABEL_TRANSITION}
                        className="ml-3 overflow-hidden flex items-center gap-2"
                        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                      >
                        <span className="text-note font-medium whitespace-nowrap" style={{ color: color.text }}>Life Space</span>
                      </motion.div>
                    </motion.div>
                  </Link>

                  <motion.button
                    initial={false}
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setIsLifeOpen((v) => !v)}
                    className="p-2 transition-colors duration-200 text-text-muted hover:text-text-primary"
                    style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isLifeOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight size={14} />
                    </motion.div>
                  </motion.button>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: isExpanded && isLifeOpen ? "auto" : 0, opacity: isExpanded && isLifeOpen ? 1 : 0 }}
                  transition={SUBMENU_TRANSITION}
                  style={{ overflow: "hidden" }}
                >
                  <div className="flex flex-col gap-0.5 pl-3 pr-2 pb-2 pt-1">
                    <div className="h-px mb-1 transition-colors duration-500" style={{ backgroundColor: isLifeActive ? color.borderActive : "rgba(255,255,255,0.04)" }} />
                    {lifeNav.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/") ||
                        (item.href === "/life/journal" && pathname.startsWith("/life/history"));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption transition-colors duration-200 ${
                            isActive ? "font-medium text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                          style={{ color: isActive ? color.text : undefined }}
                        >
                          <Icon size={13} style={{ color: isActive ? color.text : undefined }} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                    <Link
                      href="/life/history"
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption transition-colors duration-200 ${
                        pathname.startsWith("/life/history") && !pathname.startsWith("/life/journal")
                          ? "font-medium text-text-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      }`}
                      style={{ color: pathname.startsWith("/life/history") && !pathname.startsWith("/life/journal") ? color.text : undefined }}
                    >
                      <History
                        size={13}
                        style={{ color: pathname.startsWith("/life/history") && !pathname.startsWith("/life/journal") ? color.text : undefined }}
                        strokeWidth={pathname.startsWith("/life/history") && !pathname.startsWith("/life/journal") ? 2.5 : 2}
                        className="shrink-0"
                      />
                      <span className="truncate">History</span>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
            {/* Health Space */}
            <div className="flex flex-col gap-1.5 w-full">
              <div
                className={`flex flex-col transition-all duration-200 overflow-hidden rounded-lg relative ${
                  isHealthActive ? "bg-[var(--item-bg)]" : "hover:bg-surface-hover"
                }`}
                style={{ "--item-bg": healthColor.bgActive } as React.CSSProperties}
              >
                {isHealthActive && (
                  <div className="absolute left-0 top-2.5 w-0.5 h-6 rounded-r-full" style={{ backgroundColor: healthColor.text }} />
                )}
                <div className="flex items-center w-full">
                  <Link href="/health" className="flex-1 flex items-center h-11">
                    <motion.div
                      initial={false}
                      animate={{ paddingLeft: isExpanded ? 12 : 10 }}
                      transition={SIDEBAR_SPRING}
                      className="flex items-center w-full h-full"
                    >
                      <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg">
                        <Heart size={18} style={{ color: healthColor.text }} strokeWidth={isHealthActive ? 2.5 : 2} className="transition-colors duration-200" />
                      </div>
                      <motion.div
                        initial={false}
                        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
                        transition={LABEL_TRANSITION}
                        className="ml-3 overflow-hidden flex items-center gap-2"
                        style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                      >
                        <span className="text-note font-medium whitespace-nowrap" style={{ color: healthColor.text }}>Health Space</span>
                      </motion.div>
                    </motion.div>
                  </Link>

                  <motion.button
                    initial={false}
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setIsHealthOpen((v) => !v)}
                    className="p-2 transition-colors duration-200 text-text-muted hover:text-text-primary"
                    style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: isHealthOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronRight size={14} />
                    </motion.div>
                  </motion.button>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: isExpanded && isHealthOpen ? "auto" : 0, opacity: isExpanded && isHealthOpen ? 1 : 0 }}
                  transition={SUBMENU_TRANSITION}
                  style={{ overflow: "hidden" }}
                >
                  <div className="flex flex-col gap-0.5 pl-3 pr-2 pb-2 pt-1">
                    <div className="h-px mb-1 transition-colors duration-500" style={{ backgroundColor: isHealthActive ? healthColor.borderActive : "rgba(255,255,255,0.04)" }} />
                    {healthNav.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption transition-colors duration-200 ${
                            isActive ? "font-medium text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                          style={{ color: isActive ? healthColor.text : undefined }}
                        >
                          <Icon size={13} style={{ color: isActive ? healthColor.text : undefined }} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className={`shrink-0 flex items-center justify-between relative pl-5 pr-4 py-4 overflow-hidden border-t border-border-dim bg-surface ${isMobileOpen ? "pb-24 lg:pb-4" : "pb-4"}`}>
          {user && (
            <>
              <Link href="/life" className="flex items-center gap-3 group/profile-link">
                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0 group-hover/profile-link:scale-105 transition-transform duration-200">
                  <span className="text-accent text-note font-bold">
                    {user.name
                      ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                      : user.email.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={LABEL_TRANSITION}
                      className="flex flex-col overflow-hidden whitespace-nowrap"
                    >
                      <p className="text-note font-medium text-text-primary truncate leading-none">{user.name}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-0.5 shrink-0"
                  >
                    <button
                      onClick={() => { setIsSettingsOpen(true); setIsMobileOpen(false); }}
                      className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all duration-200"
                    >
                      <LogOut size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.aside>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userName={user?.name} />
    </>
  );
}
