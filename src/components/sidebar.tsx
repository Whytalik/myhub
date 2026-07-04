"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar-provider";
import { SettingsModal } from "./settings-modal";
import { LogOut, Settings2, Sparkles, Pin, X, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { getActiveDomain } from "@/lib/domains";

const SIDEBAR_SPRING = { type: "spring", stiffness: 320, damping: 32, restDelta: 0.001 } as const;
const LABEL_TRANSITION = { duration: 0.14, ease: "easeOut" } as const;
const SUBMENU_TRANSITION = { duration: 0.22, ease: [0.16, 1, 0.3, 1] } as const;

interface SidebarProps {
  user?: { name: string; email: string };
  initialOpenSections?: Record<string, boolean>;
  initialOrder?: string[];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openSpaces, setOpenSpaces] = useState<Set<string>>(new Set());

  const domain = getActiveDomain(pathname);
  const [isOpen, setIsOpen] = useState(true);
  const [lastDomainId, setLastDomainId] = useState(domain.id);

  if (domain.id !== lastDomainId) {
    setLastDomainId(domain.id);
    setIsOpen(true);
    setOpenSpaces(new Set());
  }

  // Auto-open space containing the active page
  const targetSpace = domain.spaces.find(
    (s) => s.pages.length > 1 && s.pages.some((p) => pathname === p.href || pathname.startsWith(p.href + "/")),
  );
  if (targetSpace && !openSpaces.has(targetSpace.label)) {
    setOpenSpaces((prev) => new Set([...prev, targetSpace.label]));
  }

  const isExpanded = isMobileOpen || !isCollapsed || isHovered;

  const DomainIcon = domain.icon;
  const color = {
    text: domain.accent,
    bgActive: `${domain.accent}12`,
    borderActive: `${domain.accent}30`,
  };

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
                  <h1 className="text-heading font-bold text-text-primary tracking-tight leading-none">
                    MyHub
                  </h1>
                  <p className="text-micro font-mono text-accent uppercase tracking-wider mt-0.5">
                    Personal OS
                  </p>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                  }}
                  className={`hidden lg:flex p-2 rounded-lg transition-all duration-200 ${
                    !isCollapsed
                      ? "text-accent bg-accent/10"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
                  }`}
                >
                  <motion.div
                    animate={{ rotate: !isCollapsed ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <Pin size={14} />
                  </motion.div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation — spaces of the active domain */}
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col scroll-smooth px-3 pt-4">
          <nav className="flex flex-col gap-1.5 w-full">
            <div
              className={`flex flex-col transition-all duration-200 overflow-hidden rounded-lg relative ${
                pathname.startsWith(domain.href) ? "bg-[var(--item-bg)]" : "hover:bg-surface-hover"
              }`}
              style={{ "--item-bg": color.bgActive } as React.CSSProperties}
            >
              {pathname.startsWith(domain.href) && (
                <div
                  className="absolute left-0 top-2.5 w-0.5 h-6 rounded-r-full"
                  style={{ backgroundColor: color.text }}
                />
              )}
              <div className="flex items-center w-full">
                <Link href={domain.href} className="flex-1 flex items-center h-11">
                  <motion.div
                    initial={false}
                    animate={{ paddingLeft: isExpanded ? 12 : 10 }}
                    transition={SIDEBAR_SPRING}
                    className="flex items-center w-full h-full"
                  >
                    <div className="w-9 h-9 flex items-center justify-center shrink-0 rounded-lg">
                      <DomainIcon
                        size={18}
                        style={{ color: color.text }}
                        strokeWidth={2.5}
                        className="transition-colors duration-200"
                      />
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -8 }}
                      transition={LABEL_TRANSITION}
                      className="ml-3 overflow-hidden flex items-center gap-2"
                      style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                    >
                      <span
                        className="text-note font-medium whitespace-nowrap text-caption uppercase tracking-wider font-mono"
                        style={{ color: color.text }}
                      >
                        {domain.label} Space
                      </span>
                    </motion.div>
                  </motion.div>
                </Link>

                <motion.button
                  initial={false}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsOpen((v) => !v)}
                  className="p-2 transition-colors duration-200 text-text-muted hover:text-text-primary"
                  style={{ pointerEvents: isExpanded ? "auto" : "none" }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <ChevronRight size={14} />
                  </motion.div>
                </motion.button>
              </div>

              <motion.div
                initial={false}
                animate={{
                  height: isExpanded && isOpen ? "auto" : 0,
                  opacity: isExpanded && isOpen ? 1 : 0,
                }}
                transition={SUBMENU_TRANSITION}
                style={{ overflow: "hidden" }}
              >
                <div className="flex flex-col gap-0.5 pl-3 pr-2 pb-2 pt-1">
                  <div
                    className="h-px mb-1 transition-colors duration-500"
                    style={{ backgroundColor: color.borderActive }}
                  />
                  {domain.spaces.map((space) => {
                    const SpaceIcon = space.icon;
                    if (space.pages.length === 1) {
                      const page = space.pages[0];
                      const PageIcon = page.icon;
                      const isActive =
                        pathname === page.href ||
                        pathname.startsWith(page.href + "/") ||
                        (page.href === "/life/journal" && pathname.startsWith("/life/history"));
                      return (
                        <Link
                          key={page.href}
                          href={page.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption transition-colors duration-200 relative ${
                            isActive
                              ? "font-medium text-text-primary"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                          style={{ color: isActive ? color.text : undefined }}
                        >
                          <PageIcon
                            size={13}
                            style={{ color: isActive ? color.text : undefined }}
                            strokeWidth={isActive ? 2.5 : 2}
                            className="shrink-0"
                          />
                          <span className="truncate">{page.label}</span>
                        </Link>
                      );
                    }

                    const anyPageActive = space.pages.some(
                      (p) => pathname === p.href || pathname.startsWith(p.href + "/"),
                    );
                    return (
                      <div key={space.label} className="flex flex-col">
                        <button
                          onClick={() =>
                            setOpenSpaces((prev) => {
                              const next = new Set(prev);
                              if (next.has(space.label)) next.delete(space.label);
                              else next.add(space.label);
                              return next;
                            })
                          }
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-caption transition-colors duration-200 w-full text-left ${
                            anyPageActive
                              ? "font-medium text-text-primary"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                          }`}
                          style={{ color: anyPageActive ? color.text : undefined }}
                        >
                          <SpaceIcon
                            size={13}
                            style={{ color: anyPageActive ? color.text : undefined }}
                            strokeWidth={anyPageActive ? 2.5 : 2}
                            className="shrink-0"
                          />
                          <span className="truncate flex-1">{space.label}</span>
                          <motion.div
                            animate={{ rotate: openSpaces.has(space.label) ? 0 : -90 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <ChevronDown size={12} className="text-text-muted shrink-0" />
                          </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                          {openSpaces.has(space.label) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-0.5 pl-2 pb-1">
                                {space.pages.map((page) => {
                                  const PageIcon = page.icon;
                                  const isActive =
                                    pathname === page.href ||
                                    pathname.startsWith(page.href + "/");
                                  return (
                                    <Link
                                      key={page.href}
                                      href={page.href}
                                      className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-caption transition-colors duration-200 relative ${
                                        isActive
                                          ? "font-medium text-text-primary"
                                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                                      }`}
                                      style={{ color: isActive ? color.text : undefined }}
                                    >
                                      <PageIcon
                                        size={11}
                                        style={{ color: isActive ? color.text : undefined }}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className="shrink-0"
                                      />
                                      <span className="truncate">{page.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div
          className={`shrink-0 flex items-center justify-between relative pl-5 pr-4 py-4 overflow-hidden border-t border-border-dim bg-surface ${isMobileOpen ? "pb-24 lg:pb-4" : "pb-4"}`}
        >
          {user && (
            <>
              <Link href="/life" className="flex items-center gap-3 group/profile-link">
                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0 group-hover/profile-link:scale-105 transition-transform duration-200">
                  <span className="text-accent text-note font-bold">
                    {user.name
                      ? user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
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
                      <p className="text-note font-medium text-text-primary truncate leading-none">
                        {user.name}
                      </p>
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
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsMobileOpen(false);
                      }}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={user?.name}
      />
    </>
  );
}
