"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./sidebar-provider";
import { SettingsModal } from "./settings-modal";
import { LogOut, Settings2, Sparkles, Pin, X, ChevronDown } from "lucide-react";
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
  const domain = getActiveDomain(pathname);
  const [openSpaces, setOpenSpaces] = useState<Set<string>>(
    () => new Set(domain.spaces.map((s) => s.label)),
  );
  const [lastDomainId, setLastDomainId] = useState(domain.id);

  if (domain.id !== lastDomainId) {
    setLastDomainId(domain.id);
    setOpenSpaces(new Set(domain.spaces.map((s) => s.label)));
  }

  const isPageActive = (page: { href: string }) =>
    pathname === page.href ||
    pathname.startsWith(page.href + "/") ||
    (page.href === "/life/journal" && pathname.startsWith("/life/history"));

  // Auto-open space containing the active page
  const targetSpace = domain.spaces.find((s) => s.pages.some(isPageActive));
  if (targetSpace && !openSpaces.has(targetSpace.label)) {
    setOpenSpaces((prev) => new Set([...prev, targetSpace.label]));
  }

  const isExpanded = isMobileOpen || !isCollapsed || isHovered;

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
            <motion.div
              initial={false}
              animate={{
                height: isExpanded ? "auto" : 0,
                opacity: isExpanded ? 1 : 0,
              }}
              transition={SUBMENU_TRANSITION}
              style={{ overflow: "hidden" }}
            >
              <div className="flex flex-col gap-2">
                {domain.spaces.map((space) => {
                  const SpaceIcon = space.icon;
                  const accent = space.accent;
                  const color = {
                    text: accent,
                    bg: `${accent}0d`,
                    border: `${accent}22`,
                  };
                  const isOpen = openSpaces.has(space.label);
                  const anyPageActive = space.pages.some(isPageActive);

                  return (
                    <div
                      key={space.label}
                      className="flex flex-col rounded-lg overflow-hidden relative"
                      style={{
                        backgroundColor: color.bg,
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      <button
                        onClick={() =>
                          setOpenSpaces((prev) => {
                            const next = new Set(prev);
                            if (next.has(space.label)) next.delete(space.label);
                            else next.add(space.label);
                            return next;
                          })
                        }
                        className="flex items-center gap-3 px-3 py-2 text-caption transition-colors duration-200 w-full text-left"
                        style={{ color: color.text }}
                      >
                        <SpaceIcon
                          size={13}
                          style={{ color: color.text }}
                          strokeWidth={anyPageActive ? 2.5 : 2}
                          className="shrink-0"
                        />
                        <span className="truncate flex-1 font-medium">{space.label}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 0 : -90 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <ChevronDown
                            size={12}
                            style={{ color: color.text }}
                            className="shrink-0"
                          />
                        </motion.div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-0.5 px-2 pb-2">
                              {space.pages.map((page) => {
                                const PageIcon = page.icon;
                                const isActive = isPageActive(page);
                                return (
                                  <Link
                                    key={page.href}
                                    href={page.href}
                                    className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-caption transition-colors duration-200 ${
                                      isActive
                                        ? "font-medium bg-surface"
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
