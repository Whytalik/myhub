"use client";

import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { SettingsModal } from "@/components/layout/settings-modal";
import { LogOut, Settings2, Sparkles, Pin, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getActiveDomain } from "@/lib/spaces/domains";

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

  const matchesPage = (page: { href: string }) =>
    pathname === page.href ||
    pathname.startsWith(page.href + "/") ||
    (page.href === "/life/journal" && pathname.startsWith("/life/history"));

  const allPages = domain.spaces.flatMap((s) => s.pages);
  const activePage = allPages
    .filter(matchesPage)
    .reduce<(typeof allPages)[number] | undefined>(
      (best, page) => (!best || page.href.length > best.href.length ? page : best),
      undefined,
    );
  const isPageActive = (page: { href: string }) => activePage?.href === page.href;

  useEffect(() => {
    const targetSpace = domain.spaces.find((s) => s.pages.some((p) => p.href === activePage?.href));
    if (targetSpace) {
      setOpenSpaces((prev) =>
        prev.has(targetSpace.label) ? prev : new Set([...prev, targetSpace.label]),
      );
    }

  }, [pathname]);

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isMobileOpen ? 288 : isExpanded ? 280 : 72 }}
        initial={false}
        transition={SIDEBAR_SPRING}
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30 h-screen glass-sidebar flex flex-col justify-between overflow-hidden select-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform duration-300 md:transition-none`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
          <Link href="/life" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/20 shadow-[0_0_15px_var(--color-accent-muted)]">
              <Sparkles size={18} />
            </div>
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={LABEL_TRANSITION}
                  className="flex flex-col"
                >
                  <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                    MyHub
                  </h1>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1 font-bold">
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
                className="flex items-center gap-1.5"
              >
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="md:hidden p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                  }}
                  className="hidden md:flex p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
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

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
          <nav className="space-y-1">
            {domain.spaces.map((space) => {
              const SpaceIcon = space.icon;
              const isOpen = openSpaces.has(space.label);
              const anyPageActive = space.pages.some(isPageActive);

              return (
                <div key={space.label} className="w-full flex flex-col">
                  <button
                    onClick={() => {
                      if (!isExpanded) {
                        toggleSidebar();
                      }
                      setOpenSpaces((prev) => {
                        const next = new Set(prev);
                        if (next.has(space.label)) next.delete(space.label);
                        else next.add(space.label);
                        return next;
                      });
                    }}
                    className={`w-full flex items-center justify-center md:justify-start gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-150 ${
                      anyPageActive
                        ? "text-accent bg-accent-muted"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    <SpaceIcon
                      size={14}
                      strokeWidth={anyPageActive ? 2.5 : 2}
                      className={anyPageActive ? "text-accent" : "text-zinc-500"}
                    />
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left truncate">{space.label}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 0 : -90 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <ChevronDown size={12} className="text-zinc-500" />
                        </motion.div>
                      </>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: "easeInOut" }}
                        className="pl-6 pr-2 py-1 space-y-0.5 border-l border-white/5 ml-5 mt-1"
                      >
                        {space.pages.map((page) => {
                          const PageIcon = page.icon;
                          const isActive = isPageActive(page);
                          return (
                            <Link
                              key={page.href}
                              href={page.href}
                              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs transition-colors duration-150 ${
                                isActive
                                  ? "text-accent font-medium bg-accent-muted"
                                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                              }`}
                            >
                              <PageIcon
                                size={12}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={isActive ? "text-accent" : "text-zinc-500"}
                              />
                              <span className="truncate">{page.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile */}
        <div className="h-16 border-t border-white/5 px-4 flex items-center justify-between gap-3 flex-shrink-0 bg-white/[0.02]">
          {user && (
            <>
              <Link href="/life" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center border border-accent/20 text-xs font-semibold flex-shrink-0">
                  <span>
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
                      className="min-w-0"
                    >
                      <p className="text-xs font-medium text-white truncate">
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
                    className="flex items-center gap-1"
                  >
                    <button
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setIsMobileOpen(false);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
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
